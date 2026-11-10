# NOCTIS — A library of experiences

Um museu digital de livros, cinema, jogos, música, fotografia e arte. O projeto combina uma entrada cinematográfica, seis salas culturais e um arquivo pessoal no navegador. Interface em inglês; documentação em português brasileiro.

[Ver o site](https://noctis-dalva1.vercel.app/) · [Auditoria final](docs/31-final-audit.md) · [Fontes das mídias](public/artworks/sources.json)

A hospedagem mantém a proteção de acesso existente da Vercel. O link pode exigir uma sessão autorizada; isso precisa ser considerado antes de compartilhá-lo com recrutadores. O repositório permanece privado.

## O que está implementado

- Homepage The Living Archive com intro, Skip intro, replay e seis ambientes.
- Catálogo editorial com **20 obras reais** e créditos de imagem. Capturas de gameplay oficiais de LIMBO e INSIDE; quatro fotografias históricas.
- Busca global com Ctrl+K/⌘K, busca por texto, filtros e estados vazios/indisponíveis.
- Quick Preview separado das fichas completas, destinos externos identificados e exposição After Hours.
- Livro interativo compartilhado por Frankenstein, Dracula e Pride and Prejudice, com informações próprias de cada obra.
- Saved, Want to Experience, avaliações privadas, álbuns, capas personalizadas e histórico opcional, desligado inicialmente.
- Layout responsivo, controles de teclado e preferência por movimento reduzido.

Contas e comunidade têm infraestrutura anterior preservada, mas **não fazem parte da experiência remota validada deste portfólio**. Esta entrega não configura Supabase nem autenticação.

## Executar localmente

Use Node.js 24 e npm, dentro desta pasta:

```sh
npm ci
npm run dev
```

Abra o endereço exibido no terminal e mantenha o servidor em execução. Não abra `index.html` por duplo clique. No Windows, `Iniciar-NOCTIS.cmd` é uma alternativa já existente que usa a porta 5180.

```sh
npm test
npm run test:security
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run preview
```

`build` gera `dist/`. `preview` confere a distribuição. `npm start` serve a build com o serviço de catálogo em Node; `HOST` e `PORT` são opcionais nesse servidor. `lint` utiliza verificações estáticas do TypeScript, não ESLint. `format` aplica o Prettier; `format:check` apenas verifica.

## Estrutura e decisões

| Caminho                             | Responsabilidade                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/`                          | Rotas, composição da aplicação e transições globais.                                   |
| `src/components/`                   | Componentes compartilhados, incluindo diálogos acessíveis.                             |
| `src/features/`                     | Homepage, salas, busca, detalhes, exposições e arquivo pessoal.                        |
| `src/data/`                         | Obras editoriais, textos, fontes e relações entre imagens e registros.                 |
| `src/services/`                     | Consulta, normalização, validação de URLs e destinos externos.                         |
| `src/test/`                         | Testes de interface e regressões dos fluxos.                                           |
| `server/`, `api/`                   | Serviço de metadados e adaptação para funções da Vercel.                               |
| `public/artworks/`, `public/media/` | Mídias locais com procedência documentada.                                             |
| `docs/`                             | Guias didáticos, decisões e relatórios de cada etapa.                                  |
| `supabase/`                         | Infraestrutura anterior e testes locais; sem serviço remoto configurado nesta entrega. |

React e TypeScript organizam os componentes e contratos de dados; Vite gera a distribuição. CSS Modules mantém os estilos por componente. Motion for React cuida das transições, React Router da navegação e Lucide dos ícones. IndexedDB guarda os uploads; o arquivo pessoal guarda referências e metadados no armazenamento local.

## Dados, APIs e privacidade

O catálogo editorial funciona sem variáveis de ambiente. Os dados pessoais ficam vinculados ao navegador e à origem (domínio/porta); mudar de navegador ou limpar os dados do site pode torná-los indisponíveis. Não há sincronização remota validada. Capas aceitam JPEG, PNG ou WebP até 2 MiB; o arquivo de imagem fica no IndexedDB e não é enviado a um servidor de mídia.

Open Library e Art Institute of Chicago têm adaptadores implementados; disponibilidade e imagens dependem dos respectivos provedores. MusicBrainz exige `NOCTIS_CONTACT` real, configurado **no servidor**. TMDB, RAWG e Unsplash continuam desconectados: adicionar uma chave não os habilita. Falhas externas preservam o catálogo local e exibem estados apropriados. [Guia de provedores](docs/08-provedores.md).

`.env.example` contém somente exemplos. `.gitignore` protege `.env` privados, credenciais, chaves, dependências e artefatos locais. Variáveis `VITE_` são públicas no bundle; segredos nunca devem usar esse prefixo. As variáveis Supabase permanecem vazias nesta versão.

## Publicação e limites

A Vercel usa `npm ci`, `npm run build` e `dist/`. `vercel.json` preserva `/api/catalog/` e o fallback das rotas SPA, excluindo assets, imagens e vídeos. A aplicação usa URLs relativas para o serviço, sem exigir um servidor localhost em produção.

As imagens mantêm seus autores e direitos. Capas e capturas promocionais não são declaradas livres de copyright; são reproduções editoriais com links para as fontes. [Procedência e direitos](public/artworks/sources.json). A fotografia de fundo de After Hours é uma reprodução histórica de baixa resolução usada como atmosfera, sem reconstrução por IA.

A suíte de testes não substitui uma auditoria completa por leitor de tela, aparelhos físicos ou testes de todos os provedores. Metadados sociais são globais; não há geração de cards sociais específicos por obra. Veja o [relatório final](docs/31-final-audit.md) para resultados executados, limitações e checklist manual.

## Documentação para estudar

Comece por [mídias reais](docs/30-midias-reais.md), [livros compartilhados](docs/26-shared-book-experience.md), [transições](docs/25-navigation-transitions.md), [formatação](docs/28-formatacao.md) e [auditoria final](docs/31-final-audit.md). Os documentos anteriores registram suas respectivas etapas; contagens e verificações antigas não descrevem necessariamente a versão atual.
