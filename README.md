# OndeAcho

Plataforma para conectar famílias a clínicas e profissionais especializados em TEA/TDAH infantil.

## Estrutura
- `apps/backend`: API NestJS
- `apps/admin`: painel administrativo Next.js (`admin.ondeachotea.com`)
- `apps/web`: site público Next.js (`ondeachotea.com`)
- `apps/mobile`: aplicativo Flutter
- `docs/ambiente-ondeachotea.md`: domínios, DNS e variáveis de ambiente
- `docs/plano-produto-ondeacho.md`: arquitetura e roadmap
- `docs/RUNBOOK.md`: operação (dev/hml/prod)
- `docs/checklist-homologacao.md`: checklist de validação
- `docs/lgpd-retencao-seguranca.md`: diretrizes LGPD/segurança

## Subir com Docker (recomendado)
```bash
npm install
npm run docker:up
```

Depois compile o backend, aplique schema e seed:
```bash
npm run build --workspace apps/backend
npm run db:migrate
npm run db:seed
```
(Em desenvolvimento podes usar `npm run db:migrate:dev --workspace apps/backend` sem build.)

Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)
Health: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) e [http://localhost:3000/api/v1/health/ready](http://localhost:3000/api/v1/health/ready)

## Setup local rápido (Postgres via Docker + migrate + seed)
Na raiz do repositório (com Docker instalado):
```bash
npm install
npm run setup:local
```
Isso cria `apps/backend/.env` a partir do exemplo, sobe só o serviço `db`, aplica migrações e o seed. Depois:
```bash
npm run dev:backend
npm run dev:admin
npm run dev:web
```
O admin em `next dev` usa `apps/admin/.env.development` e aponta para `http://127.0.0.1:3000/api/v1`. O site público (`dev:web`) usa a porta **3002** e `apps/web/.env.development` — inclua `http://localhost:3002` em `CORS_ORIGINS` no backend (ver `apps/backend/.env.example`).

## Rodar sem Docker (Postgres já instalado)
1. Copie `apps/backend/.env.example` para `apps/backend/.env` e ajuste `DB_*`.
2. `npm run build --workspace apps/backend`, depois `npm run db:migrate` e `npm run db:seed` (ou `db:migrate:dev` / `db:seed:dev` no workspace backend sem build).
3. `npm run dev:backend` e `npm run dev:admin`

## Credenciais seed
- Admin: `admin@ondeacho.app` / `Admin@123`
- Responsável: `responsavel@ondeacho.app` / `Admin@123`

## Produção com Docker
```bash
npm run docker:up:prod
npm run build --workspace apps/backend
npm run db:migrate
npm run db:seed
```
