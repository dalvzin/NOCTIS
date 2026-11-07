# NOCTIS · Stage 06.1 — The Awakening + The Living Mosaic

Uma biblioteca de experiências culturais. Interface em inglês; documentação em português brasileiro.

Revisão integrada mais recente: [auditoria, escopo real da busca, hierarquia, proporções, livros, exposição e evidências](docs/27-integrated-audit.md). Alterações apenas locais; as seções seguintes registram etapas anteriores.

Refinamento atual: cantos arredondados, cartões com ações agrupadas e microanimações da navegação. [Arquivos, decisões e verificações desta rodada](docs/24-soft-ui-motion.md). As contagens nas seções abaixo registram as respectivas etapas históricas.

Continuação: [rolagem suave, entrada das páginas e acabamento de Discover](docs/25-navigation-transitions.md), com movimento reduzido e verificações locais.

Books: [abertura compartilhada de Frankenstein, Pride and Prejudice e Dracula](docs/26-shared-book-experience.md), com acabamento das páginas, dados próprios e 306 testes aprovados.

## Homepage do portfólio

A entrada cinematográfica de 3,1 segundos se torna um mosaico assimétrico dos seis ambientes. Tem Skip intro, memória por sessão, teclado, reduced motion e composições SVG originais, sem vídeo ou áudio. Abaixo ficam seleções de obras reais do catálogo existente. Salas, pesquisa, arquivo pessoal e navegação global foram preservados. Contas/Supabase foram postergados para depois do portfólio e não são exigidos para navegar.

Verificação Stage 06.1: **207 testes passaram em 15 arquivos**; TypeScript, lint e build aprovados. Foram conferidos primeira entrada, skip por teclado, retorno, seis links, movimento reduzido, pesquisa, fallback e sete tamanhos de viewport. [Guia e relatório A–H da homepage](docs/16-homepage-awakening.md). Stage 06.2 não foi iniciada.

## Executar

No Windows, você também pode abrir `Iniciar-NOCTIS.cmd` pelo Explorador de Arquivos. Ele inicia a prévia no terminal normal do Windows, em `http://127.0.0.1:5180/`, e mantém a janela aberta. A opção `--strictPort` exibe erro se essa porta estiver ocupada, evitando uma mudança silenciosa de endereço. Esse iniciador não foi executado no ambiente normal do usuário pela automação.

Use Node.js 24 LTS e npm. Dentro desta pasta:

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

Abra o endereço exibido pelo Vite. `dev` serve o código durante o desenvolvimento; `build` verifica TypeScript e gera `dist/`; `preview` permite conferir esse resultado localmente. Não abra `index.html` por duplo clique.

## Entrega

Homepage e seis experiências preservadas. A experiência principal oferece 17 obras reais selecionadas; 18 demonstrações antigas continuam acessíveis por referências legadas e salvamentos existentes. Busca global Ctrl+K/⌘K, `/search?q=...`, filtros por categoria/formato/criador/tag/período, Quick Preview e fichas com fontes. Discover oferece coleções editoriais e a exposição After Hours. Saved, Want to Experience, avaliações privadas de meia estrela, álbuns multimídia e histórico opcional estão disponíveis localmente. O histórico começa desligado. A infraestrutura anterior de contas e comunidade foi preservada, mas não é promovida no portfólio atual nem foi configurada nesta revisão. Não existe integração remota validada neste workspace.

Open Library e Art Institute of Chicago têm consultas externas implementadas e verificadas no navegador. O museu inicialmente devolveu HTTP 403; após ajustes de parâmetros e identificação, a busca respondeu com metadados reais. Falhas continuam sendo exibidas sem impedir o catálogo local. MusicBrainz depende de um contato real em `.env`. TMDB, RAWG e Unsplash foram investigados, mas permanecem desconectados; adicionar uma chave não os habilita nesta versão. Veja o guia de provedores antes de configurar ou publicar.

A seleção editorial possui imagens reais associadas aos 17 registros, com origem e créditos. Livros Open Library usam capas e edições fornecidas pela Covers API; os três livros locais identificam o ebook exato do Gutenberg. O detalhe musical pode consultar a Cover Art Archive com identificação da release. A API AIC retornou bloqueio 403 na revisão atual; as três pinturas selecionadas agora usam reproduções locais verificadas, com procedência em `public/artworks/sources.json`. Imagens promocionais e capas sob copyright mantêm seus titulares e não são declaradas CC0. Falhas ainda exibem o placeholder NOCTIS identificado. Nada é anunciado como disponível para streaming.

Capas de álbuns aceitam JPEG, PNG ou WebP até 2 MiB. Os arquivos ficam no IndexedDB deste navegador, sem envio a servidor; o JSON do arquivo pessoal guarda somente referências. Trocar endereço, porta ou navegador muda os dados acessíveis.

## Serviço de metadados

`npm run dev` e `npm run preview` incluem `/api/catalog/` pelo Vite. O iniciador do Windows continua usando a porta 5180. Para servir a distribuição com a API, após `npm run build`, execute `npm start` (Node.js 24). Esse servidor se limita à interface e à consulta de metadados; banco, autenticação e mídias das contas são fornecidos pelo Supabase quando configurado.

Copie `.env.example` para `.env` para configurar Supabase e/ou `NOCTIS_CONTACT`. Não coloque credenciais em variáveis `VITE_`. Para uma futura hospedagem, é necessário manter um serviço Node ou adaptar os endpoints para funções de servidor; enviar somente `dist/` a uma hospedagem estática mantém o catálogo local, mas não habilita as consultas externas.

`npm run lint` usa regras estáticas do TypeScript para código não utilizado, inalcançável e rótulos inválidos. Não é ESLint. A Stage 05 adiciona o SDK oficial Supabase e PGlite apenas para testes PostgreSQL locais.

## Contas: postergadas no portfólio atual

Não há `.env` real configurado. A infraestrutura da Stage 05 foi preservada como preparação e ficou fora do escopo da Stage 06.1. Não é preciso configurá-la para usar a homepage ou o arquivo local. Se essa integração for retomada depois do portfólio, aplique as duas migrações em `supabase/migrations/`, configure Auth/Google/redirects, preencha as duas variáveis públicas Supabase do `.env.example` e implante a função `shared-cover`. Nunca coloque chaves privilegiadas em `VITE_`. Veja [Configuração Supabase](docs/12-supabase-configuracao.md). Entrar não importa dados automaticamente: importação e histórico têm consentimentos próprios.

Verificação Stage 05: TypeScript, lint e build aprovados; **191 testes passaram em 14 arquivos**. `npm run test:security`: 18 testes locais aprovados, incluídos nesse total. Os testes de RLS executaram PostgreSQL via PGlite com visitante/A/B; Auth real, OAuth e Storage remoto não foram testados por falta de configuração. [Relatório completo](docs/15-relatorio-stage05.md).

## Aprender e evoluir

Stage 06.4A — Frankenstein Manuscript: somente a ficha `gutenberg:books:84` usa o livro interativo. A revisão atual tem duas aberturas no desktop e quatro folhas no celular, com sumário superior, seções identificadas por cor e ações/fontes abaixo do livro. Abertura física, demais fichas, HUD e homepage preservados. TypeScript, lint e build aprovados; **302 testes em 21 arquivos**. Sem deploy. [Revisão atual, arquivos, capturas e testes](docs/23-frankenstein-hierarquia.md); [relatório inicial A–H](docs/22-frankenstein-manuscript.md).

Refinamento atual de Quick Preview e Full Record (05/11/2026): prévia curta com ações rápidas; ficha com nota editorial específica, dados adicionais, rating, álbuns e destinos. Comportamento aplicado às seis categorias; HUD e After Hours preservados. TypeScript, lint e build aprovados; **282 testes em 20 arquivos**. Sem deploy ou mudança no armazenamento. [Arquivos, decisões, capturas desktop/mobile, testes e limites](docs/21-preview-full-record.md).

Revisão editorial atual (05/11/2026): confiabilidade, seleção real, Books como sala piloto e exposição localizada `/discover/after-hours`. Mosaico preservado, prévias com créditos expansíveis e capas automáticas que respeitam escolhas existentes. TypeScript, lint e build aprovados; **267 testes em 19 arquivos**. Nenhuma dependência nova e nenhum deploy. [Arquivos, decisões, fontes, resultados, capturas e pendências para revisão visual](docs/20-editorial-after-hours.md).

Verificação final da Stage 04.1 (04/11/2026): `npm run typecheck`, `npm run lint` e `npm run build` concluídos sem erros; `npm test -- --reporter=dot`: **157 testes passaram, em 8 arquivos**. Upload, substituição, remoção, seleção da capa de uma obra e refresh foram exercitados no navegador integrado, além de medidas em 390×844 e 1365×900. Imagens de cinco categorias carregaram; AIC retornou bloqueio externo e exibiu fallback. Detalhes e limites no guia abaixo.

- [Mapa de todas as pastas e arquivos](docs/01-estrutura.md)
- [React, funções e fluxo da aplicação](docs/02-funcionamento.md)
- [Decisões, acessibilidade e escopo](docs/03-decisoes.md)
- [Verificação histórica da Stage 01](docs/04-verificacao.md)
- [Stage 02: arquivos, componentes, animações e fluxo](docs/05-experiences.md)
- [Stage 02: resultados e limites da verificação](docs/06-verificacao-stage02.md)
- [Stage 03: arquitetura, arquivos e aprendizado](docs/07-discovery.md)
- [Stage 03: provedores, configuração e direitos](docs/08-provedores.md)
- [Stage 03: verificações e roteiro de uso](docs/09-verificacao-stage03.md)
- [Stage 03: auditoria e correção de links externos](docs/10-auditoria-links.md)
- [Stage 04.1: capas, imagens, persistência, arquivos e roteiro de testes](docs/11-capas-e-imagens.md)
- [Stage 05: configuração do Supabase](docs/12-supabase-configuracao.md)
- [Stage 05: arquitetura, arquivos e conceitos](docs/13-contas-comunidade-arquitetura.md)
- [Stage 05: segurança e roteiro visitante/A/B](docs/14-seguranca-e-verificacao.md)
- [Stage 05: relatório A–I, testes e limitações](docs/15-relatorio-stage05.md)
- [Stage 06.1: homepage, introdução, mosaico e relatório A–H](docs/16-homepage-awakening.md)

Para hospedar futuramente, o servidor deve devolver `index.html` para rotas da aplicação como `/books`, preservando os caminhos de arquivos estáticos. A publicação não faz parte desta entrega.

## Stage 06.2 — Navegação, HUD e marca

Marca compartilhada com o círculo dourado original no cabeçalho, abertura e rodapé; menu agrupado, busca adaptativa, foco de teclado corrigido e espaçamento compartilhado. O modo portfólio oculta convites para contas futuras e mantém o arquivo local. Nenhuma dependência nova.

Verificação: TypeScript, lint e build aprovados; **216 testes em 16 arquivos**. [Explicação, arquivos, evidências, limitações e roteiro A–H](docs/17-navigation-hud-brand.md). A evolução do catálogo está descrita na etapa seguinte.

## Publicação na Vercel — preparada, sem deploy

Vite, Node 24.x, instalação `npm ci`, build `npm run build` e saída `dist` estão configurados em `vercel.json`. O adaptador `api/catalog.mjs` preserva o catálogo existente; há fallback SPA e atalho `/archive` para `/my-archive`. Nenhuma autenticação foi configurada.

Build, TypeScript e lint aprovados; **249 testes em 18 arquivos**. Nenhum push ou deploy realizado. Consulte o [guia de publicação GitHub/Vercel](docs/19-publicacao-vercel.md), com arquivos, variáveis e limitações da verificação local.

## Stage 06.3 — Cartões, imagens e layouts

Cartões alinhados com proporções por categoria, miniaturas compartilhadas, variantes de imagem verificadas, fallback explícito e limites para prévias/detalhes/capas. Uploads e personalização preservados. Nenhuma dependência nova.

Verificação final: TypeScript, lint e build aprovados; **231 testes em 17 arquivos**. [Auditoria, fontes, arquivos, evidências e relatório A–H](docs/18-catalog-artwork.md). AIC não carregou neste ambiente; os limites estão documentados. Stage 06.4 não iniciada.
