# Domínios e variáveis — ondeachotea.com

Referência para produção e DNS. Ajuste segredos (`JWT_SECRET`, senhas de banco) apenas em arquivos **no servidor** ou secrets do CI — não commite valores sensíveis.

## DNS (registros típicos)

| Tipo | Nome / host | Valor | Notas |
|------|-------------|-------|--------|
| A | `@` | IP da VPS | Site público `https://ondeachotea.com` |
| A | `www` | IP da VPS | Opcional; redirecione `www` → apex ou o inverso |
| A | `api` | IP da VPS | API `https://api.ondeachotea.com` |
| A | `admin` | IP da VPS | Painel `https://admin.ondeachotea.com` |

Certificados TLS: use **Let’s Encrypt** (Certbot, Caddy ou Nginx com `certbot --nginx`).

## Serviços por domínio

| URL | App | Porta local típica (systemd) |
|-----|-----|------------------------------|
| `https://ondeachotea.com` | `apps/web` (Next.js) | `3002` |
| `https://admin.ondeachotea.com` | `apps/admin` (Next.js) | `3001` |
| `https://api.ondeachotea.com` | `apps/backend` (NestJS) | `3000` |

No proxy reverso (Nginx/Caddy), cada `server_name` aponta para `127.0.0.1` na porta indicada.

## API — CORS (`apps/backend`)

Defina `CORS_ORIGINS` (lista separada por vírgulas) com as **origens exatas** que o navegador envia (esquema + host + porta), por exemplo:

```env
CORS_ORIGINS=https://ondeachotea.com,https://www.ondeachotea.com,https://admin.ondeachotea.com
```

Inclua `http://localhost:3001` e `http://localhost:3002` apenas em desenvolvimento local.

## Clientes — `NEXT_PUBLIC_API_URL` / Flutter

| Cliente | Variável | Exemplo produção |
|---------|----------|------------------|
| Web pública (`apps/web`) | `NEXT_PUBLIC_API_URL` | `https://api.ondeachotea.com/api/v1` |
| Admin (`apps/admin`) | `NEXT_PUBLIC_API_URL` | `https://api.ondeachotea.com/api/v1` |
| Mobile (Flutter) | `--dart-define=API_BASE_URL=...` ou default no código | `https://api.ondeachotea.com/api/v1` |

A URL deve incluir o prefixo **`/api/v1`**.

## Site público — URL canónica (opcional)

Em `apps/web`, `NEXT_PUBLIC_SITE_URL` pode ser usada para metadados e links absolutos (ex.: `https://ondeachotea.com`).
