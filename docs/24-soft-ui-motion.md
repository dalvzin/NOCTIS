# Curvas, agrupamento e pequenos movimentos

Esta rodada refina a interface existente. A estrutura das seis salas, as cores da marca, os registros culturais e os fluxos do arquivo pessoal continuam os mesmos. Nenhuma dependência foi adicionada.

## O que mudou e por quê

Os cantos agora usam uma escala compartilhada: 12 px para controles, 20 px para cartões, 24 px para painéis e curvas completas para pequenas ações. A escala fica em `src/styles/global.css`. Isso permite ajustar a aparência depois sem procurar valores independentes em cada tela. As imagens mantêm suas proporções; os cantos arredondados pertencem à moldura, não alteram a obra.

Os cartões de obras agrupam imagem, crédito, categoria, título, autor e ações em uma superfície com borda e fundo discreto. Save e Want ficam no rodapé do cartão. O preenchimento horizontal caiu para 11 px, mas a altura mínima continua em 44 px. Uma nota pessoal, quando existente, ocupa sua própria linha. No celular não se reserva a altura de duas linhas para títulos curtos.

O percurso de After Hours mantém suas três obras e sua composição. Cada etapa ganhou fundo, borda, número circular e reação ao hover ou foco dentro do cartão. Quick Preview agora parece um botão, com menos distância da explicação da obra. Os créditos continuam acessíveis por uma abertura separada.

Discover desenha o sublinhado da esquerda para a direita. A lupa recebe uma breve animação do traço e uma pequena inclinação. O botão de menu desloca discretamente suas linhas. Dentro do menu, o indicador esquerdo cresce e o texto se move poucos pixels. Os mesmos sinais aparecem no foco por teclado. Não há animação contínua; a preferência de movimento reduzido suprime os movimentos.

## Arquivos desta rodada

| Arquivo                                                       | Responsabilidade                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/styles/global.css`                                       | Escala de curvas e duração; controles, botões gerais, avisos e disclosures.    |
| `src/components/navigation/Navigation.tsx`                    | Classes específicas para lupa e menu; os eventos existentes foram preservados. |
| `src/components/navigation/Navigation.module.css`             | Hovers e foco de Discover, lupa, menu e indicador lateral.                     |
| `src/components/ui/Modal.module.css`                          | Curvas dos diálogos, painel lateral e botão de fechar.                         |
| `src/features/experiences/Experiences.module.css`             | Superfície unificada dos cartões, hierarquia e rodapé de ações.                |
| `src/features/personal/PersonalActions.tsx`                   | Classe que distingue ações compactas dos controles completos.                  |
| `src/features/personal/Personal.module.css`                   | Botões compactos, painéis, álbuns, abas e capas.                               |
| `src/features/discovery/Artwork.module.css`                   | Cantos das molduras de imagem; proporções preservadas.                         |
| `src/features/discovery/Discovery.module.css`                 | Filtros, resultados, estados vazios e atalhos.                                 |
| `src/features/discovery/Editorial.module.css`                 | Seleções editoriais e cartões de temas com superfícies e hover.                |
| `src/features/home/Home.module.css`                           | Curvas dos seis ambientes; estrutura e ilustrações preservadas.                |
| `src/features/exhibitions/AfterHours.module.css`              | Etapas do percurso e botão de Quick Preview.                                   |
| `src/features/experiences/FullRecord.module.css`              | Painéis de notas, arquivo, fontes e proveniência.                              |
| `src/features/experiences/RoomEntrance.module.css`            | Pequeno acabamento da placa de abertura da sala.                               |
| `src/features/frankenstein/FrankensteinManuscript.module.css` | Curvas de controles e painéis, preservando o formato físico do livro.          |

São estilos de componentes já existentes. Não foi criado um segundo sistema de cartões, nem foram substituídos os componentes de navegação ou persistência. Os demais arquivos modificados no checkout pertencem às rodadas anteriores.

## Verificações executadas

- `npm run typecheck`: passou.
- `npm run lint`: passou. Neste projeto, esse comando verifica regras adicionais do TypeScript; não é uma execução do ESLint.
- `npm test -- --reporter=dot`: **302 testes passaram em 21 arquivos**. Nenhum teste novo foi necessário para estes ajustes de apresentação. A suíte verifica regressões funcionais; não mede qualidade estética.
- `npm run build`: passou após os últimos ajustes de CSS; saída em `dist`.
- Navegador local: cartões da homepage em 1440 e 390 px, menu por teclado, Quick Preview de Metropolis e Frankenstein, fechamento por Escape e paginação do livro.
- As seis salas, Discover, Search, My Archive, Settings e After Hours abriram em 390 px sem transbordamento horizontal. A homepage foi conferida também em 320 px e Discover em 768 px.
- Movimento reduzido foi selecionado na origem isolada de testes `localhost:5180`: a busca abriu com `animation-name: none`. A preferência foi restaurada. O arquivo de teste continuou com uma obra salva, desejada e avaliada em 4.5, sem alteração desses dados. A origem principal `127.0.0.1:5180` não teve seu arquivo modificado.

As capturas em `docs/evidence/soft-ui/` mostram a implementação local: cartões no desktop e celular e percurso da exposição. Não são protótipos. Não houve deploy. A revisão de navegador foi feita no navegador integrado, sem uma matriz de navegadores físicos ou leitores de tela. Não foi repetido o upload de capas, pois sua implementação não mudou.

## Como continuar

Para mudar o grau de arredondamento, comece pelas variáveis `--radius-*`. Use o modo de movimento reduzido ao revisar qualquer nova animação. Mantenha o foco visível e não reduza a altura de toque só para compactar visualmente um botão. O agrupamento por superfícies deve ajudar a identificar conteúdo e ação sem transformar toda frase em um botão.
