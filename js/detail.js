// Modal de detalhes da imagem.
// Usa funções de ui.js (valueOrFallback, parseDate, setImageWithFallback)
// e de api.js (getLargeImageUrl).

const detailEls = {
    dialog: document.getElementById("detail-dialog"),
    close: document.getElementById("detail-close"),
    title: document.getElementById("detail-title"),
    image: document.getElementById("detail-image"),
    imageNote: document.getElementById("detail-image-note"),
    date: document.getElementById("detail-date"),
    center: document.getElementById("detail-center"),
    author: document.getElementById("detail-author"),
    id: document.getElementById("detail-id"),
    description: document.getElementById("detail-description"),
    keywords: document.getElementById("detail-keywords")
};

let detailRequestId = 0;
let lastDetailTrigger = null;

// Remove tags HTML (as descrições da NASA às vezes trazem links e tags).
function stripHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    return (doc.body.textContent || "").trim();
}

function formatFullDate(isoDate) {
    const date = parseDate(isoDate);
    if (!date) return NOT_INFORMED;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

// Preenche a descrição em parágrafos (texto puro, sem HTML).
function renderDescription(container, rawDescription) {
    container.replaceChildren();
    const text = stripHtml(rawDescription);
    if (!text) {
        const p = document.createElement("p");
        p.textContent = "Descrição não informada.";
        container.append(p);
        return;
    }
    text.split(/\n+/).filter(Boolean).forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        container.append(p);
    });
}

function renderKeywords(list, keywords) {
    list.replaceChildren();
    const valid = (keywords || []).map((k) => valueOrFallback(k, "")).filter(Boolean);
    if (valid.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nenhuma palavra-chave informada";
        list.append(li);
        return;
    }
    valid.forEach((keyword) => {
        const li = document.createElement("li");
        li.textContent = keyword;
        list.append(li);
    });
}

// Abre o detalhe de uma imagem.
async function openDetail(item, trigger) {
    const requestId = ++detailRequestId;
    lastDetailTrigger = trigger;

    detailEls.title.textContent = valueOrFallback(item.title, "Sem título");
    detailEls.date.textContent = formatFullDate(item.date);
    detailEls.center.textContent = valueOrFallback(item.center);
    detailEls.author.textContent = valueOrFallback(item.author);
    detailEls.id.textContent = valueOrFallback(item.id);
    renderDescription(detailEls.description, item.description);
    renderKeywords(detailEls.keywords, item.keywords);

    detailEls.image.alt = `Imagem ampliada: ${detailEls.title.textContent}`; // ← corrigido (crases)
    setImageWithFallback(detailEls.image, item.thumbnail);
    detailEls.imageNote.textContent = "Carregando versão ampliada…";

    if (!detailEls.dialog.open) detailEls.dialog.showModal();
    detailEls.close.focus();

    try {
        const largeUrl = await getLargeImageUrl(item.id);
        if (requestId !== detailRequestId) return; // resposta antiga: descartar
        if (largeUrl) {
            setImageWithFallback(detailEls.image, largeUrl);
            detailEls.imageNote.textContent = "";
        } else {
            detailEls.imageNote.textContent = "Versão ampliada indisponível. Exibindo a miniatura.";
        }
    } catch (error) {
        if (requestId !== detailRequestId) return;
        detailEls.imageNote.textContent = "Não foi possível carregar a versão ampliada. Exibindo a miniatura.";
        console.error(error);
    }
}

function closeDetail() {
    detailEls.dialog.close();
}

detailEls.close.addEventListener("click", closeDetail);

// Clique no fundo (fora da caixa) fecha o diálogo.
detailEls.dialog.addEventListener("click", (event) => {
    if (event.target === detailEls.dialog) closeDetail();
});

// Ao fechar (botão, ESC ou fundo), devolve o foco ao card de origem.
detailEls.dialog.addEventListener("close", () => {
    detailRequestId++;
    if (lastDetailTrigger && document.contains(lastDetailTrigger)) lastDetailTrigger.focus();
});