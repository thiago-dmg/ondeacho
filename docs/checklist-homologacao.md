# Checklist de Homologação

## 1. Acesso e autenticação
- [ ] Cadastro de usuário responsável com e-mail/senha.
- [ ] Login de usuário responsável.
- [ ] Login administrativo com role `admin`.
- [ ] Persistência de sessão no app Flutter.

## 2. Busca e descoberta
- [ ] Listagem de clínicas carregando da API.
- [ ] Listagem de profissionais carregando da API.
- [ ] Filtro por especialidade funcionando.
- [ ] Filtro por convênio funcionando.
- [ ] Detalhe de clínica carregando por ID.

## 3. Avaliações e moderação
- [ ] Usuário autenticado consegue avaliar clínica.
- [ ] Bloqueio de avaliação duplicada por usuário/clínica.
- [ ] Admin consegue aprovar avaliação.
- [ ] Admin consegue rejeitar avaliação.

## 4. Favoritos e pré-contato
- [ ] Adicionar clínica aos favoritos.
- [ ] Remover clínica dos favoritos.
- [ ] Enviar pré-contato com canal preferido.
- [ ] Visualizar lista de pré-contatos enviados.

## 5. Admin CRUD
- [ ] Criar/editar/excluir clínicas.
- [ ] Criar/editar/excluir profissionais.
- [ ] Criar/editar/excluir especialidades.
- [ ] Criar/editar/excluir convênios.

## 6. Dados e infraestrutura
- [ ] Migration aplicada sem erro.
- [ ] Seed aplicada sem erro.
- [ ] API acessível via Swagger.
- [ ] Healthcheck (`/health`) retornando `ok`.
- [ ] Readiness (`/health/ready`) validando banco.
- [ ] Banco persistindo dados entre reinícios.

## 7. Qualidade mínima
- [ ] `npm run lint` no backend sem erros.
- [ ] `npm run --workspace apps/admin lint` sem erros.
- [ ] `flutter analyze` sem erros.
