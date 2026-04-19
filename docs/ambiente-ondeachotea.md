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

### Obrigatório para web/admin/mobile funcionarem

Os três clientes usam **`https://api.ondeachotea.com/api/v1`**. Isso só resolve no DNS se existir:

| Tipo | Host | Valor |
|------|------|--------|
| **A** | **`api`** | **mesmo IP da VPS** que o `@` |

Sem o registo **`api`**, o browser mostra **`net::ERR_NAME_NOT_RESOLVED`** ao chamar a API — **não é bug do Next nem do Flutter**.

Verificar na VPS ou no PC:

```bash
dig +short api.ondeachotea.com A
# ou: nslookup api.ondeachotea.com
```

Tem de devolver o IP da VPS. Se estiver vazio, cria/edita o registo **A** `api` no painel DNS (Hostinger) e aguarda a propagação (minutos a horas).

### Nginx na frente da API

A API Nest escuta em **localhost:3000**. O domínio público `https://api.ondeachotea.com` exige **Nginx (ou Caddy)** na porta **443** com `proxy_pass` para `http://127.0.0.1:3000` e certificado TLS para `api.ondeachotea.com`. Exemplo completo (site + api + admin): [`nginx-ondeachotea-exemplo.conf`](./nginx-ondeachotea-exemplo.conf).

### Admin em `https://admin.ondeachotea.com` (em vez do IP:3001)

1. Registo **A** `admin` → IP da VPS (já na tabela acima).
2. Nginx `server_name admin.ondeachotea.com` → `proxy_pass http://127.0.0.1:3001`.
3. Certificado TLS para `admin.ondeachotea.com`.
4. **Rebuild do admin** com `NEXT_PUBLIC_API_URL=https://api.ondeachotea.com/api/v1` (já é o esperado em produção).
5. Aceder sempre por **`https://admin.ondeachotea.com`** — os links deixam de ser `http://72.61.35.190:3001/...`.

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

**Nota:** `CORS_ORIGINS` na API lista **origens do browser** (site e admin), **não** o hostname da API. Não é necessário (nem correcto) colocar `https://api.ondeachotea.com` em `CORS_ORIGINS` para o site em `ondeachotea.com` chamar a API.

## Site público — URL canónica (opcional)

Em `apps/web`, `NEXT_PUBLIC_SITE_URL` pode ser usada para metadados e links absolutos (ex.: `https://ondeachotea.com`).
