# Stage 06.1 — The Awakening + The Living Mosaic

## A. Mudanças visuais e escopo

A homepage deixa o grande bloco de texto seguido por seis cartões iguais. A primeira tela agora é uma entrada editorial com um mosaico assimétrico ocupando a maior parte do viewport desktop. Books abre a composição; Art ocupa um painel horizontal maior; Films e Games compartilham uma coluna de proporções diferentes; Music e Photography completam o conjunto.

A paleta continua baseada em obsidian, charcoal, ivory, bronze e ash. As cenas acrescentam apenas variações discretas de papel, metal, madeira e sombra. Não há vídeo, música automática, efeito neon, rastreamento do ponteiro ou tela de carregamento desvinculada.

Abaixo do mosaico há seis obras reais do catálogo existente, divididas entre Curator’s Selection e Hidden Gems. O fechamento conduz a Discover e Search. Não existe repetição do mosaico nessa parte da homepage, nem contagem fictícia de popularidade.

Somente a homepage foi redesenhada. Salas, fichas, busca, My Archive, editor de álbuns, Settings, perfis e HUD global não foram redesenhados. A infraestrutura anterior de contas foi preservada, sem novas alterações e sem exigência de configuração Supabase para esta experiência de portfólio. A homepage não acrescenta um convite de login nem depende de autenticação.

## B. A sequência de animação

| Momento aproximado | Fase | O que acontece |
| --- | --- | --- |
| 0–260 ms | `darkness` | Obsidian com um detalhe de luz central. A navegação global e o botão de pular continuam disponíveis. |
| 260–950 ms | `wordmark` | Surge a marca NOCTIS com tipografia editorial. |
| 950–1450 ms | `opening` | As duas partes da marca se afastam discretamente, sugerindo uma passagem. |
| 1450–3100 ms | `assembling` | A camada escura perde opacidade; os seis fragmentos entram com pequenos deslocamentos e rotações. A mesma marca segue para a faixa editorial. |
| A partir de 3100 ms | `ready` | O mosaico fica acomodado e mantém seus efeitos curtos de interação. |

**A animação se torna a homepage:** os links são renderizados uma única vez, nas suas áreas finais de CSS Grid. Apenas transformações e opacidade mudam. Não existe um conjunto de fragmentos descartado e substituído por uma segunda grade. Um teste confirma que os seis elementos DOM são os mesmos antes e depois da introdução.

Os tempos são uma composição visual, não uma simulação de download. Nenhuma requisição de imagem determina quando o visitante pode entrar em uma sala. Os links estão semanticamente disponíveis desde a primeira renderização. Focar um deles por teclado termina a entrada imediatamente; ativar Skip intro também termina e leva o foco ao primeiro ambiente. Não se prende a rolagem nem se abre um diálogo de carregamento.

## C. Como cada categoria se comporta

| Categoria | Composição original | Movimento |
| --- | --- | --- |
| Books | Livro de capa rígida, volume aberto, páginas e luz de uma janela. | O livro se acomoda na entrada; a página faz uma virada breve em hover/foco. |
| Films & Series | Projetor, película e uma cidade imaginada na tela. | A iluminação aparece gradualmente; a interação intensifica o feixe sem flashes. |
| Games | Monitor, paisagem vetorial e controle. | O sinal emerge durante a entrada; a linha de boot se forma na interação. |
| Music | Toca-discos com sulcos, selo e braço. | O conjunto se acomoda com rotação curta; o vinil gira suavemente no hover/foco, sem áudio. |
| Photography | Ampliação pendurada por prendedores, com cena urbana original. | A imagem se desenvolve em opacidade; uma camada de emulsão desaparece na interação. |
| Art | Moldura, iluminação e natureza-morta original. | A luz revela a composição; um traço de pincel se desenha no hover/foco. |

São animações finitas, não seis loops contínuos. No toque, a cena pronta, o nome, o descritor e a seta já comunicam a navegação sem depender de hover. Todo o tile é um link, com alvo muito maior que 44 px de altura. Os efeitos também respondem a `:focus-visible`.

## D. Arquivos e responsabilidades

| Arquivo | Responsabilidade e conexão |
| --- | --- |
| `src/features/home/Home.tsx` | Monta faixa editorial, marca, seis links do mosaico, seleção real, Hidden Gems e convite final. Usa as rotas de `rooms`, os registros de `curatedWorks` e os cartões/Quick Preview existentes. |
| `src/features/home/useAwakening.ts` | Hook que controla as cinco fases, timers, memória da sessão, pulo, mudança de preferência e interrupção quando a aba fica oculta. Limpa timers ao desmontar. |
| `src/features/home/RoomScene.tsx` | Seis composições SVG originais. `useId` fornece identificadores únicos para gradientes, evitando que uma cena utilize por engano a definição de outra. |
| `src/features/home/Home.module.css` | Áreas do mosaico, proporções responsivas, tipografia, estados da entrada, microanimações, foco e pausa fora do viewport. Seus nomes ficam isolados por CSS Modules. |
| `src/features/archive/Pages.tsx` | Passa a reexportar o novo Home. RoomGrid e Information continuam disponíveis, preservando seus usos em outras páginas. |
| `src/test/HomeAwakening.test.tsx` | Testes da sequência, identidade dos links, memória por sessão, skip/foco, reduced motion, destinos, obras reais, lazy loading, observação do viewport e armazenamento bloqueado. |
| `docs/evidence/stage-06-1-*.jpg` | Capturas da entrada, homepage pronta e composições móveis verificadas. |
| `docs/evidence/stage-06-1-layout-checks.json` | Medidas reais de viewport, conteúdo, altura do mosaico e setas nos sete tamanhos conferidos. |
| `README.md` | Aponta a direção atual, documentação e resultados desta etapa. |

Não foi adicionada dependência. Não foi alterada a configuração de provedores, conta, banco, RLS, armazenamento ou autenticação.

## Conceitos técnicos com exemplos

### Estado e hooks do React

`useAwakening` é um **custom hook**: reúne uma regra de comportamento para o componente. `phase` é um estado React; quando muda de `opening` para `assembling`, React atualiza o atributo `data-phase` e o CSS apresenta a transição correspondente.

`useRef` guarda os timers e a informação de conclusão sem provocar uma renderização a cada escrita. O marcador de conclusão impede que desligar reduced motion mais tarde reinicie uma introdução já concluída. `useEffect` agenda a sequência e devolve sua função de limpeza. Isso também evita timers tentando atualizar uma homepage que já foi desmontada.

O tipo TypeScript `AwakeningPhase` permite somente cinco nomes. `Record<CategorySlug, string>` exige um descritor para cada categoria existente. Os dados do catálogo continuam sendo reutilizados; o componente não cria uma segunda lista de obras fictícias.

### Session storage

A chave é `noctis.home.awakened.v1`, com o valor `seen`. Ela pertence ao `sessionStorage`, separado do arquivo pessoal em `localStorage` e dos arquivos de capa em IndexedDB. Essa chave não registra navegação, pesquisa ou preferências pessoais.

O marcador é salvo ao iniciar a entrada. Assim, sair antes de ela terminar não obriga o visitante a assistir tudo de novo ao voltar. Refresh e navegação interna na mesma sessão mostram a composição pronta. Uma nova sessão/aba pode ter uma nova entrada, conforme o comportamento de sessionStorage do navegador.

Se o navegador bloquear esse armazenamento, não há erro fatal: a entrada ainda pode ser pulada. Nesse caso, a memória entre montagens pode não estar disponível. Nenhuma coleção ou histórico é apagado para reiniciar a introdução.

### Grid, transform e opacidade

Desktop usa doze colunas e seis faixas. Cada link ocupa uma área diferente; os espaços são de oito pixels, formando uma composição contínua. As posições finais já existem desde o início. `transform` desloca/rotaciona visualmente um fragmento sem reorganizar a página, e `opacity` controla sua aparição.

A marca é absoluta, fora do fluxo. Seu movimento também usa posições de referência, além de transformação, para chegar à faixa editorial; isso não desloca os demais conteúdos. Não há texto grande que desaparece e provoca salto de layout.

Abaixo de 760 px, o mosaico muda para duas colunas e quatro faixas. Books e Art passam a ocupar a largura inteira. As outras categorias mantêm áreas confortáveis. Em telas pequenas, a composição pode ultrapassar uma dobra: não se tenta espremer seis ambientes em uma tela ilegível. Photography aceita uma quebra controlada entre Photo e graphy quando necessário, e a seta tem espaço reservado.

Em telas desktop baixas, a altura mínima preserva a legibilidade, permitindo rolagem vertical normal. Não há necessidade de rolagem horizontal.

### Movimento reduzido e acessibilidade

O hook reutiliza `useMotionPreference`, que já combina a preferência do dispositivo com o controle existente de Settings. Há ainda uma leitura inicial de `matchMedia` para evitar uma entrada elaborada antes da preferência nativa estar disponível no hook. O CSS inclui a proteção `prefers-reduced-motion`.

Com movimento reduzido, a primeira composição já está em `ready`, sem introdução elaborada nem microanimações. Se a preferência mudar durante a entrada, ela termina imediatamente. Desligá-la depois não reinicia a sequência.

As cenas SVG são decorativas e ficam com `aria-hidden` e sem foco próprio. O nome acessível de cada link inclui sala, categoria e descritor. Não há `aria-hidden` nas categorias, nem `inert` ou bloqueio dos links durante a introdução. O leitor de tela não precisa aguardar uma contagem ou ouvir cinco anúncios de fase.

### Desempenho

A primeira tela usa somente SVG/CSS originais, sem download de imagens externas, fontes novas, vídeo ou áudio. Não há cálculo por movimento do mouse, parallax ou ciclo JavaScript por frame. As fases geram poucas mudanças de estado e as microanimações têm término.

Um `IntersectionObserver` acompanha a entrada. Fora do viewport, o CSS pausa as animações das cenas. Isso foi observado no navegador: `data-visible=false` e `animation-play-state=paused` ao abrir um preview abaixo da primeira dobra. Ao ocultar a aba, a sequência é finalizada para não manter uma entrada desnecessária em segundo plano.

As imagens reais abaixo da dobra usam o `loading="lazy"` do ItemImage existente, com limites de tamanho e fallback. Nenhum novo preload foi necessário. Não foram medidos FPS, consumo de GPU ou uma nota Lighthouse; não há promessa de desempenho baseada em números não coletados.

## Fontes e atribuições

As seis cenas do mosaico foram desenhadas nesta etapa diretamente no código do projeto. São representações das categorias, não capas de livros comerciais, frames de filmes, gameplay ou fotografias de terceiros. Não dependem de licença de banco de imagens e não há atribuição externa inventada.

Curator’s Selection reutiliza Frankenstein (Gutenberg), Journey (página oficial) e Ambient 2 (discografia oficial). Hidden Gems reutiliza Metropolis (pôster francês identificado), Migrant Mother (Library of Congress) e The Bedroom (AIC). Créditos, fontes e direitos permanecem nos componentes existentes. As verificações e distinções de direitos dessas imagens estão em [Capas e imagens](11-capas-e-imagens.md).

## E. Verificações

Execução final: `npm run typecheck` e `npm run lint` aprovados; `npm test -- --reporter=dot` aprovou **207 testes em 15 arquivos**, em 17,79 segundos; `npm run build` gerou a produção sem erros, em 1,32 segundo. O JavaScript principal ficou em 405,87 kB (128,34 kB gzip). Isso não é uma medição de tempo de carregamento em rede real.

Os resultados finais dos comandos são registrados no README. Foram adicionados dezesseis testes específicos da homepage à suíte anterior. Eles verificam a sequência completa de 3,1 segundos com relógio simulado, a continuidade dos seis elementos DOM, pulo e foco, retorno por sessão, preferência de movimento e sua mudança, seis destinos, obras reais e imagens lazy, pausa por observação e falha de sessionStorage.

No navegador integrado foi observado `darkness → ready` em uma primeira entrada. Pular com Espaço deixou o estado pronto e o foco em `/books`. Os seis links abriram suas salas, e voltar não repetiu a introdução. Tab moveu o foco de Books para Films com outline visível. Ctrl+K abriu a busca e encontrou Frankenstein. Skip to content continuou funcionando.

O controle existente Reduce motion foi exercitado, e a homepage mostrou `data-reduced=true`, `ready` e transição instantânea. A preferência foi restaurada para Follow device preference depois do teste. Não foi alterada a configuração de movimento do sistema operacional.

| Viewport CSS confirmado | Largura de conteúdo | Altura do mosaico | Setas cortadas |
| --- | --- | --- | --- |
| 320×740 | 305 px | 821 px | 0 |
| 390×844 | 375 px | 821 px | 0 |
| 768×1024 | 753 px | 799 px | 0 |
| 1365×768 | 1350 px | 543 px | 0 |
| 1920×1080 | 1905 px | 855 px | 0 |
| 1280×600 | 1265 px | 503 px | 0 |
| 640×400 | 625 px | 851 px | 0 |

A diferença de quinze pixels é a barra de rolagem do ambiente. Não houve conteúdo mais largo que o viewport. 640×400 foi um teste de reflow, não um teste de zoom real a 200%.

O Quick Preview de Frankenstein abriu a partir do conteúdo editorial. The Bedroom apresentou falha de imagem externa e o fallback existente apareceu. A primeira tela não depende dessa fonte. Após uma atualização de hook durante desenvolvimento houve um erro transitório de Fast Refresh; a inicialização limpa por reload do código final abriu os seis links sem novos erros de console. Isso não foi ocultado como se nenhum erro tivesse ocorrido durante a edição.

## F. Limitações

Não foram testados aparelhos físicos, Safari, Firefox, leitores de tela reais nem zoom real a 200%. É importante fazer uma revisão humana nesses ambientes. Os testes automáticos verificam estrutura/estado; não substituem julgamento de direção de arte ou medição de fluidez em dispositivos mais lentos.

As imagens de fontes externas continuam sujeitas a indisponibilidade. O fallback é funcional, mas não se afirma que a imagem AIC carregou nesta sessão. A memória de introdução depende da disponibilidade de sessionStorage. Nenhuma parte desta entrega ativa Supabase ou valida autenticação real.

## G. Guia manual

1. Abra o site em uma nova sessão de aba, com movimento normal. Observe escuro → marca → abertura → fragmentos → mosaico, em cerca de três segundos.
2. Use Skip intro com mouse e com Espaço. O foco deve ir para Books, sem aguardar o fim da animação.
3. Entre numa sala e volte. A mesma sessão deve abrir o mosaico pronto. Refresh também deve preservar esse comportamento.
4. Ative Reduce motion em Settings ou a preferência do sistema. Volte à homepage: não deve haver entrada elaborada. Restaure a preferência quando terminar o teste.
5. Use Tab e Enter para visitar as seis salas. Confira o foco visível, a busca Ctrl+K e o menu global.
6. Teste no celular, em uma janela baixa e com zoom real a 200%. A disposição deve mudar, mantendo títulos e alvos utilizáveis, sem rolagem lateral.
7. Desça até as seleções e abra Quick Preview. Confira créditos, links e fallback se alguma imagem estiver bloqueada.

## H. Próxima tarefa

Stage 06.2 — Navigation & HUD Refinement permanece separada. Ela não foi iniciada automaticamente, e o HUD não foi redesenhado nesta entrega.
