# Verificação da Stage 01

Verificações executadas em 04/11/2026, com Node.js 24.21.0 e npm 11.19.0.

## Resultados

- Instalação concluída: 113 pacotes adicionados; auditoria retornou 0 vulnerabilidades naquele momento.
- `npm ls --depth=0`: dependências resolvidas sem erros. React 19.3.1, Vite 8.3.5, TypeScript 7.0.2, Motion 14.9.0, React Router DOM 7.18.5 e Lucide React 1.67.0. Versões fixadas no manifesto e lockfile.
- `npm run build`: TypeScript e build de produção aprovados. Saída JavaScript aproximadamente 406 kB antes de gzip e 131 kB com gzip; CSS aproximadamente 10,4 kB antes de gzip.
- `npm test`: 14 testes aprovados cobrindo convite, seis salas, três páginas pessoais, Discover, 404, navegação e pesquisa.
- Navegador Brave real: homepage carregada e conferida em desktop e viewport 390 × 844; busca aberta, campo focado, filtro “music”, Escape e retorno do foco ao acionador confirmados.

A primeira execução de testes teve uma falha na consulta do próprio teste: havia dois links válidos contendo “The Gallery”. A consulta foi corrigida para aceitar esse caso. Durante a conferência real, o diálogo inicialmente focava seu botão de fechar; o código foi ajustado para focar o campo da pesquisa após `showModal()`.

## Limites da evidência

Os testes usam jsdom, com métodos de diálogo simulados: não comprovam o comportamento nativo de Tab ou a aparência. A conferência real acima complementa, mas não substitui uma auditoria de acessibilidade. Não foram executados leitor de tela, Lighthouse, cobertura completa de navegadores ou emulação real de reduced motion. As regras de reduced motion existem no código; seu comportamento visual ainda precisa dessa conferência específica. Não houve publicação.

A prévia na rede restrita não ficou acessível no navegador; após liberação para executar o servidor local, a conferência funcionou na porta 5174. Os servidores usados nesta validação foram encerrados. Use `npm run dev` para iniciar novamente.

## Roteiro para você conferir

1. Execute `npm run dev` e abra o endereço impresso.
2. Clique em Enter the Archive; deve chegar às seis salas.
3. Abra cada sala e volte usando o menu. A URL e o título da aba devem acompanhar a página.
4. Abra Ctrl+K ou ⌘K. Digite “music” e depois um termo inexistente. Escolha uma sala.
5. Abra um painel; navegue com Tab/Shift+Tab e feche com Escape ou clique fora. Confira se o foco retorna ao controle.
6. Confira as páginas pessoais: elas devem explicar o estado futuro, sem solicitar conta nem coletar histórico.
7. Teste uma URL inexistente para conferir a página 404.
8. Ative movimento reduzido no sistema e recarregue. O convite deve aparecer sem deslocamento de entrada.
9. Confira larguras de 320, 768 e 1440 pixels e zoom de 200%. Procure texto cortado, rolagem horizontal ou controles inacessíveis.

Os itens deste roteiro são instruções para validação adicional, não afirmações de testes já executados.
