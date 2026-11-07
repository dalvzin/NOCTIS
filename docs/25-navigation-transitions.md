# Navegação suave e acabamento de Discover

## Resultado

Os atalhos dentro de uma página agora usam rolagem suave. Isso inclui `Your archive & sources` no Frankenstein e os convites para seções da homepage. Na navegação entre páginas internas, o conteúdo que chega tem uma entrada de 320 ms: opacidade de 25% a 100% e deslocamento vertical de 8 px até a posição final. Cabeçalho e rodapé permanecem estáveis.

A navegação não espera uma animação terminar. Não há uma cópia clicável da página antiga, bloqueio temporário de controles ou atraso artificial para carregar os dados. A abertura física do Frankenstein permanece independente da entrada geral. Drácula e Pride and Prejudice não receberam a experiência de manuscrito nesta rodada: essa expansão ficou para o próximo pedido.

## Arquivos e decisões

- `src/app/App.tsx`: envolve as rotas com uma superfície identificada pelo caminho da página. Alterar apenas a busca ou uma aba por query não recria essa superfície. O foco no conteúdo e o fechamento dos diálogos permanecem preservados.
- `src/app/App.module.css`: define a entrada curta. A transformação deixa de existir após a animação, evitando criar permanentemente um novo contexto para elementos posicionados. A preferência de movimento reduzido desativa a entrada.
- `src/styles/global.css`: `scroll-behavior: smooth` no documento; destinos com identificador têm margem para o cabeçalho fixo. Tanto o modo reduzido do sistema quanto a preferência local usam rolagem imediata.
- `src/features/discovery/DiscoverPage.tsx`: a seleção editorial e o atalho Follow a thread deixam de impor rolagem instantânea; usam a preferência de CSS. O reposicionamento para o topo ao trocar de página continua imediato, enquanto o conteúdo entra visualmente. Isso evita percorrer o comprimento inteiro da página anterior para abrir uma página diferente.
- `src/features/discovery/Editorial.module.css`: a exposição usava explicitamente `border-block`, isto é, borda superior e inferior. Agora tem quatro lados, curvas e preenchimento interno responsivo.
- `src/features/archive/Pages.module.css`: Find Your Room usa `RoomGrid`, diferente do mosaico inicial e dos atalhos simples já refinados. Seus seis links agora têm moldura completa, curva de 20 px, imagem com cantos suaves e hover/foco consistente.

Links externos continuam sendo navegação do navegador; a aplicação não tenta controlar a transição do site de destino. Nenhuma dependência adicionada.

## Verificação executada

- `npm run typecheck`, `npm run lint` e `npm run build`: passaram. O lint deste repositório é uma checagem adicional de TypeScript. Build em `dist`.
- `npm test -- --reporter=dot`: **302 testes passaram em 21 arquivos**. São os testes de regressão existentes; não foram adicionadas verificações que apenas repetiriam valores de CSS.
- Navegador: Explore the Archive abriu Discover com animação computada de 0,32 s; bordas esquerda e direita da exposição mediram 1 px e raio de 20 px.
- Find Your Room foi conferido visualmente no desktop e em 390 px, com foco por teclado e sem transbordamento horizontal no celular.
- Frankenstein: o atalho começou com rolagem em 0 e chegou em 811, demonstrando deslocamento entre as observações. O destino permaneceu visível. O valor final varia com a altura da janela e o limite inferior da página.
- Quick Preview → Open full record: chegou ao Frankenstein, fechou o diálogo e colocou o foco no conteúdo principal; a animação de chegada estava aplicada.
- Homepage → Follow a thread: chegou a `/discover#follow-a-thread`, rolou até a seção e colocou o foco nela.
- Na origem isolada de testes `localhost:5180`, Reduce motion resultou em `animation-name: none` e `scroll-behavior: auto`, inclusive após navegar. A preferência foi restaurada. Nenhuma obra salva foi alterada.

Capturas da implementação local em `docs/evidence/transitions/`: exposição e Find Your Room. Imagens estáticas mostram o acabamento, mas não demonstram a duração do movimento. A verificação de movimento foi feita no navegador integrado; não houve uma matriz de dispositivos físicos. Nenhum push ou deploy.
