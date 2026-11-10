# Stage 07 — Auditoria final e versão de portfólio

## A. Avaliação

**Ready with minor limitations — pronto com pequenas limitações.** A suíte automatizada cobre os fluxos principais e a distribuição compila. A avaliação não equivale a certificar todos os dispositivos, leitores de tela ou serviços externos. A proteção existente da Vercel exige atenção antes de compartilhar o link publicamente.

A experiência interativa foi preservada nos três livros, conforme confirmação expressa do usuário, que substitui a restrição a Frankenstein presente no prompt da Stage 07. Nenhuma nova etapa foi iniciada.

## B. Achados antes das correções

| Prioridade | Achado                                                                       | Tratamento                                                                             |
| ---------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Crítica    | Nenhuma identificada no escopo examinado.                                    | Não representa garantia de ausência de vulnerabilidades.                               |
| Alta       | Nenhuma falha funcional identificada na suíte executada.                     | Serviços de contas/comunidade não foram tratados como produção validada.               |
| Média      | Games alternava para imagens dominadas por nomes/logos.                      | LIMBO entrou na seleção; INSIDE recebeu gameplay oficial.                              |
| Média      | Fundo azul retangular de After Hours não integrava a composição.             | Fotografia histórica em preto e branco, escurecida, com fades e extensão lateral.      |
| Média      | Rejeição inesperada de `onSubmit` deixava o formulário de álbum ocupado.     | Tratamento de erro com `try/catch/finally` e teste de falha seguido de nova tentativa. |
| Média      | README promovia contagens, intro e estado de entrega antigos.                | Reescrito como apresentação atual do projeto.                                          |
| Média      | Servidor Node independente não declarava MIME de MP4.                        | Incluído `video/mp4`; não confundir com o servidor estático da Vercel.                 |
| Baixa      | Faltavam favicon e metadados sociais básicos.                                | Marca SVG e card social estático da própria identidade.                                |
| Baixa      | Classes ausentes produziam o texto `undefined` no atributo class de imagens. | Composição de classes filtra valores ausentes.                                         |
| Baixa      | Restavam estilos de ilustrações substituídas por mídias reais.               | Removidos seletores e keyframes sem uso nas duas folhas afetadas.                      |

O tratamento do álbum é uma correção defensiva confirmada com rejeição simulada; não foi observado um travamento normal no arquivo pessoal do usuário. Não se apagou armazenamento pessoal para testar.

## C. Arquivos e funcionamento

- `src/data/editorialAdditions.ts`, `editorialArtwork.ts`, `curated.ts`: registro real de LIMBO, destino oficial e capturas de gameplay de LIMBO/INSIDE. Firewatch permanece no catálogo e em salvamentos existentes.
- `src/data/roomMedia.ts`, `roomCuration.ts`: seleção da composição de Games e texto compatível com quatro jogos. O catálogo passa de 19 para 20 obras reais.
- `public/artworks/`: imagens completas e miniaturas preparadas a partir dos arquivos oficiais. `sources.json` registra URLs, autoria, direitos, arquivo de origem e dimensões. Não há imagens inventadas.
- `src/data/historicalArtwork.ts`, `features/exhibitions/NightCity.tsx`: associam o novo fundo ao registro **gsc1994017109/PP**, fotografia de Samuel H. Gottscho de 1933. Não se atribui a ele o identificador de uma fotografia semelhante.
- `features/exhibitions/AfterHours.tsx` e CSS: o fundo fica em uma camada própria, atrás das três janelas, cobrindo também as margens. Gradientes fundem suas bordas ao ambiente; um zoom discreto responde a hover/foco. A preferência de movimento reduzido desativa esse movimento. Sem vídeo contínuo adicional ou áudio.
- `features/personal/AlbumTools.tsx`: `AlbumForm` preserva os campos após erro e libera o botão no `finally`, permitindo tentar novamente.
- `features/discovery/ItemImage.tsx`: mantém apenas classes existentes. Não muda proporções nem o fallback.
- `features/home/Home.module.css`, `features/experiences/RoomEntrance.module.css`: limpeza de estilos das antigas ilustrações. As animações em uso e o livro interativo continuam presentes.
- `index.html`, `public/assets/brand/`: favicon e card social da marca; o card é composição tipográfica, não fotografia gerada. Metadados globais em inglês.
- `server/start.mjs`: tipo correto para vídeos MP4 na hospedagem Node independente.
- `src/test/`: nova regressão de LIMBO/INSIDE, recuperação do formulário e expectativas de contagem atualizadas.
- `README.md`: apresentação atual, execução, arquitetura, dados, publicação e limites. As etapas anteriores permanecem em `docs/`.

Nenhuma dependência foi adicionada. Pillow foi usado apenas na preparação local das mídias; não entra no bundle ou no repositório. O aplicativo continua React + TypeScript + Vite + CSS Modules + Motion + React Router + Lucide.

### Fontes e direitos

As capturas de LIMBO (`Running Left.jpg`, pacote de julho de 2010) e INSIDE (`INSIDE_01.png`) vieram da [página oficial de imprensa da Playdead](https://playdead.com/press/). São material promocional com copyright da Playdead, apresentado editorialmente; não são CC0.

O fundo vem da [Library of Congress](https://www.loc.gov/pictures/item/gsc1994017109/PP/), com reprodução e informação de dedicação pública no [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:New_York_city_views._LOC_gsc.5a18133.jpg). O arquivo de 560 × 391 é utilizado escuro como atmosfera; não foi artificialmente reconstruído ou descrito como fotografia de alta resolução.

## D. Verificações executadas

- Antes das alterações: `npm test` passou com **329 testes em 23 arquivos**; `test:security` passou com **18 em 3 arquivos**; TypeScript, lint e build passaram.
- Depois das correções: `npm test` passou com **331 testes em 23 arquivos**. `npm run test:security`: **18 em 3 arquivos** (subconjunto já incluído nos 331, não somar como testes distintos).
- A primeira execução intermediária encontrou uma expectativa ainda fixada em 19 IDs; corrigida para os 20 registros únicos e a suíte foi reexecutada com sucesso.
- `npm run typecheck`, `npm run lint` e `npm run build` passaram após as alterações de código; saída `dist/`. O lint é TypeScript estático, não ESLint.
- A auditoria de dependências de produção feita na leitura inicial retornou zero vulnerabilidades conhecidas. A tentativa posterior de `npm audit --json` completo não concluiu por falha de DNS do registro npm; não se declara auditoria completa aprovada.
- Foram revisados fallback SPA, exclusões de mídias/API, `.gitignore`, exemplos de ambiente, validação de URLs, diálogos, persistência e limites de uploads. Nenhuma chave privada foi incluída. Supabase e autenticação não foram configurados.
- A suíte cobre rotas, busca/filtros, prévias, destinos, livros, arquivo pessoal, capas, estados de falha, movimento reduzido e regras de segurança locais. Usa fixtures; não prova disponibilidade de cada serviço remoto.

A prévia local desta rodada retornou timeout na conexão do navegador, embora o processo do servidor tenha iniciado. Por isso, não se atribui a essa tentativa uma validação visual ou de uploads. A conferência publicada foi realizada no Brave após o deploy e está registrada abaixo. Não foram executados Lighthouse, leitor de tela real nem testes em aparelho físico nesta auditoria.

### Conferência efetiva em produção

A Vercel confirmou **Ready / Production / Current** para o commit `55a9104`, com build concluída e função TypeScript transpilada sem erro. Os cinco avisos exibidos referem-se à versão Node 24 definida no projeto sobrepondo a configuração Node 26 da plataforma e à variável de cache do npm. Não foram alteradas configurações da conta para silenciar avisos.

No Brave, foram executados:

- Homepage publicada com imagens de Journey, LIMBO e INSIDE carregadas; ausência de overflow horizontal em 1920 px. Metadado do card social presente.
- After Hours com fotografia real carregada, largura lateral completa, fades, três destinos e crédito correto. Captura real salva na pasta de visualizações da entrega.
- Abertura direta das seis salas, com títulos próprios e sem imagens já concluídas em erro no momento da inspeção. Imagens lazy ainda não solicitadas não foram consideradas verificadas.
- Replay da intro seguido de Skip: botão ausente imediatamente após o clique. Também observada a saída natural da intro.
- Quick Preview de Frankenstein: foco inicial no fechamento; Shift+Tab permaneceu no diálogo; Escape fechou e devolveu foco ao botão que abriu a prévia.
- Busca por LIMBO, submissão por Enter, filtro Games e período 2010s; navegação até a ficha completa com destino oficial Playdead.
- Na **origem exclusiva desse deploy**, Save, Want e nota 4,5 persistiram após refresh. Criado o álbum `QA · Night studies`, adicionada a obra LIMBO, escolhida sua imagem como capa e verificada a imagem depois de atualizar a página. Isso não alterou o arquivo pessoal do domínio habitual do usuário.
- Histórico inicialmente pausado; após opt-in, visitas às fichas completas apareceram em Recently Explored. Sem apagar histórico ou arquivo pessoal para teste.
- Settings em Reduce motion: na sala Films, vídeo permaneceu pausado e sem `src`.
- Em viewport de **390 × 844**, Dracula, Pride and Prejudice e Frankenstein abriram e avançaram da página 1 para a 2. Também conferidos homepage, Discover, Search, alias `/archive` (redireciona a `/my-archive`), After Hours, álbum e Films, sem overflow horizontal nas inspeções. O tamanho normal do navegador foi restaurado.

**Upload não validado no navegador nesta rodada:** o seletor abriu, mas a extensão do Brave impediu a seleção automatizada de arquivo por não possuir acesso a URLs de arquivos locais. Nenhuma permissão da extensão foi alterada. Upload, substituição e remoção de arquivos continuam cobertos pela suíte automatizada e devem ser repetidos manualmente no checklist; não se declara esse fluxo aprovado no navegador.

Não foram testados todos os destinos externos por navegação real, todas as combinações de filtros, todos os tamanhos ou a animação de virada em todos os dispositivos. Os três livros foram inspecionados no modo de movimento reduzido; a suíte também cobre sua lógica de navegação.

## E. Limitações conhecidas

1. Arquivo pessoal é local por origem/navegador; não há sincronização remota validada. Limpar os dados do site pode remover o acesso aos álbuns e uploads. Exportação de metadados não deve ser confundida com backup automático das imagens.
2. Provedores podem bloquear consultas, não fornecer capas ou não oferecer destinos de compra/streaming. Há fallback identificado, nunca URL Spotify ou imagem inventada.
3. TMDB, RAWG e Unsplash seguem desconectados; MusicBrainz exige contato real. Contas/comunidade não foram configuradas nesta entrega.
4. Proteção de acesso da Vercel foi preservada. Acesso de recrutadores sem sessão deve ser decidido pelo usuário antes da divulgação.
5. Card social é global, sem imagem/metadados por obra renderizados no servidor. Não se promete SEO completo de páginas individuais.
6. Não há certificação de acessibilidade, desempenho em aparelho de entrada ou revisão jurídica independente de todas as reproduções.

Esses limites não são apresentados como funcionalidades completas ou como bugs corrigidos.

## F. Checklist manual final

- [ ] Abrir em sessão nova: intro, Skip imediato e replay; testar somente teclado e movimento reduzido.
- [ ] Navegar pelas seis salas; conferir fontes, imagens e ausência de cortes excessivos em computador e celular.
- [ ] Em Games, observar Journey → LIMBO → INSIDE; abrir a ficha de LIMBO e o destino Playdead.
- [ ] Em After Hours, verificar fundo integrado de ponta a ponta, fades e leitura das três janelas.
- [ ] Buscar texto, aplicar/remover filtros, testar resultado vazio e indisponibilidade externa.
- [ ] Abrir/fechar prévias com Escape e conferir retorno do foco; abrir as fichas completas.
- [ ] Abrir e folhear os três livros, usando as ações do arquivo fora das páginas.
- [ ] Salvar, marcar Want, avaliar e criar/editar um álbum; conferir persistência após refresh.
- [ ] Subir JPEG/PNG/WebP, substituir, usar artwork de uma obra e remover/resetar capa; rejeitar arquivo inválido/acima de 2 MiB.
- [ ] Conferir histórico opt-in e Settings sem excluir dados reais para testar.
- [ ] Atualizar diretamente `/discover`, `/search` e `/archive`; conferir 404 e navegação de volta.
- [ ] Testar em celular físico e com leitor de tela; conferir acesso de visitante antes de compartilhar publicamente.

## G. O que o projeto demonstra

Direção visual consistente, seis experiências de conteúdo dentro de uma mesma identidade, transições com alternativas acessíveis, navegação declarativa, contratos TypeScript, adaptação e normalização de provedores, validação de URLs, persistência local, uploads com limites, testes de interface e publicação com fallback SPA. A combinação de livro interativo, curadoria cultural e arquivo pessoal diferencia o projeto sem depender de uma integração remota não validada.

## H. Recomendação

Encerrar a expansão de funcionalidades nesta versão. A prioridade passa a ser a revisão manual indicada acima e a decisão de acesso para apresentar o portfólio. Se surgirem falhas reproduzíveis, corrigir pontualmente; não iniciar outra etapa nem redesenhar o projeto por padrão.
