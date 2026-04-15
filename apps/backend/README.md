# Backend OndeAcho

API REST em NestJS para listagem de clínicas/profissionais com autenticação JWT e RBAC.

## Rodar local
1. Copie `.env.example` para `.env`.
2. Suba um PostgreSQL local.
3. Execute a migration SQL:
   - arquivo `src/database/migrations/001_init.sql`
4. Instale dependências e rode:

```bash
npm install
npm run start:dev
```

## Endpoints principais iniciais
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (JWT)
- `GET /api/v1/listings?city=&online=&minRating=&specialtyId=&insuranceId=`
- `POST /api/v1/reviews` (JWT)
- `GET /api/v1/reviews/listing/:listingId`
- `GET/POST/PATCH/DELETE /api/v1/admin/clinics` (JWT + role admin)
- `GET/POST/PATCH/DELETE /api/v1/admin/professionals` (JWT + role admin)
- `GET/POST/PATCH/DELETE /api/v1/admin/specialties` (JWT + role admin)
- `GET/POST/PATCH/DELETE /api/v1/admin/insurances` (JWT + role admin)
- `GET /api/v1/admin/reviews` (JWT + role admin)
- `PATCH /api/v1/admin/reviews/:id/moderate` (JWT + role admin)
