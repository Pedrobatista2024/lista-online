# Lista Online Futeboleiros

Página pública de inscrição para a lista online do Futeboleiros.

Essa página permite que jogadores entrem em uma lista de racha usando um link compartilhado pelo organizador. Ela foi feita para facilitar a montagem da pré-lista sem que o organizador precise adicionar cada jogador manualmente.

## Para Que Serve

A lista online serve para:

- permitir que jogadores pesquisem o próprio nome;
- entrar na lista do racha;
- ver a ordem das inscrições;
- separar jogadores por tipo de vaga:
  - goleiros;
  - titulares;
  - reservas;
  - lista de espera;
- mostrar se as inscrições estão abertas ou fechadas.

## Como Funciona

O organizador cria uma lista dentro do app Futeboleiros.

Depois disso, o app gera um link público da lista. Esse link pode ser enviado no WhatsApp ou em outro canal.

Quando o jogador abre o link:

1. Ele pesquisa o próprio nome.
2. Confirma que é ele pela posição e, quando disponível, pela data parcial de nascimento.
3. Toca para entrar na lista.
4. A página registra a inscrição.
5. O app do organizador recebe essa inscrição e atualiza a lista online.

A ordem das vagas é definida pelo servidor, não pelo navegador. Isso evita problemas quando várias pessoas entram ao mesmo tempo.

## Regras Da Lista

- A inscrição só funciona quando a lista está aberta.
- Se a lista estiver fechada, ninguém consegue entrar pela página.
- Cada jogador só pode estar uma vez na mesma lista.
- Se as vagas principais estiverem cheias, o jogador pode cair como reserva ou lista de espera, conforme a configuração da lista.
- Goleiros entram nas vagas de goleiro.
- Jogadores de linha entram nas vagas de linha, reserva ou espera.

## Privacidade

Esta página mostra somente as informações necessárias para o jogador se identificar e acompanhar a lista.

A página não exibe:

- email;
- telefone;
- foto;
- data completa de nascimento;
- dados internos do app;
- dados de outras organizações.

Quando existe data de nascimento cadastrada, a página mostra apenas dia e mês.

## Segurança

Esta página é pública e roda no navegador. Por isso, ela não deve conter chaves secretas, senhas ou arquivos privados.

A página usa apenas uma chave pública do Supabase, apropriada para uso no navegador.

A segurança real fica nas funções controladas no Supabase, que limitam o que a página pode ler e fazer.

Não suba para este repositório:

- chaves `service_role`;
- senhas;
- arquivos `.env`;
- backups `.racha`;
- arquivos `.db`, `.sqlite` ou bancos locais;
- dados privados de usuários.

## Publicação

Esta página foi preparada para GitHub Pages.

Arquivos principais:

- `index.html`
- `styles.css`
- `app.js`

O link da lista segue o formato:

```text
https://pedrobatista2024.github.io/lista-online/?lista=ID_DA_LISTA
