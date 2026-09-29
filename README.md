# Lista Online Futeboleiros

Pagina publica estatica para inscricao na lista online do Futeboleiros.

## Como publicar no GitHub Pages

Suba estes arquivos na raiz de um repositorio publico:

- `index.html`
- `styles.css`
- `app.js`
- `.nojekyll`
- `.gitignore`

Depois ative o GitHub Pages em `Settings > Pages` usando a branch principal.

## URL esperada pelo app

O app esta gerando links neste formato:

```text
https://futeboleiros.github.io/lista-online/?lista=ID_DA_LISTA
```

Para esse link funcionar sem mudar o app, publique em:

- usuario/organizacao GitHub: `futeboleiros`
- repositorio: `lista-online`

## Seguranca

Esta pagina e publica. Nao coloque chaves secretas aqui.

O arquivo `app.js` usa apenas a chave publica `publishable` do Supabase, que pode ficar no navegador. A seguranca real fica nas funcoes RPC do Supabase:

- `buscar_lista_online_publica`
- `inscrever_jogador_lista_online`

Essas funcoes limitam os dados expostos e controlam a inscricao no banco.

A pagina nao deve conter:

- `service_role key`
- senha de banco
- tokens privados
- arquivos `.env`
- backups `.racha`
- bancos `.sqlite`, `.db`

## Teste rapido

Abra:

```text
https://futeboleiros.github.io/lista-online/?lista=ID_DA_LISTA
```

Troque `ID_DA_LISTA` pelo id de uma lista criada no app.
# lista-online
