# Licenças: tabela informativa

Tabela de licenças de beats, só informativa: a compra e a negociação acontecem por DM. Não tem checkout, carrinho nem seleção. HTML, CSS e JavaScript puro, sem dependências.

```
index.html               página de demonstração com a seção
assets/                  favicon com a cruz (SVG + PNGs de 32 e 180 px)
css/licenses.css         estilos (classes .lic-*, cores em variáveis no .lic)
js/licenses.config.js    dados: preços, limites, textos de ajuda, contato, informações
js/licenses.js           monta a tabela a partir dos dados
```

## Editar o conteúdo

Edite apenas `js/licenses.config.js`.

- **Preços e limites:** cada licença tem `price`, `formats` e `terms`. Use um número para "Até 5 mil", `'ilimitado'` para ilimitado e `true`/`false` para Sim/Não.
- **Explicações (tooltips):**
  - `formatHelp` explica MP3, WAV e STEMS. A linha "Incluso em…" é montada sozinha a partir dos planos.
  - `formatShort` é o resumo de duas ou três palavras que aparece ao lado de cada formato, na legenda da tabela.
  - `help` de cada termo explica a linha da tabela.
  - `priceHelp` explica o "A negociar" da Exclusiva.
- **Destaque:** a licença com `badge` ganha borda vermelha e a etiqueta ("Popular" no Trackout).
- **Contato:** `contact.url` é o link de DM do Instagram, o mesmo de `ness.port/data/site.js`. Vazio, aparece só o texto.
- **Informações complementares:** a lista `info`. Os textos resumem o contrato de licença não exclusiva em `ness/serverlicense/template/ness-license-template.html`.

## Antes de publicar

Com `showPending: true`, o que ainda não está definido aparece marcado como "A confirmar" e é listado no console do navegador:

- percentual de coautoria do produtor no cadastro da música;
- termos da licença exclusiva;
- canal para pedir a liberação de uma reivindicação de Content ID.

Depois de preencher, mude para `showPending: false`. As marcações somem e os itens sem texto deixam de aparecer.

## Layout

O layout se adapta à largura da própria seção (container queries), não à da janela:

- **A partir de 1040px:** tabela com os termos à esquerda e uma coluna por licença, com as linhas alinhadas. A legenda dos arquivos fica no canto, e passar o mouse numa linha destaca aquele termo em todas as licenças.
- **Abaixo de 1040px:** aparece uma barra com a legenda dos arquivos e o seletor "Por licença / Comparar termos".
  - "Por licença" mostra um card por licença: 3 + 2, depois 2 colunas, depois empilhados.
  - "Comparar termos" mostra um bloco por termo, com as cinco licenças lado a lado na lista.

As explicações abrem ao passar o mouse, ao focar pelo teclado ou ao tocar. Fecham com Esc, com um toque fora ou ao rolar a página.

## Colocar no site

1. No `<head>`, copie o link das fontes, o `css/licenses.css` e os dois scripts (o `licenses.config.js` vem antes do `licenses.js`).
2. Copie o bloco `<section class="lic" ...>` do `index.html`, entre os comentários de início e fim.

## Testar localmente

```bash
python -m http.server 5178
```

Depois abra http://localhost:5178.
