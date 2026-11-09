# Mídias reais nas salas e revisão geral

## O que mudou de fato

Os desenhos genéricos de livros, projetor, console, vinil, fotografia e escultura eram SVGs escritos no código. Foram retirados das apresentações, inclusive dos ecos decorativos das salas. A homepage conserva as mesmas seis áreas e suas rotas, mas agora usa obras identificáveis do próprio catálogo.

| Área           | Nova apresentação                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Books          | Capas de Frankenstein, Pride and Prejudice e Dracula, em uma composição que se abre em leque ao passar o cursor ou receber foco. A apresentação editorial dentro de Books continua usando a capa real de Frankenstein. |
| Films & Series | Cartazes reais dos três filmes. Ao interagir com a sala, um trecho silencioso de A Trip to the Moon ocupa a composição.                                                                                                |
| Games          | Imagens oficiais de Journey, Firewatch e INSIDE; a interação revela outras obras com transições de opacidade.                                                                                                          |
| Music          | Três capas reais de Brian Eno e colaboradores, sobrepostas com movimento curto. Nenhuma música toca automaticamente.                                                                                                   |
| Photography    | Composição com fotografias reais e quatro obras disponíveis na coleção.                                                                                                                                                |
| Art            | Pinturas de Seurat, Van Gogh e Caillebotte; transições entre reproduções identificadas.                                                                                                                                |
| After Hours    | A cidade desenhada foi substituída por uma fotografia noturna do Empire State Building feita por Carol M. Highsmith. As três entradas da exposição continuam funcionando.                                              |

O catálogo passou de **17 para 19 obras reais**. As duas adições são **Earthrise**, de William Anders/NASA (1968), e **Sadie Pfeifer, a Cotton Mill Spinner**, de Lewis Hine (1908). Elas têm descrição editorial, dados históricos, imagens correspondentes, créditos e fontes. Não foram adicionadas dezenas de registros fictícios.

## Imagens, vídeo e direitos

O trecho de **A Trip to the Moon (1902)** vem do arquivo em domínio público identificado no Wikimedia Commons. Foram extraídos 12 segundos a partir de 5:20, sem qualquer trilha sonora, em MP4/H.264 com 320×240 pixels. O arquivo publicado tem aproximadamente **424 KB**. A resolução reflete a cópia obtida; não foi feita uma reconstrução por IA nem um aumento artificial de resolução. O download de uma versão maior recebeu HTTP 429; a derivada de 240p foi obtida e usada.

O vídeo só recebe `src` depois da interação. Ele para ao sair do foco/hover, sair da área visível ou ocultar a aba. Em Films, Play film excerpt/Pause film excerpt oferece controle explícito, inclusive em dispositivos de toque. Com movimento reduzido, o vídeo não recebe a fonte e a composição permanece estática. Se o vídeo falhar, os cartazes continuam disponíveis. O comportamento foi conferido no navegador e em testes.

Escolher imagens do próprio catálogo evita apresentar uma fotografia genérica como se fosse uma cena de um jogo, filme ou livro. As outras salas usam animação CSS de imagens reais, **não vídeos documentais de todas as categorias**. O usuário pode consultar Artwork & sources abaixo do mosaico e nas salas; as fichas continuam oferecendo suas fontes completas.

Fontes das novas fotografias:

- [Earthrise — NASA](https://science.nasa.gov/resource/the-rising-earth-as-seen-by-apollo-8/). Crédito a William Anders/NASA; uso editorial e informativo conforme as [orientações de mídia da NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/), sem sugerir endosso.
- [Sadie Pfeifer — Library of Congress, 2018674894](https://www.loc.gov/item/2018674894/). A instituição informa “No known restrictions on publication”. Reprodução obtida pelo Wikimedia Commons, com identificação e direitos preservados.
- [Empire State Building at night — Library of Congress, 2011630645](https://www.loc.gov/item/2011630645/). Carol M. Highsmith; o registro informa ausência de restrições conhecidas de publicação. Reprodução obtida pelo Wikimedia Commons.
- [A Trip to the Moon — arquivo e licença](<https://commons.wikimedia.org/wiki/File:Le_Voyage_dans_la_Lune_(1902).webm>).

Cartazes e reproduções em domínio público conservam seus créditos. Capas de álbuns e imagens promocionais dos jogos continuam protegidas pelos respectivos titulares: são reproduções editoriais vinculadas às obras, **não um banco de imagens com licença livre**. Não houve aquisição de uma licença comercial nova. Os créditos não substituem os direitos dos titulares.

As imagens editoriais que dependiam de hotlinks foram obtidas das URLs já associadas aos registros, reduzidas para uso na interface e incluídas localmente. Isso inclui Journey, Firewatch, INSIDE, as três capas de álbuns e Migrant Mother. Nenhuma imagem foi procurada só pelo título e trocada silenciosamente por outra edição. URLs de origem, download, direitos e dimensões ficam nos manifestos públicos de fontes. Falhas de imagem ainda usam o monograma neutro NOCTIS, sem inventar uma obra.

## Por que as fotografias estavam gigantes

O CSS anterior deixava a altura da fotografia automática e removia o limite máximo do quadro. Como a grade tinha duas colunas, fotos verticais cresciam com a largura disponível. Agora os cartões de fotografia têm quadros de **250 px**, `object-fit: contain` e grade de quatro colunas no desktop largo, duas em telas intermediárias e uma no celular. A fotografia completa é preservada; não foi esticada nem cortada para preencher o cartão. A ficha completa e a prévia continuam podendo mostrar a obra em escala maior.

Também foi reforçado o fundo de contraste dos títulos de Films e preservada a animação curta da sala Music sobre as capas reais. O cenário e a navegação não foram reconstruídos.

## Arquivos importantes

| Arquivo ou pasta                                                 | Responsabilidade                                                                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/roomMedia.ts`                                          | Seleciona os IDs existentes para cada composição; `roomWorks` resolve os registros reais sem criar um segundo catálogo.                                                                                 |
| `src/features/experiences/RoomArtwork.tsx`                       | Apresenta as composições, controla carregamento/reprodução/pausa do vídeo, trata movimento reduzido e mostra as fontes em um componente separado.                                                       |
| `src/features/experiences/RoomArtwork.module.css`                | Define leque de capas, sobreposições, revelações, iluminação e transições.                                                                                                                              |
| `src/features/home/Home.tsx` e CSS                               | Integram a composição ao mosaico, incluindo foco por teclado e painel de fontes. A intro permanece.                                                                                                     |
| `src/features/experiences/RoomEntrance.tsx` e CSS                | Substituem os estudos genéricos das salas e acrescentam o controle do trecho de cinema.                                                                                                                 |
| `src/features/experiences/Experiences.module.css`                | Limita as fotografias e ajusta a grade responsiva.                                                                                                                                                      |
| `src/data/editorialAdditions.ts`                                 | Acrescenta somente as duas fotografias históricas.                                                                                                                                                      |
| `src/data/historicalArtwork.ts`                                  | Metadados e créditos das novas fotografias e do fundo de After Hours.                                                                                                                                   |
| `src/data/editorialArtwork.ts`                                   | Relaciona as reproduções locais às identidades estáveis das obras existentes.                                                                                                                           |
| `src/data/artwork.ts` e `src/data/roomCuration.ts`               | Integram as imagens e atualizam a descrição da coleção de fotografia.                                                                                                                                   |
| `src/features/exhibitions/NightCity.tsx`, `AfterHours.tsx` e CSS | Usam a fotografia real na exposição e exibem sua fonte. O nome histórico NightCity foi mantido; seu conteúdo deixou de ser SVG.                                                                         |
| `public/artworks/` e `sources.json`                              | Imagens publicadas e sua procedência.                                                                                                                                                                   |
| `public/media/` e `sources.json`                                 | Vídeo curto, identificação do arquivo original e detalhes da edição silenciosa.                                                                                                                         |
| `src/app/App.tsx`                                                | Corrige o scroll/foco de URLs com fragmento, como `/photography#collection`, inclusive ao abrir diretamente a página. O comportamento automático respeita o scroll definido pelo CSS e o modo reduzido. |
| `src/test/RealRoomMedia.test.tsx`                                | Verifica identidade das obras, fontes, carregamento sob demanda, pausa, movimento reduzido e falha do vídeo.                                                                                            |

`RoomScene.tsx`, `WorkVisual.tsx` e seu CSS foram removidos porque suas ilustrações deixaram de ser usadas. Ícones de interface, marca, páginas do livro e o portal abstrato da intro foram preservados; eles são elementos da interface, não fotografias de obras culturais.

## Verificações realizadas

- `npm test`: **329 testes passaram em 23 arquivos**, incluindo a regressão do fragmento de URL e a proteção das rotas de vídeo contra o fallback SPA.
- `npm run typecheck`, `npm run lint` e `npm run build`: passaram. O lint atual usa verificações adicionais do TypeScript.
- Navegador: as seis salas abriram com as contagens corretas (3/3/3/3/4/3), sem imagens carregadas com erro nem overflow horizontal na revisão desktop.
- Fotografias: as quatro imagens carregaram, com altura de 250 px e `object-fit: contain`. Revisão em desktop e viewport de 390×844; nenhuma rolagem horizontal observada no celular.
- Earthrise: Quick Preview, navegação para ficha completa e link NASA conferidos. Save persistiu após refresh na origem local de teste da build; a marca de teste foi removida depois, sem limpar o arquivo pessoal do usuário.
- Cinema: reprodução real com `muted: true`, fonte local, Play/Pause e ativação pelo foco de teclado na homepage. Ao passar para a próxima sala, o vídeo pausou.
- Movimento reduzido: em Settings na origem de teste, Films ficou estático, vídeo pausado e sem `src`; a preferência foi restaurada.
- URL `/photography#collection`: foco passou à coleção e a página deslizou até ela após a correção.
- A suíte existente também verificou busca, filtros, destinos, livros, prévias, arquivo pessoal e coberturas de segurança já presentes no projeto.

As capturas reais ficam em `docs/evidence/real-media/`. Testes unitários usam fixtures; não equivalem a testar todos os provedores externos ou todos os dispositivos. Não foram realizados teste em aparelho físico, auditoria por leitor de tela real ou investigação exaustiva de todos os dados possíveis. Não foi configurada autenticação nem integração nova de API nesta rodada.

## Publicação

A conferência do primeiro deploy revelou erros TS2688 na transpilação da função de catálogo: o compilador estava herdando `vite/client` e `vitest/globals` do frontend/testes. O `tsconfig.json` raiz agora tem `types: []`; a declaração exclusiva do navegador está em `src/vite-env.d.ts`. Os testes importam suas funções do Vitest explicitamente. Isso evita exigir tipos do cliente na função de servidor, sem remover a tipagem do frontend. A [documentação do runtime Node.js da Vercel](https://vercel.com/docs/functions/runtimes/node-js) descreve o uso da configuração TypeScript raiz.

O `vercel.json` também exclui `/media` do fallback SPA, assim como já fazia com `/assets` e `/artworks`. Sem isso, uma URL de vídeo poderia receber o HTML da aplicação. Duas verificações de regressão foram adicionadas em `server/vercel.test.mjs`, e a suíte completa foi executada novamente. Nenhuma configuração de autenticação ou variável privada foi modificada.

A proteção de acesso existente da Vercel foi preservada: uma sessão sem acesso ao projeto pode ser encaminhada ao login da plataforma. Isso não é a autenticação de usuários do NOCTIS.

Esta revisão inclui a formatação anterior, a nova intro e sua correção de Skip. A publicação foi autorizada pelo usuário junto desta rodada. O repositório permanece privado; não se altera a configuração de contas ou a visibilidade do GitHub. O resultado efetivo do deploy é informado na conversa após a verificação da Vercel.

Nenhuma dependência foi adicionada à aplicação para estas mídias. Pillow e FFmpeg foram usados somente como ferramentas temporárias de preparação, dentro de `node_modules`, sem entrar no repositório ou no bundle. Prettier, incluído no trabalho anterior de organização do código, permanece como dependência de desenvolvimento.
