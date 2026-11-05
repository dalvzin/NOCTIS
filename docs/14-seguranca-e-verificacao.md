# Stage 05 — Segurança, testes executados e validação real pendente

## Fronteiras de segurança

Todas as tabelas NOCTIS possuem RLS. Os registros pessoais, preferências e histórico são exclusivamente do dono. Álbuns públicos podem ser lidos, mas o cliente não recebe autorização para editar tabelas diretamente: mutações passam por funções que usam `auth.uid()`, e não um dono informado no JSON.

Funções privilegiadas usam `security definer` com `search_path` vazio e referências qualificadas. O privilégio de execução implícito de PUBLIC é revogado; somente as funções necessárias são concedidas a `anon`/`authenticated`. O runtime protegido da função de capa recebe execução de `album_read`, sem conceder esse papel ao frontend.

O repositório da nuvem verifica a identidade retornada e envia o usuário esperado nas mudanças. O banco rejeita comandos ou importações pendentes que acabem sendo enviados depois de uma troca de conta. O escopo React também é remontado ao trocar de identidade. Essa proteção não concede permissões; ela evita aplicar uma intenção antiga na conta errada. A autorização continua dependendo do JWT validado pelo Supabase.

As avaliações públicas são uma projeção autorizada de `archive_entries`: somente obra e nota. Uma nota publicada não abre Saved, Want, histórico ou preferências. O histórico não tem caminho público de leitura.

O token não listado é gerado com dois UUIDs aleatórios (64 caracteres hexadecimais), separado do ID do álbum e guardado em tabela exclusiva do dono. Saber apenas o ID não autoriza a leitura. A troca para Private remove o token; regenerá-lo revoga o anterior. Links não listados não aparecem nas consultas públicas.

Uploads ficam em bucket privado e caminhos `usuario/uuid`. Capas públicas só são legíveis enquanto forem referenciadas por um álbum público; imagens de perfil só ficam acessíveis com perfil público. Para não listado, a função HTTP valida a capacidade antes de emitir uma URL de 60 segundos para a capa exata. A função não aceita um caminho arbitrário fornecido pelo chamador. URLs já emitidas podem continuar funcionando até expirar; arquivos já baixados não podem ser recolhidos do dispositivo de outra pessoa.

## O que foi realmente testado

Há três níveis diferentes de evidência:

1. **PostgreSQL executado localmente:** PGlite executa as duas migrações e as consultas com os papéis `anon` e `authenticated`, além das identidades sintéticas A/B. O suporte `auth.uid()` e as tabelas básicas `auth`/`storage` são criados apenas pelo teste para representar os limites da plataforma. As políticas e funções NOCTIS executadas são as mesmas dos arquivos de migração. Isso testa SQL/RLS de verdade, mas não autentica um JWT real.
2. **Interface/serviços com substituições:** Vitest/Testing Library usam o SDK simulado para verificar formulários, restauração, erros, imports, fila e redirects. O handler de capa usa um leitor e assinador simulados. Esses testes não enviam e-mail, não entram no Google e não emitem uma URL real do Storage.
3. **Navegador integrado, sem configuração:** Account, Sign in, Community Albums, retorno ao arquivo local, menu e pesquisa existentes foram conferidos. Não houve usuário real nem conteúdo de comunidade fabricado. Em 390×844 a página Account não apresentou overflow horizontal; a captura desktop foi salva em `docs/evidence/stage-05-unconfigured-account.jpg`. Não houve erro de console capturado nesse fluxo.

O grupo PostgreSQL verifica:

- Visitante e B não leem registros privados de A nem alteram seu álbum.
- O snapshot SQL é compatível com a validação do arquivo existente; notas fora de meia estrela são rejeitadas.
- Comandos e imports de identidade anterior são rejeitados.
- Álbuns públicos são legíveis sem revelar um perfil privado ou notas que não foram compartilhadas.
- Não listado exige o token correto, fica fora das consultas comuns e deixa de abrir depois de revogação.
- Likes duplicados não aumentam a contagem e B não interage com um álbum privado alheio.
- Follow não admite auto-follow, duplicatas ou novos follows de perfil privado; listas ocultas não aparecem ao visitante.
- Ratings são compartilhados somente depois de todos os opt-ins e escopos correspondentes.
- Remixes preservam contribuintes em duas gerações, são independentes e nascem privados.
- A origem privada e os nomes privados deixam de aparecer na atribuição pública.
- Importações não sobrescrevem uma avaliação existente, não duplicam álbuns/histórico e só transferem histórico quando solicitado.
- Um item inválido desfaz toda a importação.
- B/visitante não leem upload privado; upload em prefixo de A por B é negado; álbum não listado não abre leitura direta do bucket.

As tabelas de Storage do teste não são o servidor de arquivos Supabase. Limites de tamanho/MIME e o comportamento HTTP dos endpoints de download ainda exigem teste no serviço real.

## Comandos reproduzíveis

Na raiz do NOCTIS:

```sh
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run test:security
npm run build
```

`lint` continua sendo a checagem estática mais estrita do TypeScript, não ESLint. O resultado final efetivamente obtido fica no [relatório da Stage 05](15-relatorio-stage05.md). Os testes das Stages 01–04.1 permanecem na suíte.

## Roteiro obrigatório no Supabase real

Use duas contas de teste suas, A e B, e uma janela anônima. Não use arquivos ou histórico pessoais sensíveis nessa validação. Configure antes o projeto conforme o [guia de instalação](12-supabase-configuracao.md).

### Autenticação e identidades

1. Cadastre A por e-mail. Confirme o e-mail se a configuração exigir; confira o comportamento de tentativa antes da confirmação.
2. Entre, atualize e confirme a restauração. Saia e confirme a volta ao arquivo local.
3. Peça recuperação de senha e use o link recebido. Atualize a senha; um link expirado não deve permitir mudança.
4. Configure Google e complete um login real, conferindo a URL de retorno permitida. Não houve teste real dessa etapa na entrega local.
5. Entre como B no mesmo navegador e confirme que não aparece o arquivo da conta A. Teste expiração/renovação e erro de rede.

### Arquivo e importação

1. Como visitante, salve uma obra, marque Want, avalie e crie um álbum com mais de uma categoria e uma capa sintética.
2. Entre como A. Antes de confirmar importação, confira que esses dados não foram enviados automaticamente.
3. Crie uma avaliação diferente na nuvem para a mesma obra. Importe o arquivo local sem selecionar histórico. A avaliação da nuvem deve vencer; o histórico e a preferência não devem mudar.
4. Confira título, descrição, cor, layout, capa e ordem de todos os novos álbuns. Repita a importação: não deve criar outra cópia desses álbuns.
5. Faça um segundo teste com consentimento explícito de histórico. O conjunto retém até cem visitas mais recentes. Confirme que os dados locais continuam disponíveis e que um erro mantém os originais.
6. Recarregue, abra outro navegador autenticado como A e confira a nuvem. A atualização entre abas ocorre ao voltar o foco/recarregar, sem promessa de sincronização em tempo real.

### Matriz de visibilidade

| Recurso de A | Visitante | B | A |
| --- | --- | --- | --- |
| Arquivo pessoal, preferências e histórico | Negado | Negado | Permitido |
| Álbum privado por ID | Indisponível | Indisponível | Permitido |
| Álbum público | Leitura | Leitura e interação autenticada | Edição |
| Álbum não listado sem token | Indisponível | Indisponível | Editor próprio |
| Álbum não listado com token válido | Leitura | Leitura/like com token | Edição |
| Upload privado por URL pública construída manualmente | Negado | Negado | Apenas acesso autorizado |
| Avaliação sem opt-in | Oculta | Oculta | Próprio arquivo |
| Lista social privada | Sem lista/contagem | Sem lista/contagem | Própria gestão |

Não se limite a esconder botões: repita consultas diretas via Data API com as sessões de teste, usando apenas as permissões normais de cada identidade. A chave publishable não deve permitir ler dados privados de outra pessoa. Nunca utilize service-role para simular B, pois ela ignora RLS.

### Compartilhamento, Storage e remixes

1. Publique um álbum de A e abra sem login. Confira nome/obra/capa/quantidade, URLs de destino e ausência de controles de edição.
2. Faça B dar like duas vezes: uma relação apenas. Remova o like e confira a contagem.
3. Torne outro álbum não listado. Abra somente por seu link; tente o ID normal e um token diferente. Regere o token e confirme que o anterior falha.
4. Verifique a capa enviada pelo endpoint `shared-cover`; a mesma imagem não deve ficar disponível por URL pública permanente. Torne o álbum privado e teste depois da expiração das URLs já emitidas.
5. Habilite remix no álbum público de A. B faz uma cópia e adiciona outra obra. A remixa a versão de B. O primeiro item deve continuar creditando A e o segundo, B.
6. Mude título, ordem e capa da cópia e confirme que a origem não muda. Depois torne a origem privada: o vínculo público para ela e nomes privados devem sumir, sem apagar a cópia independente.
7. Perfil privado de A não deve abrir para B nem aceitar novos follows. Seguir um perfil público não deve liberar histórico ou arquivo. Confira remoção de conexão em Account mesmo depois de o perfil ficar privado.
8. Teste controles por teclado e mobile com autenticação real. Essas páginas autenticadas não puderam ser verificadas visualmente sem uma conta configurada.

## Limites conhecidos

- Não há credenciais reais nem migrações aplicadas remotamente nesta entrega.
- E-mail, confirmação, recuperação real, Google, gateway Storage, assinatura real e implantação Deno estão pendentes de configuração/validação.
- Não há feed comportamental, solicitações de follow, notificações, exclusão de conta ou moderação. Perfis privados usam o modelo simples documentado.
- A comunidade lista até 24 álbuns públicos; não há paginação avançada nem recomendação por comportamento.
- Não há sincronização offline/Realtime; falhas são apresentadas e o usuário pode recarregar antes de repetir uma operação cuja confirmação não chegou.
- Importação não é um espelho contínuo. Repeti-la não sobrescreve álbuns já editados na nuvem.
- Uploads sem referência podem sobrar após uma falha distribuída; permanecem privados. Limpeza periódica e retenção precisam ser planejadas antes de produção em escala.
- Limpar o arquivo da conta preserva perfil e dados locais. Não equivale a excluir a conta; arquivos de perfil não são apagados por essa ação.
- O runtime Deno completo não foi executado aqui; o handler compartilhado foi testado com dependências simuladas, e a migração foi executada em PostgreSQL local.

Essas limitações não são resolvidas desabilitando RLS, abrindo o bucket ou colocando uma chave privilegiada no navegador. A Stage 06 — Polish & Launch continua dependendo de autorização do usuário.
