# Quick Preview e Full Record — duas funções diferentes

Revisão local de 05/11/2026. O HUD, a homepage, as seis salas e a exposição After Hours foram preservados. Não houve deploy, push, nova dependência, integração externa ou alteração do modelo de armazenamento.

## O que mudou

A prévia antes reutilizava `WorkContent`, o mesmo bloco da ficha: descrição, ações, rating, destinos e fontes. Por isso a ficha parecia apenas uma ampliação do modal. Agora cada superfície tem uma apresentação própria, compartilhando somente imagem, regras de identificação e os comandos pessoais existentes.

| Quick Preview                                                                         | Full Record                                                                                           |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Imagem com proporção original; título; tipo; ano disponível; criador identificado.    | Cabeçalho editorial com imagem, identificação e descrição integral disponível.                        |
| Descrição curta, até 230 caracteres, terminando em limite de palavra quando possível. | Nota específica sobre a obra; fatos existentes, assuntos e atmosfera quando disponíveis.              |
| Save e Want to Experience principais; Add to Album expansível.                        | As mesmas ações, álbuns e rating privado, em Your archive.                                            |
| Open full record evidente.                                                            | Beyond this record reúne destinos verificados; procedência fica acessível em Sources & image credits. |
| Image credit discreto, com crédito, direitos e referência da imagem.                  | Continuidade para outras obras da sala e retorno ao contexto anterior.                                |
| Sem rating, blocos de destinos ou explicações do funcionamento do sistema.            | Sem links presumidos, disponibilidade inventada ou preenchimento artificial de dados.                 |

A prévia não faz mais uma consulta de enriquecimento de destinos ao abrir. Usa o registro disponível; a ficha continua buscando detalhes quando o provedor oferece esse fluxo. Uma capa não fornecida pode, portanto, continuar como placeholder na prévia e ser enriquecida no registro completo. A imagem ainda tem seus estados próprios de carregamento e erro.

## Criador e informações confiáveis

`creatorCredit()` omite criadores vazios e marcadores como “Creator metadata unavailable”. Usa os fatos explicitamente fornecidos quando identificam uma função. Para os registros locais conhecidos, diferencia os três diretores de cinema e os três desenvolvedores de jogos. Livro usa Author; fotografia, Photographer; arte e música, Artist. Sem sustentação para uma função cinematográfica ou de desenvolvimento, usa Creator. Uma série não recebe automaticamente o rótulo Director.

As 17 obras editoriais têm notas próprias em `recordNotes.ts`. São interpretações de observação e leitura, identificadas como **NOCTIS / EDITORIAL**, não créditos novos, avaliações agregadas ou descrições de provedor. Notas genéricas sobre a seleção ou recuperação de metadados não são promovidas a texto editorial. Se não há nota específica, a seção é omitida.

As descrições locais continuam identificadas como sínteses editoriais. Registros externos identificam o texto proveniente da fonte. Não foi criada uma sinopse mais longa apenas para diferenciar a ficha: quando há pouco conteúdo confiável, ela permanece concisa. Fatos adicionais só aparecem quando já existem no registro; campos vazios não produzem listas artificiais.

## Destinos e procedência

Os destinos mantêm as regras anteriores de validação e seus rótulos específicos. Nenhuma URL de Rotten Tomatoes, Spotify ou streaming foi construída a partir de um título. Nenhuma integração foi adicionada para preencher a seção.

URLs equivalentes com e sem barra final são deduplicadas. Se a página de procedência já é um destino exibido, Sources & image credits informa onde encontrá-la, em vez de criar outro botão para o mesmo endereço. A referência da imagem é apresentada separadamente apenas quando é diferente. Links externos informam abertura em outra aba e usam `noopener noreferrer`.

O link em Image credit na prévia é atribuição da imagem, não um bloco de destinos para consumir ou comprar a obra.

## Ações, contexto e acessibilidade

- `PersonalActions` ganhou a opção de apresentação `preview`. Os comandos, IDs, estados salvos, avaliações e associações com álbuns continuam no repositório existente. O modo compacto dos cartões permanece independente, inclusive mostrando o rating já atribuído em My Archive.
- `validReturnTo()` também aceita retornos internos para My Archive e álbuns individuais. Busca preserva consulta e filtros; After Hours mantém retorno à exposição. O breadcrumb continua apontando para a sala, independentemente da origem da visita.
- O diálogo mantém Escape, botão de fechar, bloqueio da rolagem de fundo e restauração do foco. A verificação manual encontrou uma saída de foco pela borda do diálogo; foi adicionado um ciclo explícito de Tab e Shift+Tab, que ignora controles dentro de disclosures fechados.
- O título visível do modal é apenas Quick Preview. O nome acessível ainda inclui o título completo da obra; a identificação não precisa ser repetida na faixa superior.
- Não foram adicionadas animações. A abertura discreta existente continua respeitando a preferência interna e `prefers-reduced-motion`.
- As imagens mantêm `object-fit: contain`; o layout suporta retrato, quadrado e paisagem. No celular, controles não são comprimidos para obrigar o conteúdo a caber em uma tela. Títulos longos podem exigir rolagem interna normal.

## Arquivos desta rodada

| Arquivo                                                     | Responsabilidade                                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/discovery/QuickPreview.tsx`                   | Apresentação curta e independente; ações rápidas e atribuição da imagem.                                                         |
| `src/features/discovery/QuickPreview.module.css`            | Composição compacta, limites da imagem e organização mobile.                                                                     |
| `src/features/experiences/WorkDetail.tsx`                   | Novo cabeçalho da ficha, descrição, identificação e retorno contextual. Mantém os estados de busca, erro e atualização de dados. |
| `src/features/experiences/WorkContent.tsx`                  | Conteúdo exclusivo do registro: nota, informações adicionais, arquivo pessoal, destinos e procedência.                           |
| `src/features/experiences/FullRecord.module.css`            | Cabeçalho, nota em papel, painel pessoal e seções responsivas. Estilos limitados ao registro.                                    |
| `src/data/recordNotes.ts`                                   | 17 notas editoriais específicas e seleção de notas existentes adequadas.                                                         |
| `src/services/recordPresentation.ts`                        | Identificação responsável do criador, descrição curta e comparação de URLs. Não altera o objeto salvo.                           |
| `src/features/personal/PersonalActions.tsx`                 | Variação visual da prévia sem rating ou aviso técnico, mantendo os comandos de álbuns.                                           |
| `src/components/ui/Modal.tsx`                               | Rótulo visual opcional e ciclo de foco de teclado. Aparência do HUD preservada.                                                  |
| `src/services/destinations.ts`                              | Deduplicação de endereços equivalentes. Validação e seleção existentes mantidas.                                                 |
| `src/services/catalogUtils.ts`                              | Lista permitida de retornos internos inclui arquivo e álbuns.                                                                    |
| `src/test/RecordSurfaces.test.tsx`                          | 15 testes novos sobre a separação das superfícies, dados ausentes, funções, ações, persistência, URLs e foco.                    |
| `src/test/Destinations.test.tsx`                            | Destinos agora são esperados somente na ficha; enriquecimento de Spotify verificado no registro completo.                        |
| `src/test/Experiences.test.tsx`                             | Verifica descrição curta na prévia e nota específica na ficha das seis salas.                                                    |
| `src/test/Discovery.test.tsx`, `EditorialRevision.test.tsx` | Atualizam expectativas de crédito e deduplicação sem retirar a verificação de procedência.                                       |
| `README.md`                                                 | Link para este relatório e resultado atual.                                                                                      |

Alterações de rodadas anteriores foram preservadas; o status do Git já continha essas alterações no início desta rodada.

## Verificações realmente executadas

| Verificação                                 | Resultado                                                                                                                                                                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                         | Passou.                                                                                                                                                                                                                                |
| `npm run lint`                              | Passou. Usa as regras TypeScript do projeto, não ESLint.                                                                                                                                                                               |
| `npm test -- --reporter=dot`                | **282 testes passaram em 20 arquivos**; 15 testes a mais que a base anterior de 267.                                                                                                                                                   |
| `npm run build`                             | Passou; saída `dist/`. Bundle principal 429,03 kB / 134,98 kB gzip; CSS principal 53,19 kB / 11,60 kB gzip.                                                                                                                            |
| Navegador: seis categorias                  | Prévia e ficha de Frankenstein, Metropolis, INSIDE, Apollo, The Steerage e The Bedroom em 1365×900 e 390×844. Nenhum transbordamento horizontal; imagens carregadas com `contain`; zero controles de rating nas prévias e um na ficha. |
| Navegador: largura intermediária e estreita | Apollo em 768×1024 sem transbordamento. A 320×740, título completo, diálogo com rolagem interna e sem transbordamento horizontal.                                                                                                      |
| Ações pessoais manuais                      | Save e Want na prévia, rating 4,5 na ficha, reload e My Archive confirmados. Os valores originais de salvo/desejado/rating foram restaurados depois. Nenhum álbum foi apagado ou criado no navegador.                                  |
| Álbuns                                      | Associações existentes confirmadas na prévia e na ficha, sem alterá-las. Criação, associação e persistência foram exercitadas nos testes automatizados com repositórios de teste isolados.                                             |
| Teclado e modal                             | Tab/Shift+Tab nos limites, Escape, retorno ao acionador, botão de fechar e liberação da rolagem confirmados no navegador.                                                                                                              |
| Movimento reduzido                          | Preferência interna testada: animação do diálogo `none`, conteúdo e ações preservados. Preferência restaurada depois. A regra do sistema permanece no CSS; o sistema operacional não foi alterado para um ensaio manual.               |
| Contexto                                    | Busca com `q=Frankenstein&format=Novel` preservada no retorno; My Archive e After Hours também verificados.                                                                                                                            |

Os testes antigos que esperavam rating/destinos na prévia foram adaptados à nova função de cada superfície. Houve falhas intermediárias nessas expectativas e em uma tipagem de teste; foram corrigidas antes dos resultados finais acima.

## Capturas e roteiro de revisão

Estas são capturas do site implementado localmente, não mockups:

- [Quick Preview — desktop](evidence/record-surfaces/quick-preview-desktop.jpg)
- [Full Record — desktop, página completa](evidence/record-surfaces/full-record-desktop.jpg)
- [Quick Preview — celular](evidence/record-surfaces/quick-preview-mobile.jpg)
- [Full Record — celular, página completa](evidence/record-surfaces/full-record-mobile.jpg)
- [Medições e verificações do navegador](evidence/record-surfaces/browser-checks.json)

Abra `http://127.0.0.1:5180/books`, use Quick Preview em Frankenstein e depois Open full record. Na prévia, compare o conteúdo curto e as ações. Na ficha, procure A closer look, Inside the record, Your archive e Beyond this record. Repita nas outras salas: os comportamentos são compartilhados, as imagens e notas são específicas.

## Limitações

- Não há série real na seleção local atual. O cenário de série e funções ausentes foi verificado com fixture explícita, sem adicionar uma série fictícia ao catálogo público.
- Títulos extremamente longos e registros sem imagem, descrição ou criador foram cobertos por testes automatizados. O título real longo de Apollo também foi exercitado no navegador.
- O tamanho das descrições e dos fatos depende do registro disponível. Não foram adicionadas sinopses extensas, créditos não fornecidos, métricas agregadas ou disponibilidade em serviços externos.
- Não foi feita nova auditoria ao vivo de todos os destinos e provedores nesta rodada; as fontes e regras verificadas anteriormente foram preservadas. Os testes de destinos usam respostas de teste identificadas.
- Revisão em navegador integrado, sem teste em aparelhos físicos ou ensaio completo de leitor de tela. Não foi medida performance de produção.
- As alterações permanecem locais. A instalação publicada na Vercel não foi atualizada.
