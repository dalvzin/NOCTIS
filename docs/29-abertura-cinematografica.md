# A volta da abertura — The Midnight Museum

## Por que a intro havia desaparecido

A animação continuava no código, mas `useAwakening` considerava a abertura já vista quando encontrava `noctis.home.intro-seen.v1` no `localStorage`. Essa marca sobrevivia ao fechamento do navegador e às próximas visitas. O marcador antigo de sessão também suprimia a sequência após refresh. Portanto, uma pessoa que já tinha visitado o NOCTIS podia nunca mais assistir à abertura.

Agora a chave `noctis.home.awakened.v2`, no `sessionStorage`, recebe `performance.timeOrigin`: o instante de criação do documento atual. Ao atualizar a página, o navegador cria outro documento e a intro pode tocar novamente. Ao navegar para Books e voltar à home pelo React Router, o documento continua igual e a entrada não se repete. Os marcadores antigos deixam de ser consultados; nenhum arquivo pessoal, álbum ou preferência precisa ser apagado.

## O que o visitante vê

A abertura tem aproximadamente **4,4 segundos**, com o idioma da interface preservado em inglês:

| Tempo        | Cena                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 0–200 ms     | Portas escuras, com uma fresta vertical bronze. Skip intro já está disponível.               |
| 200–1250 ms  | Surge um portal arredondado, a assinatura The Midnight Museum e a marca NOCTIS.              |
| 1250–2300 ms | As portas se afastam e revelam uma composição de luz bronze e sombra.                        |
| 2300–4400 ms | O portal se expande e desaparece; o mosaico existente se acomoda, com suas seis ilustrações. |
| Depois       | A homepage continua igual, com Replay intro na faixa abaixo das salas.                       |

O texto “Some things deserve to stay” conecta a abertura à ideia de preservar experiências. Não há vídeo, áudio automático, arquivo de imagem adicional, barra de progresso fictícia ou dependência nova. São camadas CSS, gradientes, bordas, transformações e opacidade, usando a marca existente. A estrutura e as posições finais do mosaico foram preservadas.

## Arquivos e responsabilidades

| Arquivo                                       | O que faz                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/home/useAwakening.ts`           | Controla as cinco fases, os temporizadores, a lembrança do documento atual e as funções `finish` e `replay`. Cancela timers ao pular, desmontar ou ativar movimento reduzido. Ao ocultar a aba, encerra a sequência.      |
| `src/features/home/ArchiveOpening.tsx`        | Componente novo com o cenário decorativo e o botão Skip intro. Usa `createPortal` para desenhar sobre o cabeçalho, fora das camadas isoladas da homepage. Trata Esc e revela a página antes de Tab continuar a navegação. |
| `src/features/home/ArchiveOpening.module.css` | Composição visual do portal, portas, luz, tipografia, botão arredondado e ajustes de tela pequena. A composição decorativa fica oculta para leitores de tela.                                                             |
| `src/features/home/Home.tsx`                  | Integra a abertura ao mosaico, oferece Replay intro e devolve o foco às salas quando necessário. Replay volta ao topo antes de começar. Os links das salas são os mesmos durante e depois da animação.                    |
| `src/features/home/Home.module.css`           | Remove estilos da intro anterior, estiliza Replay e contém o deslocamento dos cartões durante a entrada, evitando uma barra horizontal no celular.                                                                        |
| `src/test/HomeAwakening.test.tsx`             | Verifica fases, duração, skip, replay, Esc, Tab, foco, memória de navegação, marcadores antigos, limpeza e movimento reduzido.                                                                                            |
| `src/test/NavigationHUD.test.tsx`             | Atualiza a verificação da marca compartilhada para a composição nova, renderizada pelo portal.                                                                                                                            |

Não foi criada uma nova pasta de funcionalidades: tudo permanece em `features/home`. As capturas reais da revisão ficam em `docs/evidence/awakening`.

## Acessibilidade e comportamento

- Skip intro fica fixo no canto superior direito, com área mínima de 44 px e foco visível. O botão é removido imediatamente ao começar a fase `assembling` (2300 ms), junto com a saída da abertura; não permanece durante a acomodação final das salas.
- Esc pula a sequência. O foco vai para a primeira sala.
- Tab encerra a composição antes de o navegador continuar a navegação normal, evitando esconder um controle focado atrás do cenário.
- Rolar com o mouse ou deslizar sobre o cenário também encerra a intro; não há bloqueio permanente da rolagem.
- Quando o botão sai durante a revelação, o foco só é levado às salas se estava nele. Não se toma o foco de quem não estava interagindo com a intro.
- A preferência de movimento reduzido, tanto do dispositivo quanto de Settings, leva diretamente à homepage pronta. Replay fica indisponível nesse modo.
- Se o navegador bloquear o armazenamento, a intro e Skip continuam funcionando. Nesse caso, a supressão entre montagens pode não estar disponível.
- A abertura pertence à homepage. Abrir diretamente uma ficha ou Search continua levando à página solicitada.

## Verificações executadas

Correção posterior do Skip: os **21 testes de abertura** passaram, incluindo a ausência imediata do botão na fase `assembling`, e a build de produção passou. A suíte completa abaixo foi executada na implementação inicial desta abertura.

- `npm test`: **315 testes passaram, em 22 arquivos**.
- `npm run typecheck`: passou.
- `npm run lint`: passou. Neste projeto esse comando usa verificações adicionais do TypeScript; não é ESLint.
- `npm run build`: passou; saída em `dist`.
- Navegador integrado: abertura após refresh; Skip; Replay; Esc; Tab; navegação para Books e retorno à home sem repetição; seis links preservados.
- Telas de teste: viewport padrão desktop, 390×844 e 320×568. Após a correção, a largura rolável coincidiu com a largura útil nas duas telas pequenas durante a intro. Skip permaneceu no canto superior direito com 44 px de altura.
- A build de produção foi servida localmente com `vite preview`: abertura após refresh e Tab confirmados. Settings → Reduce motion → home → refresh mostrou `ready`, sem Skip nem Replay; a preferência de teste foi restaurada para Follow device preference.

Capturas: [desktop](evidence/awakening/desktop-opening.png) e [celular](evidence/awakening/mobile-opening.png). São quadros da implementação, não maquetes; uma captura estática não demonstra a duração nem todos os movimentos.

Não houve teste em um aparelho físico, leitor de tela real ou em todas as versões de navegadores. A rodada inicial desta abertura ficou local. Ela passou a integrar o pacote de publicação da [revisão com mídias reais](30-midias-reais.md), junto da correção do Skip.
