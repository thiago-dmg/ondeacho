# Deploy da API OndeAcho na VPS (GitHub Actions + systemd)

O workflow [`.github/workflows/ci-deploy.yml`](../.github/workflows/ci-deploy.yml) publica **API + migrações + site** na VPS (job `deploy-production`): pastas `releases/<commit>`, symlinks `current` e systemd. Resumo operacional: [deploy-acoes-github-producao.md](./deploy-acoes-github-producao.md).

## Secrets no GitHub (3)

Em **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Descrição |
|--------|-----------|
| `VPS_SSH_HOST` | IP ou hostname da VPS (ex.: `72.61.35.190`). |
| `VPS_SSH_USER` | Usuário SSH (ex.: `root` ou `deploy`). |
| `VPS_SSH_KEY` | Chave **privada** completa (PEM), incluindo `-----BEGIN ... KEY-----` e linhas seguintes. |

Não commite chaves no repositório.

## Preparação única no servidor

1. **Node.js 20** (recomendado): ex. [NodeSource](https://github.com/nodesource/distributions) ou `nvm install 20`.
2. **Arquivo de ambiente** (obrigatório para o deploy passar na validação):

   ```bash
   sudo nano /etc/ondeacho-api.env
   ```

   Use como base `apps/backend/.env.example`. Variáveis mínimas típicas: `PORT`, `JWT_SECRET`, `DB_*` ou URL do Postgres, `CORS_ORIGINS` (URL do admin/app em produção), **`PASSWORD_RESET_PUBLIC_URL=https://ondeachotea.com`** (origem do site público onde existe `/redefinir-senha` — **não** uses o host `api.`).

   ```bash
   sudo chmod 600 /etc/ondeacho-api.env
   ```

3. **Diretório de deploy** (criado automaticamente no primeiro deploy, ou crie antes):

   ```bash
   sudo mkdir -p /var/www/ondeacho-api/releases
   ```

4. **Banco**: Postgres acessível a partir da VPS com as credenciais do `.env`.

5. **Node no PATH do systemd**: o serviço usa `/usr/bin/node`. Se o Node estiver só no `nvm`, crie symlink ou ajuste `ExecStart` no arquivo gerado pelo workflow (ou instale Node via pacote no sistema).

## Ajustes opcionais no workflow

No topo do YAML, altere se precisar:

- `API_PORT`: usado só como **fallback** no health check se `PORT` não estiver em `/etc/ondeacho-api.env` (default `3000`).
- `REMOTE_DIR`: pasta na VPS (default `/var/www/ondeacho-api`).
- `SERVICE_NAME`: nome do serviço systemd (default `ondeacho-api`).

Defina **`PORT`** em `/etc/ondeacho-api.env` (ex.: `PORT=3000`) para a API e para o teste `curl` no final do deploy.

## Importação em lote (cadastros de clínicas)

O arquivo `apps/backend/src/database/import/clinicas-novas.json` contém dezenas de registros. O script **`db:import-clinicas`** precisa do **repositório completo** (monorepo com `package.json` na raiz e workspaces), porque o deploy da API em `/var/www/ondeacho-api` **só envia** `dist` + `node_modules` de produção — **não** existe lá `import-clinicas-json.ts` nem o JSON.

**Erros comuns na VPS**

- **`cd /var/www/ondeacho-admin`**: essa pasta **não é criada** pelo workflow atual (o deploy é só da API em **`/var/www/ondeacho-api`**). O painel admin Next pode nem estar na VPS.
- **`Could not read package.json` em `/root`**: o `npm run` foi executado na home do root **fora** da pasta do projeto. O comando tem de rodar na **raiz do clone** do repositório (onde está o `package.json` do monorepo).
- **`NODE_ENV=production` antes de `npm ci`**: o npm **omite `devDependencies`** (TypeScript, `@types/pg`, etc.). O `npm run build --workspace apps/backend` pode invocar um **`tsc` global** (ex. TypeScript 6) e falhar com TS5011 / TS5101 / TS5107, ou faltar `dist/database/migrate.js` ao correr `db:migrate`. Solução: `unset NODE_ENV` (ou outra sessão) e `npm ci`, ou **`npm ci --include=dev`** na raiz do monorepo.

**Procedimento recomendado na VPS**

1. Clonar o repositório em um diretório só para ferramentas (ex.: `/var/www/ondeacho-src` ou `~/ondeacho`):

   ```bash
   sudo mkdir -p /var/www
   cd /var/www
   sudo git clone https://github.com/SEU_USUARIO/ondeacho.git ondeacho-src
   sudo chown -R "$USER:$USER" ondeacho-src
   cd ondeacho-src
   ```

2. Instalar dependências na raiz (necessário para `npm run db:import-clinicas` usar o workspace `apps/backend`):

   ```bash
   npm ci --include=dev
   ```

3. Exportar as variáveis do **mesmo** Postgres que a API usa (veja `/etc/ondeacho-api.env` ou o que você configurou) e rodar **na raiz do clone**:

   ```bash
   export DB_HOST=127.0.0.1
   export DB_PORT=5432
   export DB_USER=ondeacho_user
   export DB_PASSWORD='SUA_SENHA'
   export DB_NAME=ondeacho_db

   npm run db:import-clinicas
   ```

   (Equivalente: `npm --workspace apps/backend run db:import-clinicas` a partir da **mesma** raiz.)

4. Depois do import, pode atualizar o clone com `git pull` quando o JSON mudar no repositório.

Esse script **não** executa `seed.sql`; só importa/atualiza clínicas e profissionais a partir do JSON. Migrações: `npm run db:migrate` no mesmo clone, se necessário.

**No seu PC (Windows/Git Bash)** o import já funciona dentro de `OndeAcho` com `cd apps/backend` ou na raiz do monorepo — o problema na VPS era só **diretório errado** e **projeto inexistente** (`ondeacho-admin`).

## Proxy reverso (Nginx / Caddy)

Exponha `https` na porta 443 e faça proxy para `http://127.0.0.1:3000` (ou a porta configurada). Garanta que `CORS_ORIGINS` inclua a origem do front/admin.

Domínios de referência: `ondeachotea.com` (site público), `api.ondeachotea.com` (API), `admin.ondeachotea.com` (painel). Detalhes e DNS: [ambiente-ondeachotea.md](./ambiente-ondeachotea.md).

## Painel admin (Next.js)

O admin usa **`NEXT_PUBLIC_API_URL`** (URL completa com `/api/v1`). O repositório inclui `apps/admin/.env.production` apontando para a API na VPS; em desenvolvimento local, crie `apps/admin/.env.local` com `http://localhost:3000/api/v1` (ou o IP da API). As chamadas HTTP ficam em `apps/admin/src/services/api.ts` (sem localhost fixo no código além do fallback de produção).

Para subir o admin como serviço na VPS, o passo típico é `next build` com `output: 'standalone'`, empacotar a pasta gerada pelo build + estáticos e um unit systemd — pode ser um segundo workflow quando quiser. Em Linux/macOS o `distDir` é `apps/admin/.next-build`; no Windows o build usa `../../.admin-next-build` (raiz do monorepo) para evitar erros de permissão no arquivo `trace`.

## GitHub Actions: `dial tcp …:22: i/o timeout` no passo «Upload package to VPS»

Este erro aparece nos jobs **deploy-api**, **deploy-admin** e **deploy-web** quando o runner do GitHub **não consegue abrir TCP na porta 22** até ao `VPS_SSH_HOST`. Não indica bug no código do repositório; é **conectividade ou firewall**.

### Checklist rápido

1. **`VPS_SSH_HOST`** (secret) — IP ou hostname correctos? Teste no teu PC: `ssh -i chave.pem VPS_SSH_USER@VPS_SSH_HOST` (ou `Test-NetConnection HOST -Port 22` no PowerShell).
2. **VPS ligada** — painel Hostinger / cloud a mostrar a máquina em execução.
3. **Firewall da VPS / painel** — tem de existir regra **a aceitar SSH (TCP 22)** a partir da Internet (ou pelo menos a partir de redes que o GitHub Actions use). Os IPs dos runners **mudam**; uma whitelist só de «IPs conhecidos» costuma falhar ou exigir [lista oficial](https://api.github.com/meta) (`actions` em `hooks`) actualizada com frequência. Na prática, muitos projectos deixam **22 aberto ao mundo** e reforçam com **chave SSH + desactivar password + fail2ban**.
4. **Porta SSH** — se mudaste a SSH da VPS para outra porta (ex. 2222), o workflow continua a usar **22**; ou alteras o `sshd` de volta para 22, ou terias de estender o workflow (o `appleboy/scp-action` / `ssh-action` suporta `port`).

### Depois de corrigir rede/firewall

Volta a **Actions** e executa o workflow manualmente (**Run workflow**) ou faz um push vazio para disparar de novo o deploy.

### Alternativas se não quiseres expor SSH à Internet

- **Runner self-hosted** na própria VPS (o job corre lá dentro e faz `scp`/`ssh` em `127.0.0.1`).
- **Deploy por pull na VPS** (cron ou webhook) sem SSH a partir do GitHub.
