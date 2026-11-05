# Stage 06.3 — Catálogo, imagens e layouts

## Auditoria anterior às correções

- WorkCard já é compartilhado entre Discover, busca completa, arquivo e itens de álbuns. É possível corrigir a apresentação sem reconstruir essas páginas.
- ItemImage preserva proporções e créditos, mas seu botão inclui legendas completas de alturas diferentes. Livros limitados a 214 px, música quadrada e fotos horizontais deixam títulos em posições diferentes. As regras de deslocamento do segundo cartão de arte/fotografia acentuam esse desalinhamento em coleções mistas.
- SearchPanel usa img diretamente, corta miniaturas com object-fit:cover e apenas esconde a imagem em caso de erro, deixando um espaço vazio. Não compartilha o fallback de ItemImage.
- Fallbacks grandes parecem ilustrações culturais e nem sempre exibem uma indicação visível de imagem ausente. É necessário distingui-los de imagens reais.
- Open Library já guarda cover_i e cover_edition_key e protege a capa específica quando o detalhe retorna uma capa genérica. Não substituir capas por correspondência de título.
- AIC só fornece imagens ao aplicativo quando is_public_domain=true. Usa uma única versão IIIF de 843 px em todos os contextos.
- MusicBrainz não inclui imagens nos resultados de pesquisa. A consulta CAA existente ocorre no detalhe, com cache e limite de frequência. Não disparar uma consulta por cartão.
- Firewatch usa um screenshot oficial da paisagem como capa padrão. Investigar key art na própria fonte oficial antes de substituir.
- Gutenberg já usa a capa do ebook específico; não é uma edição comercial. Journey, Ambient 2 e Migrant Mother têm imagens vinculadas às respectivas fontes reais. Não mudar a identidade desses registros para obter capas mais famosas.
- AlbumCover respeita uploads em IndexedDB e referências a obras, mas o quadro da capa de obra tem altura variável. Alterar somente apresentação; preservar metadados, ordem, Blob e personalização.
- Em telas menores, Personal.module.css ainda sobrescreve o recuo superior com 120 px. Corrigir o excesso sem redesenhar o editor.

Esta auditoria foi registrada antes das alterações de implementação. Fontes, decisões e resultados serão acrescentados após a verificação.

## A. Resultado da auditoria

As causas se dividem em apresentação, dados e disponibilidade externa. A altura das legendas e os deslocamentos de cartões eram problemas locais de CSS. O fallback da busca era uma implementação separada. Já a ausência de capas em resultados MusicBrainz vem do contrato do provedor, e as imagens AIC encontraram indisponibilidade externa nesta verificação. Não foram substituídos registros reais por demonstrações nem atribuídas capas por semelhança de título.

## B. Sistema visual e proporções

`WorkCard` continua atendendo salas, Discover, resultados, arquivo pessoal e itens dos álbuns. Os cartões usam um palco visual de 280 px no desktop e 260 px no celular; dentro dele, cada imagem tem seu próprio quadro. Isso alinha títulos e metadados sem transformar uma capa vertical numa imagem quadrada.

- Livros e filmes usam quadro vertical 2:3, sempre com a imagem inteira.
- Música usa quadro quadrado.
- Jogos usam dimensões verificadas quando disponíveis: Journey tem arte quadrada de 1175×1175; a arte de loja de Firewatch tem 460×215. O padrão sem metadados é 4:3.
- Fotografia e arte usam dimensões fornecidas/confirmadas quando disponíveis. Migrant Mother mantém a composição vertical de 821×1024. Na ausência de dimensões, o quadro usa um padrão, mas `object-fit:contain` continua preservando a imagem completa.

O palco comum alinha a grade; ele não determina a proporção da imagem. Quando a coluna é estreita, o quadro também encolhe. Não há esticamento ou recorte por `cover`. Retiramos os deslocamentos do segundo cartão de fotografia/arte, que desalinhavam coleções mistas.

Títulos continuam inteiros e podem crescer para várias linhas. Linhas, espaçamento e áreas mínimas organizam título, criador, categoria e ano. Os botões pessoais continuam disponíveis e têm altura mínima de 44 px. O indicativo Quick Preview aparece no hover/foco; em dispositivos sem hover, fica compacto, para não cobrir desnecessariamente a capa.

Créditos curtos ocupam duas linhas reservadas; direitos completos permanecem no DOM para tecnologias assistivas, no título de ajuda e na prévia/detalhe. A identificação da obra não depende da imagem: título, criador e categoria seguem em texto.

O detalhe limita o palco a 400 px no desktop e 320 px no celular. A prévia usa 180/140 px; abaixo de 380 px, imagem e título ficam empilhados para evitar fragmentar nomes como Frankenstein. O diálogo conserva sua própria rolagem. Nenhuma ação de arquivo, avaliação, álbum ou destino externo foi retirada.

Discover e busca usam o mesmo sistema, com títulos de página de até 64 px e espaçamentos compartilhados. A introdução, o mosaico, a navegação, a marca e as seis animações de entrada não foram alterados.

## C. Fontes e normalização

| Categoria | Fonte atual e relação com a obra |
| --- | --- |
| Livros | Gutenberg para ebooks editoriais e Open Library para buscas. `cover_i` identifica a imagem; `cover_edition_key` identifica sua edição. A proteção existente contra trocar uma capa específica por uma capa genérica foi mantida. |
| Filmes | O pôster editorial de Metropolis vem do Wikimedia Commons e mantém o crédito de Boris Bilinski. Há uma miniatura de 500 px extraída da página de origem. TMDB continua sem integração de imagem/pesquisa ao vivo configurada. |
| Jogos | Journey usa a arte oficial do desenvolvedor. Firewatch passou do screenshot para a arte da página Steam indicada pelo site oficial. Nenhum endereço de capa foi deduzido pelo título. |
| Música | Ambient 2 mantém a imagem da discografia oficial. MusicBrainz fornece metadados; Cover Art Archive fornece a capa frontal aprovada vinculada à release retornada, quando o detalhe consegue consultá-la. |
| Fotografia | Migrant Mother usa a fotografia da Library of Congress e mantém crédito e declaração de direitos. Unsplash ao vivo permanece sem configuração. |
| Arte | AIC fornece identificador IIIF e informação de domínio público. Só são normalizadas imagens com `is_public_domain === true`. O link oficial da coleção é preservado quando a imagem falha. |

O campo `image` recebeu metadados **opcionais**: `provider`, `kind`, `width`, `height` e `thumbnailUrl`. Os campos anteriores continuam aceitos. O snapshot pessoal preserva esses dados, filtrando dimensões inválidas e URLs inseguras. A versão do arquivo local continua 1; não é necessário migrar ou limpar os dados do usuário.

`artworkUrls` escolhe URLs explicitamente fornecidas: miniatura primeiro para cartões, busca, álbuns e prévia; versão principal primeiro para detalhe. Nunca gera imagens por nome de obra. Open Library usa M nos cartões e L no detalhe, com o mesmo identificador. AIC usa IIIF de 400/843 px com o mesmo image_id. CAA usa as variantes retornadas de 250/500 px, quando válidas.

O cache mantém capas musicais já obtidas quando uma pesquisa posterior omite a imagem. Essa preservação é restrita a resumos de livros e registros musicais: uma nova resposta de museu sem permissão de domínio público não deve recuperar a imagem anterior. Há teste para essa distinção. Não foram acrescentadas consultas por cartão; a consulta CAA continua no detalhe com os limites e o cache existentes.

Fontes consultadas nesta etapa:

- [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers): tamanhos S/M/L, identificação e hotlink.
- [AIC — documentação de imagens](https://api.artic.edu/docs/#images): IIIF e direitos.
- [Frankenstein, ebook 84](https://www.gutenberg.org/ebooks/84) e [Pride and Prejudice, ebook 1342](https://www.gutenberg.org/ebooks/1342): registros específicos, sem fingir uma edição comercial.
- [Firewatch oficial](https://www.firewatchgame.com/) e [loja indicada pelo desenvolvedor](https://store.steampowered.com/app/383870/Firewatch/): URL e dimensões da arte extraídas da página carregada.
- [Pôster de Metropolis na origem](https://commons.wikimedia.org/wiki/File:Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg): miniatura extraída do DOM da página.

Não foi encontrada uma variante maior confirmada nas páginas Gutenberg inspecionadas. As capas atuais têm 195×300 e 192×300; não inventamos uma URL maior. Algumas fontes editoriais só oferecem a variante já conhecida. A documentação CAA respondeu 429 ao navegador de pesquisa; os campos existentes foram preservados e exercitados com fixtures, sem alegar validação ao vivo de MusicBrainz nesta etapa.

## D. Arquivos e responsabilidades

| Arquivo | Alteração |
| --- | --- |
| `src/services/artwork.ts` — novo | Seleção finita de variantes, proporções e filtragem dos metadados opcionais. |
| `src/types/catalog.ts` | Estende image de forma compatível com os registros antigos. |
| `src/services/providers.ts` | Mapeia variantes e identificação de capas Open Library/CAA e imagens IIIF do AIC. |
| `src/services/catalog.ts` | Preserva imagens musicais já enriquecidas sem restaurar imagens de museu retiradas pela resposta atual. |
| `src/data/artwork.ts` | Arte de loja Firewatch, miniatura do pôster e dimensões verificadas. |
| `src/data/curated.ts` | Variantes menores IIIF para os registros editoriais existentes. |
| `src/features/discovery/ItemImage.tsx` | Renderização compartilhada, estados de carregamento e fallback explícito. |
| `src/features/discovery/Artwork.module.css` | Palco, quadros por proporção, legendas e variantes de contexto. |
| `src/features/experiences/WorkCard.tsx` | Imagem de cartão, nomes das categorias e interação discreta de prévia. |
| `src/features/experiences/Experiences.module.css` | Alinhamento de grades, títulos, prévia e detalhe. |
| `src/features/discovery/SearchPanel.tsx` | Reutiliza ItemImage para miniaturas completas, inclusive o fallback. |
| `src/features/discovery/QuickPreview.tsx` | Usa crédito compacto no cabeçalho; direitos completos continuam no conteúdo. |
| `src/features/discovery/Discovery.module.css` | Hierarquia dos títulos e espaçamento de seções. |
| `src/features/personal/AlbumTools.tsx` | Contexto de imagem próprio da capa de obra; decodificação assíncrona do upload. |
| `src/features/personal/Personal.module.css` | Limites da capa, grades mistas, controles e recuo móvel corrigido. |
| `src/features/personal/schema.ts` | Preserva os novos metadados opcionais no snapshot local. |
| `src/test/ArtworkPresentation.test.tsx` — novo | Quinze casos de resolução, permissão, persistência, fallback e teclado. |
| `src/test/Covers.test.tsx` e `src/test/Discovery.test.tsx` | Adaptam expectativas à tentativa finita de variantes e ao placeholder explícito. Os testes de upload continuam exercitando o fluxo completo. |
| `docs/18-catalog-artwork.md`, evidências e README | Auditoria, aprendizado e resultados. |

`CatalogResults`, páginas de busca, salas e arquivo reutilizam WorkCard; não precisaram ser reconstruídos. A lógica de ordenação, filtros e paginação não foi alterada. O armazenamento de uploads continua em IndexedDB, com referências nos metadados; não houve substituição de Blob, migração, reset de capa ou alteração dos álbuns existentes pelo código desta etapa. Nenhuma dependência foi adicionada.

## E. Verificação executada

### Automação

- TypeScript, lint e build de produção: aprovados na execução final.
- `npm test -- --reporter=dot`: **231 testes em 17 arquivos**, todos aprovados. São 15 testes novos, além dos 216 anteriores.
- Inclui upload/substituição/refresh/seleção/remoção de capa, limites de armazenamento, metadados de imagem, proteção de edição, direitos AIC, URL inválida, tentativas finitas, imagens lentas com quadro estável, miniaturas decorativas e ativação por teclado.
- Os testes de provedores usam fixtures explícitas, não disponibilidade real das APIs. O lint do projeto é a checagem estática TypeScript, não ESLint.

### Navegador integrado

No servidor habitual de `127.0.0.1:5180`, foram executados:

- As seis salas: carregamento real de Gutenberg, pôster Metropolis, Journey, Firewatch, Ambient 2 e Migrant Mother. `naturalWidth` foi diferente de zero para essas imagens; o ajuste observado é contain.
- Arte: AIC não carregou nas duas variantes; fallback explícito confirmado. Isso é uma limitação externa, não uma imagem real validada nesta sessão.
- Discover e busca completa: cartões, títulos e navegação. Ctrl+K e miniatura do resultado Frankenstein preservaram imagem inteira e alt decorativo.
- Quick Preview em desktop, 390 e 320 px. A prévia de 320 px inicialmente fragmentava Frankenstein; o empilhamento corrigiu o título, confirmado em uma única linha sem transbordamento horizontal.
- Detalhes de livro e fotografia; foto original inteira, com quadro de até 320 px no celular.
- Salvar, Want to Experience e nota 4: persistiram após refresh. As alterações temporárias dessas três ações foram desfeitas.
- Criado um álbum identificado **Stage 06.3 — Visual QA**, separado dos álbuns anteriores, com Frankenstein e Ambient 2. Upload PNG, substituição por PNG vertical, refresh, seleção da imagem de uma obra e remoção foram executados. O upload vertical persistido tinha 180×320 e o quadro desktop ficou limitado a 240 px com contain.
- Reordenação dos dois itens persistiu após refresh; foi restaurada à ordem inicial. O preset Reading list foi aberto e medido sem overflow, depois restaurado a Gallery grid.
- Grades Discover, busca e álbum foram medidas em **320×740, 390×844, 768×1024 e 1440×1000**: sem rolagem horizontal da página nas 12 combinações. Imagens de cartões não excederam 280 px de altura. As grades apresentaram 1/2/3 colunas conforme o espaço, sem esticar as imagens.

O álbum de QA permanece somente no arquivo do navegador integrado, com capa removida ao final do fluxo. Álbuns e uploads anteriores não foram modificados. Uma tentativa de servidor separado na porta 5181 não ficou acessível ao navegador; esse processo foi encerrado e a verificação ocorreu no servidor habitual.

Evidências em `docs/evidence/`: `stage-06-3-discover-desktop.jpg`, `stage-06-3-preview-desktop.jpg`, `stage-06-3-search-mobile.jpg`, `stage-06-3-preview-mobile.jpg`, `stage-06-3-mixed-album.jpg`, `stage-06-3-fallback-mobile.jpg` e `stage-06-3-layout-checks.json`. O JSON registra as medidas coletadas durante a inspeção; as capturas finais refletem os ajustes posteriores de texto/legenda.

## F. Limites e desempenho

Cada contexto reserva espaço antes da imagem carregar. Há lazy loading para cartões, busca e capas; prévia/detalhe carregam imediatamente, com `decoding="async"`. Em fontes com variantes conhecidas, usamos a menor apropriada. O navegador usa seu cache HTTP normal; o cache de metadados e de CAA existente continua ativo. Não adicionamos uma biblioteca de processamento ou download de originais.

A imagem tenta no máximo as duas URLs distintas fornecidas. Se ambas falham, o quadro permanece e mostra um monograma e aviso inequívoco. Não existem timers de repetição infinita. Imagem lenta exibe Loading artwork sem deslocar título ou ações. Uma imagem sem variante ou dimensão continua válida e mantém a composição inteira.

Não é possível garantir capas para todos os registros: MusicBrainz não fornece capa na pesquisa; CAA pode não ter uma release aprovada; AIC pode ficar indisponível; TMDB/RAWG/Unsplash continuam sem integrações ao vivo configuradas. Demonstrações ficcionais existentes continuam identificadas como tal. Não foram inventadas capas, licenças, estatísticas ou dados comunitários.

A nitidez de alguns ebooks é limitada à resolução confirmada da origem. Também não foram medidos desempenho em aparelho físico, consumo de dados em rede móvel, leitores de tela reais, Safari ou zoom nativo. Os testes de carregamento/erro no Vitest simulam eventos; a impossibilidade de carregar AIC no navegador foi observada de verdade, mas não simula todas as falhas de todos os provedores.

## G. Roteiro de revisão

1. Em Discover, compare Frankenstein e Pride and Prejudice: capas legíveis, títulos alinhados e créditos preservados.
2. Explore cada sala e confira o quadro adequado a capa, pôster, disco, fotografia e pintura. Um placeholder deve dizer claramente que a imagem está ausente.
3. Pesquise Frankenstein, abra Quick Preview com teclado e depois Open full record. Confira Save, Want to Experience, nota e Add to Album.
4. Abra Ctrl+K/Cmd+K e observe que a miniatura não recorta a capa.
5. Em My Archive, compare categorias mistas. Crie um álbum de revisão e alterne entre Gallery grid e Reading list.
6. Envie uma capa própria, substitua, recarregue, escolha uma obra e remova a capa. Esses testes não devem exigir conta nem sobrescrever outro álbum.
7. Confira o celular, incluindo 320 px, títulos longos e a rolagem da prévia. Verifique também seu Brave e aparelho habitual, pois a inspeção desta entrega usou o navegador integrado.

## H. Próxima etapa

Stage 06.4 — Category Rooms & Cinematic Experience Refinement. **Não iniciada.**
