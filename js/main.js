// Lógica principal: eventos, estado e comunicação entre API e interface.

const els = {
  form: document.getElementById("search-form"),
  input: document.getElementById("search-input"),
  searchButton: document.getElementById("search-button"),
  error: document.getElementById("search-error"),
  status: document.getElementById("status"),
  gallery: document.getElementById("gallery"),
  loadMore: document.getElementById("load-more"),
  retryWrapper: document.getElementById("retry-wrapper"),
  retryButton: document.getElementById("retry-button")
};

const state = {
  term: "",
  page: 1,
  hasMore: false,
  total: 0,
  shown: 0,
  searchRequestId: 0,
  retryAction: null
};

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("is-error", isError);
}

// Mostra o botão "Tentar novamente" guardando a ação a repetir (ou esconde, com null).
function showRetry(action) {
  state.retryAction = action;
  els.retryWrapper.hidden = !action;
}

function showFieldError(message) {
  els.error.textContent = message;
  els.error.hidden = !message;
  els.input.setAttribute("aria-invalid", message ? "true" : "false");
}

// Executa uma pesquisa. Com append=true, acrescenta à galeria existente.
async function runSearch(term, page, append) {
  const requestId = ++state.searchRequestId;

  showRetry(null);
  els.searchButton.disabled = true;
  els.loadMore.disabled = true;
  setStatus(append ? "Carregando mais resultados…" : `Pesquisando por “${term}”…`);
  if (!append) {
    els.gallery.replaceChildren();
    els.loadMore.hidden = true;
    state.shown = 0;
  }

  try {
    const result = await searchImages(term, page);
    if (requestId !== state.searchRequestId) return; // resposta antiga: descartar

    state.term = term;
    state.page = page;
    state.hasMore = result.hasMore;
    state.total = result.total;

    if (!append && result.items.length === 0) {
      setStatus(`Nenhuma imagem encontrada para “${term}”. Tente outro termo, como “moon” ou “galaxy”.`);
      return;
    }

    const fragment = document.createDocumentFragment();
    result.items.forEach((item) => fragment.append(createGalleryCard(item, openDetail)));
    els.gallery.append(fragment);

    state.shown += result.items.length;
    setStatus(`Exibindo ${state.shown} de ${state.total} imagens para “${term}”.`);
    els.loadMore.hidden = !state.hasMore;
  } catch (error) {
    if (requestId !== state.searchRequestId) return;
    setStatus("Não foi possível carregar as imagens. Verifique sua conexão e tente novamente.", true);
    showRetry(() => runSearch(term, page, append));
    els.loadMore.hidden = !(append && state.hasMore);
    console.error(error);
  } finally {
    if (requestId === state.searchRequestId) {
      els.searchButton.disabled = false;
      els.loadMore.disabled = false;
    }
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const term = els.input.value.trim();
  if (!term) {
    showFieldError("Digite um tema para pesquisar.");
    els.input.focus();
    return;
  }
  showFieldError("");
  runSearch(term, 1, false);
}

function handleLoadMore() {
  if (state.hasMore) runSearch(state.term, state.page + 1, true);
}

els.form.addEventListener("submit", handleSubmit);
els.input.addEventListener("input", () => showFieldError(""));
els.loadMore.addEventListener("click", handleLoadMore);
els.retryButton.addEventListener("click", () => state.retryAction && state.retryAction());