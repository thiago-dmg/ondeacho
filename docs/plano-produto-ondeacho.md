# OndeAcho - Plano de Produto e Execucao

## 1) Visao geral do produto
Plataforma BFF (mobile-first) para conectar pais e responsaveis de criancas com TEA/TDAH a clinicas e profissionais confiaveis, com busca objetiva, filtros relevantes, informacoes padronizadas e avaliacao moderada.

### Proposta de valor
- reduzir tempo e ansiedade na busca por atendimento especializado;
- centralizar informacoes praticas (especialidades, convenio, localizacao, contato, estrutura adaptada);
- oferecer comparacao clara e historico de qualidade (avaliacoes moderadas).

## 2) Definicao de MVP (primeiro ciclo)
Escopo minimo para lancamento:
- autenticacao (email/senha + recuperacao de senha);
- cadastro de perfil do responsavel e cadastro opcional da crianca;
- listagem de clinicas/profissionais com filtros principais;
- tela de detalhe com contatos, especialidades, convenios e localizacao;
- favoritos;
- avaliacoes com bloqueio de duplicidade (1 usuario por listing);
- painel admin para CRUD essencial e moderacao de avaliacoes.

Fora do MVP (fase 2+):
- login social Google;
- portal da clinica completo;
- agenda, lembretes e conteudo educativo.

## 3) Prioridades de funcionalidades
### P0 (obrigatorio para operar)
- cadastro/login email;
- listagem + filtros por cidade, especialidade, online/presencial e nota;
- detalhe do atendimento;
- favoritos;
- avaliacoes com moderacao;
- CRUD admin de clinicas/profissionais/especialidades/convenios.

### P1 (alta)
- geolocalizacao e proximidade;
- formulario de pre-contato;
- banners e conteudo informativo no admin;
- destaque patrocinado.

### P2 (media)
- login Google;
- portal da clinica;
- respostas da clinica em avaliacoes;
- metricas avancadas.

## 4) Arquitetura da solucao
### Camadas
- **Mobile (Flutter)**: clean architecture (presentation/domain/data), estado com Riverpod.
- **Backend (NestJS)**: API REST versionada, auth JWT, RBAC por perfil, validacao via DTO.
- **Banco (PostgreSQL)**: relacional, foco em consistencia, indices para busca e filtros.
- **Admin Web (Next.js)**: painel para operacao e moderacao.
- **Storage**: S3 compativel (AWS S3, Cloudflare R2 ou MinIO em dev).

### Ambientes
- `dev`, `hml`, `prod` com variaveis de ambiente separadas;
- migracoes versionadas;
- logs estruturados com correlation id;
- monitoramento de erros (Sentry ou equivalente).

## 5) Modelagem de banco (DDL inicial)
```sql
create table users (
  id uuid primary key,
  name varchar(120) not null,
  email varchar(160) not null unique,
  password_hash varchar(255) not null,
  role varchar(20) not null check (role in ('responsavel','clinica','admin')),
  phone varchar(30),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table children_profiles (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name varchar(120) not null,
  birth_date date,
  diagnosis varchar(30) check (diagnosis in ('TEA','TDAH','TEA_TDAH','OUTRO')),
  needs_notes text,
  created_at timestamp not null default now()
);

create table specialties (
  id uuid primary key,
  slug varchar(60) not null unique,
  name varchar(120) not null
);

create table insurances (
  id uuid primary key,
  slug varchar(60) not null unique,
  name varchar(120) not null
);

create table clinics (
  id uuid primary key,
  owner_user_id uuid references users(id),
  name varchar(160) not null,
  description text,
  city varchar(120) not null,
  neighborhood varchar(120),
  address_line varchar(255),
  latitude numeric(10,7),
  longitude numeric(10,7),
  phone varchar(30),
  whatsapp varchar(30),
  website varchar(255),
  instagram varchar(255),
  accepts_online boolean not null default false,
  serves_children boolean not null default true,
  supports_tea_tdh boolean not null default true,
  adapted_structure boolean not null default false,
  price_range varchar(30),
  is_sponsored boolean not null default false,
  status varchar(20) not null default 'active',
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table professionals (
  id uuid primary key,
  owner_user_id uuid references users(id),
  clinic_id uuid references clinics(id) on delete set null,
  name varchar(160) not null,
  license_number varchar(60),
  bio text,
  city varchar(120),
  neighborhood varchar(120),
  accepts_online boolean not null default false,
  supports_tea_tdh boolean not null default true,
  status varchar(20) not null default 'active',
  created_at timestamp not null default now()
);

create table clinic_specialties (
  clinic_id uuid not null references clinics(id) on delete cascade,
  specialty_id uuid not null references specialties(id) on delete cascade,
  primary key (clinic_id, specialty_id)
);

create table professional_specialties (
  professional_id uuid not null references professionals(id) on delete cascade,
  specialty_id uuid not null references specialties(id) on delete cascade,
  primary key (professional_id, specialty_id)
);

create table clinic_insurances (
  clinic_id uuid not null references clinics(id) on delete cascade,
  insurance_id uuid not null references insurances(id) on delete cascade,
  primary key (clinic_id, insurance_id)
);

create table professional_insurances (
  professional_id uuid not null references professionals(id) on delete cascade,
  insurance_id uuid not null references insurances(id) on delete cascade,
  primary key (professional_id, insurance_id)
);

create table reviews (
  id uuid primary key,
  listing_type varchar(20) not null check (listing_type in ('clinic','professional')),
  listing_id uuid not null,
  user_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status varchar(20) not null default 'pending',
  created_at timestamp not null default now(),
  unique(listing_type, listing_id, user_id)
);

create table favorites (
  user_id uuid not null references users(id) on delete cascade,
  listing_type varchar(20) not null check (listing_type in ('clinic','professional')),
  listing_id uuid not null,
  created_at timestamp not null default now(),
  primary key (user_id, listing_type, listing_id)
);

create table contacts (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  listing_type varchar(20) not null,
  listing_id uuid not null,
  message text,
  preferred_channel varchar(20) check (preferred_channel in ('phone','whatsapp','email')),
  created_at timestamp not null default now()
);

create table media (
  id uuid primary key,
  listing_type varchar(20) not null,
  listing_id uuid not null,
  url varchar(500) not null,
  media_type varchar(20) not null default 'photo',
  created_at timestamp not null default now()
);

create table sponsored_listings (
  id uuid primary key,
  listing_type varchar(20) not null,
  listing_id uuid not null,
  starts_at timestamp not null,
  ends_at timestamp not null,
  priority int not null default 0
);
```

## 6) Endpoints da API (MVP)
### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Perfil
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `POST /api/v1/me/children`
- `GET /api/v1/me/children`

### Busca/Listings
- `GET /api/v1/listings?city=&specialty=&online=&minRating=&insurance=`
- `GET /api/v1/listings/:id`
- `GET /api/v1/listings/nearby?lat=&lng=&radiusKm=`

### Avaliacoes/Favoritos/Contato
- `POST /api/v1/reviews`
- `GET /api/v1/reviews/listing/:listingId`
- `POST /api/v1/favorites`
- `DELETE /api/v1/favorites/:listingType/:listingId`
- `GET /api/v1/favorites`
- `POST /api/v1/contacts`

### Admin
- `GET/POST/PATCH/DELETE /api/v1/admin/clinics`
- `GET/POST/PATCH/DELETE /api/v1/admin/professionals`
- `GET/POST/PATCH/DELETE /api/v1/admin/specialties`
- `GET/POST/PATCH/DELETE /api/v1/admin/insurances`
- `GET /api/v1/admin/reviews`
- `PATCH /api/v1/admin/reviews/:id/moderate`
- `GET /api/v1/admin/metrics/overview`

## 7) Estrutura de pastas sugerida
### Backend (NestJS)
```txt
apps/backend/
  src/
    main.ts
    modules/
      auth/
      users/
      children/
      listings/
      reviews/
      favorites/
      contacts/
      admin/
    common/
      guards/
      decorators/
      filters/
      interceptors/
  test/
```

### Flutter
```txt
apps/mobile/
  lib/
    core/
      theme/
      routing/
      network/
    features/
      auth/
      discovery/
      listing_details/
      favorites/
      profile/
    shared/
      widgets/
      models/
```

### Admin (Next.js)
```txt
apps/admin/
  src/
    app/
      (auth)/
      dashboard/
      clinics/
      professionals/
      reviews/
      specialties/
      insurances/
      banners/
    components/
    services/
```

## 8) Telas necessarias
### Mobile
- onboarding e boas-vindas;
- login/cadastro/recuperacao;
- home com busca e filtros;
- mapa/lista de resultados;
- detalhe de clinica/profissional;
- favoritos;
- perfil do responsavel + criancas;
- envio de avaliacao.

### Admin
- login admin;
- dashboard (usuarios, acessos, listings, avaliacoes pendentes);
- CRUD de clinicas/profissionais;
- CRUD de especialidades e convenios;
- moderacao de comentarios;
- banners e conteudos.

## 9) Fluxo principal do usuario
1. responsavel cria conta;
2. opcionalmente cadastra crianca;
3. aplica filtros (cidade, especialidade, online, convenio, nota);
4. compara resultados;
5. abre detalhe, consulta contatos e localizacao;
6. salva favorito;
7. envia interesse ou avaliacao apos atendimento.

## 10) Regras de negocio principais
- uma clinica pode ter varias especialidades e varios convenios;
- profissional pode atuar sozinho ou vinculado a clinica;
- review exige usuario autenticado e unicidade por usuario/listing;
- comentarios ficam sujeitos a moderacao;
- destaque patrocinado so via permissao admin;
- conteudo sensivel de crianca deve ser minimo e opcional.

## 11) Backlog inicial (12 semanas)
### Sprint 1-2
- setup monorepo, CI basica, auth email/senha;
- entidades base (users, clinics, professionals, specialties, insurances).

### Sprint 3-4
- busca/listagem com filtros;
- detalhe de listing;
- favoritos e pre-contato.

### Sprint 5-6
- reviews e moderacao;
- painel admin CRUD completo;
- upload de imagem com storage.

### Sprint 7-8
- geolocalizacao e proximidade;
- melhorias UX e acessibilidade;
- metricas basicas e banners.

### Sprint 9-10
- hardening de seguranca e performance;
- testes E2E e observabilidade.

### Sprint 11-12
- homologacao, correcao final e deploy.

## 12) Stack recomendada
- **Backend**: NestJS + PostgreSQL + TypeORM + JWT + Swagger.
- **Admin**: Next.js + TypeScript + React Query + Tailwind.
- **Mobile**: Flutter + Riverpod + Dio + GoRouter.
- **Infra**: Docker, Nginx, S3, Cloud SQL/RDS, GitHub Actions.

## 13) Limitacoes legais e tecnicas (importante)
- **Google Maps Places**: uso sujeito a termos/licencas e custo por requsicao; evitar persistir dados proibidos por contrato.
- **Scraping de avaliacoes publicas**: alto risco juridico e de bloqueio; preferir sistema proprio de reviews.
- **Dados de convenios**: evitar scraping de sites de operadoras; usar cadastro manual validado e parceria comercial.
- **LGPD**: dados de criancas exigem cuidado redobrado; coletar minimo necessario, base legal clara, consentimento explicito e politica de retencao.
- **Conteudo gerado por usuarios**: implementar moderacao, denuncia, trilha de auditoria e canal de remocao.

## 14) Proximos passos de implementacao
1. persistencia real com PostgreSQL e migracoes;
2. autenticar endpoints sensiveis com guard JWT e RBAC;
3. iniciar admin Next.js com login e CRUD de clinicas;
4. iniciar app Flutter com fluxo auth e listagem.
