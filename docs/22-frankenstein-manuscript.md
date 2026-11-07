# Stage 06.4A — The Frankenstein Manuscript

**Histórico da primeira versão.** A revisão visual posterior passou a ter duas aberturas/quatro folhas, com arquivo e fontes abaixo do livro. Consulte [a organização atual](23-frankenstein-hierarquia.md).

Protótipo local de uma única obra, concluído em 05/11/2026. Interface em inglês; documentação em português brasileiro. Não houve deploy, push, instalação de dependências, configuração de autenticação ou mudança no armazenamento.

## A. Resultado implementado

A ficha canônica de **Frankenstein** agora é um livro interativo. A capa abre, o livro permanece aberto e todas as informações, fontes, ações e controles de navegação ficam dentro das páginas e margens desse objeto. Não há uma animação que desaparece para revelar a ficha convencional.

Rota existente: `/books/gutenberg:books:84`.

A identificação exige simultaneamente ID `gutenberg:books:84`, categoria `books`, fonte editorial `curated`, provedor `gutenberg` e identificador externo `84`. O título não decide a seleção. Uma edição de Open Library com o mesmo título continua usando a ficha padrão. O Quick Preview também permanece com sua apresentação curta anterior.

As três aberturas são:

| Abertura | Página esquerda | Página direita |
| --- | --- | --- |
| I — The identity | Capa real do ebook selecionado, título, autora e identificação da edição. | Introdução editorial, ano da obra, autora, formato e referência do ebook. |
| II — The story | Descrição existente, identificada como síntese editorial. | Nota específica e leitura original do NOCTIS, com assuntos do registro. |
| III — The archive | Save, Want to Experience, rating privado e Add to Album. | Destino verificado, procedência e direitos da imagem. |

Não foi criada uma sinopse factual longa nem reproduzido texto de uma edição moderna. A data de 1818 vem do registro existente e identifica a publicação da obra; não é apresentada como a data de uma edição impressa correspondente à capa. A imagem é explicitamente identificada como capa do **Project Gutenberg ebook 84**, sem alegar que seja a encadernação original de 1818.

## B. Construção visual e animações

O objeto é HTML e CSS, com perspectiva, capa exterior, revestimento interior, bloco de folhas, contracapa, sombra, bordas de papel e gradiente de curvatura junto ao miolo. A textura do papel é feita com gradientes discretos; nenhum asset novo ou biblioteca 3D foi acrescentado.

### Abertura

1. Estado `closed`: a capa real ocupa o centro do enquadramento por aproximadamente 350 ms.
2. Estado `opening`: o conjunto se centraliza como livro aberto enquanto a capa gira aproximadamente −179° em torno da borda esquerda, alinhada à lombada. Duração de 1,48 s.
3. Frente e revestimento têm faces separadas. O revestimento tem orientação própria e a arte da frente é ocultada depois que cruza a lombada. Isso evita mostrar letras invertidas no verso.
4. O papel e a tinta se revelam durante a abertura. Ao terminar, o estado é `reading`; o mesmo objeto permanece como interface.

Uma captura intermediária encontrou a arte espelhada no compositor. A correção separou as faces, retirou a opacidade animada do ancestral 3D e controlou a visibilidade de frente/revestimento. O bloco de páginas também deixou de cobrir o conteúdo com um retângulo opaco. A captura final de abertura confirma a frente oculta e o revestimento visível.

Skip animation permanece disponível durante a entrada. Entrar/recarregar começa no topo do objeto para impedir que a restauração de rolagem coloque a capa atrás do HUD.

### Viradas

Uma folha, não o livro inteiro, gira sobre o miolo. A direção para frente parte da folha direita e avança para a esquerda; a volta parte da esquerda. Há duas faces, sombra variável e uma pequena flexão visual da borda livre. As folhas de base representam a página estacionária e a página que chega.

A folha animada é uma representação decorativa e inacessível, sem controles funcionais duplicados. Os controles reais ficam nas páginas estabilizadas. Assim não aparecem dois ratings ou formulários concorrentes durante uma virada.

O movimento desktop dura 720 ms; o controlador estabiliza em até 740 ms. Durante esse intervalo, novos comandos de virada são rejeitados. O rodapé continua anunciando o estado e o conteúdo em movimento fica temporariamente inerte. Após a virada, o foco vai para a área de leitura; se o objeto ficou acima do enquadramento, ele volta para baixo do HUD.

### Estados e recuperação

`useManuscriptBook.ts` contém um redutor exclusivo deste protótipo: `closed → opening → reading ↔ turning`. Cada transição tem uma revisão numérica; uma conclusão antiga não encerra uma virada nova. Temporizadores são uma recuperação controlada, não um loop: são limpos ao mudar de estado ou desmontar.

Ao mudar de modo de layout durante uma abertura/virada, o livro estabiliza na página de destino adequada. Ativar movimento reduzido ou ocultar a aba também encerra a transição com conteúdo legível. Não há fila de animações sobrepostas.

## C. Arquivos criados e modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/features/frankenstein/FrankensteinManuscriptPage.tsx` | Seleção canônica, estrutura física, capa, composição das folhas, teclado, foco e retorno ao contexto anterior. |
| `src/features/frankenstein/ManuscriptLeaf.tsx` | Conteúdo das seis páginas; dados reais, identificação editorial e integração das ações/fontes existentes. |
| `src/features/frankenstein/ManuscriptControls.tsx` | Sumário das três aberturas, Previous/Next, limites e anúncio dos números de página. |
| `src/features/frankenstein/useManuscriptBook.ts` | Estados, bloqueio de comandos concorrentes, duração, layout e recuperação de interrupções. |
| `src/features/frankenstein/FrankensteinManuscript.module.css` | Papel, capa, lombada, profundidade, faces, viradas, tipografia, controles em tinta e responsividade. |
| `src/features/experiences/WorkDetail.tsx` | Um desvio isolado para a obra canônica. O restante da ficha padrão foi preservado. |
| `src/test/FrankensteinManuscript.test.tsx` | 18 testes novos do protótipo, da seleção por ID e da máquina de estados. |
| `src/test/manuscriptHelpers.ts` | Ajuda os fluxos de teste anteriores a entrar na abertura correta do novo livro. |
| `Discovery.test.tsx`, `EditorialRevision.test.tsx`, `PersonalUI.test.tsx`, `RecordSurfaces.test.tsx` | Adaptam os testes que antes procuravam todas as ações imediatamente na ficha de Frankenstein. Agora navegam pelas páginas reais. |
| `docs/evidence/frankenstein/` | Capturas da implementação e registro dos ensaios no navegador. |
| `README.md`, este documento | Estado atual, aprendizado e roteiro de revisão. |

O repositório já continha mudanças das rodadas anteriores. Elas foram preservadas. A arquitetura não ganhou um sistema genérico para livros: remover a pasta `frankenstein` e o import/desvio de `WorkDetail` desacopla este experimento.

## D. Integração funcional e proteção dos dados

`PersonalActions` e `ExternalDestinations` são os mesmos componentes funcionais usados pelo restante do site. Os comandos de salvar, desejar, avaliar e associar álbuns continuam no repositório pessoal existente. Não há uma segunda persistência, migração, novos IDs ou limpeza de `localStorage`.

As fontes continuam passando pela validação de destinos existente. O link do Gutenberg mantém URL, aviso de nova aba e `noopener noreferrer`. Não foi criada URL por título nem adicionada uma integração externa.

Os testes manuais que alteram dados ocorreram em **`http://localhost:5180`**, inicialmente conferido como vazio. Essa origem é separada de **`http://127.0.0.1:5180`**, onde fica o arquivo principal usado pelo usuário. Nessa origem de teste foi criado o álbum identificado **Manuscript — isolated QA**. Nenhum arquivo pessoal foi limpo; esse conteúdo de QA não foi colocado no arquivo principal.

No navegador de QA foram exercitados Save, Unsave, Want to Experience, rating 4,5, criação de álbum e associação. Depois de recarregar, os estados e a associação estavam presentes. A preferência de movimento de QA foi restaurada a Follow device preference após o ensaio.

## E. Verificações executadas

| Verificação | Resultado final |
| --- | --- |
| `npm run typecheck` | Passou. |
| `npm run lint` | Passou; corresponde às regras estáticas TypeScript já configuradas no projeto. |
| `npm test -- --reporter=dot` | **300 testes passaram em 21 arquivos**, incluindo 18 novos. Base anterior: 282 testes em 20 arquivos. |
| `npm run build` | Passou; saída `dist/`. Bundle principal: 443,11 kB / 138,78 kB gzip. CSS principal: 72,89 kB / 15,54 kB gzip. |
| Entrada de catálogo | Discover e busca filtrada abriram a obra correta. Acesso direto também verificado. |
| Contexto | Retorno preservou `/discover` e `/search?q=Frankenstein&format=Novel`; o botão Voltar do navegador retornou à busca filtrada. |
| Capa e entrada | Imagem `/artworks/book-84.jpg` carregada, estados fechado/abrindo/aberto observados, face externa oculta após a passagem pela lombada. |
| Desktop | Três aberturas, Next/Previous e navegação por sumário; livro permanece aberto. Uma folha gira enquanto a transformação do livro estabilizado permanece `none`. |
| Cliques repetidos | Duplo clique avançou uma abertura, sem enfileirar outra. Seleção acidental de texto encontrada no ensaio foi corrigida nos controles. |
| Interrupção | Redimensionamento durante uma virada estabilizou em modo de página individual no destino correto. Redutor também cobre interrupção na abertura e conclusões antigas. |
| Mobile | Seis páginas individuais em 390×844; título e formulário de álbuns verificados a 320×740. Sem transbordamento horizontal. Texto corrido medido em 17 px / entrelinha 32,3 px. |
| Tablet | 768×1024 mostrou duas páginas, sem transbordamento horizontal. |
| Movimento reduzido | Preferência interna verificada no navegador: livro já aberto, sem capa animada e sem animações nos descendentes. Preferência do sistema coberta por teste automatizado. |
| Ações e persistência | Salvamento/desfazer, desejo, rating, álbum e associação após reload verificados no navegador de QA e nos testes. |
| Isolamento | Pride and Prejudice manteve a ficha padrão no navegador; todos os outros 16 registros editoriais, além de uma edição alternativa de Frankenstein, foram cobertos por testes. |
| Higiene | `git diff --check` sem erros de whitespace. Sem push ou deploy. |

As setas de teclado da leitura e a preservação das teclas dos campos são cobertas por testes automatizados. No navegador, também foi confirmado que uma seta no seletor de rating não vira a página. Leitor de tela completo e dispositivos físicos não foram ensaiados.

O navegador foi usado com o servidor de desenvolvimento. Um servidor temporário da distribuição foi iniciado, mas o navegador não conseguiu alcançar a porta 5191; ele foi encerrado. Portanto, não se afirma um ensaio completo da distribuição servida em produção. A compilação de produção acima foi efetivamente executada e aprovada.

## F. Limitações e compromissos

- É uma interpretação visual de uma ficha, não um manuscrito histórico digitalizado nem o texto integral do romance.
- A capa existente do ebook tem 195×300 px. Ela foi preservada; ampliá-la pode revelar a resolução da fonte. Não foi substituída por uma encadernação inventada.
- A flexão de papel é uma aproximação CSS, não uma simulação física de malha. No celular, a virada é simplificada para uma transição curta de página individual.
- Não há arraste/swipe, som ou viradas automáticas contínuas. Os meios de navegação são os controles e as setas quando a leitura está em foco.
- A posição da página é temporária e volta à identidade ao recarregar. Save, Want, rating e álbuns continuam persistentes.
- A disponibilidade atual do site externo do Gutenberg não foi novamente auditada por uma requisição remota nesta rodada; a URL verificada e correspondente ao registro foi preservada e conferida no DOM.
- As medições de contraste orientaram o escurecimento da tinta secundária. Não se afirma uma auditoria formal completa de acessibilidade ou teste em todos os navegadores.
- Nenhum tratamento novo foi aplicado a outros livros, categorias, homepage ou HUD. A versão publicada na Vercel não foi atualizada.

## G. Guia manual de inspeção

1. Com o servidor local rodando, abra [Frankenstein](http://127.0.0.1:5180/books/gutenberg:books:84). Observe a capa e a abertura; use Skip animation para acesso imediato.
2. Na abertura I, confira a capa, a autora, a data da obra e a identificação do ebook.
3. Use Next para a história; volte com Previous. O sumário inferior também permite escolher Identity, The story e The archive.
4. Na abertura III, experimente os comandos pessoais com seus próprios dados somente quando desejar alterá-los. Save, Want, rating e Add to Album são reais. O link do Gutenberg permanece na página de fontes.
5. No celular, cada comando Next avança uma folha, de 1 a 6. A página 5 reúne ações pessoais e a 6 reúne fontes.
6. Ative Reduce motion em Settings para conferir a abertura imediata. A preferência do sistema também é respeitada.
7. Abra Pride and Prejudice e outras categorias para comparar: suas fichas continuam convencionais. Uma edição externa de Frankenstein também não recebe este protótipo.

Capturas reais:

- [Livro fechado](evidence/frankenstein/closed-book.jpg)
- [Abertura e revestimento interno](evidence/frankenstein/opening-book.jpg)
- [Identidade — desktop](evidence/frankenstein/identity-desktop.jpg)
- [História — desktop](evidence/frankenstein/story-desktop.jpg)
- [Arquivo funcional — desktop, origem de QA](evidence/frankenstein/archive-saved-desktop.jpg)
- [Folha em movimento](evidence/frankenstein/turning-sheet.jpg)
- [Identidade — celular](evidence/frankenstein/identity-mobile.jpg)
- [Arquivo — celular, origem de QA](evidence/frankenstein/archive-mobile.jpg)
- [Medições e registros do navegador](evidence/frankenstein/browser-checks.json)

## H. Próximo passo

Revisar visualmente a proporção do objeto, o peso da capa, a curvatura do miolo, o ritmo das viradas e a leitura no celular. Ajustar este exemplar antes de decidir qualquer expansão. A Stage 06.4A não foi aplicada automaticamente ao restante do catálogo.
