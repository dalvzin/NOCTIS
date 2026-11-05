# Stage 06.2 — Navegação, HUD e identidade

## A. Correção da marca

O cabeçalho original usava `N<span>◦</span>CTIS`: o símbolo é o caractere `◦` (U+25E6), em Georgia, com a cor `--bronze`. Ele já é um pequeno círculo vazado; não foi substituído por uma bola preenchida, um O comum ou um novo desenho.

`NoctisWordmark` centraliza exatamente esse glifo. A navegação mantém tamanho de 28 px, espaçamento de 7 px e tamanho móvel de 24 px. O símbolo herda a mesma fonte, linha de base e espaçamento das letras, escalando junto delas. Rodapé e introdução herdam as dimensões dos seus contextos. Não há uma imagem ou download adicional para o logo.

A aparência visual é `N◦CTIS`, mas `role="img" aria-label="NOCTIS"` apresenta o nome correto aos leitores de tela. As partes desenhadas ficam ocultas da árvore acessível. A cópia cinematográfica inteira permanece decorativa, pois a marca acessível já existe no cabeçalho. Títulos do navegador e textos comuns continuam escritos NOCTIS.

Na introdução, `split` fornece dois grupos: `N◦C` e `TIS`. Só esses grupos recebem o deslocamento de abertura de −17/+17 px; o círculo acompanha o primeiro grupo. Isso evita que seletores genéricos de `span` animem o símbolo isoladamente. Os tempos de `useAwakening` permanecem 260, 950, 1450 e 3100 ms. Skip intro, entrada instantânea de retorno e movimento reduzido continuam funcionando.

## B. Melhorias do HUD

O cabeçalho mantém sua posição e transparência. Busca e menu agora usam ícones de 20 px e áreas de interação de pelo menos 44 px. O atalho visual informa Cmd e Ctrl; continua oculto em telas pequenas para preservar espaço.

A escala compartilhada de espaçamento usa 4, 8, 12, 16, 24 e 32 px. `--header-height` é 88 px no desktop e 76 px até 600 px; cabeçalho, conteúdo, busca e altura do mosaico usam a mesma referência. `--page-top` organiza o início de páginas pessoais e descoberta. O arquivo pessoal tinha 150 px de margem interna superior **além** do cabeçalho compensado pelo main; isso gerava um vazio desnecessário. Agora usa o recuo compartilhado de 40–64 px.

Os painéis usam `--panel-gutter`, `--control-height` e `--hud-duration` (180 ms). Filtros reutilizam os passos de 16/24 px. A busca ganhou links de salas com área mínima de 44 px e metadados de 11 px. As proporções de imagens e os layouts artísticos das salas foram preservados.

`scrollbar-gutter: stable` reserva o espaço da barra vertical. Assim, bloquear a rolagem do fundo ao abrir um diálogo não desloca o cabeçalho. A medição em desktop confirmou a posição horizontal da marca em 99,75 px antes e durante o menu.

## C. Navegação e interação

O estado `panel` continua sendo `null`, `menu` ou `search`: somente um painel de navegação fica aberto. Mudanças de caminho ou parâmetros de consulta fecham o painel. Ctrl+K e Cmd+K alternam a busca; quando um Quick Preview está aberto, o atalho não abre outro diálogo sobre ele.

O menu mantém o mesmo padrão lateral e agrupa The Archive (Home/Discover), The Rooms (seis categorias numeradas) e Your Space (arquivo, histórico e configurações). Os números são decorativos para leitores de tela. `NavLink` preserva os indicadores ativos em detalhes de obras; páginas de álbuns também destacam visualmente My Archive. O destaque combina cor, fundo discreto e linha lateral.

O diálogo nativo mantém foco contido, Escape e fechamento pelo fundo. Ao cancelar, o foco retorna ao botão de origem sem rolar a página. Ao navegar, `App` aguarda o fechamento do diálogo e o próximo quadro antes de focar o main: conteúdo externo a um diálogo modal aberto está inerte e não podia receber foco confiavelmente. A busca recebe foco no campo; outros diálogos deixam o navegador escolher o primeiro controle, evitando tentar focar campos dentro de detalhes fechados.

A busca usa a altura real do cabeçalho, limites da janela e rolagem interna. No celular fica centralizada; o menu ocupa no máximo 364 px e pode ocupar toda a largura disponível. A largura máxima padrão do navegador para dialog foi sobrescrita explicitamente, pois ela deixava uma fresta lateral involuntária em telas estreitas. Há compensação das áreas seguras superior/inferior no painel lateral. Movimento reduzido desativa a animação discreta de entrada; a preferência local também é respeitada.

`portfolioMode = true` é uma decisão explícita em `src/config/portfolio.ts`. Oculta Account/Community do menu e convites para conectar conta em ações pessoais e Settings. Salvar, avaliar e criar álbuns continuam locais. Os módulos e endereços futuros foram preservados; isso não configura Supabase nem torna autenticação um recurso pronto. Nenhuma dependência foi adicionada.

## D. Arquivos e responsabilidades

| Arquivo | Responsabilidade nesta etapa |
| --- | --- |
| `src/components/brand/NoctisWordmark.tsx` (novo) | Marca acessível e grupos opcionais para abertura. |
| `src/components/brand/NoctisWordmark.module.css` (novo) | Glifo original bronze e transição dos grupos. |
| `src/config/portfolio.ts` (novo) | Centraliza a apresentação do portfólio sem promover contas. |
| `src/components/navigation/Navigation.tsx` | Marca, agrupamento, atalhos, estado e destaque de álbuns. |
| `src/components/navigation/Navigation.module.css` | Cabeçalho, itens, ícones, hierarquia e adaptação móvel. |
| `src/components/ui/Modal.tsx` | Foco inicial da busca e restauração de foco sem rolagem. |
| `src/components/ui/Modal.module.css` | Painéis contidos, espaçamento, áreas seguras e entrada discreta. |
| `src/app/App.tsx` | Marca do rodapé e foco do conteúdo após navegar. |
| `src/features/home/Home.tsx` | Reutiliza a marca na introdução existente. |
| `src/features/home/Home.module.css` | Anima grupos explícitos e usa a altura compartilhada do cabeçalho. |
| `src/styles/global.css` | Tokens, compensação do cabeçalho e reserva da barra de rolagem. |
| `src/features/discovery/Discovery.module.css` | Recuo, filtros, alvos da busca e legibilidade de metadados. |
| `src/features/personal/PersonalActions.tsx` | Mantém ações locais sem chamadas para contas futuras. |
| `src/features/personal/PersonalPages.tsx` | Settings coerente com a versão local. |
| `src/features/personal/Personal.module.css` | Corrige o vazio superior das páginas pessoais. |
| `src/test/NavigationHUD.test.tsx` (novo) | Nove testes de marca, atalhos, foco, menu e modo portfólio. |
| `README.md` e este documento | Estado atual, aprendizado, resultados e roteiro. |
| `docs/evidence/stage-06-2-*` | Capturas e medidas reais desta verificação. |

## E. Testes executados

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado. O projeto usa regras do TypeScript; não é ESLint.
- `npm run build`: aprovado; Vite gerou a distribuição. Bundle principal de 406,77 kB, 128,61 kB gzip nessa execução.
- `npm test -- --reporter=dot`: **216 testes aprovados em 16 arquivos**. Inclui a regressão das etapas anteriores, os testes da introdução e nove testes novos.

Durante o trabalho, a suíte detectou que os números das salas entravam nos nomes acessíveis e quebravam os links esperados. Foram marcados como decorativos. A checagem TypeScript também encontrou uma opção indevida na consulta de um teste; ela foi corrigida antes da execução final.

No navegador integrado, em `http://127.0.0.1:5180/`, foram exercitados menu, navegação até Settings/My Archive, Escape, Ctrl+K, foco da busca, seta para resultado, Enter para `/search?q=Frankenstein`, Quick Preview e página completa. A correção final de foco foi confirmada em `MAIN#main` após navegar. Salvar e avaliar Frankenstein persistiram após refresh; as alterações de teste foram desfeitas. A preferência local Reduce motion abriu a homepage diretamente em ready; foi restaurada para Follow device preference.

Uma nova aba confirmou a fase opening, com transformações opostas nos grupos `N◦C` e `TIS`, seguida de ready com seis salas. Não houve erros de console nessa aba de verificação. Menu foi inspecionado em desktop e celular. Busca foi medida em 320×740, 768×1024, 1280×800 e 1920×1080, sem transbordamento horizontal dos diálogos ou da página nessas medições. A homepage também foi inspecionada em 390×844 e 1440×1000. As larguras úteis descontam 15 px reservados para a barra de rolagem.

O clique no fundo e a preservação do diálogo ao clicar no conteúdo foram testados automaticamente. Não foram simulados por coordenadas no navegador integrado. Os testes automáticos usam fixtures para provedores; esta etapa não certifica disponibilidade das APIs externas.

Evidências: `stage-06-2-home-desktop.jpg`, `stage-06-2-navigation-desktop.jpg`, `stage-06-2-home-mobile.jpg`, `stage-06-2-navigation-mobile.jpg`, `stage-06-2-wordmark-opening.jpg` e `stage-06-2-layout-checks.json`, em `docs/evidence/`.

## F. Limitações

Não foram executados testes em aparelhos físicos, Safari, leitor de tela real, zoom nativo do navegador ou teclado virtual de celular. A preferência local reduzida e os testes automatizados cobrem o comportamento; não foi alterada a configuração de acessibilidade do sistema operacional. Áreas seguras e zoom merecem conferência em dispositivos reais.

Contas reais, autenticação e comunidade seguem adiadas. As rotas preparatórias ainda podem ser acessadas diretamente e continuam exibindo seus estados existentes quando não configuradas. Álbuns e capas continuam usando a implementação da Stage 04.1; a suíte de regressão os exercita, mas o upload completo não foi repetido manualmente nesta etapa. Não houve migração de dados nem redesenho dos cartões.

## G. Roteiro para revisão pessoal

1. Abra o site pelo iniciador habitual. Em uma nova sessão, observe o círculo dourado e a abertura da marca; compare cabeçalho e rodapé.
2. Abra o menu, entre numa sala e num detalhe. Reabra o menu e confira o destaque da categoria.
3. Use Ctrl+K ou Cmd+K, digite um título e navegue com as setas. Enter no campo abre a busca completa; Enter num resultado abre a obra. Escape fecha e devolve o foco.
4. Teste o clique no fundo do painel. Em celular, role o menu e a busca até o fim; Settings deve continuar acessível.
5. Em Settings, selecione Reduce motion e volte à homepage. Depois restaure a preferência desejada.
6. Salve uma obra, avalie, visite My Archive e recarregue. Não é necessário entrar numa conta.
7. Confira pessoalmente o zoom em 200%, o teclado virtual e a navegação com Tab no Brave habitual. Esses ambientes não foram certificados pela verificação automatizada desta entrega.

## H. Próxima etapa

Stage 06.3 — Catalog Cards, Artwork & Content Layout Refinement. **Não iniciada.** O mosaico, as salas e os fluxos de álbuns permanecem prontos para essa revisão posterior.
