// Camada de acesso à API da NASA Image and Video Library.
// Documentação: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf

const API_BASE = "https://images-api.nasa.gov";
const PAGE_SIZE = 24;

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`A API respondeu com erro (HTTP ${response.status}).`);
  }
  return response.json();
}

// Converte um item bruto da API para um objeto simples usado pela interface.
function normalizeItem(rawItem) {
  const data = rawItem && rawItem.data && rawItem.data[0];
  if (!data || !data.nasa_id) return null;

  const previewLink = (rawItem.links || []).find((link) => link.render === "image" || link.rel === "preview");

  return {
    id: data.nasa_id,
    title: data.title || "",
    description: data.description || data.description_508 || "",
    date: data.date_created || "",
    center: data.center || "",
    author: data.photographer || data.secondary_creator || "",
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    thumbnail: previewLink ? toHttps(previewLink.href) : ""
  };
}

function toHttps(url) {
  return typeof url === "string" ? url.replace(/^http:\/\//i, "https://") : "";
}

// Pesquisa imagens por termo. Retorna { items, hasMore, total }.
async function searchImages(term, page) {
  const url = `${API_BASE}/search?q=${encodeURIComponent(term)}` +
    `&media_type=image&page_size=${PAGE_SIZE}&page=${page}`;

  const json = await fetchJson(url);
  const collection = json.collection || {};
  const items = (collection.items || []).map(normalizeItem).filter(Boolean);
  const hasMore = (collection.links || []).some((link) => link.rel === "next");
  const metadata = collection.metadata || {};

  return {
    items,
    hasMore,
    total: typeof metadata.total_hits === "number" ? metadata.total_hits : items.length
  };
}

// Busca a URL da imagem ampliada de um item (tenta ~large, ~medium, ~orig...).
async function getLargeImageUrl(nasaId) {
  const json = await fetchJson(`${API_BASE}/asset/${encodeURIComponent(nasaId)}`);
  const files = ((json.collection && json.collection.items) || [])
    .map((entry) => entry.href)
    .filter((href) => typeof href === "string" && /\.(jpe?g|png|gif|webp)$/i.test(href));

  const preferences = ["~large", "~medium", "~orig", "~small"];
  for (const suffix of preferences) {
    const found = files.find((href) => href.includes(suffix));
    if (found) return toHttps(found);
  }
  return files.length ? toHttps(files[0]) : "";
}