# NOCTIS — revisão editorial e exposição After Hours

Entrega local de 05/11/2026. Interface em inglês; explicação em português. Não houve deploy, push, configuração de autenticação ou descarte do arquivo pessoal. Nenhuma dependência foi adicionada. A base e as ilustrações das seis salas continuam no projeto.

## Incremento 1 — confiabilidade e acabamento

### O que mudou e por quê

- A experiência principal passou de nove obras reais misturadas com dezoito demonstrações para **17 obras reais**: três livros, três filmes, três jogos, três álbuns, duas fotografias e três pinturas. É uma seleção editorial pequena, não um catálogo completo. As demonstrações saíram da busca e das salas principais, mas seus identificadores, fichas antigas e referências pessoais continuam disponíveis. O cache não elimina esses registros legados.
- Os hotlinks de imagens do Art Institute of Chicago estavam sujeitos ao mesmo bloqueio externo HTTP 403 observado na auditoria. Foram incluídas reproduções verificadas de **La Grande Jatte**, **The Bedroom** e **Paris Street; Rainy Day**, associadas aos registros exatos. Bedroom é a versão de Chicago de **1889**, não a versão de 1888. La Grande Jatte é a pintura de Seurat, não um estudo preparatório de outro museu.
- Imagens redistribuídas ficam em `public/artworks/`, com versão menor para cartões quando a origem permite. O manifesto `sources.json` registra página de origem, URL efetivamente obtida, crédito, direitos declarados pela fonte, dimensões e data de verificação. Não foi feita busca genérica de imagens para preencher cartões.
- A consulta local a Open Library por Frankenstein respondeu HTTP 200 e trouxe referência de edição e capa. Portanto, **a indisponibilidade publicada não foi reproduzida aqui**. A busca continua dependente do provedor, mas uma falha não remove a seleção local nem vira uma afirmação de que a obra não existe. Exceções inesperadas do hook agora terminam o carregamento e informam busca incompleta.
- O breadcrumb sempre leva à sala. Um link independente preserva a consulta de busca. O validador de retorno aceita também a exposição e o fragmento editorial do Discover; continua recusando redirecionamentos externos.
- Mudar uma coleção editorial desloca a página até a seleção, coloca o foco na seção e anuncia título e quantidade. O link da homepage para Follow a Thread chega à seção correta.
- Discover deixou de promover comunidade não configurada. A navegação de portfólio existente foi preservada. Créditos, diagnósticos de fontes e explicações extensas de armazenamento continuam acessíveis em áreas expansíveis.
- Contagens agora distinguem `1 work` de `2 works`. Não há filtro para reinserir demonstrações fictícias na experiência principal.

### Fontes e direitos

As reproduções dos arquivos do Commons foram selecionadas após conferir a identificação de domínio público apresentada na página/API da fonte. Isso não transforma todas as imagens do Commons em reutilizáveis: candidatos com direitos incertos ou avisos conflitantes foram descartados. Os links precisos estão em [sources.json](../public/artworks/sources.json).

Os três livros são **ebooks específicos do Project Gutenberg** (84, 1342 e 345). Suas capas são identificadas dessa maneira, e não como capas de uma edição comercial. A declaração de domínio público do ebook se refere aos EUA; os termos da fonte e a legislação aplicável continuam relevantes. Não se deve estender essa declaração a qualquer edição do livro.

Jogos e música mantêm imagens remotas extraídas de páginas oficiais, com copyright de seus titulares explicitamente informado. Não foram baixadas como se fossem domínio público. A fotografia Migrant Mother mantém a origem e a declaração da Library of Congress. Imagens de edições retornadas por Open Library não são substituídas pela capa do ebook local. Registros AIC antigos com o mesmo ID podem usar a reprodução local verificada, sem regravar o salvamento pessoal.

### Verificado e pendente

No navegador, imagens carregaram nas seis categorias. Os três quadros locais decodificaram em 500px nos cartões; as três capas musicais oficiais, em 1080px. Os testes cobrem fallback de consulta, estado incompleto, breadcrumb, caminhos permitidos de imagens e preservação de salvamentos legados. A disponibilidade da instalação publicada, limites de provedores e eventuais mudanças futuras de URLs não foram validados por um deploy.

Para revisão visual: avaliar se duas fotografias são suficientes para esta primeira seleção e se a quantidade de informação secundária está adequada. Não há necessidade de completar uma quantidade artificial com registros sem arte.

## Incremento 2 — refinamento editorial e Books piloto

### O que mudou e por quê

**Homepage (comportamento histórico desta revisão):** mosaico e seis ilustrações originais preservados. A marca da primeira abertura permanece; ao terminar, cede espaço a uma pequena ficha editorial em vez de repetir o wordmark do cabeçalho. O primeiro ritual continua cinematográfico e pode ser pulado. Nesta etapa, um marcador funcional `noctis.home.intro-seen.v1` guardava que a abertura já havia sido vista, inclusive em outra sessão. Essa regra foi substituída pela [abertura cinematográfica atual](29-abertura-cinematografica.md), que toca novamente após refresh e oferece Replay. Ao entrar por uma peça do mosaico, a sala recebe um eco decorativo daquela ilustração; nenhum clique espera a animação acabar.

**Books:** única sala redesenhada neste incremento. A capa real de Frankenstein abre a sala sobre papel marfim, com nota de margem específica. A coleção usa o título “On the reading table.” As outras cinco salas preservam sua estrutura visual e animações; passaram a usar registros reais. As entradas de sala não repetem o ritual em cada retorno na mesma sessão; Replay continua disponível.

**Quick Preview:** imagem, título, criador e data aparecem juntos. Open full record ganhou prioridade. Síntese e ações continuam presentes. Créditos extensos ficaram em Sources & image credits; a legenda duplicada ao lado da imagem foi retirada apenas da prévia. O diálogo nativo preserva foco, Escape e bloqueio da rolagem de fundo.

**Discover:** exposição em destaque, uma seleção de curadoria, duas coleções, um percurso entre mídias e acesso às salas. Follow a Thread conecta Frankenstein → INSIDE → Apollo, com uma nota para cada obra e uma frase explicando cada passagem. Trata-se de interpretação editorial, não de alegação de influência histórica.

**My Archive e álbuns:** explicação local mais compacta e controles de edição depois das obras. Save mantém uma obra no arquivo; Want to Experience marca intenção; Album reúne obras. A explicação de Album foi tornada explícita. Upload, ordem, remoção de itens, avaliações e demais ações existentes continuam disponíveis.

**Capa automática:** quando `cover.kind` é `none`, AlbumCover procura a primeira obra ilustrada na ordem do álbum. Isso é uma regra de exibição: não altera o JSON salvo nem escolhe uma capa em nome do usuário. Capas `work` e `upload` continuam tendo prioridade. Um upload indisponível apresenta o aviso correspondente. Remover uma capa escolhida volta ao modo automático. O formato de armazenamento e a versão do arquivo pessoal não mudaram; os Blobs continuam no IndexedDB.

### Verificado e pendente

Foram exercitados seleção editorial com foco/anúncio, link Follow a Thread, sala Books, prévia a 320px, Escape, devolução do foco, rolagem de fundo e imagens reais. Os testes existentes de capas, arquivo e ações pessoais passaram; um teste novo confirma que a capa automática não grava nem sobrescreve metadados. Não foi repetido manualmente todo o fluxo de upload deste incremento: sua regressão foi automatizada.

Para revisão visual: aprovar o equilíbrio papel/escuro, a proporção da capa e a nota de margem em Books, a hierarquia do Discover, a ficha da homepage e a ordem das ações da prévia. **Não expandir o desenho de Books para outras salas antes dessa revisão.**

## Incremento 3 — After Hours: The City Remembers

### O que mudou e por quê

Rota: `/discover/after-hours`. A arquitetura em SVG foi desenhada no código: fachadas em planos, janelas, luz estática, perspectiva de rua e poste. Não há personagens, logotipos, símbolos, interface ou assets extraídos de Deadlock, nem áudio automático. Verde oxidado, vinho e papel ficam concentrados na exposição.

Seleção final:

| Obra                                  | Mídia      | Papel na narrativa                                                               |
| ------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| Metropolis — Fritz Lang, 1927         | Cinema     | A arquitetura como organização social; a cidade acima e as vidas abaixo.         |
| The Steerage — Alfred Stieglitz, 1907 | Fotografia | A separação passa à imagem documental: corpos, grades e passagem entre conveses. |
| The Bedroom — Vincent van Gogh, 1889  | Pintura    | O percurso termina na promessa de um espaço privado.                             |

Firewatch continua na coleção The spaces we inhabit. Para esta exposição, sua paisagem de floresta enfraquecia o percurso urbano; a fotografia sustenta melhor a passagem entre cidade, circulação e abrigo. As relações são uma proposta de leitura, não uma cronologia compartilhada.

As três janelas são links normais para fichas completas. Abaixo delas há um percurso textual com os mesmos destinos, notas específicas, prévias e créditos expansíveis. Nada depende de hover. No celular, a cidade dá lugar a uma sequência vertical ligada por uma linha de percurso; a cena desktop não é apenas encolhida. Hover/foco deslocam discretamente os cartões; ambos os modos de movimento reduzido eliminam esse movimento.

### Verificado e pendente

Verificadas três janelas e links equivalentes, abertura por Enter, ficha de Bedroom e retorno à exposição, prévias e Escape, imagens e sequência vertical. Um problema encontrado nessa verificação foi corrigido: o validador antigo recusava a nova rota de retorno da exposição.

Para revisão visual: avaliar a intensidade da luz, a geometria da cidade, o tamanho das janelas, a paleta localizada e a seleção narrativa. **A linguagem experimental não foi espalhada pelo restante do site.**

## Arquivos e funções importantes

| Arquivo ou grupo                                                                    | Responsabilidade                                                                                                                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/data/editorialAdditions.ts`                                                    | Oito novos registros reais com metadados, fontes e sínteses originais.                                                                                             |
| `src/data/editorialPaths.ts`                                                        | Notas de margem, passos da exposição e conexões entre mídias. Separa a curadoria dos componentes.                                                                  |
| `src/data/curated.ts`                                                               | Une os 17 registros e define a ordem e descrição das coleções editoriais.                                                                                          |
| `src/data/artwork.ts`, `bundledArtwork.ts`                                          | Associação por ID entre obra e imagem exata; referências locais e oficiais, créditos e direitos.                                                                   |
| `public/artworks/`, `sources.json`                                                  | Reproduções verificadas servidas junto ao site e inventário de procedência. Não contém imagens de jogo extraídas.                                                  |
| `src/services/catalog.ts`                                                           | Catálogo principal real, acesso aos IDs legados, fallback e correção de apresentação de imagens conhecidas.                                                        |
| `src/services/catalogUtils.ts`, `artwork.ts`                                        | Validação: imagens locais só sob `/artworks/` em JPEG; destinos externos continuam HTTPS. Seleção de variantes preservada. Retornos limitados às rotas permitidas. |
| `src/hooks/useCatalogSearch.ts`                                                     | Carregamento, cancelamento e erro com resultados locais úteis.                                                                                                     |
| `src/features/discovery/DiscoverPage.tsx`, `Editorial.module.css`                   | Composição editorial, seleção com rolagem/foco/anúncio e percurso entre mídias.                                                                                    |
| `QuickPreview.tsx`, `ExternalDestinations.tsx`, `ProviderNotice.tsx`                | Hierarquia da prévia, explicações expansíveis e disponibilidade das fontes.                                                                                        |
| `SearchPage.tsx`, `CatalogFilters.tsx`                                              | Estados de busca honestos, microcopy e retirada do filtro de demonstrações.                                                                                        |
| `src/features/experiences/RoomEntrance.tsx` e estilos                               | Entrada por sala, marcador de visita, eco do mosaico e Books piloto. Motion mantém a aparição breve; CSS preserva os rituais existentes.                           |
| `RoomExperience.tsx`, `WorkDetail.tsx`, `WorkContent.tsx`, `WorkCard.tsx` e estilos | Seleção real por sala, breadcrumb, retorno contextual, créditos, ações e apresentação do registro.                                                                 |
| `src/features/home/Home.tsx`, `Home.module.css`, `useAwakening.ts`                  | Ficha no lugar da repetição de marca, ligação à sala, abertura vista e retorno ágil. `RoomScene` não foi redesenhado.                                              |
| `src/features/personal/AlbumTools.tsx`                                              | Capa automática derivada, respeito à escolha existente e texto do editor.                                                                                          |
| `PersonalPages.tsx`, `PersonalActions.tsx`, `Personal.module.css`                   | Obras antes do editor, aviso local compacto, esclarecimento sobre Album e controles acessíveis.                                                                    |
| `src/features/personal/schema.ts`                                                   | Aceita referências de imagens locais verificadas nos snapshots; sem migração destrutiva.                                                                           |
| `src/services/format.ts`                                                            | `workCount()` centraliza singular/plural dos álbuns.                                                                                                               |
| `src/features/exhibitions/NightCity.tsx`                                            | SVG original, decorativo e estático; IDs de gradientes isolados com `useId`.                                                                                       |
| `AfterHours.tsx`, `AfterHours.module.css`                                           | Exposição, links, créditos, notas, prévias, composição desktop e percurso mobile.                                                                                  |
| `src/app/App.tsx`, `Navigation.tsx`                                                 | Nova rota, título, foco de fragmento, Discover ativo na exposição e texto de rodapé.                                                                               |
| `server/start.mjs`, `vercel.json`                                                   | Tipos MIME de imagens locais e exclusão de `/artworks/` do fallback SPA. Não foi feito deploy.                                                                     |
| `src/test/EditorialRevision.test.tsx`                                               | 16 testes sobre confiabilidade, legado, foco, capas, curadoria, exposição e movimento reduzido.                                                                    |
| Testes existentes de experiências, navegação, Discover, arquivo, capas e homepage   | Ajustam expectativas de demonstrações principais para obras reais, preservando testes das fichas antigas e dos comportamentos pessoais.                            |
| `server/vercel.test.mjs`, `src/test/setup.ts`                                       | Verifica que imagem ausente não recebe HTML; simula `scrollIntoView` apenas no jsdom.                                                                              |

## Verificação final executada

| Verificação                         | Resultado                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                 | Passou.                                                                                                                                                                                                                                                                       |
| `npm run lint`                      | Passou. É a checagem estática TypeScript configurada pelo projeto, não ESLint.                                                                                                                                                                                                |
| `npm test -- --reporter=dot`        | **267 testes passaram em 19 arquivos**. Base anterior: 249 em 18.                                                                                                                                                                                                             |
| `npm run build`                     | Passou; saída `dist/`. Bundle principal 420,72 kB / 132,30 kB gzip; CSS principal 49,19 kB / 10,89 kB gzip.                                                                                                                                                                   |
| Distribuição no servidor Node local | `/discover/after-hours` e `/books`: HTTP 200 HTML; `/artworks/bedroom.jpg`: HTTP 200, MIME JPEG e assinatura binária JPEG; manifesto: HTTP 200 JSON; imagem inexistente: HTTP 404. Servidor temporário encerrado após o teste, sem interromper o servidor de desenvolvimento. |
| Navegador local                     | Books, Discover e After Hours em 1440×1000, 768×1024, 390×844 e 320×740, sem transbordamento horizontal nas 12 combinações. Imagens verificadas nas seis salas.                                                                                                               |
| Interações manuais                  | Coleção com foco e feedback, Follow a Thread, breadcrumb separado da busca, prévia estreita, Escape/foco/rolagem, Enter em janela da exposição, ficha e retorno, preferência interna de movimento reduzido e restauração à preferência do dispositivo.                        |

Os registros de dimensões e imagens ficam em [layout-checks.json](evidence/editorial/layout-checks.json). Capturas: [Books desktop](evidence/editorial/books-desktop.jpg), [Books mobile](evidence/editorial/books-mobile.jpg), [homepage preservada](evidence/editorial/home-preserved.jpg), [After Hours desktop](evidence/editorial/after-hours-desktop.jpg), [After Hours mobile](evidence/editorial/after-hours-mobile.jpg) e [prévia mobile](evidence/editorial/preview-mobile.jpg).

Limites: revisão no navegador integrado, sem ensaio completo de leitor de tela, sem medição de Core Web Vitals em produção, sem teste em aparelhos físicos e sem deploy. Movimento reduzido interno foi exercitado no navegador; a preferência do sistema foi coberta pelos testes e regras CSS, sem alterar o sistema operacional. Houve mensagens transitórias de hot reload durante edições; elas não devem ser confundidas com uma falha de build final. Não foi auditada uma instalação remota de Supabase ou da versão publicada.

## Roteiro de revisão visual

1. Abra a homepage e confirme o mosaico familiar. Em uma visita já realizada, a navegação deve ser imediata.
2. Entre em Books e compare papel, capa e nota de margem no desktop e no celular.
3. Em Discover, selecione The spaces we inhabit e observe posição, foco e anúncio da seleção. Siga Who gets to belong? para ler as passagens entre mídias.
4. Abra After Hours, visite uma janela e use Back to the exhibition. Compare a cena desktop com a sequência vertical mobile.
5. Abra uma prévia, expanda Sources & image credits e feche com Escape. As informações principais não devem depender de animação.
6. Revise um álbum existente: sua capa escolhida deve continuar igual; somente álbuns em modo automático derivam capa das obras.

Próximo passo depende da avaliação visual dos dois pilotos. As outras cinco salas permanecem sem expansão desse redesenho.
