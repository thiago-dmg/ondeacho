# LGPD, Retenção e Segurança Mínima

## Princípios de dados
- Coletar somente dados necessários para descoberta de atendimento.
- Evitar dados clínicos sensíveis da criança no MVP.
- Manter consentimento explícito para cadastro de perfis infantis.

## Base legal e transparência
- Exibir política de privacidade no app e no admin.
- Informar finalidade de uso para avaliações, favoritos e pré-contatos.
- Permitir solicitação de exclusão de conta e dados associados.

## Retenção recomendada
- **Contas ativas**: manter enquanto houver vínculo.
- **Pré-contatos**: reavaliar após 12 meses sem atividade.
- **Logs técnicos**: 30 a 90 dias (sem dados sensíveis).
- **Backups**: retenção de 15 a 30 dias em ambiente seguro.

## Segurança mínima obrigatória
- HTTPS em todos ambientes públicos.
- Segredo JWT forte e rotacionável.
- CORS restrito por ambiente.
- Rate limit ativo para proteção básica.
- Controle de acesso por role (admin/clinica/responsável).
- Revisão periódica de permissões administrativas.

## Processo operacional
- Definir responsável por atendimento de solicitações LGPD.
- Criar rotina de exportação/exclusão de dados por usuário.
- Registrar incidentes de segurança e ações corretivas.
