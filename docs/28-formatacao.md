# Formatação e leitura do código

Os arquivos de React/JSX, TypeScript, JavaScript do servidor, CSS Modules, testes, HTML, JSON e documentação foram organizados com Prettier. Funções e componentes extensos deixaram de ficar comprimidos em uma linha. O conteúdo e a ordem das operações foram preservados.

## O padrão

- Dois espaços de indentação.
- Largura preferida de 100 caracteres. Strings, URLs e dados de SVG podem ultrapassar esse limite.
- Propriedades de JSX separadas em linhas quando há mais de uma propriedade.
- Propriedades CSS separadas em linhas dentro de cada regra.
- Ponto e vírgula e aspas simples em JavaScript/TypeScript; aspas de atributos JSX seguem o padrão da linguagem.
- Quebras de linha LF, com CRLF reservado ao iniciador `.cmd` do Windows.

Formatar melhora a apresentação do código; não reorganiza a arquitetura nem muda a lógica. Funções pequenas ainda podem ser curtas. Blocos maiores agora têm estrutura visual para acompanhar condições, eventos, retornos e elementos filhos.

## Arquivos de configuração

| Arquivo                              | Responsabilidade                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `.prettierrc.json`                   | Regras compartilhadas do formatador.                                                              |
| `.prettierignore`                    | Exclui dependências, build, arquivos privados, evidências, imagens e dados gerados da formatação. |
| `.editorconfig`                      | Indentação, codificação e quebras de linha para editores compatíveis.                             |
| `.gitattributes`                     | Mantém quebras de linha consistentes nos checkouts do Git.                                        |
| `package.json` e `package-lock.json` | Prettier 3.9.10 como dependência de desenvolvimento, com versão fixada e comandos de uso.         |

Prettier não entra no código entregue ao navegador. SQL, TOML e o iniciador CMD não foram transformados por ele: não são linguagens suportadas pela configuração adotada. Nenhuma migração SQL foi aplicada e nenhum banco foi alterado.

## Como manter organizado

Dentro da pasta do projeto:

```sh
npm run format
```

Esse comando aplica o padrão aos arquivos suportados. Para conferir sem escrever alterações:

```sh
npm run format:check
```

O segundo comando é útil antes de enviar uma mudança para revisão. Os arquivos privados `.env` são ignorados.

## Exemplos para abrir no editor

- `src/features/discovery/QuickPreview.tsx`: propriedades, elementos filhos e condições da prévia.
- `src/app/App.tsx`: rotas e preparação da página organizadas em várias linhas.
- `src/styles/global.css`: variáveis, seletores e propriedades CSS separados.
- `src/features/frankenstein/FrankensteinManuscriptPage.tsx`: fluxo de abertura, navegação e JSX do livro.
- `server/catalog.mjs`: requisições, tratamento de erros e rotas do catálogo.

## Verificação

TypeScript, lint e build passaram após a formatação. A suíte executada teve **311 testes aprovados em 22 arquivos**. Aquela rodada ficou local, sem novo push ou deploy. A formatação passou a integrar o pacote de publicação da [revisão com mídias reais](30-midias-reais.md).
