# Stage 03 — verificação e roteiro de uso

Data: 04/11/2026. Node.js 24.21.0, npm 11.19.0. Projeto existente ampliado sem instalação de novas bibliotecas. Homepage e apresentação das seis categorias preservadas.

## Comandos realmente executados

| Verificação                       | Resultado final                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base antes da Stage 03            | 60 testes, TypeScript e build aprovados.                                                                                                              |
| `npm run typecheck`               | Aprovado.                                                                                                                                             |
| `npm run lint`                    | Aprovado. Usa as regras estáticas de TypeScript para código não utilizado, inalcançável e rótulos; não é ESLint nem uma auditoria completa de estilo. |
| `npm test -- --reporter=dot`      | 83 testes aprovados em 4 arquivos.                                                                                                                    |
| `npm run build`                   | Aprovado. JavaScript: aproximadamente 454,5 kB / 146,3 kB gzip; CSS: 26,7 kB / 6,4 kB gzip.                                                           |
| `node --check server/start.mjs`   | Sintaxe aprovada.                                                                                                                                     |
| `node --check server/catalog.mjs` | Sintaxe aprovada.                                                                                                                                     |
| Inspeção do bundle                | Zero ocorrências dos marcadores privados pesquisados: `NOCTIS_CONTACT`, nomes convencionais de chaves TMDB/RAWG/Unsplash e `AIC-User-Agent`.          |
| Arquivos de ambiente              | Somente `.env.example`; não foi criado arquivo com credenciais reais.                                                                                 |

A pasta não possui repositório Git. Portanto não houve revisão de histórico de commits nem a afirmação de que commits existentes foram auditados. A inspeção cobriu os arquivos disponíveis e o bundle gerado, com o escopo acima; não equivale a um scanner completo de segredos.

## Cobertura dos testes

Os testes anteriores continuam cobrindo homepage, rotas, navegação, demonstrações, prévias, fichas, filtros e movimento reduzido simulado. Os testes específicos de demonstração agora usam `source=demo`, pois o padrão das salas é o catálogo híbrido.

Os testes novos cobrem:

- Identificadores válidos, campos opcionais ausentes e respostas malformadas nos adaptadores.
- Restrição de imagens AIC ao domínio público explicitamente indicado; host IIIF permitido e rejeição de URL insegura.
- Ausência de capas de livros e álbuns sem licença verificada; ausência de áudio e estatísticas inventadas.
- Metadados MusicBrainz, identificação da aplicação e estado desativado sem contato.
- Deduplicação entre curadoria e fonte externa, sem confundir demos com obras reais.
- Filtros de categoria, criador, tags e década; datas desconhecidas não entram em décadas fictícias.
- Resultados locais preservados quando o serviço falha, cache, cancelamento e rejeição de registros incompletos.
- Resolução de deep link externo pelo provedor permitido e recusa de categoria incompatível.
- Ctrl+K, setas, Enter para resultados, prévia, ficha e ligação à fonte de uma obra real.
- Coleções editoriais, fallback de imagem e resposta antiga que não substitui uma consulta nova.
- Serviço Node com fixtures: consultas idênticas compartilhadas, cache, HTTP 429, pausa antes de nova tentativa, JSON inválido, identificação AIC, validação de query e métodos HTTP.

**Fixtures são respostas sintéticas identificadas em testes. Não são anunciadas como comprovação de sucesso de API real.**

Durante a implementação, corrigimos incompatibilidades de tipos na declaração do middleware, uma consulta de teste que esperava um campo opcional explicitamente `undefined` e espaços remanescentes após conversão de HTML em texto. Os testes antigos também precisaram refletir os novos rótulos e a limpeza de filtros que retorna à coleção híbrida. O resultado final acima foi obtido depois dessas correções.

## Testes reais no Brave

Usamos o servidor Windows já aberto pelo usuário na porta 5180, sem encerrá-lo.

1. **Open Library:** a busca `Frankenstein`, filtrada para Books, retornou registros reais além da curadoria. Abrimos Quick Preview de _Cleopatra and Frankenstein_, de Coco Mellors, entramos na ficha e conferimos o destino `https://openlibrary.org/works/OL25345096W`. Campos ausentes foram informados, sem resumo inventado.
2. **Art Institute:** a busca `monet` inicialmente devolveu HTTP 403. A interface mostrou a falha e preservou o restante do site. Após ajustar parâmetros ao formato documentado e enviar `AIC-User-Agent`, o teste final retornou 12 registros reais, incluindo _Water Lilies_ e _Bordighera_. Não é possível concluir a causa exata do primeiro 403 apenas com essa sequência.
3. **Imagens:** algumas URLs oficiais não carregaram neste ambiente. Na prévia de _Bordighera_, conferimos o fallback SVG e o aviso “Source image unavailable · Original NOCTIS placeholder”. Não declaramos sucesso de carregamento de imagens que falharam. A atribuição e a referência à licença acompanharam os metadados.
4. **Curadoria:** abrimos `/discover?collection=inhabited-spaces`, a prévia de _The Bedroom_ e sua ficha, conferindo fonte e aviso de curadoria real. O destino de retorno manteve a coleção escolhida.
5. **Teclado:** Ctrl+K abriu o painel abaixo da barra com foco no campo. ArrowDown moveu foco para Frankenstein. Enter no campo abriu `/search?q=Frankenstein` e fechou o painel. Na conferência final, Escape devolveu foco ao botão Search archive; na prévia de Bordighera, devolveu foco ao cartão correto.
6. **Filtros e histórico:** aplicamos década 1810 e criador Shelley; a URL refletiu ambos e exibiu um resultado. Depois trocamos a categoria e usamos Voltar: o criador e os filtros anteriores retornaram.
7. **Responsividade:** medimos busca, Discover, Books e ficha de arte em viewports de 320 e 768 px. Nenhuma dessas páginas apresentou rolagem horizontal; a área útil medida foi de 305 e 753 px por causa da barra vertical. A captura móvel da ferramenta tem limitações de escala; isso não substitui avaliação em aparelho real.

## Limitações conhecidas

- TMDB, RAWG e Unsplash permanecem desconectados. Foram pesquisados e há mensagens claras de indisponibilidade. Não há adaptadores fictícios nem ativação automática por preenchimento de chaves. O documento 08 descreve os bloqueios e o trabalho necessário.
- MusicBrainz tem adaptador configurável por contato real, mas não foi consultado ao vivo com identificação do usuário. Não inventamos um contato para ativá-lo. CAA foi adiado por direitos de imagem.
- O acesso externo pode falhar novamente. Consultas e imagens são independentes; sucesso de metadados não garante entrega de imagem.
- Uma ficha Open Library aberta diretamente após recarga pode ter menos informações de autoria do que a busca, pois o endpoint de obra pode trazer apenas IDs de autores. O site indica metadados ausentes e não dispara uma cadeia ilimitada de consultas de autores. Se vier da busca, preserva autoria/ano já recuperados ao enriquecer a ficha.
- Deduplicação editorial é heurística; equivalência entre todas as edições e adaptações ainda requer refinamento. IDs de provedores não são substituídos por índices de resultado.
- Limite de 12 resultados por provedor, sem paginação remota nesta etapa. Show more revela apenas registros já recebidos. Os filtros são locais sobre esse conjunto, não filtros remotos completos.
- Sem player, clipes de hover, streaming, recomendações pessoais, trending, contas, favoritos, avaliações ou comunidade.
- Testes do proxy usam fixtures e o navegador verificou o servidor Vite. O servidor standalone de produção teve sintaxe revisada/verificada, mas não foi submetido a um teste HTTP completo de implantação nesta sessão.
- Não foram executados leitor de tela, auditoria WCAG completa, macOS/Cmd+K real, Safari/Firefox, Lighthouse ou teste de movimento reduzido ligado no Windows. Os seis casos de movimento reduzido simulado da Stage 02 continuam passando.
- Houve mensagens genéricas de conexão do ambiente do navegador na etapa anterior. Não usamos um console vazio como critério presumido de aprovação; as evidências desta etapa são os testes e fluxos descritos aqui.

## Como você pode verificar

1. Mantenha `Iniciar-NOCTIS.cmd` aberto. Se necessário, feche e reabra o iniciador para carregar a configuração Vite atualizada.
2. Abra `http://127.0.0.1:5180/discover`. Entre em uma coleção editorial e abra uma prévia.
3. Use Ctrl+K ou ⌘K, digite `Frankenstein`, use as setas e pressione Enter no campo para ver os resultados completos.
4. Filtre por Books, criador Shelley e década 1810. Confira a URL. Use Voltar/Avançar após trocar de categoria.
5. Abra um resultado real da Open Library, entre na ficha e confira View source. Ele não deve anunciar capa ou streaming se isso não foi verificado.
6. Pesquise `monet` em Art, abra a disponibilidade de fontes e compare com uma consulta de Films & Series: TMDB deve informar que está desconectado, sem resultados externos simulados.
7. Em uma sala, selecione Fictional demonstrations only e confirme que as demos continuam identificadas. Depois limpe filtros e confira os registros reais locais.
8. Experimente um termo sem resultados. Confira a mensagem e a possibilidade de limpar filtros. Se uma fonte falhar, os registros locais devem permanecer utilizáveis.
9. Revise em celular, com teclado, zoom e preferência de movimento reduzido. Isso complementa as verificações automatizadas.

## Próxima etapa

Stage 04 — Personal Archive deve acrescentar favoritos, avaliações pessoais, histórico opcional e organização em álbuns, com persistência inicial e privacidade coerente. Ela não foi iniciada. A identidade estável e a origem dos registros já preparam esse trabalho.
