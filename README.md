# OndeAcho

Plataforma para conectar famílias a clínicas e profissionais especializados em TEA/TDAH infantil.

## Estrutura
- `apps/backend`: API NestJS
- `apps/admin`: painel administrativo Next.js
- `apps/mobile`: aplicativo Flutter
- `docs/plano-produto-ondeacho.md`: arquitetura e roadmap
- `docs/RUNBOOK.md`: operação (dev/hml/prod)
- `docs/checklist-homologacao.md`: checklist de validação
- `docs/lgpd-retencao-seguranca.md`: diretrizes LGPD/segurança

## Subir com Docker (recomendado)
```bash
npm install
npm run docker:up
```

Depois aplique schema e seed:
```bash
npm run db:migrate
npm run db:seed
```

Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)
Health: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) e [http://localhost:3000/api/v1/health/ready](http://localhost:3000/api/v1/health/ready)

## Rodar sem Docker (local)
1. Suba Postgres local.
2. Copie `apps/backend/.env.example` para `apps/backend/.env`.
3. Execute migration e seed:
```bash
npm run db:migrate
npm run db:seed
```
4. Rode:
```bash
npm run dev:backend
npm run dev:admin
```

## Credenciais seed
- Admin: `admin@ondeacho.app` / `Admin@123`
- Responsável: `responsavel@ondeacho.app` / `Admin@123`

## Produção com Docker
```bash
npm run docker:up:prod
npm run db:migrate
npm run db:seed
```
