# Stage 03 — auditoria e correção de destinos externos

Data: 04/11/2026. Escopo: código existente em `outputs/noctis`; sem redesign, novas dependências ou início da Stage 04.

## Causas encontradas

| Hipótese                               | Evidência nesta cópia                                                                                                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A obra não possui destino real         | As 18 demonstrações são fictícias e não têm URL real. Não devemos vincular um livro/álbum/filme de outra pessoa apenas porque o título é parecido.                                                                                          |
| O provedor não oferece o link na busca | MusicBrainz retorna resultados resumidos; os relacionamentos com serviços externos exigem consulta de detalhes com `url-rels`. Uma relação Spotify também pode estar apenas em outra edição, não no grupo de lançamentos consultado.        |
| Adaptador descarta campos disponíveis  | Open Library não extraía `links` de detalhes; MusicBrainz não extraía `relations`. O modelo não possuía destinos tipados.                                                                                                                   |
| Normalização/cache perde o link        | A memória substituía o registro inteiro por respostas resumidas. Não distinguia lista de links ausente de lista completa vazia. O cache da busca também podia retornar uma cópia anterior ao enriquecimento da ficha.                       |
| A interface oculta uma URL existente   | Não encontramos um caso de URL de fonte HTTPS válida escondida pelo JSX antigo. O problema era a limitação a um único “View source”, sem diferenciar catálogo, site oficial ou reprodução. O novo bloco é compartilhado por prévia e ficha. |
| URL inválida elimina o registro        | A validação do cliente exigia URL da fonte para aceitar metadados. Agora o registro pode continuar visível sem URL utilizável; o componente de destinos explica a indisponibilidade e não renderiza links inseguros.                        |

Nesta cópia não havia URLs Spotify cadastradas, nem adaptadores ativos de TMDB, RAWG ou Unsplash. O relato do usuário orientou a auditoria; não presumimos que esse conjunto de arquivos continha as mesmas ligações observadas em outra sessão ou seleção de resultados.

## Como funciona a seleção

`Work.destinations` contém tipo, URL e proveniência: `provider` quando veio de um campo do próprio registro, ou `curator` quando foi conferida na curadoria. Esses marcadores registram a origem da associação; não significam uma checagem HTTP em tempo real a cada clique.

`getDestinations` valida candidatos, agrupa URLs repetidas e prioriza destinos por categoria. Depois inclui a fonte original como alternativa informativa, quando seu tipo é reconhecível.

| Categoria      | Preferência e fallback                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Books          | Editora ou página de loja explicitamente associada à obra; depois catálogo. O adaptador reconhece produtos Amazon com ASIN e registros Google Books com ID quando fornecidos em `links`. Uma resenha ou um link desconhecido não é promovido a editora/loja pelo título do campo. Open Library e Gutenberg aparecem como **View Book Details**, com aviso explícito de catálogo e ausência de promessa de compra. |
| Music          | Spotify somente com URL direta de álbum/faixa fornecida por relação de streaming válida. Caso contrário, **View on MusicBrainz**. Uma discografia de artista é identificada separadamente como **View Artist Discography**, sem fingir ser player.                                                                                                                                                                |
| Films & Series | Destinos de streaming/distribuidor exigem associação explícita e verificada nos dados. Sem eles, usa-se página TMDB conhecida como **View on TMDB**, com aviso de que é informativa. Sem ID/URL TMDB, uma fonte de cinema existente pode ser mostrada como informação; nenhum ID é adivinhado.                                                                                                                    |
| Games          | Site oficial ou storefront verificado; depois registro do catálogo. Os sites existentes de Journey e Firewatch são reconhecidos como oficiais.                                                                                                                                                                                                                                                                    |
| Photography    | Página original da fotografia quando conhecida. Guias de contexto permanecem identificados como fonte de fotografia, não como a fotografia original.                                                                                                                                                                                                                                                              |
| Art            | Registro oficial da obra no museu, **View Museum Collection**. A fonte Art Institute usa a página de seu identificador de obra.                                                                                                                                                                                                                                                                                   |

Somente URLs HTTPS são renderizadas. HTTP legado é convertido para HTTPS apenas em serviços conhecidos que já usam esse protocolo. Rejeitamos credenciais na URL, portas não padrão, pesquisas genéricas apresentadas como obras, Spotify de artista/pesquisa, domínios parecidos com Spotify e combinações incompatíveis de categoria e tipo. Spotify precisa de host e caminho de álbum/faixa válidos; MusicBrainz precisa de entidade e UUID válidos; TMDB precisa de movie/tv com ID.

Não há consulta por nome seguida de um link inventado. Uma URL bem formada não prova disponibilidade regional, assinatura, estoque ou preço; os textos evitam essas promessas.

## Correções de dados locais

- _Metropolis_: acrescentada a página específica [TMDB movie 19](https://www.themoviedb.org/movie/19-metropolis), conferida como o filme de 1927. A fonte MoMA permanece nos créditos. Isso não ativa a API TMDB nem anuncia streaming.
- _Ambient 2_: acrescentado o [registro MusicBrainz](https://musicbrainz.org/release/4395aa9b-c167-404f-b941-2c18fde490d7), identificado pelo [registro oficial de detalhes indexado](https://musicbrainz.org/release/4395aa9b-c167-404f-b941-2c18fde490d7/details). O rótulo indica informação de lançamento, não escuta. Nenhum Spotify foi inventado.
- _Migrant Mother_: acrescentada a [página original na Library of Congress](https://www.loc.gov/item/2017762891/), mantendo o guia contextual como fonte.

As fontes oficiais indexadas confirmam a identidade dos registros; o leitor web encontrou bloqueios/indisponibilidade ao acessar diretamente MusicBrainz e Library of Congress. Portanto não afirmamos que todas as páginas externas responderam HTTP 200 nesta sessão. Links de serviços externos podem exigir acesso permitido, variar por região ou ficar indisponíveis.

Os 9 registros reais locais têm pelo menos um destino tipado. As 18 demos continuam sem destino fabricado e agora explicam isso na interface.

## Extração e preservação

O servidor passou a solicitar `artist-credits+tags+url-rels` no detalhe MusicBrainz. O adaptador lê relações de streaming com recurso Spotify; relações encerradas e URLs inadequadas são descartadas. Open Library extrai apenas destinos cujo tipo podemos identificar com segurança. Os demais continuam acessíveis pela página do próprio catálogo.

A prévia enriquece registros externos de Books/Music sob demanda. Mantém o link informativo enquanto aguarda e apresenta aviso não bloqueante em caso de falha. A ficha continua usando seu enriquecimento existente. Não há busca massiva de edições para tentar achar Spotify.

No cache, `destinations` ausente significa “esta resposta não informa a lista”; nesse caso preservamos os links anteriores. `destinations: []` significa uma lista completa sem destinos válidos e pode remover links anteriores. Isso evita perpetuar um Spotify retirado pelo provedor. A fonte também é preservada quando uma resposta do mesmo provedor omite sua URL. Resultados de busca em cache consultam a versão mais recente do registro conhecido.

Referências técnicas consultadas: [MusicBrainz API e relações](https://musicbrainz.org/doc/MusicBrainz_API), [Books API](https://openlibrary.org/dev/docs/api/books), [Search API](https://openlibrary.org/dev/docs/api/search). Resultados resumidos não prometem incluir todos os links de uma ficha.

## Arquivos alterados

| Arquivo                                                  | Responsabilidade da mudança                                                                                                                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/catalog.ts`                                   | `DestinationKind`, `Destination`, campo opcional de destinos e fonte sem URL obrigatória.                                                                                                                             |
| `src/services/destinations.ts` — novo                    | Validação, rótulos, prioridade, fallback, extração MusicBrainz/Open Library e união de listas.                                                                                                                        |
| `src/services/providers.ts`                              | Preserva as URLs disponíveis dos provedores, distinguindo campos ausentes de listas vazias.                                                                                                                           |
| `server/catalog.mjs`                                     | Solicita relações de URL MusicBrainz e marca listas de detalhes completas, inclusive vazias.                                                                                                                          |
| `src/services/catalog.ts`                                | Preserva destinos/fonte entre respostas resumidas e detalhes, sanitiza URLs e atualiza resultados vindos do cache. Metadados sem URL não são descartados apenas por isso.                                             |
| `src/hooks/useDestinationRecord.ts` — novo               | Enriquecimento cancelável da prévia para registros externos de livros e música; mantém informação conhecida durante falhas.                                                                                           |
| `src/features/discovery/ExternalDestinations.tsx` — novo | Bloco comum de ações externas e estado indisponível, com rótulos por tipo.                                                                                                                                            |
| `src/features/discovery/QuickPreview.tsx`                | Usa o registro enriquecido, sem alterar a navegação ao detalhe.                                                                                                                                                       |
| `src/features/experiences/WorkContent.tsx`               | Coloca o bloco compartilhado na prévia e na ficha, mantendo os créditos originais.                                                                                                                                    |
| `src/data/curated.ts`                                    | Associa os três destinos conferidos acima sem trocar IDs ou rotas.                                                                                                                                                    |
| `src/styles/global.css`                                  | Apenas utilitário acessível `.srOnly` para anunciar abertura em nova aba.                                                                                                                                             |
| `src/test/Destinations.test.tsx` — novo                  | Extração, classificação, validação, cobertura das seis categorias, enriquecimento da prévia e preservação/remoção em cache. URLs Spotify e ASIN usados em fixtures são sintéticos, nunca anunciados como links reais. |
| `server/catalog.test.mjs`                                | Confirma que o pedido de detalhes inclui `url-rels`.                                                                                                                                                                  |
| `README.md` e este documento                             | Registro didático da correção e das limitações.                                                                                                                                                                       |

## Verificação

A cobertura estática confirmou **9/9** registros reais locais com destino e **18/18** demos sem links inventados. No Brave, conferimos um exemplo real e um fictício em cada uma das seis categorias: o real apresentou o rótulo apropriado e o fictício mostrou indisponibilidade explícita.

Os testes automatizados incluem prévia → ficha nas seis categorias, destinos inseguros, extração de URLs fornecidas, ausência de relações, Spotify sintético na prévia, cache resumido, atualização da fonte e remoção explícita de um destino.

Resultados finais realmente obtidos:

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado; usa as regras estáticas TypeScript existentes, não ESLint.
- `npm test -- --reporter=dot`: **113 testes aprovados em 5 arquivos**.
- `npm run build`: aprovado; JavaScript aproximadamente 461 kB / 148,4 kB gzip.
- `node --check server/catalog.mjs`: sintaxe aprovada.
- Brave: seis fichas reais e seis demos conferidas; também abrimos a prévia de Frankenstein e navegamos à ficha, confirmando o mesmo destino e a indicação de que é informação de catálogo, não compra.

MusicBrainz ao vivo continua dependendo da configuração de contato do servidor; Spotify foi exercitado com fixtures, sem alegação de reprodução real. Não habilitamos as APIs desconectadas nem iniciamos a Stage 04.
