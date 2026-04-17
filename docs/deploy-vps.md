# Deploy da API OndeAcho na VPS (GitHub Actions + systemd)

O workflow [`.github/workflows/deploy-api-vps.yml`](../.github/workflows/deploy-api-vps.yml) publica o backend NestJS na VPS no mesmo estilo do BibleReader: pasta `releases/<commit>`, symlink `current` e serviço systemd.

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

   Use como base `apps/backend/.env.example`. Variáveis mínimas típicas: `PORT`, `JWT_SECRET`, `DB_*` ou URL do Postgres, `CORS_ORIGINS` (URL do admin/app em produção).

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

## Proxy reverso (Nginx / Caddy)

Exponha `https` na porta 443 e faça proxy para `http://127.0.0.1:3000` (ou a porta configurada). Garanta que `CORS_ORIGINS` inclua a origem do front/admin.

## Painel admin (Next.js)

O deploy atual é só da **API**. Para subir o `apps/admin` na mesma VPS, o próximo passo típico é `next build` com `output: 'standalone'`, empacotar `.next/standalone` + estáticos e outro unit systemd — pode ser um segundo workflow quando quiser.
