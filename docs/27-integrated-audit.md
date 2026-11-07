# Revisão integrada — conteúdo, superfície e movimento

Esta rodada aplica a auditoria ao projeto existente. O checkout começou sem alterações locais pendentes. Não foram encontradas instruções `AGENTS.md` na árvore do projeto nem nos diretórios ancestrais consultados. Não houve instalação de dependências, alteração do modelo do arquivo pessoal, commit, push ou deploy.

## Achados e diagnóstico

| Achado da auditoria | O que foi observado nesta revisão |
| --- | --- |
| Seis fontes indisponíveis | Não se reproduziu no servidor local: Open Library e AIC responderam à busca por Severance. O módulo do servidor também carregou diretamente em Node, fora do Vite. Não foi confirmada a causa da falha simultânea na instância publicada. |
| Severance sem série nos resultados | A busca de filmes/séries pelo TMDB não está implementada/conectada nesta versão. Os resultados externos de livros não representam uma busca de séries. A busca restrita a Films & Series expõe essa limitação em disponibilidade das fontes. |
| MusicBrainz indisponível | Reproduzido: falta o contato real de aplicação no servidor, `NOCTIS_CONTACT`. O cliente não recebe nem precisa desse valor. |
| RAWG e Unsplash indisponíveis | São integrações ainda não conectadas. Acrescentar uma variável isolada não cria seus adaptadores; são necessários aplicação/credenciais e validação dos termos correspondentes. |
| Uma fonte atrasar a busca inteira | O endpoint agregado esperava todos os provedores. A interface global passou a consultar as salas independentemente e mostrar respostas concluídas enquanto as outras continuam pendentes. |
| Busca local e filtro de período de Books | Mantidos. A coleção não depende da resposta externa; os refinamentos continuam na URL. |
| Games residual no mosaico | Reproduzido: cerca de 122 px de altura na medição inicial em 1440 px. A nova distribuição deu aproximadamente 285 px nessa revisão. |
| Photography estreita/quebra artificial | Confirmado no layout e no `<wbr>` do título. A peça agora ocupa uma linha inteira no celular, sem quebra inserida na palavra. |
| Prévia horizontal numa coluna vertical pequena | Reproduzido com Firewatch: a imagem ficava na coluna de 128 px. A composição horizontal agora usa um diálogo de até 820 px e uma área de imagem proporcional. |
| Filtros extensos antes de duas/três obras | Reproduzido nas salas. Busca curta permanece visível; refinamentos ficam numa expansão e formatos sem alternativa útil são omitidos. |
| Livro alto, caixas dentro do papel, abertura recorrente | Reorganizados a partir da implementação existente. O livro continua com duas aberturas/quatro páginas, mas com diagramação mais densa, cabeçalho compacto e abertura lembrada por sessão. |
| Excesso de superfícies arredondadas | Confirmado visualmente. Cartões de obras perderam a caixa externa; curvas maiores permanecem nos modais. Papel e arquitetura têm tratamentos próprios. |
| Fechar prévia após expandir álbum | Durante o teste móvel, o fechamento podia sair do enquadramento ao rolar. O cabeçalho do diálogo agora é sticky dentro do modal. |

### O que não foi atribuído a um defeito novo

Capas automáticas, seleção manual de capa, validação de uploads, persistência, preservação de edições, URLs de destinos, Escape e contenção de foco já existiam. Foram preservados e cobertos pelos testes pertinentes. Não foi necessário reescrever armazenamento, adapters de imagens ou modais.

## Busca e alcance real

`searchCatalog` agora aceita um callback opcional de progresso. Quando usado pela interface global, cada categoria retorna independentemente. As respostas completas são combinadas com a seleção local e deduplicadas. Consultas por categoria e consumidores existentes preservam o contrato anterior.

`useCatalogSearch` mantém a proteção de consulta ativa e cancelamento: uma resposta antiga não atualiza a nova consulta, mesmo se o transporte ignorar o aborto. Retry limpa o cache do cliente e repete os parâmetros atuais. Os registros locais permanecem disponíveis durante espera e falha.

A interface distingue andamento, resultados disponíveis e indisponibilidade. Configuração ausente não é apresentada como uma falha que um botão de retry possa resolver. Uma falha real oferece retry, desabilitado enquanto estiver em andamento. Os detalhes por fonte continuam em expansão.

O servidor mantém timeout por provedor, validação de respostas, cache e isolamento de erros. A importação direta do módulo Node passou, e os testes do handler da Vercel verificam o caminho reescrito, parâmetros, respostas JSON e separação do fallback SPA. Isso **não equivale a um teste da instância remota**: não houve deploy nem validação HTTP da versão publicada nesta rodada. A falha simultânea das seis fontes reportada na auditoria permanece sem reprodução remota confirmada.

Não foram criados resultados de demonstração para simular Severance ou uma integração. Também não foram expostas credenciais. `NOCTIS_CONTACT` deve ser configurado no servidor para MusicBrainz, com um contato que o responsável autorize enviar ao provedor. TMDB, RAWG e Unsplash continuam bloqueios de integração, não apenas campos de ambiente vazios.

## Direção editorial e apresentação

Mantive as 17 obras reais existentes e seus IDs. Nenhuma obra foi removida de salvamentos ou álbuns. A opção adotada foi assumir os recortes, em vez de acrescentar itens para aumentar números:

- Music é explicitamente um tríptico de ambient ligado a Brian Eno e colaboradores.
- A seleção local de Films & Series contém três filmes de cinema inicial; não promete séries disponíveis.
- Photography é uma sequência de observação de duas fotografias documentais.

`roomCuration.ts` reúne essas apresentações e as intenções de Books, Games e Art. As imagens, direitos, créditos e destinos dos registros foram reutilizados; não foram inventadas URLs ou substituídas obras por imagens de preenchimento.

As superfícies agora seguem uma hierarquia: modal temporário com curva generosa; botões discretos; obras com menos molduras; papel com divisórias e tipografia; After Hours com aberturas arquitetônicas. A cor secundária ficou mais legível. Rótulos repetidos e o campo de categoria redundante dentro das salas foram reduzidos.

O mosaico preserva as seis ilustrações originais, No. 001 e a assimetria. Games ganhou altura; Photography e Music recebem largura inteira no celular. A nota de Books tem mais largura útil no desktop e passa para baixo da capa em telas menores.

## Prévia, livro e registro completo

Quick Preview continua sem rating ou destinos externos. Reutiliza o mesmo componente com composições portrait, square e landscape, escolhidas por categoria e proporção conhecida. `object-fit: contain` e as variantes de imagem existentes continuam preservando a obra. Imagens horizontais deixam de ocupar uma coluna vertical minúscula; fotografias e pinturas têm espaço proporcional na coleção e na ficha.

O livro preserva a abertura física, a máquina de estados, a virada, o skip e a leitura móvel de uma página por vez. Retornos ao mesmo registro na sessão começam em leitura; Replay book opening pode reabrir, com foco levado ao skip e depois devolvido à leitura. A lembrança usa chaves separadas em `sessionStorage`, sem tocar no arquivo pessoal.

Mantive quatro páginas nos três livros porque há capa, bibliografia, sinopse e interpretação próprias; reduzi a altura e a densidade de UI em vez de inserir texto para preencher papel. A medição intermediária do livro de Frankenstein passou de aproximadamente 857 para 719 px em 1440 px, após compactar cabeçalho, margens e conteúdo. Fatos, sinopse e leitura editorial continuam identificados. Não há citações inventadas nem texto integral novo. Ações e fontes permanecem fora do livro, com atalho direto.

No Full Record, dois assuntos não criam uma seção inteira. Assuntos ficam junto ao conjunto de identificação e apenas fatos/atmosfera justificam Record details. Notas editoriais, rating, destinos específicos e atribuições continuam separados. Os retornos à sala e ao contexto de origem foram preservados.

## After Hours e movimento

As três obras continuam relacionadas como máquina, passagem e refúgio. As molduras viraram recessos em arco, com sombra interna, soleira e iluminação de foco/hover. O cenário vetorial original permanece; não foram usados assets, personagens ou símbolos de Deadlock. No celular, uma linha luminosa e conexões laterais unem as aberturas. A leitura posterior usa divisórias e interpretação adicional, sem repetir três imagens em novos cards.

As entradas das salas reutilizam os estudos originais: projeção em Films, sinal em Games, disco e agulha em Music, revelação em Photography, afastamento de detalhe em Art. São gestos de 700–800 ms, com skip e replay, sem movimento contínuo. Visitas recorrentes usam a memória existente da sessão. Books mantém a transição geral ao entrar na sala e a abertura física ao entrar no registro. As fichas das outras mídias recebem uma revelação breve de 400–500 ms, sem bloquear controles.

Movimento reduzido preserva conteúdo e navegação e suprime os efeitos. O sistema e a preferência interna continuam sendo considerados; nenhum ajuste do sistema operacional foi alterado.

## My Archive e álbuns

O arquivo passou a usar menos painéis e linhas mais discretas. Edit album e Change album cover são expansões claras; a capa e as obras mantêm protagonismo. Escolhas manuais, capa automática e uploads continuam usando o mesmo armazenamento. A pluralização existente (`1 work`) foi confirmada. O texto de ratings foi corrigido para indicar o Full Record, onde a avaliação realmente está.

## Arquivos e responsabilidades

| Grupo | Arquivos principais |
| --- | --- |
| Busca progressiva e mensagens | `src/services/catalog.ts`, `src/hooks/useCatalogSearch.ts`, `src/features/discovery/ProviderNotice.tsx`, `SearchPanel.tsx` |
| Recortes e coleção antes dos filtros | `src/data/roomCuration.ts` (novo), `src/features/experiences/RoomExperience.tsx`, `Experiences.module.css`, `src/features/discovery/CatalogFilters.tsx` |
| Proporções e modal | `QuickPreview.tsx`, `QuickPreview.module.css`, `Artwork.module.css`, `src/components/ui/Modal.tsx`, `Modal.module.css` |
| Hierarquia geral e mosaico | `src/styles/global.css`, `Home.tsx`, `Home.module.css`, `Discovery.module.css` |
| Livro compartilhado | `useManuscriptBook.ts`, `FrankensteinManuscriptPage.tsx`, `FrankensteinManuscript.module.css` |
| Full Record | `WorkDetail.tsx`, `WorkContent.tsx`, `FullRecord.module.css` |
| Exposição | `src/data/editorialPaths.ts`, `AfterHours.tsx`, `AfterHours.module.css` |
| Gestos de entrada | `RoomEntrance.tsx`, `RoomEntrance.module.css`, `WorkVisual.tsx` |
| Arquivo pessoal | `PersonalPages.tsx`, `Personal.module.css` — sem mudanças de schema/repositório/IndexedDB |
| Verificação de comportamentos | `src/test/AuditReliability.test.tsx` (novo), `Experiences.test.tsx`, `FrankensteinManuscript.test.tsx`, `PersonalUI.test.tsx` |

## Evidências e limites

Verificação final executada: **311 testes aprovados em 22 arquivos**; `npm run typecheck`, `npm run lint`, `npm run build` e `git diff --check` passaram. O lint deste repositório usa opções adicionais do TypeScript, não ESLint. Build em `dist`, sem dependências novas. O módulo principal produzido ficou em aproximadamente 450,48 kB (141,28 kB gzip); não foi realizado um benchmark de desempenho ou medição de Web Vitals.

Os arquivos `viewport-checks.json` e `book-viewport-checks.json`, em `docs/evidence/integrated-audit/`, registram as dimensões efetivas: 44 páginas/larguras na matriz principal e seis verificações dos três livros em 320 e 768 px. Não houve transbordamento horizontal nessas medições. Isso não é uma garantia de todas as combinações de conteúdo possível.

No navegador integrado foram conferidos: busca real local, limite de séries, coleções, proporções, álbum expandido em prévia, Shift+Tab/Tab no diálogo, Escape, retorno de foco, scroll de fundo bloqueado/restaurado, replay/skip, consulta preservada após Full Record e Drácula com a preferência interna de movimento reduzido. A preferência foi restaurada. O arquivo de QA existente continuou com uma obra salva, desejada e avaliada e um álbum; não foi alterado para testar o layout.

Os testes novos cobrem progresso independente entre fontes, resultados locais durante espera/retry, parâmetros atuais no retry, respostas antigas, retry/configuração ausente e retorno/replay do livro. A suíte existente continua cobrindo uploads, troca/remoção de capas, persistência, créditos, destinos, fallbacks e segurança. Uploads de capas não foram repetidos manualmente no navegador nesta rodada. O funcionamento com `prefers-reduced-motion` está coberto pela implementação e testes de preferência; o teste de navegador usou a preferência interna, não emulação de sistema operacional. Não foi realizada uma auditoria completa com leitor de tela ou dispositivos físicos.

Capturas da implementação local: [mosaico desktop](evidence/integrated-audit/home-desktop.jpg), [mosaico 320 px](evidence/integrated-audit/mosaic-mobile-320.jpg), [Books desktop](evidence/integrated-audit/books-room-desktop.jpg), [prévia horizontal](evidence/integrated-audit/preview-landscape-desktop.jpg), [prévia móvel com álbum](evidence/integrated-audit/preview-mobile.jpg), [livro desktop](evidence/integrated-audit/book-desktop.jpg), [fotografia móvel](evidence/integrated-audit/photography-mobile.jpg), [After Hours desktop](evidence/integrated-audit/after-hours-desktop.jpg), [After Hours móvel](evidence/integrated-audit/after-hours-mobile.jpg).

Pendências materiais: conexão de filmes/séries, jogos e fotografia a provedores externos; contato de servidor para MusicBrainz; reprodução da falha simultânea de fontes na instância publicada. Não foi prometida uma busca universal nem alterada a versão no GitHub/Vercel.
