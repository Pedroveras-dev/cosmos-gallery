# Cosmos Gallery

Galeria de imagens do espaço: pesquise por temas como Lua, Marte, nebulosas e galáxias e veja os detalhes
de cada imagem. Usa dados reais da NASA Image and Video Library API.
Trabalho da **1ª Avaliação** de **Programação Web** — UESPI, Tecnologia em Sistemas de Computação (Problema 9).

## Integrantes

- João Pedro Veras
- Matheus Wallace

## Descrição

O usuário pesquisa imagens por tema (ex.: Marte, nebulosa, Apollo 11), vê os resultados em uma galeria
e abre uma janela de detalhes com a imagem ampliada e seus metadados.

## Principais funcionalidades

- Pesquisa de imagens por termo, com validação de campo vazio.
- Galeria responsiva com miniatura, título e ano.
- Janela de detalhes: imagem ampliada, título, descrição, data, centro responsável, autor e palavras-chave.
- Botão **Carregar mais resultados**, sem recarregar a página.
- Estados de carregamento, ausência de resultados e erro de comunicação, com botão "Tentar novamente".
- Tratamento de metadados ausentes ("Não informado") e de imagens com falha (placeholder).
- Acessibilidade: HTML semântico, foco visível, navegação por teclado, `aria-live` e `<dialog>` nativo.

## API utilizada

[NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf) (não exige chave).

- Busca: `GET https://images-api.nasa.gov/search?q={termo}&media_type=image&page={n}&page_size=24`
- Imagem ampliada: `GET https://images-api.nasa.gov/asset/{nasa_id}`

## Tecnologias

- HTML5 semântico
- CSS3 (Grid, Flexbox, variáveis CSS)
- JavaScript (ES6+, `fetch`, `async/await`), sem frameworks

## Estrutura de pastas

```
index.html
css/style.css
js/api.js      # requisições à API e normalização dos dados
js/ui.js       # formatação e criação de elementos
js/detail.js   # janela de detalhes da imagem
js/main.js     # estado, eventos e fluxo da pesquisa
```

## Como executar

1. Clone o repositório: `git clone https://github.com/Pedroveras-dev/cosmos-gallery.git`
2. Abra a pasta e execute o `index.html` no navegador (ou use a extensão *Live Server* do VS Code).
3. É necessária conexão com a internet, pois os dados são buscados em tempo de execução.

Alternativa: `python -m http.server 8000` e acesse `http://localhost:8000`.