# Decisões e limites

Registro das decisões da Stage 01. As salas e o catálogo local foram ampliados na Stage 02; veja [o guia atualizado](05-experiences.md). As referências a páginas introdutórias abaixo descrevem a fundação original.

## Identidade

Obsidian `#111113`, charcoal `#242427`, ivory `#E8E0D3`, bronze `#A58D70` e ash `#67656D` são tokens. Ash foi preservado, mas o texto secundário usa `#AAA5A0` para melhorar a leitura no fundo escuro. Georgia traz a voz editorial; Arial mantém controles familiares sem baixar fontes. O espaçamento fluido usa `clamp`, com grades de três, duas e uma coluna conforme o espaço disponível.

As seis ilustrações usam somente geometria e CSS criados para este projeto. Não há material de terceiros para atribuir, hotlinks ou imagens quebradas. A curadoria é identificada como demonstração local. Não há títulos fictícios apresentados como obras reais.

## Navegação e acessibilidade

Usamos `dialog.showModal()` para aproveitar a modalidade e contenção nativas de foco, em vez de construir uma armadilha de teclado manual. Botões têm nomes acessíveis; links ativos usam `aria-current`; há link de salto, landmarks, ordem de títulos e foco visível. O menu lateral também atende celular. Ao fechar, o foco retorna ao acionador; ao trocar de página, o conteúdo recebe foco.

Motion recebe `reducedMotion="user"`; o convite também consulta `useReducedMotion`. CSS remove transições e animações para `prefers-reduced-motion`. Não há parallax, vídeos, áudio automático ou transições imersivas das categorias nesta etapa.

Referências técnicas consultadas: [MotionConfig](https://motion.dev/docs/react-motion-config), [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) e [Vite](https://vite.dev/guide/).

## Arquitetura proporcional

Uma fonte tipada alimenta navegação, pesquisa e rotas para evitar divergência entre nomes e URLs. Não criamos `services/` porque não há integração externa; nem `hooks/` só para reexportar um hook pronto. As seis salas compartilham uma página introdutória; suas experiências completas entram na Stage 02. Não há armazenamento local ou rastreamento.

O Hybrid Catalog permanece planejado: seleção manual e APIs progressivas. Busca global de obras, filtros e Hybrid Discovery pertencem à Stage 03. Favoritos, avaliações e histórico pertencem à Stage 04; contas e comunidade à Stage 05. Não há botões de salvar ou login fingindo funcionar.
