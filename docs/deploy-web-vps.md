# Deploy do site público na VPS (`ondeachotea.com`)

**Deploy recomendado:** merge em `main` dispara o job `**deploy-production`** em `[.github/workflows/ci-deploy.yml](../.github/workflows/ci-deploy.yml)`, que builda API + site, aplica **migrações**, publica e reinicia `ondeacho-api` e `ondeacho-web`. Guia completo: [deploy-acoes-github-producao.md](./deploy-acoes-github-producao.md).

O resto desta página descreve o equivalente **manual** (Next em **localhost:3002**, Nginx na **443**), útil para diagnóstico ou se ainda não usares Actions.

### Se o site em `ondeachotea.com` «não tem» o que o Git já tem (ex.: «Esqueci minha senha» no login, mapa ou redes na ficha)

O repositório pode estar certo e **produção ainda a servir um build antigo** do `apps/web`, ou o browser/proxy a **cachear HTML**. Confirma na VPS: `sudo systemctl status ondeacho-web`, `curl -sI https://ondeachotea.com/login` (ou `http://127.0.0.1:3002/login`), faz **novo** `npm run build --workspace apps/web` + **restart** do serviço (ou deixa o job `deploy-web` da Actions concluir). Depois de publicar, o projecto inclui `middleware` com `Cache-Control: no-store` nas rotas principais para reduzir HTML antigo em cache.

Para **redes sociais** após gravar no admin: na base tem de existir a migração `**010_clinic_website_social.sql`**; a API tem de estar actualizada; o pedido `GET /listings/:id` não pode estar em cache antigo (o backend envia `Cache-Control: no-store` nas listagens).

### Link «Redefinir senha» no e-mail: `ERR_TOO_MANY_REDIRECTS`

Indica **redireccionamento em cadeia** (ex.: Nginx ou DNS a mandar `www` ↔ apex em ciclo). Garante **um único host canónico** (só `ondeachotea.com` **ou** só `www`, com um único salto 301) e que `PASSWORD_RESET_PUBLIC_URL` no `/etc/ondeacho-api.env` use **esse mesmo** host. A página `/redefinir-senha` é servida com **SSR** (`getServerSideProps`) e cabeçalhos `no-store` em `next.config.js` para evitar HTML antigo em cache.

## O que precisas na VPS (resumo)

1. **Node 20** (igual ao admin / CI).
2. **API** a correr (ex. `ondeacho-api` na **3000**). Com o build por defeito do site (`NEXT_PUBLIC_API_URL=/api/v1`), o Next faz proxy para esse Nest — **não** precisas de subdomínio `api` nem CORS extra só por causa do site.
3. **Build** do `apps/web`: `npm run build --workspace apps/web` (usa `apps/web/.env.production` versionado).
4. **systemd** a servir `next start -p 3002` a partir da pasta `current` (ou deploy manual equivalente).
5. **Nginx** com `server_name ondeachotea.com www.ondeachotea.com` e `proxy_pass http://127.0.0.1:3002` (só precisa de `location /` — os pedidos `/api/v1` chegam ao Next e são reencaminhados internamente).

Mais contexto de DNS, CORS e exemplo Nginx (site + **api** + admin): [ambiente-ondeachotea.md](./ambiente-ondeachotea.md) e [nginx-ondeachotea-exemplo.conf](./nginx-ondeachotea-exemplo.conf).

## Build de produção (na VPS ou na tua máquina antes de enviar o pacote)

Na **raiz do monorepo**, instala dependências **antes** de exportar `NODE_ENV=production` para o build do Next:

```bash
# Se já exportaste NODE_ENV=production na mesma sessão, o npm omite devDependencies
# (typescript, @types/pg, …) e o backend pode usar um tsc global errado. Usa:
npm ci --include=dev
# ou: unset NODE_ENV && npm ci

export NODE_ENV=production
npm run build --workspace apps/web
```

Para compilar o **backend** ou correr `**npm run db:migrate`** no mesmo clone, também precisas de `devDependencies` instaladas (ou `npm ci --include=dev` como acima).

O `**apps/web/.env.production**` define `NEXT_PUBLIC_API_URL=/api/v1` (mesma origem + rewrites no `next.config.js`).

Para build com API em subdomínio (opcional):  
`export NEXT_PUBLIC_API_URL=https://api.ondeachotea.com/api/v1` antes do `npm run build`.

Em Linux na VPS o output fica em `apps/web/.next-build`. No Windows o projeto pode usar `../../.web-next-build` na raiz do repo — em deploy Linux usa sempre o caminho do `next.config.js` do `apps/web`.

**Importante:** `NEXT_PUBLIC_`* fica “gravada” no JavaScript gerado; mudar só no `systemd` sem novo **build** não altera a URL da API no browser.

## Primeira vez na VPS (manual, estilo admin)

1. Clona o repo (ou copia o artefacto de CI) para um diretório de trabalho.
2. Instala dependências na raiz: `npm ci --include=dev` (recomendado se `NODE_ENV=production` estiver definido no shell; caso contrário `npm ci` basta).
3. Corre `npm run build --workspace apps/web` (ou exporta variáveis se quiseres URL absoluta da API).
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

## GitHub Actions

O workflow `[.github/workflows/ci-deploy.yml](../.github/workflows/ci-deploy.yml)` inclui o job `**deploy-web`**: em push para `main`/`master` com alterações em `apps/web/**` (ou no próprio workflow), faz build, envia para `/var/www/ondeacho-web` e reinicia o serviço `**ondeacho-web**` na porta **3002**. Em **Run workflow** (manual), o site também é publicado (útil para primeira instalação ou rebuild sem mudar ficheiros sob o filtro de paths).

**Requisito na VPS:** o serviço `ondeacho-web` e Nginx a `proxy_pass` para `127.0.0.1:3002` têm de existir (primeira vez: secção “Primeira vez na VPS” acima). Sem isso, o job falha no `curl` local após o restart.

Se o login em produção **não mostra** links que já existem no código (ex.: «Esqueci minha senha»), quase sempre é **build antigo a servir**: confirma `sudo systemctl status ondeacho-web`, faz push que toque em `apps/web/` ou dispara o workflow manualmente, e verifica em Actions se `deploy-web` concluiu.

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

## “Failed to fetch” na página (catálogos, login, etc.)

Com `**NEXT_PUBLIC_API_URL=/api/v1`**, o pedido vai para **o mesmo host** do site e o Next encaminha para `**127.0.0.1:3000`**. Se ainda falhar:

1. Na VPS: `curl -sS http://127.0.0.1:3000/api/v1/health` — tem de responder. Se **Connection refused**, o serviço **Nest** (`ondeacho-api`) **não está a correr** ou está noutra porta.
2. Confirma que fizeste `**git pull`** e **novo `npm run build --workspace apps/web`** depois da alteração para `/api/v1` (build antigo ainda pode apontar para `https://api...`).

## “Não seguro” no Chrome

Pode ser certificado inválido/expirado, **cert só para outro nome** (ex.: só `www`), ou site a abrir por **HTTP** com extensão a marcar HTTPS. Depois de o 502 passar, valida com `sudo certbot certificates` e o `server_name` no Nginx a coincidir com o domínio do cert.

## Docker (opcional)

Existe `apps/web/Dockerfile.prod`; o build típico em monorepo é na raiz com `npm run build --workspace apps/web` e cópia do `.next-build` para a imagem, conforme a tua pipeline.