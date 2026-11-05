# Stage 02 — resultados da verificação

Data: 04/11/2026. Ambiente: Windows, Node.js 24.21.0, npm 11.19.0. Nenhuma dependência nova foi instalada nesta etapa.

## Antes das alterações

Confirmamos a base existente: os 14 testes da Stage 01 passaram e `npm run build` concluiu a verificação TypeScript e o build de produção. O código existente foi ampliado; a homepage e sua grade original de seis categorias foram preservadas.

## Verificações automatizadas finais

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado: TypeScript sem erros. |
| `npm test` | Aprovado: 60 testes em 2 arquivos. |
| `npm run build` | Aprovado: TypeScript e Vite geraram a distribuição. JavaScript aproximadamente 431 kB / 139 kB gzip; CSS aproximadamente 22 kB / 5,5 kB gzip. |
| Lint | Não disponível: `npm run` confirma que não existe script ou configuração de lint. Não declaramos lint aprovado nem adicionamos ferramentas apenas para criar um resultado. |

### O que os testes cobrem

- Convite da homepage, seis links, navegação, busca inicial de salas, estados pessoais e 404 geral.
- Três registros por sala, identificadores únicos, dados mínimos e correspondência de categoria.
- Acesso direto às 18 URLs de obras e indicação explícita de dados fictícios.
- Quick Preview e navegação à ficha nas seis categorias.
- Filtros específicos de cada categoria, combinação de título/autor e formato, ausência de resultados e limpeza.
- Filtros na URL, formato inválido tolerado e retorno da ficha com filtros preservados.
- 404 para obra ausente e para uma obra de outra categoria.
- Fechamento da prévia com restauração do foco e da rolagem; prevenção de diálogo de pesquisa sobre a prévia.
- Categoria ativa no menu dentro de uma ficha e navegação para registros relacionados.
- Seis salas com movimento reduzido **simulado**: conteúdo presente imediatamente e sem botão de replay.
- Replay decorativo preservando o filtro da coleção.

Na primeira ampliação dos testes, TypeScript apontou uma opção `exact` não suportada pela consulta de teste e o teste de cancelamento usava um atalho inexistente (`fireEvent.cancel`). As consultas foram corrigidas e o cancelamento passou a disparar um evento nativo `cancel`. Os problemas não foram ignorados; a suíte final passou.

## Conferência no navegador real

Usamos o servidor que já estava funcionando no Windows, em `http://127.0.0.1:5180/`. Esse servidor pertence à sessão aberta pelo usuário e não foi encerrado pela validação.

- Abrimos as seis salas, verificamos seus títulos, dados e composições; entradas de revelação e recorte foram observadas nas capturas. O replay CRT foi acionado. Isso é uma conferência visual, não uma medição de todos os quadros das seis animações.
- Em Books, abrimos Quick Preview, fechamos com Escape e confirmamos foco no cartão e desbloqueio da rolagem. Depois abrimos a ficha pelo link da prévia.
- Em Photography, abrimos prévia e ficha com viewport estreito. A 320 px, o diálogo medido tinha 282 px de largura e permanecia dentro da tela.
- Nas seis categorias, com viewports de 320 e 768 px, confirmamos três cartões por coleção e ausência de rolagem horizontal por medição do documento. A área útil era de 305 e 753 px por causa da barra de rolagem vertical.
- Em Books com `format=Poetry`, abrimos Nocturnal Margins e usamos Voltar do navegador: a coleção retornou com o filtro e um resultado.
- Reabrimos a homepage para conferir a preservação de sua apresentação.

## Limites e pontos para revisão humana

- O ambiente jsdom simula métodos de `dialog`; seus testes não comprovam por si só a interação nativa. Escape e restauração do foco foram complementados no Brave. A sequência completa de Tab/Shift+Tab e um leitor de tela ainda precisam de revisão humana.
- Movimento reduzido foi coberto por simulação do hook e regras CSS, sem alterar a preferência global do Windows. Não foi feita uma conferência real com essa opção do sistema ligada.
- As capturas em viewport móvel ficaram reduzidas pela ferramenta de captura. As medições de largura e as interações funcionaram, mas isso limita a inspeção visual fina no celular. Recomendamos conferir também em um aparelho real.
- A interface de inspeção não expôs `document.getAnimations()`. Portanto não houve instrumentação de duração real, taxa de quadros ou desempenho por frame. As durações nominais de 0,9 a 1,25 s estão definidas no CSS.
- Durante a edição ao vivo houve um aviso de React sobre alteração nas dependências de um efeito após atualização a quente; a navegação foi recarregada. Também surgiram mensagens de conexão do navegador durante a sessão. Esses registros não foram tratados como testes aprovados. A conferência final em uma nova aba é registrada abaixo.
- Não foram executados Lighthouse, auditoria WCAG completa, Safari, Firefox, testes em aparelhos reais ou publicação.

### Nova aba após a última alteração

Abrimos uma nova aba em `/books`, abrimos e fechamos Quick Preview com Escape e confirmamos visualmente a coleção e seu foco. Não apareceu novamente o aviso de React sobre dependências de efeito. Persistiu uma mensagem genérica: `Could not establish connection. Receiving end does not exist.` A origem dessa mensagem no ambiente do navegador não foi identificada com certeza. Os fluxos testados continuaram funcionando; não a omitimos nem declaramos o console completamente limpo. A aba final foi deixada aberta para revisão, com o servidor do usuário preservado.

## Roteiro de aceitação

1. Com o iniciador aberto, visite as seis salas e observe as entradas; use Replay para comparar.
2. Em cada sala, combine um formato com um trecho de título/autor. Confira o estado vazio e Reset filters.
3. Abra a prévia pelo teclado, use Tab/Shift+Tab, Escape e reabra para entrar na ficha.
4. Na ficha, confira metadados, nota editorial, aviso de demonstração e relacionados.
5. Use Back to the collection e Voltar do Brave para conferir os filtros.
6. Ative movimento reduzido no Windows e repita a navegação: não deve haver recorte, giro, folhas ou entrada de texto em movimento.
7. Confira a interface em celular real, com zoom de 200% e, se possível, leitor de tela.

Este roteiro descreve revisão adicional. Não é uma lista de verificações já executadas. A próxima etapa não foi iniciada.
