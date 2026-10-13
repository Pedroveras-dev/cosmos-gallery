// Funções de apresentação: formatação de dados e criação de elementos.

const NOT_INFORMED = "Não informado";

const IMAGE_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#dfe5f1"/>' +
  '<text x="200" y="155" font-family="sans-serif" font-size="20" fill="#3d4b6b" text-anchor="middle">' +
  'Imagem indisponível</text></svg>'
);

// Retorna o valor como texto limpo ou o texto padrão quando estiver ausente.
function valueOrFallback(value, fallback = NOT_INFORMED) {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text === "" ? fallback : text;
}

function parseDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatYear(isoDate) {
  const date = parseDate(isoDate);
  return date ? String(date.getUTCFullYear()) : "Data não informada";
}

// Define o src de uma imagem e troca por um placeholder se falhar.
function setImageWithFallback(img, src) {
  img.onerror = () => {
    img.onerror = null; // evita laço infinito
    img.src = IMAGE_PLACEHOLDER;
  };
  img.src = src || IMAGE_PLACEHOLDER;
}

// Cria um item da galeria (<li> com botão).
function createGalleryCard(item, onSelect) {
  const title = valueOrFallback(item.title, "Sem título");

  const li = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-button";
  button.setAttribute("aria-label", `Ver detalhes: ${title}`);

  const img = document.createElement("img");
  img.alt = `Miniatura: ${title}`;
  img.loading = "lazy";
  setImageWithFallback(img, item.thumbnail);

  const text = document.createElement("div");
  text.className = "card-text";

  const heading = document.createElement("p");
  heading.className = "card-title";
  heading.textContent = title;

  const date = document.createElement("p");
  date.className = "card-date";
  date.textContent = formatYear(item.date);

  text.append(heading, date);
  button.append(img, text);
  button.addEventListener("click", () => onSelect(item, button));
  li.append(button);
  return li;
}