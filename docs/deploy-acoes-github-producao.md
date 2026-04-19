# Deploy automático de produção (GitHub Actions)

Este documento descreve o fluxo **definitivo** após merge em `main`: build, migrações, publicação na VPS e restarts — **sem** comandos manuais na VPS para API e site público.

O workflow é [`.github/workflows/ci-deploy.yml`](../.github/workflows/ci-deploy.yml). O job **`deploy-production`** corre em cada push para `main` (e em `workflow_dispatch`) **depois** de `ci-node` e `ci-mobile` passarem.

## O que a esteira faz (ordem)

1. `npm ci --include=dev` no runner (garante `typescript` e `@types/*` mesmo com `NODE_ENV=production` noutros contextos).
2. `npm run build --workspace apps/backend` e `npm run build --workspace apps/web` (com `NEXT_PUBLIC_*` resolvidos abaixo).
3. `npm prune --omit=dev` e empacotamento de dois tarballs (API e site).
4. Upload por SCP para `/tmp/deploy-prod/<run_id>/` na VPS.
5. Na VPS: extrair API → **`node --env-file=/etc/ondeacho-api.env …/dist/database/migrate.js`** → symlink `current` da API → `systemctl restart ondeacho-api` → health HTTP.
6. Extrair site → symlink `ondeacho-web` → `systemctl restart ondeacho-web` → `curl` em `/login`.

Se **qualquer** passo falhar (build, migração, health), o job falha e o GitHub marca o run como vermelho — não há “deploy meio verde”.

## Pré-requisitos únicos na VPS (fora da esteira)

Isto continua a ser configuração de **infraestrutura**, feita uma vez:

- **Node.js 20** em `/usr/bin/node` (o script de migração usa `node --env-file`, disponível no Node 20).
- Ficheiro **`/etc/ondeacho-api.env`** (root `600`) com todas as variáveis necessárias à API e à base de dados (ver secção seguinte). A esteira **não** cria este ficheiro por segurança.
- **systemd** com unidades `ondeacho-api` e `ondeacho-web` (o deploy **sobrescreve** os unit files gerados a partir do repo em cada run — alinha com o CI).
- **Nginx** (ou outro proxy) apenas com **`proxy_pass`** para `127.0.0.1:3002` (site) e `3000` (API). **Não** configures `location /_next/static` a apontar para pastas no disco: o Next serve esses ficheiros; um alias errado gera **404 nos chunks** e o site fica preso em “Carregando…”.
- **Não** corras **PM2** e **systemd** ao mesmo tempo para o mesmo app na mesma porta — um só processo a servir o site.

## Secrets e variáveis no GitHub

| Tipo | Nome | Obrigatório |
|------|------|-------------|
| Secret | `VPS_SSH_HOST` | Sim |
| Secret | `VPS_SSH_USER` | Sim |
| Secret | `VPS_SSH_KEY` | Sim (chave privada PEM) |
| Secret ou Variable | `NEXT_PUBLIC_API_URL` | Não — por defeito `/api/v1` (proxy no Next → API local) |
| Secret ou Variable | `NEXT_PUBLIC_SITE_URL` | Não — por defeito `https://ondeachotea.com` |

Em **workflow_dispatch**, o input opcional continua a poder sobrescrever `NEXT_PUBLIC_API_URL` no build do admin (job `deploy-admin`).

## Conteúdo mínimo de `/etc/ondeacho-api.env`

Usa `apps/backend/.env.example` como checklist. Em produção, atenção especial a:

| Variável | Uso |
|----------|-----|
| `PORT` | Porta local da API (ex.: `3000`). |
| `JWT_SECRET` | Obrigatório em produção. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Migrações e Nest usam os mesmos valores. |
| `CORS_ORIGINS` | Opcional se só usares os domínios já permitidos pelo código. |
| `PASSWORD_RESET_PUBLIC_URL` | Origem do **site** onde existe `/redefinir-senha` (ex.: `https://ondeachotea.com`). **Não** uses o host `api.`. |
| `SENDGRID_API_KEY` | E-mail transacional (reset de senha, suporte). |
| `SENDGRID_FROM` | Remetente verificado no SendGrid. |
| `SUPPORT_INBOX_EMAIL` | Opcional — caixa que recebe tickets de suporte. |

Formato compatível com **`node --env-file`**: uma variável por linha `CHAVE=valor`. Valores com caracteres especiais: preferir aspas ou evitar quebras de linha; testa localmente com `node --env-file=/etc/ondeacho-api.env -e "console.log(process.env.DB_HOST)"`.

## CI em pull requests

`ci-node` inclui **lint + build do backend + build do `apps/web`**. Se o TypeScript ou o Next falharem, o PR fica vermelho **antes** de qualquer deploy.

## Plano “só merge na main”

1. Garantir secrets SSH e rede (porta 22 acessível aos runners GitHub, ou self-hosted runner na VPS — ver `docs/deploy-vps.md`).
2. Garantir `/etc/ondeacho-api.env` e systemd/Nginx conforme acima.
3. Merge em `main` → Actions executa CI → **`deploy-production`** publica API + migrações + site e reinicia serviços.

## Mapa e redes sociais na ficha da clínica

O site já lê `websiteUrl`, `instagramUrl` e `facebookUrl` do `GET /listings/:id` e mostra o iframe do mapa com base no endereço (`apps/web/pages/clinica/[id].tsx`). A API expõe esses campos após a migração **`010_clinic_website_social.sql`** e dados preenchidos no admin — nada extra na esteira além de **migrações a correrem** (passo 5 acima).

## Recuperação de 404 em `/_next/static/...`

Indica HTML de um build e ficheiros de **outro** build (deploy parcial, processo antigo ainda a correr, ou Nginx a servir estáticos do disco). Corrige com: um único `ondeacho-web` via systemd, deploy completo pela esteira, e Nginx só a fazer proxy ao Node.
