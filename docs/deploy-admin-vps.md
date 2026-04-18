# Deploy do admin na VPS (GitHub Actions)

O job **deploy-admin** do workflow único `.github/workflows/ci-deploy.yml` publica o Next.js em `/var/www/ondeacho-admin` e sobe o serviço systemd `ondeacho-admin` na porta **3001** (localhost). Esse job só corre em `main`/`master` quando há alterações em `apps/admin/**` ou no próprio `ci-deploy.yml` (ou em execução manual *workflow_dispatch*).

## O que configurar no GitHub (uma vez)

1. **Secrets** (já usados pelo deploy da API): `VPS_SSH_HOST`, `VPS_SSH_USER`, `VPS_SSH_KEY`.

2. **`NEXT_PUBLIC_API_URL` (opcional)** — por defeito o admin usa **`/api/v1`** na mesma origem; o **Next faz proxy** para `http://127.0.0.1:3000` (veja `rewrites` em `apps/admin/next.config.js`). Assim **não depende de CORS** no browser.

   Só precisa de variável/secret se a API estiver **noutro host** (ex.: `https://api.seudominio.com/api/v1`). Aí configure **também** `CORS_ORIGINS` na API com a origem do painel.

## Login admin em produção

- Utilizador de exemplo no seed: **`admin@ondeacho.app`**, senha **`Admin@123`** (comentário em `apps/backend/src/database/seed.sql`).
- Se aparecer **“Credenciais inválidas”**, a API está a responder mas o utilizador não existe ou a senha não coincide — na VPS rode o seed (ou crie o user na base):

  `npm run db:seed --workspace apps/backend` (com env da base; ex.: `set -a && source /etc/ondeacho-api.env && set -a`). O `db:migrate` / `db:seed` em produção usam `node dist/...` — é preciso **build do backend** no artefacto (o deploy da API já inclui isso).

## HTTPS (“Não seguro”)

- Aviso **“Não seguro”** é normal em **`http://IP:3001`** — não há certificado.
- Para HTTPS, use **domínio + Nginx + Let’s Encrypt** (ou Cloudflare) na **443** com proxy para `http://127.0.0.1:3001`.

## O que fazer na VPS (primeira vez)

1. **Node** já é necessário para a API; o admin usa o mesmo `node` em `/usr/bin/node` (Ubuntu/Debian padrão).

2. **Diretório** — o primeiro deploy cria `/var/www/ondeacho-admin/releases/...` e o symlink `current`. Nada precisa ser criado à mão.

3. **Firewall** — por padrão só **localhost:3001** escuta. Para acessar de fora:
   - **Recomendado:** Nginx (ou Caddy) na frente com HTTPS e `proxy_pass http://127.0.0.1:3001`.
   - **Não recomendado:** abrir a porta 3001 no firewall só para teste.

4. **CORS** — se o admin for servido em outro domínio que a API, o backend precisa aceitar a origem do painel (headers CORS). Ajuste no NestJS se o browser bloquear chamadas.

5. **Disparar o deploy** — faça push em `main` alterando `apps/admin/**` ou use **Actions → Deploy Admin to VPS → Run workflow**.

## Acesso pelo IP (porta 3001)

O admin escuta na **3001**. No painel da **Hostinger → Firewall da VPS**, tens de ter uma regra **Accept | TCP | 3001 | Any** (ou equivalente). Sem isso, o browser de fora dá **ERR_CONNECTION_TIMED_OUT** — o serviço até pode estar OK em `curl http://127.0.0.1:3001` na própria VPS.

Para produção é melhor **Nginx na 80/443** a fazer proxy para `http://127.0.0.1:3001` e **não** expor a 3001 na internet.

## Nginx (exemplo)

Substitua `admin.seudominio.com` e o caminho do certificado.

```nginx
server {
  listen 443 ssl http2;
  server_name admin.seudominio.com;

  ssl_certificate     /etc/letsencrypt/live/admin.seudominio.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/admin.seudominio.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Comandos úteis na VPS

```bash
sudo systemctl status ondeacho-admin
sudo journalctl -u ondeacho-admin -f
curl -sI http://127.0.0.1:3001/
```
