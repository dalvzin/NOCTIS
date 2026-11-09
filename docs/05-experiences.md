# Stage 02 — Experiences: guia de desenvolvimento

## O que mudou

A Stage 01 continua sendo a base: React, Router, Motion, tokens, navegação e homepage. A grade das seis categorias da homepage não foi redesenhada. Substituímos apenas as antigas páginas introdutórias das categorias por coleções exploráveis. A implementação continua local e não publica o site.

Há três obras em cada sala. Todos os nomes de obras, criadores, descrições e metadados são fictícios, criados para a demonstração. Essa informação aparece nos cartões e nas fichas. As imagens são composições originais em SVG e CSS. Não foram usadas capas, fotografias, fontes, áudio ou imagens de terceiros; não há atribuições externas nem downloads para executar a experiência.

## Pastas e arquivos

| Arquivo                         | O que faz e onde entra                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/works.ts`             | Define `CategorySlug` e `Work`, contém as 18 obras e exporta `getWork` e `workPath`. É a fonte única do catálogo local.                                                               |
| `src/features/experiences/`     | Nova pasta que reúne a experiência cultural compartilhada pelas seis salas. A separação evita colocar catálogo e detalhes no arquivo da homepage.                                     |
| `RoomExperience.tsx`            | Página de uma sala. Seleciona suas obras, lê os filtros da URL, calcula os resultados, abre/fecha a prévia e monta os cartões.                                                        |
| `RoomEntrance.tsx`              | Abertura editorial da sala. Escolhe a frase e a composição, consulta movimento reduzido e permite repetir a animação decorativa.                                                      |
| `RoomEntrance.module.css`       | Fundos atmosféricos, layout da entrada e seis animações. As classes de cada sala ficam isoladas neste módulo.                                                                         |
| `WorkVisual.tsx`                | Desenha uma composição SVG apropriada à categoria, utilizando a paleta do registro. `hero` escolhe a proporção de destaque. É reutilizado na sala, cartão, prévia e ficha.            |
| `WorkVisual.module.css`         | Define texturas, legendas, moldura e proporções das composições. Livros, fotografia e arte ganham proporções verticais; cinema tem quadro mais largo e música um quadrado.            |
| `WorkCard.tsx`                  | Cartão com dois controles distintos: a imagem abre Quick Preview; o título é um link de acesso direto à ficha. Sem links aninhados em botões.                                         |
| `WorkContent.tsx`               | Texto compartilhado por prévia e ficha: autoria, ano, formato, descrição, metadados e aviso de demonstração. `compact` omite a nota editorial na prévia.                              |
| `WorkDetail.tsx`                | Página completa de uma obra. Lê `workId` da URL, confere se pertence à sala e apresenta conteúdo, nota de curadoria, retorno e duas obras relacionadas. Endereço inválido mostra 404. |
| `Experiences.module.css`        | Grade da coleção, filtros, cartões, estado vazio, conteúdo da prévia, ficha e relacionados. Também adapta esses elementos para telas menores.                                         |
| `src/test/Experiences.test.tsx` | Testa os dados e os fluxos novos. A preferência de movimento reduzido é simulada, sem mudar a configuração do computador.                                                             |

Arquivos existentes que mudaram:

- `App.tsx`: conecta as novas páginas e rotas, atualiza o título com o nome da obra e preserva o foco no conteúdo ao navegar.
- `Pages.tsx`: remove apenas a antiga função `Category`; mantém `Home`, `RoomGrid`, `Discover` e `Information`.
- `Navigation.tsx`: mantém a categoria ativa também dentro de uma ficha e evita abrir outro diálogo pelo Ctrl+K sobre o Quick Preview. A busca global continua sendo um navegador de salas.
- `App.test.tsx`: passa a esperar três obras nas salas, em vez da mensagem antiga de página futura.
- `package.json`: acrescenta `npm run typecheck`, que verifica os tipos sem criar a distribuição. Não houve novas dependências ou atualização de bibliotecas.
- `README.md` e `docs/01-estrutura.md` a `03-decisoes.md`: orientam o estado atual do projeto. `04-verificacao.md` permanece como histórico da fundação; `06-verificacao-stage02.md` registra a nova validação.

## Os dados, sem mistério

`Work` descreve um registro: identificador, categoria, título, criador, ano, formato, atmosfera, descrição, nota editorial, pares de metadados e paleta. A categoria é uma união de seis strings, impedindo categorias inexistentes no catálogo. `facts` permite metadados apropriados à obra, como páginas para um livro e duração para um filme.

`getWork(category, id)` procura uma obra que corresponda aos dois valores. Assim, um álbum não aparece em `/books/rooms-for-rain`. `workPath(work)` centraliza a construção de caminhos como `/music/rooms-for-rain`, evitando escrever URLs de formas diferentes nos cartões e relacionados.

Não há `fetch`, serviço remoto ou persistência. Futuras integrações poderão transformar dados externos nesse mesmo formato, sem obrigar os componentes a conhecer cada API. Isso ainda não implementa a Stage 03.

## Os filtros

Em `RoomExperience`, `roomWorks` seleciona os três registros da sala. `formats` extrai os formatos disponíveis, como Novel, Poetry e Essays em Books. `visible` aplica simultaneamente o formato e a pesquisa por título ou criador, ignorando maiúsculas/minúsculas e espaços nas extremidades.

`useSearchParams` lê e altera a parte da URL após `?`. Por exemplo, `/books?format=Poetry&q=theo` pode ser recarregado ou compartilhado e mantém os filtros. Não é armazenamento de histórico pessoal. `updateFilter` cria uma cópia de `URLSearchParams`, atualiza somente o filtro escolhido e usa `replace` para não criar uma entrada no histórico a cada letra digitada. Um formato desconhecido é tratado como All.

Os botões têm `aria-pressed`, o campo tem um rótulo visível e a quantidade de resultados usa `role="status"`. Quando não há resultados, aparece um estado vazio com Reset filters, que realmente limpa ambos os filtros.

## Do cartão à prévia e à página completa

1. A imagem do cartão chama `onPreview(work)`.
2. `RoomExperience` guarda esse objeto no estado `selected` usando `useState`.
3. Com `selected` preenchido, o React monta `Modal`, reutilizando o diálogo nativo da Stage 01.
4. A prévia mostra a obra sem sair da coleção. Fechar, Escape ou clicar fora limpa `selected` e devolve foco ao cartão. O diálogo bloqueia a interação com o fundo e a rolagem da página.
5. Open full record é um `Link` de verdade. Ele abre `/:categoria/:workId`, desmonta a sala e, consequentemente, fecha seu diálogo.
6. `WorkDetail` usa `useParams` para obter o identificador e chama `getWork`. Se a obra existe naquela sala, monta a ficha. Caso contrário, apresenta 404.

O título do cartão também abre a ficha diretamente, sem exigir a prévia. Cada ficha tem URL própria e funciona quando aberta diretamente. Os dois relacionados levam às outras obras da mesma sala.

O link carrega `returnTo` em `location.state`, um pequeno estado da navegação do Router. Ele contém a URL da coleção com seus filtros. O botão Back to the collection usa esse destino; um acesso direto à ficha retorna à sala sem filtros. O código só aceita destinos pertencentes à própria sala, para manter esse retorno previsível. Alterações apenas nos filtros não provocam a rolagem/foco de troca de página, pois o efeito de `App` depende de `pathname`, não da query string.

## As seis entradas e a filosofia Cinematic Balance

Concentramos a animação no objeto de entrada, por aproximadamente um segundo. Ela não é uma espera obrigatória, não cobre os controles e não roda em loop. O texto faz uma entrada sutil de 10 pixels por 550 ms com Motion; a estrutura e o catálogo continuam disponíveis desde o início.

| Sala               | Composição e efeito                         | Implementação                                                                                                                               |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The Reading Room   | Um volume editorial e duas folhas que viram | `pageTurn`: folhas decorativas com `rotateY`, ponto de apoio à esquerda e desaparecimento ao terminar. Perspectiva sugere profundidade.     |
| The Screening Room | Quadro de projeção em verdes escuros        | `crt`: uma linha horizontal cresce até o quadro completo usando escala e opacidade. Não usa piscadas ou flashes.                            |
| The Console Room   | Portal geométrico e sinal de sistema pronto | `boot`: escala discreta e `clip-path`; `signal` revela a legenda ao final. Não simula um jogo funcional nem oferece um botão Play fictício. |
| The Listening Room | Disco, sulcos e braço de toca-discos        | `vinyl`: o grupo SVG marcado `data-part="record"` gira 55 graus e repousa. O braço permanece parado. Não há reprodução de áudio.            |
| The Darkroom       | Moldura e composição de janela              | `develop`: contraste, opacidade e tonalidade se assentam, evocando a revelação. Não há flash de câmera.                                     |
| The Gallery        | Forma orgânica e gestos largos              | `brush`: um recorte poligonal percorre a composição, evocando uma pincelada. Não anima a página inteira.                                    |

CSS `@keyframes` descreve estados intermediários de uma animação. O seletor da sala aplica apenas o efeito daquela categoria. Não foram necessárias bibliotecas adicionais. Motion for React continua responsável pela entrada do texto e pela integração com a preferência do sistema.

`useReducedMotion` remove a entrada do texto, aplica a classe estática e omite Replay. A media query `prefers-reduced-motion` também remove animações, recortes, filtros e folhas decorativas. A proteção existe em duas camadas: React e CSS. A preferência pode mudar durante a sessão.

`take` é um contador local de replay. Ao incrementá-lo, a `key` da cena muda, e React recria somente a composição decorativa, reiniciando suas animações CSS. Não apaga filtros nem remonta o catálogo. O componente de sala recebe uma chave baseada na categoria para que mudar de ambiente não leve uma prévia aberta à próxima sala.

## Atmosfera, desempenho e acessibilidade

As salas usam luz radial discreta baseada na paleta, linhas arquitetônicas, textura e sombra. Tudo é local e leve; não há vídeo em segundo plano, autoplay ou download de imagens grandes. `useId` dá identificadores únicos aos gradientes SVG: duas cópias da mesma obra podem aparecer na página e no diálogo sem compartilhar acidentalmente seus gradientes.

As composições são decorativas e usam `aria-hidden`; títulos e descrições dão o contexto textual da obra. `fieldset`/`legend` agrupam filtros; `dl`, `dt` e `dd` apresentam metadados. O foco tem destaque e os controles continuam utilizáveis sem hover. Em telas estreitas, as grades passam para uma coluna e a ficha reorganiza imagem e texto.

O uso de SVG em vez de imagens geradas mantém os estudos editáveis e evita acrescentar dependências ou material externo. A homepage e seus seis cartões originais continuam como estavam. Não acrescentamos uma tela de loading artificial: os dados já estão no pacote e as entradas das salas dão o momento cinematográfico sem bloquear a exploração. Uma abertura global mais elaborada continua sendo uma possibilidade visual futura, não uma funcionalidade prometida nesta entrega.

## Exercício guiado

Para entender o fluxo, escolha uma obra em `works.ts`, acompanhe sua passagem para `WorkCard`, observe `setSelected` em `RoomExperience` e depois siga `workPath` até `WorkDetail`. Para entender as animações, compare a classe da categoria em `RoomEntrance` com seus `@keyframes`. Você pode pedir explicação linha por linha de qualquer trecho.

## O que ainda não existe

Não há catálogo real, API, busca global de obras, player, trailer, visualizador fotográfico em alta resolução, jogo executável, favoritos, avaliações, login, comunidade ou privacidade avançada. Settings mantém sua função informativa. A demonstração não finge disponibilizar esses recursos. A Stage 03 não foi iniciada.
