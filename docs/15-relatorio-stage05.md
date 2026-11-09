# Stage 05 — Relatório de entrega

## A. Funcionalidades implementadas

O código contém cadastro e entrada por e-mail/senha, verificação conforme configuração Supabase, recuperação de senha, Google OAuth por PKCE, restauração de sessão e saída local. Contas ainda não estão ativadas neste workspace porque não há configuração real.

O arquivo pessoal ganhou um repositório Supabase para Saved, Want, avaliações, álbuns, ordenação, capas, histórico opt-in e preferência de movimento. Visitantes continuam usando o arquivo local. Conectar uma conta não importa os dados automaticamente. A importação tem confirmação, consentimento separado de histórico, regras de conflito, deduplicação e verificação dos novos álbuns.

Perfis têm username único, nome, bio, avatar, capa, cor, visibilidade e até seis álbuns públicos destacados. Configurações controlam listas sociais, compartilhamento de avaliações e escopos por categoria. Não há feed falso. Álbuns podem ser privados, públicos ou não listados por token revogável. Likes, follows e remixes usam registros reais e atribuição por item; não há números inventados.

O estado atual que o usuário verá em Account é **Supabase is not configured yet**. As telas não fingem que uma conta existe. O catálogo e as funcionalidades locais permanecem disponíveis.

## B. Configuração Supabase

Foram preparados `.env.example`, duas migrações, bucket privado, RLS, configuração local da CLI e uma Edge Function para capa não listada. Nenhum segredo foi criado ou solicitado no chat; nenhuma alteração foi feita em um projeto remoto.

Para ativar, é necessário usar um projeto real, aplicar as migrações em ordem, preencher URL e chave publishable, configurar Auth/SMTP/redirects, habilitar Google com credenciais próprias e implantar a função de capa. O [guia de configuração](12-supabase-configuracao.md) contém os passos. Depois é obrigatório executar a matriz de teste real.

## C. Arquivos e pastas

As novas áreas são `src/features/accounts/`, `src/features/community/`, `supabase/migrations/`, `supabase/functions/shared-cover/`, `supabase/tests/` e `scripts/`. As integrações existentes foram estendidas em `main`, rotas, menu, Discover e componentes do arquivo pessoal. O [mapa detalhado](13-contas-comunidade-arquitetura.md) explica cada arquivo importante e sua conexão com o restante do projeto.

Dependências: `@supabase/supabase-js` 2.119.0 para integração oficial e `@electric-sql/pglite` 0.5.15 para testes locais. As versões resolvidas estão no lockfile. Páginas de conta e o SDK têm carregamento separado para preservar o carregamento inicial. Nenhum segundo framework de backend foi introduzido.

## D. Banco e segurança

O esquema separa perfis, preferências, relação pessoal com obras, álbuns/itens, capacidades de compartilhamento, likes, follows, histórico, destaques e mapeamentos de importação. Há FKs, índices, chaves únicas, limites e timestamps.

RLS e RPCs verificam a identidade no servidor. O cliente não tem escrita direta para trocar donos ou forjar contribuintes. Perfis e avaliações começam privados; histórico nunca fica público. Não listado exige um token de alta entropia e não concede leitura anônima de todo o bucket. Uma função protegida pela capacidade assina apenas a capa daquele álbum por 60 segundos.

O Vite bloqueia chaves privilegiadas reconhecíveis em variáveis `VITE_` antes do bundle. Também foi conferido que o nome da variável privilegiada de servidor não apareceu nos arquivos JavaScript gerados. Isso é evidência de separação de módulos, não substitui a revisão de configuração antes de publicar.

## E. Explicações técnicas

O [guia de arquitetura](13-contas-comunidade-arquitetura.md) explica Supabase, PostgreSQL, tabelas, FKs, sessão, autenticação/autorização, RLS, RPC, transações, armazenamento e proveniência com exemplos reais do NOCTIS.

As decisões centrais são: preservar os comandos existentes por um repositório substituível; separar arquivo local e conta; confirmar gravações antes de atualizar o estado; importar sem destruir originais; manter mídias privadas; copiar remixes com contribuintes estáveis em vez de substituir todos os créditos pelo último usuário.

## F. Testes efetivamente executados

| Comando                      | Resultado obtido                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`          | Aprovado.                                                                                                         |
| `npm run lint`               | Aprovado; regras estáticas do TypeScript, sem ESLint.                                                             |
| `npm test -- --reporter=dot` | **191 testes passaram em 14 arquivos**, execução final de 18,44 s.                                                |
| `npm run test:security`      | **18 testes passaram em 3 arquivos**, 3,04 s. Esses testes também fazem parte dos 191, não são somados novamente. |
| `npm run build`              | Aprovado, 1,72 s, sem aviso de chunk acima de 500 kB na execução final.                                           |

O grupo de segurança inclui **15 casos PostgreSQL executados**, dois testes do handler HTTP de capa e um teste da proteção de variáveis públicas. PostgreSQL foi exercitado com visitante, A e B: isolamento privado, capacidades, revogação, ratings, follows, likes, importação transacional e proveniência entre gerações.

Auth e formulários foram testados com SDK simulado. O runtime Deno e um projeto remoto não foram executados. A função de inicialização Deno foi preparada para as variáveis oficiais atuais e a alternativa legada; sua implantação e assinatura real continuam pendentes.

No navegador integrado foram conferidos Account, Sign in, Community Albums, retorno ao arquivo local, pesquisa e menu. A tela Account coube em 390×844, sem overflow horizontal. Foi salva captura desktop do estado real sem configuração, e não houve erro de console capturado nesse fluxo. Não foi feita uma sessão autenticada real nem um teste de interface com usuários A/B no Supabase.

## G. Limitações conhecidas

A implementação está pronta para configuração e validação de integração, mas **não há evidência de funcionamento de login, e-mail, Google ou Storage remoto neste ambiente**. Não deve ser anunciada como integração de produção validada.

Não há sincronização offline/Realtime, follow requests, feed comportamental, moderação, exclusão de conta ou paginação avançada da comunidade. Perfis privados não aceitam novos follows e não dão acesso a seguidores antigos. As listas mostram contagens das pessoas visíveis, sem revelar contagens de listas privadas.

Uma falha entre Storage e banco pode deixar um arquivo privado sem referência. Existe compensação em operações simples de capa, mas a limpeza periódica de órfãos de importações/atualizações ambíguas requer planejamento operacional. Não se apagam originais locais nem arquivos cujo vínculo possa ter sido confirmado pelo banco sem que a resposta tenha chegado.

Remixes existentes permanecem independentes quando a origem é ocultada ou apagada; links e nomes privados são suprimidos. Uploads de capa de outra pessoa não são copiados automaticamente para o remixador.

## H. Guia manual

1. Sem configurar Supabase, abra Account e confirme o aviso; use o arquivo local normalmente.
2. Siga o [guia Supabase](12-supabase-configuracao.md), reinicie o servidor e cadastre uma conta sua.
3. Valide confirmação de e-mail, entrada, refresh, saída, recuperação e Google.
4. Em Account, escolha entre arquivo local e nuvem. Faça a importação primeiro sem histórico; confira os dados locais preservados e os conflitos informados.
5. Monte um perfil, publique deliberadamente um álbum e confira em janela anônima. Teste não listado, regeneração de token, privacidade e mídias.
6. Use outra conta para likes, follows e remix; depois confira uma segunda geração de remix.
7. Execute a [matriz completa de segurança](14-seguranca-e-verificacao.md), incluindo consultas diretas com as permissões normais de A/B. Não use service-role para simular outro usuário.

## I. Próxima etapa

Stage 06 — Polish & Launch poderá tratar a revisão visual/UX que o usuário adiou, acessibilidade final, desempenho, observabilidade e preparação operacional de publicação. Ela **não foi iniciada**. Antes de considerar a integração Stage 05 concluída em ambiente real, ainda é necessário configurar o projeto e completar o roteiro remoto de autenticação e autorização.
