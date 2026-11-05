# Como o código vira uma experiência

## Entrada e componentes

`index.html` carrega `main.tsx`. `createRoot` conecta React ao elemento `root`. React desenha componentes, que são funções retornando JSX: uma maneira de descrever HTML dentro de TypeScript.

`App` coloca `Navigation`, `Routes` e o rodapé na tela. O Router compara a URL com cada `Route` e escolhe a página. `Link` altera a URL sem recarregar o documento. `NavLink` também informa o link ativo com `aria-current`.

## Funções de página

- `Home`: apresenta convite, salas, curadoria demonstrativa e descoberta. `useReducedMotion` decide se a entrada deve animar; a preferência reduzida elimina a animação inicial.
- `RoomGrid`: percorre `rooms` com `map`, criando um link por sala. A chave `slug` identifica cada elemento para React.
- `RoomExperience` (Stage 02): recebe uma sala pela propriedade `room` e apresenta entrada, catálogo, filtros e Quick Preview. Substitui a antiga `Category` introdutória.
- `Discover`: oferece os seis destinos. Não simula feed de comunidade.
- `Information`: recebe `title` e `description`; atende páginas futuras e 404 sem duplicar seu layout.
- `Artwork`: recebe o motivo visual e uma indicação de tamanho. Não carrega imagens nem representa uma obra real.

Props são dados passados de um componente para outro: `<RoomExperience room={room}/>` entrega a sala selecionada à função. A interface `Room` exige campos como `slug` e `name`: TypeScript aponta inconsistências antes do build.

## Estado, efeitos e referências

`useState` guarda dados que mudam a tela. Em `Navigation`, `panel` vale `menu`, `search` ou `null`; mudar esse valor abre um painel ou fecha tudo. `query` guarda o que foi digitado; `filter` cria a lista de destinos compatíveis sem modificar os dados originais.

`useEffect` conecta o componente a coisas externas. O efeito `shortcut` adiciona um ouvinte de teclado e devolve uma função que o remove. Limpar efeitos evita ouvintes duplicados. Outro efeito fecha o painel quando a rota muda.

`useRef` guarda uma referência que não precisa redesenhar a tela. `Modal` usa uma para acessar o elemento `dialog` e chamar `showModal()`. `App` usa outra para mover o foco ao conteúdo após navegar. O efeito do diálogo guarda o elemento anteriormente focado e a rolagem original para restaurá-los na desmontagem.

## Do clique ao resultado

1. Você clica no cartão The Listening Room.
2. Seu `Link` aponta para `/music`, definido no dado `slug`.
3. O Router seleciona a rota que contém `RoomExperience` e a sala de música.
4. `RoomExperience` mostra a entrada de vinil e as três obras da sala. O fluxo das prévias e fichas está no documento 05.
5. `App` atualiza o título da aba, volta ao topo e leva o foco ao conteúdo.

Na busca, Ctrl+K ou ⌘K chama `shortcut`, abre `Modal`, e o campo recebe foco. Digitar filtra apenas nomes de destinos. Clicar em um resultado navega e fecha o painel. Escape e o botão de fechar também encerram o diálogo. Tab fica dentro do diálogo pelo comportamento nativo do navegador.

## Onde começar a estudar

Altere uma descrição em `rooms.ts` e observe o cartão e a categoria. Depois acompanhe a propriedade `room` até `RoomExperience`. Por último, examine `setPanel` em `Navigation` para entender os estados. Explicações linha por linha podem ser feitas sobre qualquer arquivo, sem exigir entender a aplicação inteira de uma vez.
