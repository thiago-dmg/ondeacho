# OndeAcho — site público (Next.js)

Interface web para famílias encontrarem clínicas TEA/TDAH, usando a mesma API NestJS do monorepo.

## Desenvolvimento

Na raiz do monorepo (com `npm install` já executado):

```bash
npm run dev:web
```

Abre em [http://localhost:3002](http://localhost:3002). A API deve estar em `http://127.0.0.1:3000` e `CORS_ORIGINS` no backend deve incluir `http://localhost:3002` (já está no `.env.example`).

Variáveis: copie `apps/web/.env.development` para `apps/web/.env.local` se precisar ajustar.

## Produção

Build:

```bash
npm run build --workspace apps/web
```

Configure `NEXT_PUBLIC_API_URL=https://api.ondeachotea.com/api/v1` no ambiente de build (e `CORS` na API com `https://ondeachotea.com`).

## Deploy

Ver [docs/ambiente-ondeachotea.md](../../docs/ambiente-ondeachotea.md) e [docs/deploy-web-vps.md](../../docs/deploy-web-vps.md).
