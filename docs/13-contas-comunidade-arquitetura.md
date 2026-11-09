# Stage 05 — Arquitetura, arquivos e conceitos

## O que muda para quem usa

Visitantes continuam navegando e usando seu arquivo local. O menu ganha Account e Community Albums, mantendo o desenho anterior. Discover mantém as coleções editoriais e oferece uma entrada para coleções públicas reais.

Ao entrar, a conta é restaurada pelo Supabase Auth. Isso não importa o arquivo local. Em Account é possível escolher Use cloud archive ou Use local archive. A escolha da conta conectada permanece nesta sessão de navegador, inclusive após refresh; outra conta não herda os dados da anterior. Ao sair, a interface volta ao arquivo local.

Os mesmos controles de Saved, Want to Experience, avaliação, álbuns, capas, ordenação e histórico passam a usar um repositório diferente. Na nuvem, a interface só mostra a alteração confirmada após resposta válida do banco. Falhas deixam a última versão confirmada e apresentam erro; não existe fila offline prometendo sincronização futura.

## Mapa de arquivos

| Arquivo/pasta                                                            | O que faz e como se conecta                                                                                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/services/supabase.ts`                                               | Cria o cliente oficial apenas com configuração pública válida; carrega o SDK em arquivo separado, define PKCE e valida os destinos internos após login.                                                |
| `scripts/public-env.mjs` e `.d.mts`                                      | Protegem o build contra chaves privilegiadas em variáveis públicas; a declaração fornece tipos para o Vite.                                                                                            |
| `vite.config.ts`                                                         | Executa essa proteção antes de servir/compilar; mantém os endpoints de catálogo existentes.                                                                                                            |
| `src/features/accounts/Auth.tsx`                                         | `AuthProvider` assina eventos do SDK, restaura a sessão, reconhece recuperação de senha e cancela a assinatura ao desmontar. Eventos novos têm prioridade sobre uma restauração antiga ainda pendente. |
| `accounts/AuthPages.tsx`                                                 | Formulários rotulados de entrada/cadastro/recuperação, botão Google, retorno de autenticação e atualização de senha somente em sessão de recuperação.                                                  |
| `accounts/CloudRepository.ts`                                            | Implementa o contrato do arquivo pessoal usando RPCs PostgreSQL. Serializa leituras/escritas, valida snapshots e mantém erros/estado de carregamento.                                                  |
| `accounts/ArchiveScope.tsx`                                              | Seleciona o repositório local ou da conta. Remonta o escopo ao trocar de identidade e também seleciona o serviço correto de mídia. Atualiza a cópia da nuvem ao voltar à janela.                       |
| `accounts/media.ts`                                                      | Envia, baixa e remove arquivos do bucket privado, sempre no prefixo do usuário autenticado.                                                                                                            |
| `accounts/migration.ts`                                                  | Prepara importação, exclui histórico sem consentimento, envia capas, chama a transação de importação e verifica flags, avaliações e novos álbuns, incluindo ordem e personalização.                    |
| `accounts/AccountPage.tsx`                                               | Escolha local/nuvem, importação confirmada, saída, editor de perfil, imagens, privacidade, álbuns destacados e remoção das próprias conexões mesmo quando um perfil fica privado.                      |
| `src/features/community/service.ts`                                      | Contratos de leitura de perfis/álbuns, RPCs e URLs assinadas. Valida snapshots compartilhados antes de mostrá-los.                                                                                     |
| `community/RemoteMedia.tsx`                                              | Mostra imagem remota autorizada com fallback; usa URLs curtas, sem endereço público permanente para um upload privado.                                                                                 |
| `community/AlbumSharing.tsx`                                             | Editor de visibilidade do dono, geração/revogação de link e página de álbum compartilhado. Inclui likes reais, remix e créditos por item.                                                              |
| `community/CommunityPages.tsx`                                           | Lista até 24 álbuns públicos e mostra perfis acessíveis, álbuns destacados, listas sociais permitidas e avaliações explicitamente compartilhadas.                                                      |
| `src/features/personal/MediaContext.tsx`                                 | Seleciona o armazenamento de imagens por contexto React. Evita misturar IndexedDB do visitante com arquivos de outra conta.                                                                            |
| `personal/types.ts`                                                      | Acrescenta modo do repositório e carregamento, preservando os comandos e o formato local da Stage 04.                                                                                                  |
| `personal/images.ts`, `covers.ts`, `AlbumTools.tsx`                      | Mantêm a validação e o fluxo de capas; agora recebem o serviço de armazenamento do escopo ativo. Mensagens distinguem navegador e conta.                                                               |
| `personal/PersonalActions.tsx`, `PersonalPages.tsx`                      | Mantêm ações existentes; indicam destino local/nuvem, oferecem entrada para conta e incluem visibilidade no editor de álbum da nuvem. Limpar a nuvem não apaga imagens de perfil nem dados locais.     |
| `src/main.tsx`                                                           | Conecta AuthProvider → ArchiveScope → PersonalMotion → App.                                                                                                                                            |
| `src/app/App.tsx`                                                        | Acrescenta rotas com carregamento sob demanda, sem reconstruir as rotas culturais.                                                                                                                     |
| `Navigation.tsx` e `DiscoverPage.tsx`                                    | Acrescentam os acessos de conta e comunidade ao desenho existente.                                                                                                                                     |
| `supabase/migrations/`                                                   | Fonte versionada do esquema, funções transacionais, regras de acesso e bucket. A segunda migração trata importação e deduplicação.                                                                     |
| `supabase/functions/shared-cover/`                                       | `index.ts` liga o runtime Deno ao SDK; `handler.ts` contém a lógica HTTP testável que valida o token antes de assinar a capa.                                                                          |
| `supabase/config.toml`                                                   | Portas e callbacks do ambiente local da CLI, mais a configuração da função de capacidade. Não contém credenciais.                                                                                      |
| `supabase/tests/`                                                        | Executa autorização em PostgreSQL real via PGlite e testa o limite de assinatura da função HTTP com serviços substituídos.                                                                             |
| `src/test/Accounts.test.tsx`, `AuthState.test.tsx`, `AuthForms.test.tsx` | Testam configuração, erros, importação consentida, fila do repositório, restauração de sessão e formulários com SDK simulado.                                                                          |
| `server/public-env.test.mjs`                                             | Confirma que a proteção pré-build rejeita chaves privilegiadas.                                                                                                                                        |
| `.env.example`, `.gitignore`, `package.json`, `package-lock.json`        | Documentam configuração, excluem segredos/estados locais e registram dependências e suas versões resolvidas.                                                                                           |

As duas dependências novas são `@supabase/supabase-js` (cliente oficial de produção) e `@electric-sql/pglite` (somente desenvolvimento/testes). Nenhuma biblioteca de gerenciamento de estado nem outro framework de backend foi introduzido.

## Conceitos usando exemplos do NOCTIS

**Supabase** reúne Auth, banco PostgreSQL, API e Storage. **PostgreSQL** é o banco que armazena registros e aplica regras mesmo quando alguém ignora a interface. Uma **tabela** é uma coleção estruturada: `albums` contém título, dono, visibilidade e personalização. Uma **chave estrangeira** relaciona tabelas: `album_items.album_id` aponta para um álbum existente; apagar um álbum remove seus itens, sem apagar uma cópia independente feita por remix.

**Autenticação** responde quem está fazendo a requisição. **Autorização** responde o que essa pessoa pode acessar. Uma **sessão** contém a identidade e os tokens que o SDK restaura e renova. Google OAuth permite usar a identidade confirmada pelo Google via Supabase; NOCTIS não recebe sua senha Google.

**RLS** significa segurança por linha. Mesmo sabendo o UUID de um álbum privado da conta A, B não pode ler o registro. Esconder um botão no React não impediria B de consultar a API manualmente; por isso as políticas e funções do PostgreSQL também verificam propriedade, visibilidade e consentimento.

Uma **RPC** é uma chamada a uma função do banco. `archive_mutate` executa uma mudança inteira dentro de uma transação. Uma **transação** confirma tudo ou desfaz tudo: se um item da importação for inválido, não fica metade do álbum gravada. As operações do arquivo também adquirem um lock por usuário para não reordenar o mesmo álbum de maneira conflitante entre abas.

`localStorage` e IndexedDB pertencem à origem deste navegador. A persistência na nuvem pertence à conta, com autorização no servidor, podendo ser lida em outro dispositivo autenticado. Não há transferência automática entre esses meios. O contexto React escolhe o repositório; os componentes continuam usando os mesmos comandos.

## Esquema do banco

| Tabela             | Dados e proteção principal                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`         | Nome, username único, bio, imagens e cor. Privado por padrão; sem e-mail público.                                                                               |
| `user_preferences` | Movimento, histórico opt-in, privacidade de avaliações, escopos de listas e categorias. Leitura exclusiva do dono.                                              |
| `archive_entries`  | Uma linha por usuário/obra, snapshot compacto, Saved, Want e avaliação independentes. Sempre privada; avaliações compartilhadas passam por projeção específica. |
| `albums`           | Dono, visibilidade, permissão de remix, personalização e origem. Privado por padrão.                                                                            |
| `album_items`      | Snapshot do item, posição, contribuinte original e álbum de origem. Não permite escrita direta do cliente para forjar créditos.                                 |
| `album_shares`     | Token imprevisível do álbum não listado, legível apenas pelo dono.                                                                                              |
| `album_likes`      | Par usuário/álbum único; contagem calculada dos registros.                                                                                                      |
| `follows`          | Par seguidor/seguido único, com restrição contra seguir a si mesmo.                                                                                             |
| `browsing_history` | Visitas privadas e IDs locais de importação para não duplicar retries.                                                                                          |
| `featured_albums`  | Até seis destaques públicos pertencentes ao perfil.                                                                                                             |
| `imported_albums`  | Mapeamento local → nuvem, exclusivo do usuário, para importação idempotente.                                                                                    |

Saved, Want e rating ficam na mesma linha porque descrevem a mesma relação usuário/obra, com estados independentes. Isso evita três snapshots duplicados da mesma obra. Itens de álbum preservam seu próprio snapshot/proveniência para formar uma cópia editorial independente. Não são armazenadas respostas completas de provedores.

O adaptador `archive_snapshot` mantém o formato local v1 para os componentes existentes. O campo legado `visibility: private` desse formato não é a fonte de autorização de um álbum da nuvem: a visibilidade real está em `albums` e é lida pelo editor de compartilhamento e por `album_read`. Exportar o arquivo pessoal não exporta tokens de compartilhamento, relações sociais ou configuração completa do perfil.

## Importação local → nuvem

Não acontece no evento de login. Account apresenta uma confirmação específica e um checkbox separado para histórico. Sem esse checkbox, tanto o histórico quanto os snapshots usados **somente** por ele são removidos do payload. A preferência de gravação também não é transferida.

Saved e Want são combinados com OR: um estado positivo existente não é apagado. Em conflito de avaliação, ganha a avaliação existente na nuvem, e o relatório mostra a quantidade de conflitos. Reduced motion mais restritivo é preservado. Álbuns são copiados como privados; mapeamentos impedem que repetir a importação crie outra cópia. Um álbum já importado e depois editado na nuvem não é sobrescrito pelo original local.

Capas enviadas recebem novas chaves no prefixo da conta. Depois da transação, o cliente valida o snapshot e os novos álbuns, incluindo ordem, layout, cor e capa. Os originais locais não são apagados. Com consentimento, o histórico é combinado por identidade local e limitado aos cem registros mais recentes; ele nunca vira atividade pública.

O Storage e o PostgreSQL não compartilham uma única transação distribuída. Uma falha depois do envio de um arquivo pode deixar um Blob privado sem referência. Não se remove cegamente esse arquivo quando a resposta é ambígua, pois o banco pode ter confirmado. Recarregue a conta antes de repetir; a importação é deduplicada no banco. A limpeza administrativa de arquivos órfãos e uma política de retenção automatizada ficam pendentes.

## Privacidade e comunidade

Perfis privados não são encontrados na rota pública, não aceitam novos follows e não concedem acesso apenas porque alguém já os seguia. Conexões antigas continuam removíveis pelo próprio seguidor. Não existe fluxo parcial de solicitação de follow.

Um usuário pode deliberadamente compartilhar um álbum mesmo com perfil privado. O álbum fica legível segundo sua visibilidade, mas o nome e as informações privadas do perfil são ocultados. Álbum público é descobrível; não listado é acessível somente pelo token e não aparece nas listagens; privado é exclusivo do dono.

Avaliações são privadas por padrão. Para aparecerem no perfil, o perfil deve ser público, Hide all personal activity deve estar desligado, o opt-in de compartilhamento precisa estar ligado e o escopo da categoria precisa permitir o visitante. O resultado compartilhado contém obra e nota, nunca as flags Saved/Want. Histórico permanece privado em todos os casos.

Contagens sociais são de **pessoas visíveis** conforme as políticas, identificadas assim na interface; uma lista oculta não revela sequer sua contagem. Não existe feed comportamental. Escopos futuros de eventos de álbum/remix/follow permanecem privados no modelo, sem controles que prometam um feed inexistente. A visibilidade de um álbum publicado é independente de Hide activity e precisa ser alterada no próprio álbum.

## Remix e atribuição

Só álbuns públicos com `allow_remix` podem ser remixados. O resultado é um novo álbum privado do remixador. Título, descrição, ordem, itens, cor e layout podem então mudar sem alterar o original. Capas de obras permanecem selecionáveis; um upload do criador original não é copiado para o namespace de outro usuário.

Cada item preserva `contributor_id` e `origin_album_id`. Se A adicionou um livro, B o remixou e acrescentou um filme, e A remixou novamente a versão de B, o livro continua creditado a A e o filme a B. Escritas diretas para forjar esses créditos são negadas; a função de remix faz a cópia autorizada.

Referências a um álbum que se tornou privado deixam de aparecer publicamente. Nomes privados ou excluídos viram uma indicação neutra. Apagar ou esconder a origem não apaga cópias independentes feitas quando o remix era permitido; o aviso de publicação informa essa consequência. Não é possível criar uma nova cópia a partir de um álbum privado ou não listado.
