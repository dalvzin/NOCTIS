# Preparação para GitHub e Vercel — sem deploy

Nenhum push, deploy ou configuração de autenticação foi realizado. Design e animações foram preservados.

## Pasta e configuração

O projeto é a pasta `outputs/noctis` desta conversa: aquela que contém package.json, src e server. Publique o código completo dessa pasta, incluindo api e vercel.json; apenas dist não inclui o serviço de catálogo.

| Opção Vercel | Valor |
| --- | --- |
| Framework | Vite |
| Install Command | npm ci |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js | 24.x |
| Root Directory | Pasta que contém package.json e vercel.json |

package.json e package-lock.json declaram Node 24.x, sem dependências novas. O ambiente local executou Node 24.21.0.

## Rotas e catálogo

vercel.json configura o fallback para index.html, mantendo as URLs do React Router. /discover, /search, /my-archive, detalhes e álbuns podem ser encaminhados à SPA. O fallback exclui /api e /assets para não devolver HTML a pedidos de API ou assets ausentes.

A rota existente do arquivo é /my-archive. Acrescentei /archive como atalho, preservando parâmetros e fragmento. /archive?tab=albums abre a aba de álbuns existente.

O plugin do Vite que atende /api/catalog no desenvolvimento não vira automaticamente um servidor na Vercel. O novo api/catalog.mjs adapta o serviço existente server/catalog.mjs a uma Vercel Function. A primeira regra de rewrite envia os caminhos de catálogo à função compartilhada. O parâmetro interno __noctis_route permite reconstruir a rota quando a plataforma fornece a URL de destino. As consultas também são preservadas. A função aguarda a resposta terminar antes de concluir.

Não foi implementada outra API: são as mesmas validações, fontes e respostas. O frontend já usa caminhos relativos /api/catalog/…, que apontarão ao domínio publicado. A função não abre uma porta nem executa server/start.mjs. npm start continua reservado ao servidor Node tradicional/local.

O cache e o controle de frequência existentes são por instância de servidor. Não são um cache compartilhado entre todas as instâncias serverless. Nenhum banco ou cache remoto foi adicionado.

## Ambiente e arquivos privados

Nenhuma variável é obrigatória para o portfólio com catálogo local e arquivo pessoal.

| Variável | Orientação |
| --- | --- |
| NOCTIS_CONTACT | Opcional, somente no servidor da Vercel. Necessária para habilitar MusicBrainz. Use contato real que autorize enviar no User-Agent aos provedores. |
| HOST e PORT | Somente para o servidor local. Não configure na Vercel. |
| VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY | Deixe ausentes. Supabase e autenticação continuam adiados. |

Variáveis VITE_ são públicas na build. Não coloque nelas senhas ou chaves privadas. A proteção de build existente contra chaves Supabase privilegiadas permanece ativa. TMDB, RAWG e Unsplash continuam sem integração configurada; não há tokens desses serviços sendo lidos.

O único arquivo de ambiente encontrado foi .env.example, sanitizado. Não havia variáveis VITE_ no ambiente desta execução. A busca por padrões comuns de tokens GitHub, chaves privadas e chaves Supabase secretas não encontrou ocorrências nos arquivos revisados nem no dist gerado. Essa busca por padrões não é uma certificação universal de ausência de segredos.

.gitignore já protegia node_modules, dist, .env*, tsbuildinfo e temporários Supabase, preservando .env.example. Acrescentei .vercel, coverage, logs, .npmrc e formatos comuns de chaves/contas de serviço. O novo .vercelignore aplica proteção equivalente para eventual upload pela CLI.

Esta pasta ainda não é um repositório Git. Portanto, não há índice/histórico local para auditar. As regras foram revisadas; confira a lista real antes do primeiro commit. Ignorar um arquivo não remove uma cópia que já tenha sido publicada anteriormente.

## O que muda ao publicar

- Não há destino absoluto de localhost/127.0.0.1 nas chamadas do frontend. Os endereços locais encontrados são de desenvolvimento, parsing de URL no servidor e validação futura de Supabase.
- Imagens e consultas externas continuam dependendo dos provedores. A publicação não garante que AIC ou outro serviço indisponível passe a responder.
- O arquivo pessoal e uploads continuam em localStorage/IndexedDB, vinculados ao domínio e navegador. Os dados do localhost não migram automaticamente para o domínio publicado. A exportação existente guarda metadados; guarde as capas originais separadamente.
- Não há contas, upload remoto, sincronização ou comunidade habilitados por esta preparação.

## Arquivos alterados

| Arquivo | Responsabilidade |
| --- | --- |
| vercel.json, novo | Framework, instalação, build, saída e rotas API/SPA. |
| api/catalog.mjs, novo | Adaptador do catálogo existente para Vercel Functions. |
| .vercelignore, novo | Proteção do futuro upload de código pela CLI. |
| .gitignore | Proteção ampliada de arquivos locais e privados. |
| .env.example | Explicação das variáveis opcionais e locais. |
| package.json e package-lock.json | Família Node 24.x, sem novas dependências. |
| src/app/App.tsx | Atalho /archive para /my-archive. |
| server/vercel.test.mjs, novo | Testes das rotas, adaptador e respostas JSON. |
| src/test/App.test.tsx | Verifica o atalho e a aba preservada. |
| README.md e este documento | Instruções e limites da preparação. |

## Resultados reais

- npm run build: aprovado; dist/index.html confirmado. Vite concluiu a build local em 1,45 s nessa execução.
- npm run typecheck e npm run lint: aprovados. O lint usa regras estáticas TypeScript.
- npm test -- --reporter=dot: **249 testes aprovados em 18 arquivos**.
- A função foi importada diretamente com Node 24, fora do Vitest; status retornou os seis estados de provedores.
- Os novos testes verificam fallback de /discover, /search, /archive e outras páginas; exclusão de API/assets; URL original/reescrita; parâmetros de busca; detalhes aninhados; JSON 400/404/405.
- As consultas de provedores nos testes usam fixtures.

Não executei deploy, vercel build/dev nem refresh num domínio Vercel. O empacotamento e o roteamento efetivos da plataforma precisarão ser confirmados depois de uma publicação autorizada. Não há uma URL pública verificada nesta entrega.

## Passos futuros — quando você decidir publicar

### GitHub

1. Use somente a pasta noctis como repositório, para não incluir outros projetos do workspace.
2. No GitHub Desktop, escolha File → Add local repository, selecione noctis e crie o repositório ali se solicitado. Não crie outra pasta noctis dentro dela.
3. Revise Changes. src, server, api, package.json, package-lock.json e vercel.json devem entrar. node_modules, dist, arquivos .env privados, .npmrc e chaves não devem aparecer.
4. Faça o commit local. Quando quiser enviar o código, use Publish repository e escolha a visibilidade desejada. Esse passo publica no GitHub; não foi executado pelo assistente.

### Vercel

1. Quando autorizar a publicação, use Add New → Project e importe o repositório do GitHub.
2. Se o repositório contém somente noctis, Root Directory é a raiz (./). Se versionar a pasta maior desta conversa, selecione outputs/noctis. A pasta selecionada deve conter package.json e vercel.json.
3. Confira Vite, Node 24.x, npm ci, npm run build e dist.
4. Deixe Supabase ausente. Adicione NOCTIS_CONTACT somente se desejar habilitar MusicBrainz.
5. Clique Deploy apenas quando quiser publicar. A importação inicial cria a implantação nesse passo.
6. Após publicar, abra e atualize /discover, /search e /archive. Confira /api/catalog/status (JSON), uma busca, detalhes e imagens. Uma API inválida não deve devolver a homepage.
7. Teste o arquivo pessoal no novo domínio. Considere que a Vercel pode publicar automaticamente novos pushes na branch conectada, conforme a configuração escolhida.

Referências oficiais: [Vite e SPA](https://vercel.com/docs/frameworks/frontend/vite), [configuração e rewrites](https://vercel.com/docs/project-configuration/vercel-json), [funções Node.js](https://vercel.com/docs/functions/runtimes/node-js), [versões Node](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
