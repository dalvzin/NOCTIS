# Stage 03 — Discovery: arquitetura e aprendizado

## O que foi ampliado

A homepage e os seis ambientes continuam na arquitetura existente. As animações, o menu, o diálogo nativo, as cores e as fichas foram reaproveitados. O catálogo passa a combinar 9 obras reais selecionadas manualmente, as 18 demonstrações fictícias da etapa anterior e resultados externos dos provedores conectados. Cada origem tem um rótulo próprio; falhas externas não transformam demos em obras reais.

Não foram adicionadas bibliotecas. Acrescentamos um serviço Node de consulta de metadados, sem contas ou banco, para controlar frequência, identificar a aplicação e manter configurações fora do navegador. No desenvolvimento ele é ligado ao mesmo servidor Vite; em produção existe um iniciador Node separado.

## Mapa dos arquivos novos

| Arquivo                         | Responsabilidade e conexão                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/catalog.ts`          | Formato normalizado `Work`, categorias, provedores, resposta da busca e estados de disponibilidade. `Source` distingue dados fictícios, curados e externos por uma união discriminada.                                          |
| `src/data/curated.ts`           | Nove obras reais com fontes verificadas e duas coleções editoriais. Descrições e conexões são textos próprios do NOCTIS, não avaliações ou estatísticas.                                                                        |
| `src/services/`                 | Nova camada entre dados e componentes. Reúne acesso ao catálogo, regras de busca e adaptação de respostas.                                                                                                                      |
| `src/services/catalogUtils.ts`  | Normaliza texto para busca, valida links HTTPS, filtra dados, agrupa duplicatas e restringe destinos de retorno a páginas internas conhecidas.                                                                                  |
| `src/services/providers.ts`     | Adaptadores tipados de Open Library, Art Institute of Chicago e MusicBrainz. Recebem dados desconhecidos, validam campos e produzem `Work` ou rejeitam o registro. Compartilhado pelo serviço Node e testes. Não contém chaves. |
| `src/services/catalog.ts`       | Catálogo local compartilhado, consultas aos endpoints internos, validação das respostas, cache de buscas e registro em memória de obras externas conhecidas. Resolve também deep links e enriquecimento de fichas.              |
| `src/hooks/`                    | Nova pasta para comportamentos React reutilizáveis que precisam de estado/efeitos.                                                                                                                                              |
| `src/hooks/useCatalogSearch.ts` | Debounce, cancelamento, estado de carregamento, tentativas manuais e proteção contra respostas antigas. Alimenta sala, painel e página de resultados.                                                                           |
| `src/features/discovery/`       | Nova pasta com as interfaces de descoberta, reutilizando cartões e conteúdo da Stage 02.                                                                                                                                        |
| `SearchPanel.tsx`               | Painel compacto abaixo da navegação. Mostra sugestões editoriais, pesquisa obras, permite setas nos resultados e Enter para a página completa.                                                                                  |
| `SearchPage.tsx`                | Rota `/search`, formulário de pesquisa, seleção de categoria, filtros, resultados, limites e estado vazio. A URL preserva a consulta.                                                                                           |
| `DiscoverPage.tsx`              | Curator’s Selection, Hidden Gems editorial, duas coleções por URL, categorias e obras em destaque. Não simula comunidade ou popularidade.                                                                                       |
| `CatalogFilters.tsx`            | Filtros sobre registros carregados: formato, criador, tag/assunto, década e real/demonstração. Opções vêm dos dados efetivamente disponíveis.                                                                                   |
| `CatalogResults.tsx`            | Grade reutilizável, limite inicial de 12, botão de mostrar mais e estado de Quick Preview. Usado por busca, Discover e salas.                                                                                                   |
| `QuickPreview.tsx`              | Composição compartilhada da prévia: imagem, conteúdo, origem e link para ficha. Usa o `Modal` já existente.                                                                                                                     |
| `ItemImage.tsx`                 | Usa a imagem licenciada disponível, carrega sob demanda e volta ao SVG original quando falta ou falha. O placeholder é identificado.                                                                                            |
| `ProviderNotice.tsx`            | Estado de consulta e disponibilidade real de cada fonte, com detalhes recolhíveis e tentativa manual após falha.                                                                                                                |
| `Discovery.module.css`          | Estilos isolados dos filtros, painel, página de busca, coleções e imagens. Preserva os tokens existentes.                                                                                                                       |
| `server/`                       | Código executado somente no Node, não no navegador.                                                                                                                                                                             |
| `server/catalog.mjs`            | Endpoints internos, hosts externos fixos, validação de entradas, identificação da aplicação, cache, limite de frequência e normalização. Exporta serviço e middleware para testar sem rede real.                                |
| `server/catalog.d.mts`          | Declaração TypeScript do middleware JavaScript para a configuração Vite. Não gera comportamento em execução.                                                                                                                    |
| `server/start.mjs`              | Servidor da distribuição: serve apenas `dist/`, suporta rotas do React e liga os mesmos endpoints de catálogo. Não expõe arquivos `.env`.                                                                                       |
| `server/catalog.test.mjs`       | Testes do serviço com respostas sintéticas e frequência controlada, em ambiente Node. Não fazem chamadas reais.                                                                                                                 |
| `src/test/Discovery.test.tsx`   | Normalização, direitos de imagem, deduplicação, filtros, falhas, cache, corrida entre respostas, deep links e fluxo da descoberta.                                                                                              |
| `.env.example`                  | Nomes e explicações de configuração, sem credenciais. É a única exceção `.env*` que pode ser versionada.                                                                                                                        |

## Arquivos existentes que mudaram

`works.ts` mantém os dados fictícios, mas aplica o modelo compartilhado. Seus IDs internos agora incluem `noctis:categoria:identificador`; `legacyId` preserva endereços antigos como `/books/atlas-of-silence`. `workPath` e `getWork` respeitam esse alias.

`App.tsx` conecta `/search`, o novo Discover e títulos de obras conhecidas. `Navigation.tsx` abre `SearchPanel` em vez do shell antigo, preservando atalhos e menu. `Modal.tsx` e seu CSS permitem posicionar o painel abaixo da barra; mantêm Escape, clique fora, foco e rolagem.

`RoomExperience.tsx` passa a usar a busca compartilhada e os filtros adicionais. `WorkCard`, `WorkContent` e `WorkDetail` distinguem origens e exibem fontes. `WorkDetail` resolve registros externos na recarga, enriquece metadados quando possível e mantém informação já obtida se o enriquecimento falhar. `WorkVisual` aceita ano desconhecido sem inventá-lo. `RoomEntrance` altera somente o rótulo para indicar o catálogo híbrido; seus efeitos foram preservados. `Pages.tsx` conserva Home/RoomGrid/Information; o Discover antigo foi substituído pela página dedicada.

`vite.config.ts` liga o middleware em desenvolvimento e preview. `package.json` inclui `start` e `lint`; este último usa regras estáticas do compilador TypeScript, não ESLint. `setup.ts` prepara fixtures e também permite testes Node. Os testes anteriores foram ajustados para escolher `source=demo` quando verificam especificamente as três demonstrações de uma sala. Limpar todos os filtros retorna agora à coleção híbrida, não apenas às demos.

## O que é uma API?

Uma API é uma interface para pedir dados a outro sistema. NOCTIS envia uma requisição HTTP, como um pedido de busca à Open Library. A resposta normalmente vem em JSON: texto estruturado com campos e listas. JSON não é código executado pelo site.

Cada provedor organiza sua resposta de uma maneira: Open Library usa `author_name`, enquanto o museu usa `artist_title`. O adaptador traduz esses campos para `creator`, usado pelos mesmos componentes. Assim, um cartão não precisa saber falar com três APIs diferentes.

`unknown` no adaptador significa que ainda não confiamos no formato recebido. Validamos identificadores e títulos, tratamos campos opcionais e só depois retornamos um `Work`. Não há `dangerouslySetInnerHTML`: descrições do museu são convertidas a texto e renderizadas pelo React como texto.

## Identificadores e duplicatas

Um registro pode ter o ID `openlibrary:books:OL123W`, enquanto uma obra de museu usa `aic:art:28560`. Isso evita colisões e cria referências que futuros álbuns poderão guardar. A origem continua no registro; não tratamos uma consulta como identidade de uma obra.

A deduplicação mantém primeiro os registros curados e compara categoria, título-base e sobrenome do primeiro criador; também reconhece prefixos como “Mary Shelley’s”. Demos nunca são fundidas com obras reais. É uma heurística editorial para agrupar duplicatas evidentes, não uma prova de equivalência entre edições, traduções, adaptações ou nomes homônimos. Os IDs próprios dos provedores são preservados, e suas fichas continuam resolvíveis diretamente.

## Fluxo completo da busca

1. Ctrl+K/⌘K ou o ícone abre o painel. Antes de digitar, aparecem obras reais escolhidas pela curadoria.
2. `query` guarda o texto. Resultados locais aparecem imediatamente.
3. O hook espera 400 ms sem nova digitação, reduzindo pedidos desnecessários. Isso é **debouncing**.
4. A consulta chega a `/api/catalog/search?q=...`. O servidor seleciona apenas os adaptadores disponíveis para a categoria e limita cada fonte a 12 registros.
5. Os adaptadores normalizam as respostas. O cliente combina os registros com os locais e agrupa duplicatas.
6. O React recebe o novo estado e atualiza links/cartões. Uma resposta antiga não substitui a busca atual: o efeito anterior é cancelado e marcado como inativo.
7. Enter no campo abre `/search?q=...`. Nessa página, categoria e filtros ficam na URL. Voltar/Avançar do navegador restaura esses estados.
8. A imagem de um cartão abre Quick Preview. Open full record abre a ficha por ID; o destino de retorno guarda os filtros.
9. View source abre a página original identificada. Não anuncia streaming, loja ou Spotify sem um destino verificado.

Setas para cima/baixo percorrem os links do painel; Tab continua disponível. Não foi implementado um falso combobox com seleção virtual: os resultados são links normais, com foco real e nomes acessíveis.

## Carregamento, erro e cache

O catálogo local permanece visível durante a consulta. Mensagens avisam quando fontes externas estão sendo verificadas; falhas e integrações não configuradas aparecem na disponibilidade. Um erro não vira sucesso vazio nem conteúdo fictício apresentado como real.

O **cache** é memória temporária: no servidor, respostas válidas duram 10 minutos, com até 100 entradas; no navegador, buscas bem-sucedidas duram 5 minutos, com até 40 entradas. Consultas idênticas em andamento no servidor compartilham o mesmo pedido. Não há armazenamento de histórico pessoal ou persistência desses caches.

O servidor espaça pedidos por provedor em pelo menos 1,1 segundo, limita a fila e aguarda no máximo 6,5 segundos por requisição externa. O cliente limita a espera a 11 segundos. Cancelar uma busca interrompe a espera do cliente; um pedido de servidor compartilhado pode continuar até seu timeout para atender outro consumidor. Erros 429/503 criam uma pausa de 30 segundos; não há tentativas automáticas em loop. Retry é uma ação explícita.

Filtros refinam somente os registros carregados. Não representam uma consulta avançada ao catálogo inteiro, e as contagens informam esse limite. Não oferecemos orientação de foto, plataforma de jogo ou outros filtros sem dados suficientes para operar consistentemente.

## Configuração e privacidade de credenciais

Variáveis de ambiente permitem configurar execução sem editar componentes. `NOCTIS_CONTACT` identifica a aplicação para os provedores e fica no Node. Um contato real só deve ser configurado se você autorizar seu envio no cabeçalho de identificação. MusicBrainz fica desabilitado sem ele.

Chaves futuras de TMDB, RAWG ou Unsplash não devem usar prefixo `VITE_`, pois esse prefixo disponibiliza valores para o navegador. Essas integrações ainda não leem chaves nesta entrega; o exemplo não promete habilitá-las por simples preenchimento. Consulte o guia 08.

## Limites intencionais

Não há personalização, estatísticas de trending, contas, comunidade, favoritos, avaliações ou álbuns. Não há clipes ou áudio; `mediaPreviews` reserva o formato para fontes autorizadas futuras, mas nenhuma mídia foi inventada. A Stage 04 não foi iniciada.
