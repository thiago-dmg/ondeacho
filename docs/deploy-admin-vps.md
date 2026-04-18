# Deploy do admin na VPS (GitHub Actions)

O workflow `.github/workflows/deploy-admin-vps.yml` publica o Next.js em `/var/www/ondeacho-admin` e sobe o serviço systemd `ondeacho-admin` na porta **3001** (localhost).

## O que configurar no GitHub (uma vez)

1. **Secrets** (já usados pelo deploy da API): `VPS_SSH_HOST`, `VPS_SSH_USER`, `VPS_SSH_KEY`.

2. **Variável** (Settings → Secrets and variables → Actions → **Variables**):
   - `NEXT_PUBLIC_API_URL` — URL base da API **com** `/api/v1`, acessível pelo **navegador** dos administradores.
   - Exemplos:
     - `https://api.seudominio.com/api/v1`
     - `http://SEU_IP_PUBLICO:3000/api/v1` (sem HTTPS até colocar certificado na API)

Essa variável é embutida no build do Next; alterou URL → rode o workflow de novo.

## O que fazer na VPS (primeira vez)

1. **Node** já é necessário para a API; o admin usa o mesmo `node` em `/usr/bin/node` (Ubuntu/Debian padrão).

2. **Diretório** — o primeiro deploy cria `/var/www/ondeacho-admin/releases/...` e o symlink `current`. Nada precisa ser criado à mão.

3. **Firewall** — por padrão só **localhost:3001** escuta. Para acessar de fora:
   - **Recomendado:** Nginx (ou Caddy) na frente com HTTPS e `proxy_pass http://127.0.0.1:3001`.
   - **Não recomendado:** abrir a porta 3001 no firewall só para teste.

4. **CORS** — se o admin for servido em outro domínio que a API, o backend precisa aceitar a origem do painel (headers CORS). Ajuste no NestJS se o browser bloquear chamadas.

5. **Disparar o deploy** — faça push em `main` alterando `apps/admin/**` ou use **Actions → Deploy Admin to VPS → Run workflow**.

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
