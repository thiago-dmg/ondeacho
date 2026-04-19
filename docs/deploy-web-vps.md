# Deploy do site público na VPS (`ondeachotea.com`)

Mesma ideia do [deploy do admin](./deploy-admin-vps.md): Next.js em **localhost:3002**, Nginx na **443** com HTTPS, domínio apontando para a VPS.

## O que precisas na VPS (resumo)

1. **Node 20** (igual ao admin / CI).
2. **API** a correr (ex. `ondeacho-api` na 3000) e **`CORS_ORIGINS`** com `https://ondeachotea.com` e `https://www.ondeachotea.com` se o site chamar `https://api.ondeachotea.com`.
3. **Build** do `apps/web` com `NEXT_PUBLIC_API_URL` definido **no momento do build** (ver abaixo).
4. **systemd** a servir `next start -p 3002` a partir da pasta `current` (ou deploy manual equivalente).
5. **Nginx** com `server_name ondeachotea.com www.ondeachotea.com` e `proxy_pass http://127.0.0.1:3002`.

Mais contexto de DNS e variáveis: [ambiente-ondeachotea.md](./ambiente-ondeachotea.md).

## Build de produção (na VPS ou na tua máquina antes de enviar o pacote)

Na **raiz do monorepo** (com `npm ci` ou `npm install` já feito):

```bash
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.ondeachotea.com/api/v1
export NEXT_PUBLIC_SITE_URL=https://ondeachotea.com
npm run build --workspace apps/web
```

Em Linux na VPS o output fica em `apps/web/.next-build`. No Windows o projeto pode usar `../../.web-next-build` na raiz do repo — em deploy Linux usa sempre o caminho do `next.config.js` do `apps/web`.

**Importante:** `NEXT_PUBLIC_*` fica “gravada” no JavaScript gerado; mudar só no `systemd` sem novo **build** não altera a URL da API no browser.

## Primeira vez na VPS (manual, estilo admin)

1. Clona o repo (ou copia o artefacto de CI) para um diretório de trabalho.
2. Instala dependências na raiz: `npm ci`.
3. Exporta as variáveis acima e corre `npm run build --workspace apps/web`.
4. Copia para um destino fixo, por exemplo:

   ```text
   /var/www/ondeacho-web/current/
     node_modules/          (da raiz do monorepo, ou só o necessário para next start)
     apps/web/package.json
     apps/web/.next-build/
     apps/web/next.config.js
     apps/web/public/
   ```

   O `next start` deve correr com **cwd** em `apps/web` (onde está o `package.json` do app web), como no admin.

5. Cria o serviço systemd `ondeacho-web` (exemplo):

   ```ini
   [Unit]
   Description=OndeAcho site público (Next.js)
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/var/www/ondeacho-web/current/apps/web
   ExecStart=/usr/bin/node /var/www/ondeacho-web/current/node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3002
   Restart=always
   RestartSec=5
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

   Ajusta caminhos se a tua árvore de ficheiros for outra (o essencial é `WorkingDirectory` = pasta do `apps/web` com `.next-build` ao lado lógico do que o Next espera).

6. `sudo systemctl daemon-reload && sudo systemctl enable --now ondeacho-web`
7. `curl -sI http://127.0.0.1:3002/` — deve responder **200**.

## Nginx (exemplo para `ondeachotea.com`)

Substitui os caminhos do certificado (Let’s Encrypt / Certbot).

```nginx
server {
  listen 443 ssl http2;
  server_name ondeachotea.com www.ondeachotea.com;

  ssl_certificate     /etc/letsencrypt/live/ondeachotea.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ondeachotea.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Redirecionamento **www → apex** (ou o contrário) podes fazer com um `server` extra na porta 443 ou só `return 301`.

## Firewall

Não abras a **3002** à internet se usares Nginx: só **80/443** públicos; a 3002 fica em localhost.

## GitHub Actions (opcional)

O workflow [`.github/workflows/ci-deploy.yml`](../.github/workflows/ci-deploy.yml) já faz deploy da **API** e do **admin**. Para automatizar o site da mesma forma, seria preciso um job `deploy-web` espelhado ao `deploy-admin` (artefacto `apps/web/.next-build`, serviço `ondeacho-web`, pasta `/var/www/ondeacho-web`). Até lá, o deploy manual deste doc é suficiente.

## Comandos úteis

```bash
sudo systemctl status ondeacho-web
sudo journalctl -u ondeacho-web -f
curl -sI http://127.0.0.1:3002/
```

## 502 Bad Gateway no browser (Nginx mostra erro)

Significa: **o Nginx está a correr**, mas **não há resposta válida** do Next na porta para onde o `proxy_pass` aponta (ex.: `127.0.0.1:3002`).

1. Na VPS: `curl -sI http://127.0.0.1:3002/`  
   - Se der **Connection refused** ou timeout → o site **não está a escutar** nessa porta: falta instalar/servir o `apps/web` (systemd `ondeacho-web` ou `next start` manual).
2. Confirma que o `proxy_pass` no bloco `server` de `ondeachotea.com` é **exactamente** a mesma porta do `next start` (3002 no nosso exemplo).
3. `sudo systemctl status ondeacho-web` — se `inactive` ou `failed`, vê logs: `sudo journalctl -u ondeacho-web -n 80 --no-pager`.

**Commit/push no Git** não corrige o 502 **sozinho** enquanto não existir job de deploy do `apps/web` na Actions: tens de **build + arrancar o serviço na VPS** (manual ou script), como fizeste para o admin.

## “Não seguro” no Chrome

Pode ser certificado inválido/expirado, **cert só para outro nome** (ex.: só `www`), ou site a abrir por **HTTP** com extensão a marcar HTTPS. Depois de o 502 passar, valida com `sudo certbot certificates` e o `server_name` no Nginx a coincidir com o domínio do cert.

## Docker (opcional)

Existe `apps/web/Dockerfile.prod`; o build típico em monorepo é na raiz com `npm run build --workspace apps/web` e cópia do `.next-build` para a imagem, conforme a tua pipeline.
