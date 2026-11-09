# Stage 04.1 — Capas de álbuns e imagens das obras

Documentação em português brasileiro; interface em inglês. Esta etapa preserva a homepage, a navegação, as cores, as rotas e os rituais de entrada das salas. Não inicia a Stage 05.

## Diagnóstico: o que foi constatado

O upload original funcionou no navegador integrado, com um PNG válido. Portanto, não foi possível reproduzir uma falha universal de gravação, nem afirmar que o problema relatado tinha uma única causa.

Havia problemas concretos de apresentação: o seletor mostrava **No work selected** mesmo quando havia uma imagem enviada; a edição da capa ficava dentro do mesmo painel recolhido do formulário de título/descrição; não havia indicação de que a capa era salva imediatamente. Além disso, o contêiner 16:9 de um álbum recebia um componente de obra com proporção própria. O tamanho intrínseco do filho podia expandir a grade; a regra genérica `object-fit: cover` do álbum também disputava com o `contain` da obra. Isso podia produzir imagens grandes ou recortadas.

O carregamento também dependia diretamente de `createImageBitmap`, sem alternativa, e operações do IndexedDB não tinham prazo máximo. São fragilidades de compatibilidade tratadas nesta etapa; não foram comprovadas como causa do caso específico no Brave do usuário.

Para imagens do catálogo, a situação era diferente:

- Open Library: a consulta não pedia `cover_i`/`cover_edition_key`; o adaptador descartava capas intencionalmente. A orientação oficial da Covers API permite exibir capas por hotlink e recomenda seu próprio host. A correção segue essa orientação e mantém os direitos dos titulares, sem chamar as capas de CC0.
- MusicBrainz: a busca retorna metadados de um grupo de lançamentos, não uma imagem. Agora o detalhe pode consultar a Cover Art Archive e identificar a release da capa aprovada.
- Seleção editorial: somente as duas pinturas já tinham imagens. Os outros sete registros agora têm imagens verificadas e associadas individualmente aos seus identificadores.
- Renderização: imagens reais usavam uma proporção única 6:7. Agora o componente compartilhado usa proporções por categoria e limites de tamanho.

## Arquivos e responsabilidades

| Arquivo                                     | Responsabilidade nesta etapa                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/personal/images.ts`           | Acesso ao IndexedDB, confirmação de transações, tratamento de bloqueio/erros/prazo máximo, validação de tamanho/formato/resolução e decodificação com alternativa por `<img>`.                     |
| `src/features/personal/covers.ts`           | Novo serviço que coordena envio, substituição, compensação quando metadados falham e remoção do Blob antigo após confirmação.                                                                      |
| `src/features/personal/AlbumTools.tsx`      | Editor, estado ocupado, feedback imediato, indicação correta de capa enviada, carregamento de Blob URL e liberação de memória. Não troca uma imagem de edição já salva por outra edição conhecida. |
| `src/features/personal/PersonalPages.tsx`   | Torna o editor da capa visível na página do álbum, separado do formulário recolhido de texto.                                                                                                      |
| `src/features/personal/Personal.module.css` | Contém capas enviadas e capas de obras; limita a capa principal e impede expansão indevida da grade.                                                                                               |
| `src/features/discovery/ItemImage.tsx`      | Exibe imagem, crédito e direitos; volta ao estudo NOCTIS quando a URL falta ou o navegador informa falha.                                                                                          |
| `src/features/discovery/Artwork.module.css` | Novo módulo específico de proporções e dimensões. Os créditos ficam fora do quadro da imagem, sem recorte.                                                                                         |
| `src/data/artwork.ts`                       | Novo mapa de sete imagens editoriais verificadas: URL, obra, crédito, direitos e página de origem.                                                                                                 |
| `src/data/curated.ts`                       | Associa esse mapa aos registros existentes, sem trocar seus IDs. Corrige a atribuição da fotografia. Mantém as imagens AIC já existentes.                                                          |
| `src/services/providers.ts`                 | Normaliza capas Open Library e imagens aprovadas da CAA, com identificação da edição/release.                                                                                                      |
| `src/services/catalog.ts`                   | Preserva a capa de uma edição ao carregar o detalhe da obra; permite complementar um snapshot antigo sem imagem usando o mesmo ID conhecido.                                                       |
| `src/features/experiences/WorkCard.tsx`     | Usa esse complemento de imagem em cartões salvos antes desta etapa; a imagem já presente no snapshot tem prioridade.                                                                               |
| `server/catalog.mjs`                        | Solicita campos de capa de livros. Faz consulta CAA somente no detalhe musical, com cache, limite de frequência e timeout independente.                                                            |
| `src/test/Covers.test.tsx`                  | Testa edição completa, compensação de falha, referências persistidas, fallback e associação de imagens. O armazenamento binário é simulado nestes testes.                                          |
| `src/test/Discovery.test.tsx`               | Atualiza a expectativa sobre capas OL: exibir pela API, sem inventar licença livre.                                                                                                                |
| `src/test/PersonalUI.test.tsx`              | Corrige opções `exact` indevidas em consultas `getByRole`, encontradas na verificação TypeScript que havia ficado pendente.                                                                        |
| `server/catalog.test.mjs`                   | Testa os campos de capa solicitados e a integração CAA com respostas simuladas, incluindo ausência de imagem.                                                                                      |
| `docs/fixtures/`                            | Dois PNGs sintéticos usados para testar upload e substituição, sem utilizar arquivos pessoais do usuário.                                                                                          |
| `docs/evidence/`                            | Captura do álbum de teste com a capa selecionada e o editor disponível.                                                                                                                            |

Nenhuma dependência foi adicionada.

## Como upload e persistência funcionam

1. O usuário seleciona JPEG, PNG ou WebP, com até 2 MiB (2 × 1024 × 1024 bytes). SVG, GIF, arquivo vazio ou formato diferente são rejeitados.
2. O navegador decodifica a imagem; apenas mudar a extensão não transforma um arquivo inválido em imagem. O limite é 6000 pixels por lado e 16 megapixels no total.
3. O arquivo é um **Blob**, uma sequência binária. Ele é gravado no banco IndexedDB `noctis-personal-images`, versão 1, object store `covers`, com uma chave UUID.
4. Somente após a transação completar, `changeAlbumCover` grava `{ kind: 'upload', imageId }` nos metadados do álbum pelo repositório.
5. O React recebe a atualização pelo `useSyncExternalStore`. `AlbumCover` lê o Blob e cria uma URL temporária `blob:` para o `<img>`.
6. A URL temporária nunca é persistida: deixa de ser válida ao encerrar aquela sessão da página. Após atualizar, uma nova URL é criada a partir do mesmo Blob persistido.
7. Ao substituir, o Blob antigo só é removido depois que a nova referência foi salva. Se os metadados falharem, a imagem antiga continua selecionada e o novo Blob não utilizado é removido.
8. Ao remover a capa, a referência vira `{ kind: 'none' }` e o Blob anterior é removido. Falhas de limpeza geram aviso; o aplicativo não diz que a limpeza foi completa.

Os metadados continuam no `localStorage`, chave `noctis.personal.v1`, com JSON validado. Não há base64 de imagem ali. `localStorage` armazena strings; IndexedDB armazena os binários maiores sem inflar esse JSON. Ambos pertencem à origem do site: trocar porta, endereço ou navegador muda o arquivo local acessível.

O contrato de dados permanece compatível com a versão 1. A capa pode ser `none`, `work` com `workId`, ou `upload` com `imageId`. Uma futura implementação Supabase poderá mapear `imageId` para uma chave de objeto em Storage, mantendo uma camada de serviço para resolver/carregar a imagem. Isso exigirá migração explícita, autenticação e autorização; os Blobs locais não são transferidos automaticamente. Exportar metadados JSON não exporta os arquivos de capa.

## Imagens externas: associação e direitos

### Livros

A busca Open Library agora pede o ID da imagem e a edição associada. A URL usa o padrão documentado `/b/id/{coverId}-L.jpg?default=false`, somente quando há ID positivo fornecido pela API. `default=false` permite detectar imagem ausente por erro HTTP, em vez de receber uma imagem vazia.

Se há `cover_edition_key`, o crédito e `image.sourceUrl` apontam para essa edição. O registro continua representando uma **obra**, e sua data é a primeira publicação; a capa não é apresentada como uma primeira edição. A capa de uma edição não é trocada pela capa genérica do detalhe da obra durante o enriquecimento. Quando só há uma capa da obra, o texto diz que a edição não foi especificada. Nenhum ISBN ou nome de arquivo é adivinhado.

Frankenstein da curadoria Gutenberg é explicitamente o ebook 84. Sua capa é a publicada nessa página, não a de uma edição comercial arbitrária. A busca Open Library pode mostrar outra capa porque representa outro registro editorial. Isso é esperado.

### Música

A busca MB permanece leve e sem requisições de imagem por cartão. No detalhe, com `NOCTIS_CONTACT` configurado, o servidor pode consultar `/release-group/{id}` da CAA. Aceita somente imagem frontal aprovada, com uma release UUID identificada na resposta e URL no host oficial correspondente àquela release. Ausência, erro ou timeout deixa o registro utilizável com placeholder. São utilizados cache de dez minutos, limite de frequência e timeout de 2,5 segundos.

A associação de uma capa ao grupo não significa que todas as edições usam a mesma arte. A identificação da release acompanha a imagem. A capa editorial de Ambient 2 vem da discografia oficial; ela não informa uma edição física específica e isso é declarado. Não há capa deduzida de um link Spotify.

### Filmes, jogos, fotografia e arte

Metropolis usa o pôster francês de 1927 de Boris Bilinski, identificado na página do arquivo Commons e marcado como domínio público ali. Journey e Firewatch usam arte promocional/screenshot das páginas oficiais; seus direitos permanecem com os titulares. Não foram marcados como CC0 ou licenciados para redistribuição irrestrita. Ambient 2 mantém a mesma distinção de copyright. As imagens são referências editoriais remotas, sem republicação local dos arquivos.

Migrant Mother usa o arquivo exato do item 2017762891 presente no manifesto oficial Free to Use and Reuse da Library of Congress. O guia oficial declara não haver restrições conhecidas para essas imagens. Obras AIC continuam usando somente imagens marcadas como domínio público. As integrações de busca TMDB, RAWG e Unsplash continuam desconectadas; não foram simuladas.

Referências consultadas:

- [Open Library: Covers API e orientação de hotlink](https://openlibrary.org/dev/docs/api/covers)
- [Open Library: Search API, obras e edições](https://openlibrary.org/dev/docs/api/search)
- [Cover Art Archive: API](https://musicbrainz.org/doc/Cover_Art_Archive/API)
- [Commons: pôster específico de Metropolis](https://commons.wikimedia.org/wiki/File:Boris_Bilinski_-_Filmplakat_f%C3%BCr_Metropolis.jpg)
- [Firewatch: fonte oficial](https://www.firewatchgame.com/)
- [Journey: fonte oficial](https://thatgamecompany.com/journey/)
- [Brian Eno: discografia oficial](https://www.brian-eno.net/information)
- [Library of Congress: manifesto de arquivos livres para uso](https://data.labs.loc.gov/free-to-use/manifest.html)
- [Library of Congress: contexto e direitos de Migrant Mother](https://guides.loc.gov/migrant-mother)
- [Gutenberg: permissões e particularidades das edições digitais](https://www.gutenberg.org/policy/permission.html)

## Por que as proporções diferem

Livros e pôsteres usam quadro 2:3; capas musicais, 1:1; jogos e fotografias, 4:3; pinturas, quadro quadrado neutro. Uma fotografia pode ser vertical e um jogo pode fornecer arte quadrada: `object-fit: contain` preserva a imagem inteira dentro desses quadros, sem esticar nem cortar. As proporções organizam o espaço; não modificam o arquivo.

O quadro de cartão fica limitado a 320 px de altura; o detalhe, 440 px (340 px em telas pequenas). Capas enviadas do álbum ficam em um quadro de até 240 px na página; capas de obras dentro de álbuns usam até 220 px para a imagem. Créditos são conteúdo separado e continuam legíveis fora da imagem. Não há recorte para preencher artificialmente uma proporção.

## Verificação real e limites

Execução final em 04/11/2026: TypeScript, lint e build aprovados. `npm test -- --reporter=dot`: **157 testes passaram em 8 arquivos**, duração de 15,60 segundos. O build gerou `dist/` em 1,41 segundo. Não foi adicionada dependência de produção ou de teste.

Os resultados finais de comandos estão no README. Os testes anteriores de navegação, experiências, links e arquivo pessoal continuam na suíte. Novos testes cobrem upload/substituição, remoção, seleção de obra, recriação do repositório, falhas de quota, Blob ausente, liberação de URLs temporárias, créditos/fallback nas seis categorias, preservação de edição OL e validação de imagens CAA. Esses testes não substituem uma verificação real de IndexedDB: o fluxo real também foi executado no navegador integrado, em origem isolada dos álbuns do Brave do usuário.

No navegador foram confirmados: upload de PNG 320×180, substituição por PNG 180×320, refresh preservando a imagem substituída, remoção seguida de refresh, inclusão de Frankenstein e sua seleção como capa, outro refresh mantendo a seleção. A capa da obra mediu 147×220 px, e o cartão 214×320 px. Em 390×844 e em 1365×900 não houve largura de conteúdo superior ao viewport. Quick Preview carregou imagens reais de livros, filme, jogo, música e fotografia, com `contain`.

As imagens AIC falharam nesta sessão e o fallback apareceu. A tentativa de consulta oficial retornou bloqueio HTTP 403, inclusive para a API; não se tentou contornar a proteção. Isso é uma limitação externa observada, não um teste de imagem carregada aprovado. A consulta de músicas ao vivo continua dependendo de configuração de contato e não foi validada com um provedor musical real; seu adaptador foi testado com fixtures.

O endpoint local real de busca retornou HTTP 200 para Frankenstein, com `coverId` 12356249 e edição OL35649409M no primeiro resultado. As sete URLs editoriais adicionadas responderam HTTP 200 na consulta direta. A fotografia foi decodificada pelo navegador mesmo com tipo HTTP `binary/octet-stream`.

Não foram realizados testes em aparelho físico, Safari, Firefox, nem um teste de interface no Brave nesta etapa. A falha anterior da automação de upload do Brave era uma limitação da extensão de testes e não prova que o upload manual estava quebrado. As alterações não requerem alterar permissões da extensão para uso normal.

## Roteiro manual

1. Abra My Archive → My Albums e entre em um álbum. O editor **Album cover** está visível sem abrir Edit album.
2. Envie um JPEG, PNG ou WebP de até 2 MiB. Aguarde **Cover stored only in this browser**. A capa muda sem salvar o formulário de texto.
3. Atualize a página. Envie outra imagem e atualize novamente.
4. Use Remove cover. Atualize e confirme a volta ao estudo NOCTIS.
5. Adicione Frankenstein pelo Add to Album de sua ficha. No álbum, escolha Frankenstein em Choose a work from this album. Atualize para conferir a persistência.
6. Abra Search e veja as obras reais nas seis categorias. Uma imagem bloqueada ou removida deve voltar ao placeholder identificado.
7. Em janela estreita, confira que capa, controles e conteúdo cabem na tela. Nenhuma edição publica o álbum ou envia sua capa a um servidor.

Guarde os arquivos originais das capas. Limpar os dados do navegador remove arquivos locais sem sincronização. A Stage 05, ainda não iniciada, poderá acrescentar contas, migração consentida e armazenamento na nuvem.
