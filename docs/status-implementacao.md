# Status de Implementacao - OndeAcho

## Entregue nesta fase
- Backend NestJS com:
  - autenticacao JWT (`register`, `login`, `me`);
  - RBAC por `role` (`responsavel`, `clinica`, `admin`);
  - listagem de clinicas com filtros iniciais;
  - avaliacoes persistidas com bloqueio de duplicidade por usuario/clinica;
  - CRUD admin inicial de clinicas.
- Persistencia PostgreSQL:
  - entidades `users`, `clinics`, `reviews`;
  - migration SQL inicial em `apps/backend/src/database/migrations/001_init.sql`.
- Painel admin Next.js (base):
  - rotas `login`, `dashboard` e `home`.
- App Flutter (base):
  - arquitetura inicial por features;
  - telas `login`, `discovery` e `listing_details`;
  - navegacao com `go_router` e estado com `riverpod`.

## Proximas implementacoes
1. completar CRUD admin (profissionais, especialidades, convenios, moderacao de reviews);
2. integrar app Flutter ao backend real (Dio + auth + listagem);
3. adicionar favoritos e pre-contato;
4. criar pipeline de deploy e observabilidade.
