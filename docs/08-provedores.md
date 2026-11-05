# Stage 03 — fontes, configuração e direitos

Consulta às referências oficiais em 04/11/2026. O status observado no aplicativo e os testes estão no documento 09. Ter um adaptador escrito não significa ter confirmado disponibilidade de produção.

## Resumo de integração

| Categoria | Provedor | Situação nesta entrega |
| --- | --- | --- |
| Books | Open Library | Adaptador e consulta de busca/ficha implementados. Busca real confirmada no Brave. Sem chave. |
| Art | Art Institute of Chicago | Adaptador, atribuição e restrição de imagens implementados. Houve HTTP 403 inicial; o teste final de busca por Monet respondeu com 12 registros reais. Imagens podem falhar separadamente e têm fallback. |
| Music | MusicBrainz | Adaptador de grupos de lançamentos e busca/ficha implementados; desativado sem `NOCTIS_CONTACT`. Não validado ao vivo com um contato real. |
| Music artwork | Cover Art Archive | Investigado; reprodução automática de capas adiada, pois acesso técnico não prova licença para reutilização. |
| Films & Series | TMDB | Investigado e desconectado: sem credenciais e sem implantação validada de branding. Não há adaptador habilitável por chave nesta versão. |
| Games | RAWG | Investigado e desconectado: sem chave; é necessário confirmar o plano e as condições aplicáveis. Não há adaptador habilitável por chave nesta versão. |
| Photography | Unsplash | Investigado e desconectado: sem aplicação/chave API aprovada. Não há adaptador habilitável por chave nesta versão. |

Todas as categorias têm conteúdo local real selecionado e demonstrações identificadas. O painel de fontes não declara que uma API desconectada foi consultada.

## Open Library

Referências: [API e uso](https://openlibrary.org/developers/api), [Search API](https://openlibrary.org/dev/docs/api/search).

Usamos busca limitada e campos selecionados, motivada pela consulta do visitante. O servidor faz cache e mantém frequência inferior ao limite anônimo de uma chamada por segundo. Com contato configurado, identifica o projeto no User-Agent; não aumenta automaticamente a frequência. Não realiza coleta em massa nem usa o serviço como infraestrutura comercial de alto tráfego.

Normalizamos título, nomes de autores, ano inicial e assuntos. Fichas podem consultar o registro da obra para obter descrição; dados ausentes permanecem ausentes. A Open Library não fornece necessariamente um resumo na busca. Seus identificadores de capa não comprovam direitos de reprodução; por isso esta entrega mantém o placeholder, mesmo quando `cover_i` está presente.

## Art Institute of Chicago

Referência: [documentação da API, imagens, atribuição e limites](https://api.artic.edu/docs/).

A API aceita consultas sem chave, limita acesso anônimo e pede identificação de cortesia por `AIC-User-Agent`. O servidor envia o nome da aplicação e acrescenta o contato quando configurado. Usa campos explícitos e no máximo uma chamada a cada 1,1 segundo.

O adaptador só cria uma URL IIIF se `is_public_domain === true`, com identificador de imagem válido e base oficial permitida. Usa a base `config.iiif_url` quando fornecida. Direitos não são presumidos para todo o acervo. Imagens são referenciadas no host oficial, não baixadas para republicação.

Descrições da API são convertidas em texto, atribuídas ao museu e acompanhadas de ligação à licença CC BY 4.0. Demais metadados e imagens explicitamente liberadas seguem as condições indicadas pelo museu. As duas obras locais foram conferidas por registros oficiais: [La Grande Jatte, 27992](https://api.artic.edu/api/v1/artworks/27992) e [The Bedroom, 28560](https://api.artic.edu/api/v1/artworks/28560). Seus resumos locais são editoriais próprios; a atribuição diferencia isso.

O HTTP 403 inicial foi tratado como falha, sem identidade falsa ou scraping. Ajustamos os parâmetros ao padrão documentado e acrescentamos o cabeçalho oficial `AIC-User-Agent`; na nova verificação a busca respondeu. Não é possível atribuir a causa do 403 com certeza apenas a essas observações. Imagens podem falhar separadamente, mesmo quando os metadados funcionam, e têm fallback.

## MusicBrainz e Cover Art Archive

Referências: [API](https://musicbrainz.org/doc/MusicBrainz_API), [limites e identificação](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting), [CAA API](https://musicbrainz.org/doc/Cover_Art_Archive/API), [política de imagens](https://musicbrainz.org/doc/Cover_Art_Archive).

O adaptador busca **release groups**, não um catálogo de faixas reproduzíveis. Usa ID MusicBrainz, créditos, primeiro lançamento, tipo e tags. Não exige chave para leitura, mas exige identificação real da aplicação. O limite implementado permanece abaixo de uma chamada por segundo por processo; múltiplas instâncias compartilhando um IP exigiriam coordenação antes de uma implantação maior. O uso comercial precisa de revisão das condições do serviço.

CAA disponibiliza acesso a capas, mas sua própria política pede respeito aos titulares e não oferece uma licença geral de reprodução. Por isso não implementamos carregamento automático de capas, áudio ou letras. Ausência de imagem não impede a navegação dos metadados.

## Provedores ainda desconectados

**TMDB:** [FAQ, licença e branding](https://developer.themoviedb.org/docs/faq), [limites](https://developer.themoviedb.org/docs/rate-limiting). Precisa de credencial, logo aprovado e aviso de atribuição. Uma integração futura deve usar token no servidor, validar os termos do projeto e apresentar créditos adequados. Não foi usado um logo improvisado nem exibido conteúdo como se a integração estivesse pronta.

**RAWG:** [documentação e planos](https://rawg.io/apidocs), [termos da API](https://rawg.io/tos_api). Exige chave e backlink nas páginas com dados. Há diferenças entre a apresentação do plano gratuito e a redação dos termos sobre uso comercial; é necessário confirmar o plano aplicável antes de ativá-lo. Nenhuma permissão comercial ampla foi presumida.

**Unsplash:** [documentação oficial](https://unsplash.com/documentation), [atribuição API](https://help.unsplash.com/en/articles/2511315-guideline-attribution). Exige aplicação API, URL de imagem retornada pelo serviço e atribuição com links ao fotógrafo e Unsplash. Ações equivalentes a download têm rastreamento próprio. NOCTIS não tem botão de download nem implementa esse fluxo. Uma licença genérica de imagem não substitui as exigências da API; nenhuma foto aleatória foi hotlinkada.

## Como configurar o que já está implementado

1. Mantenha Node.js 24 e as dependências instaladas.
2. Se desejar habilitar MusicBrainz, copie `.env.example` para `.env` na raiz do projeto.
3. Preencha `NOCTIS_CONTACT` com um e-mail ou URL real de contato que possa ser enviado aos provedores. Não use um exemplo fictício em produção.
4. Reinicie o iniciador `Iniciar-NOCTIS.cmd` para que o servidor carregue a configuração.
5. Abra a disponibilidade de fontes na busca e faça uma consulta de música.

Sem `.env`, a aplicação continua funcionando; Open Library e Art Institute podem ser consultados anonimamente nos limites implementados. MusicBrainz informa a configuração pendente. TMDB, RAWG e Unsplash continuam desconectados mesmo se chaves forem adicionadas ao arquivo: falta implementação e validação, não apenas um valor secreto.

## Fontes da curadoria local

| Registro | Fonte do metadado e destino apresentado |
| --- | --- |
| Pride and Prejudice | [Project Gutenberg 1342](https://www.gutenberg.org/ebooks/1342): título, autora e primeira publicação. Sem reprodução de capa. |
| Frankenstein | [Project Gutenberg 84](https://www.gutenberg.org/ebooks/84): obra de Shelley, primeira publicação 1818; a ficha não promete uma edição específica. Sem capa. |
| Metropolis | [MoMA](https://www.moma.org/collection/works/299946): Fritz Lang, 1927. Sem alegação de disponibilidade para streaming. |
| Journey | [thatgamecompany](https://thatgamecompany.com/journey/) e [anúncio PlayStation de 2012](https://blog.playstation.com/2012/02/16/journey-takes-its-first-steps-this-march): desenvolvedora, ano e plataforma original. |
| Firewatch | [site oficial](https://www.firewatchgame.com/) e [Campo Santo, About](https://www.camposanto.com/about/): criador e ano. |
| Ambient 2 (The Plateaux of Mirror) | [discografia oficial de Brian Eno](https://www.brian-eno.net/information): título, artistas e 1980. O link é identificado como fonte, não player. |
| Migrant Mother | [guia da Library of Congress](https://guides.loc.gov/migrant-mother): Dorothea Lange, março de 1936. A fotografia não foi reproduzida. |
| La Grande Jatte e The Bedroom | Registros API oficiais do Art Institute acima; imagens somente com liberação específica. |

As descrições curtas, seleções e tags editoriais foram escritas para o NOCTIS. Não são críticas copiadas, estatísticas, gêneros oficiais prometidos ou recomendações personalizadas.
