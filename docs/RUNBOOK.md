# RUNBOOK - OndeAcho

## Ambientes
- **dev**: desenvolvimento local com dados fictícios.
- **hml**: homologação para validação de produto/negócio.
- **prod**: produção com logs, monitoramento e backups ativos.

## Variáveis obrigatórias (backend)
- `PORT`
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `CORS_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`

## Bootstrap do ambiente (dev)
1. `npm install`
2. `npm run docker:up`
3. migration:
   - `npm run db:migrate`
4. seed:
   - `npm run db:seed`
5. API:
   - `npm run dev:backend`
6. Admin:
   - `npm run dev:admin`
7. Mobile:
   - `cd apps/mobile && flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1`

## Operação diária
- Verificar saúde da API:
  - `GET /api/v1/health`
  - `GET /api/v1/health/ready`
  - `GET /api/v1/listings`
  - `GET /docs`
- Verificar pendências de moderação:
  - Admin > `reviews`
- Garantir que credenciais administrativas não sejam compartilhadas.

## Backup e recuperação (mínimo)
- Backup diário do banco PostgreSQL (`pg_dump`).
- Política de retenção recomendada: 15-30 dias.
- Testar restauração ao menos 1x por sprint.

## Segurança mínima para produção
- `JWT_SECRET` forte e rotacionável.
- HTTPS obrigatório.
- CORS restrito aos domínios oficiais.
- Logs sem dados sensíveis.
- Revisão de permissões por role em todas rotas administrativas.

## Incidentes comuns
### API não sobe
- validar conexão com banco e variáveis.
- checar se migration foi aplicada.
- validar readiness endpoint para confirmar saúde do banco.

### Login admin falha
- confirmar se usuário admin seed existe.
- validar role `admin`.

### Métricas zeradas no painel
- verificar endpoint `GET /api/v1/admin/metrics/overview`.
- confirmar existência de dados seed no banco.

### Mobile sem dados
- validar `API_BASE_URL`.
- conferir token JWT persistido e expiração.
