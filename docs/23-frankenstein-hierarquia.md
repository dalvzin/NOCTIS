# Frankenstein — leitura mais clara e arquivo abaixo do livro

**Registro histórico desta revisão.** A experiência foi posteriormente compartilhada com Pride and Prejudice e Dracula, com novo acabamento. Consulte [a evolução dos três livros](26-shared-book-experience.md).

Revisão solicitada após a avaliação visual da Stage 06.4A. A abertura física foi preservada. O pedido atual muda a organização: o livro fica dedicado à leitura; ações pessoais e procedência ficam em uma seção separada abaixo dele.

## O que mudou

- O livro agora tem **duas aberturas no desktop e quatro páginas individuais no celular**: introdução, informações essenciais, sinopse e notas editoriais. A antiga abertura The Archive foi retirada do livro.
- O sumário fica **no alto**, antes do conteúdo. Introdução e história são botões com borda, fundo, estado ativo, hover e foco visível. A navegação não depende de encontrar uma pequena inscrição no rodapé.
- O botão de avançar tem preenchimento verde, seta e rótulo do destino: Read the story, About this book ou Curator’s notes, conforme o modo de leitura. No fim aparece End of book, sem sugerir páginas inexistentes.
- Book details, Synopsis e Editorial notes receberam faixas distintas: verde discreto para detalhes/notas e bronze para a sinopse. Elas são identificação de conteúdo, sem aparência de botão nem dependência de hover.
- Títulos receberam tinta mais escura e um relevo leve. A autora ganhou rótulo explícito; os metadados têm campos agrupados, com rótulo e valor diferenciados. O texto corrido continua sem sombra pesada.
- Abaixo do livro, **Your archive & sources** reúne dois painéis: Keep this book, com Save, Want to Experience, rating e álbuns; Explore the source, com o destino e Sources & image credits.
- Um atalho acima do livro leva diretamente a essa seção, deslocando a página e colocando o foco no destino. As ações ficam disponíveis independentemente da página lida.

Nenhuma alteração foi aplicada à homepage, ao HUD, à exposição, aos outros livros ou às demais categorias. Não houve deploy, nova dependência ou mudança no modelo de dados.

## Arquivos e decisões

| Arquivo | Responsabilidade nesta revisão |
| --- | --- |
| `features/frankenstein/ManuscriptCompanion.tsx` | Novo bloco abaixo do livro. Reutiliza os componentes existentes de ações e destinos; mantém procedência e direitos. |
| `ManuscriptLeaf.tsx` | Agora contém apenas as quatro páginas de leitura. As áreas de arquivo/fontes foram removidas das folhas, inclusive das faces decorativas da animação. |
| `ManuscriptControls.tsx` | Sumário superior e paginação mais evidente, com nomes de destino e fim explícito. |
| `FrankensteinManuscriptPage.tsx` | Compõe livro e seção independente; adiciona o atalho e limita as setas de leitura ao próprio livro. |
| `useManuscriptBook.ts` | Limites de navegação atualizados para quatro páginas. Bloqueio de sobreposição, recuperação e tempos da abertura foram preservados. |
| `FrankensteinManuscript.module.css` | Hierarquia, cores, campos de metadados, estados interativos e painéis fora do papel. Estilos antigos das ações dentro das folhas foram removidos. |
| `test/FrankensteinManuscript.test.tsx` | Dois testes novos verificam ordem do sumário e separação das ações; os testes existentes foram adaptados à nova organização. |
| `test/manuscriptHelpers.ts` | Acesso ao arquivo agora usa a seção externa; não tenta abrir uma página de arquivo inexistente. |

Os caminhos da tabela são relativos a `src/`. Os dados reais, a capa do ebook 84 e os identificadores pessoais são os mesmos. O componente de ações não foi copiado: a localização mudou, a persistência continua no repositório existente.

## Verificação executada

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Passou. |
| `npm run lint` | Passou; checagem estática TypeScript do projeto. |
| `npm test -- --reporter=dot` | **302 testes passaram em 21 arquivos.** |
| `npm run build` | Passou; distribuição em `dist/`. |
| Navegador desktop | Introdução, história, sumário superior, paginação e seção externa revisados em 1440×1000. |
| Navegador mobile | Quatro páginas conferidas em 390×844; formulário de álbum expandido em 320×740. Sem transbordamento horizontal. |
| Foco do atalho | Your archive & sources levou ao bloco e focou `#frankenstein-archive`. |
| Estados pessoais existentes | Na origem separada `localhost:5180`, Saved, Want, rating 4,5 e associação ao álbum de QA continuaram presentes e sobreviveram ao reload. Nenhum valor pessoal foi alterado nesse ensaio. |

Os testes automatizados cobrem salvar/desfazer, desejo, rating, álbuns e persistência na nova posição, além de teclado, movimento reduzido, isolamento de outras fichas e limites de paginação. A primeira execução encontrou uma expectativa de teste que buscava o crédito em dois lugares do DOM; a consulta foi limitada à seção de procedência e a execução final passou.

Limites: revisão no navegador integrado, sem dispositivo físico ou ensaio completo de leitor de tela. Hover e foco têm estilos próprios; não se afirma uma auditoria formal de acessibilidade. A capa conserva a resolução original disponível. Nenhum destino externo novo foi criado ou revalidado remotamente nesta rodada.

## Revisão visual

Abra [o mesmo Frankenstein local](http://127.0.0.1:5180/books/gutenberg:books:84). Após a abertura, observe o sumário no alto e o botão Read the story. Na história, compare as faixas Synopsis e Editorial notes. Use Your archive & sources para chegar às ações abaixo do livro sem precisar virar páginas.

Capturas da implementação:

- [Introdução e navegação — desktop](evidence/frankenstein-refinement/introduction-desktop.jpg)
- [Sinopse e notas identificadas — desktop](evidence/frankenstein-refinement/story-desktop.jpg)
- [Arquivo e fontes abaixo do livro — desktop](evidence/frankenstein-refinement/archive-below-desktop.jpg)
- [Página completa — desktop](evidence/frankenstein-refinement/full-page-desktop.jpg)
- [Leitura — celular](evidence/frankenstein-refinement/story-mobile.jpg)
- [Arquivo abaixo — celular](evidence/frankenstein-refinement/archive-below-mobile.jpg)
- [Medições e verificações](evidence/frankenstein-refinement/checks.json)

O relatório inicial da Stage 06.4A foi mantido como histórico. Esta revisão substitui a organização anterior de três aberturas e seis folhas.
