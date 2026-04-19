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

Por defeito o build usa **`apps/web/.env.production`** com `NEXT_PUBLIC_API_URL=/api/v1` (mesmo host do site; proxy no Next). Para API em subdomínio, define `NEXT_PUBLIC_API_URL=https://api.ondeachotea.com/api/v1` antes do build e CORS na API.

## Deploy

Ver [docs/ambiente-ondeachotea.md](../../docs/ambiente-ondeachotea.md) e [docs/deploy-web-vps.md](../../docs/deploy-web-vps.md).

## TypeScript e `import "*.css"`

O `next build` corre o type-check. Ficheiros `.css` não são módulos TypeScript nativos: é preciso **`global.d.ts`** com `declare module "*.css"` e o `tsconfig.json` tem de incluir **`**/*.d.ts`** (o glob `**/*.ts` **não** inclui `.d.ts`). Na VPS, `git pull` na `main` para trazer `global.d.ts` e o `include` atualizado — sem isso o erro persiste mesmo com o `.css` no disco.
