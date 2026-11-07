# Uma experiência compartilhada para os livros

## O que foi implementado

Frankenstein, Pride and Prejudice e Dracula agora usam a mesma abertura física e a mesma virada de páginas no registro completo. A prévia rápida continua curta: `Open full record` leva ao livro. A entrada de `/books` mantém a capa estática em destaque e a transição geral da aplicação; foram removidos as folhas decorativas animadas, o eco do mosaico e o botão de replay dessa sala. As outras salas mantêm suas entradas.

O livro continua sendo uma apresentação editorial de quatro páginas, não uma reprodução do texto integral nem da primeira edição: título/capa, dados, sinopse e notas. No desktop aparecem duas páginas por vez; no celular, uma. Save, Want, avaliação, álbuns, destinos e créditos continuam fora do livro, abaixo dele.

## Organização e dados próprios

`src/features/frankenstein/bookPresentation.ts` é o novo ponto de apresentação. Ele define pequenas leituras originais, tema e acento de cor para os três registros Gutenberg. A identificação usa o provedor e o ID do registro; não usa apenas o título. Um livro de outra fonte pode usar a estrutura compartilhada, mas não recebe a interpretação específica do Frankenstein só por ter o mesmo nome.

Cada registro fornece sua própria capa, autor, ano, descrição, assuntos, notas e fonte. Os números 084, 1342 e 345 identificam os ebooks respectivos. O monograma da abertura, o cabeçalho e o rodapé deixaram de ter o autor e o título do Frankenstein fixos. Os links e imagens existentes foram reutilizados; nenhuma URL foi inventada ou trocada.

A pasta ainda se chama `frankenstein` por sua origem histórica. Ela agora contém os componentes compartilhados dos livros; manter o caminho evitou movimentar arquivos e testes sem necessidade nesta rodada.

## Arquivos importantes

| Arquivo | Função nesta rodada |
| --- | --- |
| `src/features/experiences/WorkDetail.tsx` | Seleciona a apresentação de livro para registros reais de Books; mantém as demais categorias e demonstrações antigas no formato anterior. Repassa o estado de atualização/falha da fonte. |
| `src/features/frankenstein/FrankensteinManuscriptPage.tsx` | Exporta agora `BookManuscriptPage`: abertura, navegação, teclado, monograma e identificação dinâmica. A chave da obra impede reaproveitar o estado da página anterior ao trocar de livro. |
| `src/features/frankenstein/bookPresentation.ts` | Seleção segura dos textos editoriais, cor, edição, número e destino do atalho de arquivo. |
| `src/features/frankenstein/ManuscriptLeaf.tsx` | Renderiza as quatro páginas com o conteúdo do registro atual, sem autoria ou reflexão fixa do Frankenstein. Reutiliza a validação de autoria da aplicação. |
| `src/features/frankenstein/ManuscriptCompanion.tsx` | Usa o destino correto para o atalho de arquivo. O antigo `#frankenstein-archive` continua válido no Frankenstein. |
| `src/features/frankenstein/FrankensteinManuscript.module.css` | Papel marfim mais claro, fundos de parágrafo com curva e borda, notas com margem destacada, dados agrupados e acentos sálvia, oliva e vinho discreto. |
| `src/features/frankenstein/useManuscriptBook.ts` | Máquina de estados existente, reutilizada sem alterar os tempos: 350 ms fechado + 1480 ms abrindo; virada de 720 ms com recuperação em 740 ms no desktop, 260 ms no celular. |
| `src/features/experiences/RoomEntrance.tsx` e `.module.css` | Removem o ritual de folhas na entrada de Books, preservando o destaque estático e as outras salas. |

Os testes em `FrankensteinManuscript.test.tsx`, `Experiences.test.tsx`, `Destinations.test.tsx`, `RecordSurfaces.test.tsx` e `PersonalUI.test.tsx` foram atualizados para a abertura compartilhada e para alcançar os conteúdos após abrir/virar o livro. Nenhuma dependência nova.

## Verificações executadas

- TypeScript, lint e build de produção passaram. O lint do projeto é uma checagem adicional do TypeScript. A saída da build continua em `dist`.
- **306 testes passaram em 21 arquivos**, incluindo quatro casos novos: entrada estática de Books e um fluxo completo para cada um dos três livros.
- Os fluxos novos verificam Quick Preview → registro completo, abertura/skip, capa e edição corretas, sinopse e reflexão próprias, Save e avaliação por ID, persistência ao recriar o repositório e link de fonte correspondente.
- Os testes existentes continuam verificando teclado, limites de páginas, entrada reduzida, cancelamento de timers, adaptação móvel durante viradas, álbuns e acesso por busca/arquivo.
- A primeira execução encontrou testes ainda baseados no formato anterior e uma regressão real: o aviso de provedor offline não era repassado ao livro. O aviso foi restaurado, os testes passaram a navegar pelas páginas corretas e a suíte final ficou sem falhas.
- No navegador integrado, Pride and Prejudice abriu pela prévia; Dracula abriu diretamente; ambos chegaram à leitura e viraram páginas. O Frankenstein também foi revisto com o acabamento novo.
- Dracula foi percorrido até a quarta página em 390 px. Pride and Prejudice foi conferido em 320 px, incluindo avanço pelo teclado. Não houve transbordamento horizontal nessas verificações.
- Na origem isolada `localhost:5180`, Dracula abriu diretamente em `reading` com `data-reduced=true`. A preferência de movimento foi restaurada. Nenhuma obra salva do usuário foi alterada no navegador.

As capturas em `docs/evidence/shared-books/` são da implementação local: introdução e história de Pride and Prejudice, história de Dracula e Frankenstein e Dracula no celular. Uma captura estática não demonstra o movimento; a abertura foi conferida no navegador e a sequência de estados tem testes automatizados.

## Limites

Não foram adicionados texto integral, novas obras, capas ou fontes externas. Imagens continuam dependentes dos arquivos e fallbacks já existentes. O acabamento foi revisto no navegador integrado, sem uma matriz de dispositivos físicos. Não houve push nem deploy. As notas específicas de cada obra são leituras editoriais originais do NOCTIS, não trechos atribuídos aos autores.
