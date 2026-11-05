# Stage 05 — Configuração do Supabase

## Estado desta entrega

A implementação de contas, arquivo na nuvem e comunidade está preparada no código. **Não há projeto Supabase configurado neste workspace:** somente `.env.example` está presente. Nenhuma chave, conta, identificador de projeto ou integração Google foi inventada. Não foram enviados e-mails, criados usuários reais ou aplicadas migrações em um serviço remoto.

Sem configuração, o site continua oferecendo catálogo, pesquisa, salas, arquivo local, avaliações e álbuns locais. Account, Sign in e Community Albums explicam a indisponibilidade. Não há login simulado nem números de comunidade fictícios.

## Preparar um projeto real

1. Crie ou escolha um projeto Supabase destinado ao NOCTIS. Um projeto dedicado evita conflito com tabelas ou políticas de outros aplicativos.
2. No SQL Editor, execute nesta ordem os arquivos versionados:
   - `supabase/migrations/20261105000100_accounts.sql`
   - `supabase/migrations/20261105000200_import.sql`
3. Confirme a criação das tabelas e das políticas. O bucket `noctis-media` deve estar **privado**, limitado a 2 MiB e aos MIME types JPEG, PNG e WebP. A migração configura isso; não transforme o bucket em público para resolver erros.
4. Em Authentication, habilite Email/password e mantenha a verificação de e-mail conforme a política desejada. Configure SMTP e os limites de envio para uso real; o provedor padrão pode ter limites de desenvolvimento.
5. Configure Site URL e Redirect URLs para a origem que realmente está usando. O iniciador Windows deste projeto usa `http://127.0.0.1:5180`. Autorize exatamente:
   - `http://127.0.0.1:5180/auth/callback`
   - `http://127.0.0.1:5180/auth/recovery`
6. Se usar a porta 5173 do comando padrão, ou um domínio publicado, cadastre os endereços correspondentes. Não use redirecionamentos globais desnecessários em produção.
7. Copie `.env.example` para `.env`. Preencha **somente** `VITE_SUPABASE_URL` com a URL real do seu projeto e `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave publishable real. Uma chave `anon` legada também é aceita.
8. Reinicie o Vite após alterar `.env`.

Variáveis `VITE_` são incluídas no JavaScript entregue ao navegador. **Nunca coloque `service_role`, `sb_secret_`, senha do banco ou segredo Google nessas variáveis.** `scripts/public-env.mjs` bloqueia chaves privilegiadas reconhecíveis antes de iniciar o Vite ou gerar o build; a validação no cliente oferece uma defesa adicional, mas não substitui esse bloqueio pré-build.

Não é necessário colar segredos nesta conversa. Use o painel do Supabase ou o ambiente protegido de implantação.

## Google OAuth

1. No Google Cloud Console, configure a tela de consentimento e um OAuth Client do tipo Web application.
2. Copie o callback exato exibido pelo provedor Google na página de Authentication do seu projeto Supabase para Authorized redirect URIs no Google. Esse endereço pertence ao Supabase, não à rota React `/auth/callback`.
3. Coloque Client ID e Client Secret no provedor Google do **painel Supabase**. O segredo não pertence ao frontend nem ao `.env` Vite.
4. Habilite o provedor e mantenha as URLs de retorno da aplicação na allowlist do Supabase.
5. Faça um login real e confirme a volta à aplicação. O cliente usa o fluxo PKCE do SDK oficial, que relaciona o código de retorno ao verificador criado no navegador.

O botão Continue with Google chama `signInWithOAuth`; não há OAuth implementado manualmente, token Google fabricado ou usuário de demonstração.

## Capas de álbuns não listados

Álbuns privados e não listados não concedem leitura anônima no bucket. Para mostrar uma capa enviada de álbum não listado, publique a Supabase Edge Function `shared-cover`, existente em `supabase/functions/shared-cover/`.

É possível usar a Supabase CLI instalada conforme a documentação oficial, vinculando ao identificador **real** do projeto e executando `supabase functions deploy shared-cover`. `supabase/config.toml` contém a configuração da função. O `project_id = "noctis"` nesse arquivo é um nome local da CLI, não uma credencial ou o identificador de um projeto remoto.

Essa única função aceita acesso sem JWT porque o próprio token de compartilhamento é a autorização de visitante. Ela valida os 64 caracteres hexadecimais, consulta a função SQL que exige um token ainda válido e somente então assina a capa retornada por essa consulta. O cliente não escolhe o bucket, o dono ou um caminho arbitrário. Não aplique esse modelo a endpoints de escrita.

`SUPABASE_URL` e a chave `default` do dicionário `SUPABASE_SECRET_KEYS` são usados apenas no runtime protegido da função; `SUPABASE_SERVICE_ROLE_KEY` é aceito como alternativa legada. O runtime Supabase fornece as variáveis de projeto correspondentes; confirme isso na implantação. A chave privilegiada nunca é importada pelo React. A URL assinada dura 60 segundos e a resposta não deve ser armazenada em cache. Veja a [referência oficial de variáveis de Edge Functions](https://supabase.com/docs/guides/functions/secrets).

Sem a função implantada, texto e obras do álbum não listado continuam tendo controle por token, mas a capa enviada pode aparecer como indisponível. Isso deve ser corrigido implantando a função, não tornando o bucket público.

## Ferramentas locais

`npm test` usa PGlite, um PostgreSQL em WebAssembly, para executar migrações e políticas com três identidades de teste. Isso não requer Docker, um banco remoto nem credenciais reais.

Docker, Supabase CLI e `psql` não estavam disponíveis na sessão. O stack Supabase completo, o gateway de Storage, o servidor de Auth e o runtime Deno remoto **não** foram executados. Se desejar testar esse stack localmente, instale as ferramentas oficiais e use a configuração versionada. O teste SQL local não substitui o roteiro de autorização no projeto real.

## Antes de publicar

- Execute o roteiro do [guia de segurança](14-seguranca-e-verificacao.md) como visitante, A e B no projeto real.
- Revise políticas preexistentes em `storage.objects`: políticas permissivas do PostgreSQL se combinam com OR. Uma política genérica de outro aplicativo pode ampliar acesso, mesmo que as políticas NOCTIS estejam corretas.
- Confira confirmação de e-mail, recuperação, OAuth, limites, SMTP e as URLs autorizadas.
- Confira RLS habilitada em todas as tabelas NOCTIS e o bucket privado.
- Não envie `.env`, tokens de sessão ou chaves privilegiadas ao controle de versão. `.gitignore` já exclui esses arquivos e os estados temporários da CLI.

Referências oficiais consultadas: [React + Supabase Auth](https://supabase.com/docs/guides/auth/quickstarts/react), [Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage e controle de acesso](https://supabase.com/docs/guides/storage/security/access-control).
