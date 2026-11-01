/* ==========================================================================
   Licenças — dados
   Este é o único arquivo que precisa ser editado para mudar preços,
   limites, formatos, textos de ajuda, informações e contato.

   Valores aceitos nos termos de cada plano:
     true / false   → Sim / Não
     número         → "Até 5 mil" (texto de `limit` do termo)
     'ilimitado'    → texto de `unlimited` do termo
   ========================================================================== */

window.LICENSE_CONFIG = {
  locale: 'pt-BR',
  currency: 'BRL',

  /* true: mostra marcado "A confirmar" o que ainda não foi definido
     (campo `pending` das informações). Mude para false antes de publicar:
     as notas somem e os itens sem texto deixam de aparecer. */
  showPending: true,

  /* Todos os formatos possíveis, na ordem em que aparecem, e a explicação
     de cada um (aparece ao passar o mouse, tocar ou focar com o teclado).
     A linha "Incluso em…" é montada sozinha a partir dos planos. */
  formats: ['MP3', 'WAV', 'STEMS'],
  /* Resumo curto, ao lado de cada formato na legenda da tabela. */
  formatShort: {
    MP3: 'comprimido',
    WAV: 'sem compressão',
    STEMS: 'faixas separadas',
  },
  formatHelp: {
    MP3: 'Áudio comprimido: arquivo leve, com qualidade um pouco menor que a do WAV.',
    WAV: 'Áudio sem compressão, na qualidade original do beat. É o formato indicado para gravar e mixar.',
    STEMS: 'O instrumental dividido em arquivos separados, um para cada parte (bateria, baixo, melodia…), para mixar a voz com mais controle.',
  },

  /* Linhas dos Termos de Uso, na ordem em que aparecem.
     `icon` aceita: mic, disc, wave, video, ticket, radio.
     `help` explica o termo (tooltip). */
  terms: [
    {
      key: 'recording', label: 'Gravação musical', icon: 'mic', type: 'boolean',
      help: 'Gravar uma música original sua sobre o beat, com letra e/ou melodia próprias.',
    },
    {
      key: 'distribution', label: 'Distribuição de cópias', icon: 'disc', type: 'limit', limit: 'Até {n}', unlimited: 'Ilimitada',
      help: 'Vendas e downloads da música.',
    },
    {
      key: 'streams', label: 'Streams online', icon: 'wave', type: 'limit', limit: 'Até {n}', unlimited: 'Ilimitados',
      help: 'Reproduções da música em plataformas de streaming.',
    },
    {
      key: 'videos', label: 'Videoclipes', icon: 'video', type: 'limit', limit: 'Até {n}', unlimited: 'Ilimitados',
      help: 'Quantidade de videoclipes que podem usar a música.',
    },
    {
      key: 'live', label: 'Performances ao vivo', icon: 'ticket', type: 'boolean',
      help: 'Apresentar a música em shows.',
    },
    {
      key: 'radio', label: 'Rádio', icon: 'radio', type: 'boolean',
      help: 'Execução da música em emissoras de rádio.',
    },
  ],

  /* Licenças, na ordem em que aparecem.
     price:      número em reais, ou null para preço negociável (usa priceLabel)
     priceHelp:  explicação do preço (tooltip), usada na Exclusiva
     badge:      etiqueta de destaque, com borda vermelha (deixe vazio para nenhuma)
     exclusive:  true dá o tratamento visual da licença exclusiva */
  plans: [
    {
      id: 'padrao',
      name: 'Padrão',
      suffix: 'WAV',
      type: 'Não exclusiva',
      price: 79.9,
      formats: ['MP3', 'WAV'],
      terms: { recording: true, distribution: 5000, streams: 100000, videos: 2, live: true, radio: false },
    },
    {
      id: 'trackout',
      name: 'Trackout',
      type: 'Não exclusiva',
      price: 119.9,
      badge: 'Popular',
      formats: ['MP3', 'WAV', 'STEMS'],
      terms: { recording: true, distribution: 5000, streams: 200000, videos: 2, live: true, radio: false },
    },
    {
      id: 'ilimitada',
      name: 'Ilimitada',
      type: 'Não exclusiva',
      price: 179.9,
      formats: ['MP3', 'WAV'],
      terms: { recording: true, distribution: 10000, streams: 'ilimitado', videos: 5, live: true, radio: false },
    },
    {
      id: 'trackout-ilimitada',
      name: 'Trackout Ilimitada',
      type: 'Não exclusiva',
      price: 209.9,
      formats: ['MP3', 'WAV', 'STEMS'],
      terms: { recording: true, distribution: 'ilimitado', streams: 'ilimitado', videos: 'ilimitado', live: true, radio: true },
    },
    {
      id: 'exclusiva',
      name: 'Exclusiva',
      type: 'Exclusiva',
      price: null,
      priceLabel: 'A negociar',
      priceHelp: 'Valor e condições definidos por contato direto.',
      exclusive: true,
      formats: ['MP3', 'WAV', 'STEMS'],
      terms: { recording: true, distribution: 'ilimitado', streams: 'ilimitado', videos: 'ilimitado', live: true, radio: true },
    },
  ],

  /* Contato abaixo da tabela. Mesmo link de DM do site
     (ness.port/data/site.js). Deixe `url` vazio para mostrar só o texto. */
  contact: {
    title: 'Interessado em uma licença?',
    text: 'Entre em contato para negociar.',
    label: 'Chamar na DM',
    handle: '@nesshated',
    url: 'https://ig.me/m/nesshated',
  },

  /* Informações complementares. Os textos resumem o contrato de licença
     não exclusiva (ness/serverlicense/template/ness-license-template.html).
     pending: o que ainda falta definir; aparece marcado enquanto
     showPending for true. */
};
