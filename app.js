/* ==========================================================================
   My Library — application logic
   ========================================================================== */

const STORAGE_KEY = "uk_library_catalog";

const DEFAULT_BOOKS = [
  { id: 101, title: "Nineteen Eighty-Four", author: "George Orwell", genre: "Fiction", year: 1949, isbn: "978-0141036144", shelfmark: "A-01", status: "available", borrower: "" },
  { id: 102, title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", year: 1813, isbn: "978-0141439518", shelfmark: "A-02", status: "available", borrower: "" },
  { id: 103, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, isbn: "978-0261102217", shelfmark: "B-03", status: "loaned", borrower: "Marta" }
];

const $ = selector => document.querySelector(selector);

/* --------------------------------------------------------------------------
   Storage — never let a blocked or full localStorage break the app
   -------------------------------------------------------------------------- */

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return structuredClone(DEFAULT_BOOKS);
    return parsed.map(normalise);
  } catch {
    return structuredClone(DEFAULT_BOOKS);
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    notify("Changes could not be saved to this browser.");
  }
}

/* Unique id even when several records are created in the same millisecond. */
let idCounter = 0;
const makeId = () => Number(`${Date.now()}${String(idCounter++ % 1000).padStart(3, "0")}`);

/* Fill in fields older records may be missing, and coerce types. */
function normalise(book) {
  const year = parseInt(book.year, 10);
  const id = Number(book.id);
  return {
    id: Number.isFinite(id) ? id : makeId(),
    title: String(book.title ?? "").trim(),
    author: String(book.author ?? "").trim(),
    genre: String(book.genre ?? "").trim(),
    year: Number.isFinite(year) ? year : null,
    isbn: String(book.isbn ?? "").trim(),
    shelfmark: String(book.shelfmark ?? "").trim(),
    status: book.status === "loaned" ? "loaned" : "available",
    borrower: String(book.borrower ?? "").trim()
  };
}

let books = loadData();
const state = { search: "", genre: "", status: "", sortBy: "title" };

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
));

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

function compareBooks(a, b) {
  if (state.sortBy === "year") {
    // Books without a year sort last, newest first otherwise.
    if (a.year === b.year) return collator.compare(a.title, b.title);
    if (a.year === null) return 1;
    if (b.year === null) return -1;
    return b.year - a.year;
  }
  return collator.compare(a[state.sortBy] || "", b[state.sortBy] || "");
}

function getVisibleBooks() {
  const q = state.search.trim().toLowerCase();
  return books.filter(b => {
    const matchesSearch = !q
      || b.title.toLowerCase().includes(q)
      || b.author.toLowerCase().includes(q)
      || b.isbn.toLowerCase().includes(q);
    const matchesGenre = !state.genre || b.genre === state.genre;
    const matchesStatus = !state.status || b.status === state.status;
    return matchesSearch && matchesGenre && matchesStatus;
  }).sort(compareBooks);
}

const toast = new bootstrap.Toast("#notificationToast", { delay: 2600 });

function notify(message) {
  $("#toastMessage").textContent = message;
  toast.show();
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

function renderStats() {
  const loaned = books.filter(b => b.status === "loaned").length;
  $("#statTotal").textContent = books.length;
  $("#statAvailable").textContent = books.length - loaned;
  $("#statLoaned").textContent = loaned;
  $("#statGenres").textContent = new Set(books.map(b => b.genre).filter(Boolean)).size;
}

function renderGenreFilter() {
  const genres = [...new Set(books.map(b => b.genre).filter(Boolean))].sort(collator.compare);
  if (state.genre && !genres.includes(state.genre)) state.genre = "";
  $("#filterGenre").innerHTML = `<option value="">All</option>`
    + genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
  $("#filterGenre").value = state.genre;

  // Same list offered as suggestions inside the form.
  $("#genreOptions").innerHTML = genres.map(g => `<option value="${escapeHtml(g)}">`).join("");
}

function cardTemplate(b) {
  const isLoaned = b.status === "loaned";
  const meta = [b.genre, b.year].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card-book">
        <div class="spine"><span class="shelfmark">${escapeHtml(b.shelfmark || "—")}</span></div>
        <div class="card-body-custom">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h3 class="book-title">${escapeHtml(b.title)}</h3>
            <span class="badge-status ${isLoaned ? "badge-loaned" : "badge-available"}">${isLoaned ? "On loan" : "On shelf"}</span>
          </div>
          <p class="author">${escapeHtml(b.author)}</p>
          <p class="meta">${meta}</p>
          ${isLoaned && b.borrower ? `<p class="meta">With ${escapeHtml(b.borrower)}</p>` : ""}
          ${b.isbn ? `<p class="meta mono">${escapeHtml(b.isbn)}</p>` : ""}
          <div class="card-actions mt-auto pt-2">
            <button class="btn btn-sm btn-outline-gold" data-action="toggle" data-id="${b.id}">
              <i class="bi ${isLoaned ? "bi-arrow-return-left" : "bi-box-arrow-right"} me-1"></i>${isLoaned ? "Return" : "Lend"}
            </button>
            <button class="btn btn-sm btn-link text-secondary text-decoration-none" data-action="edit" data-id="${b.id}">Edit</button>
            <button class="btn btn-sm btn-link text-danger text-decoration-none ms-auto" data-action="delete" data-id="${b.id}">Delete</button>
          </div>
        </div>
      </article>
    </div>`;
}

function renderUI() {
  renderStats();
  renderGenreFilter();

  const visible = getVisibleBooks();
  $("#grid").innerHTML = visible.map(cardTemplate).join("");

  const hasFilters = Boolean(state.search || state.genre || state.status);
  $("#bookCount").textContent = books.length
    ? `Showing ${visible.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`
    : "";

  const empty = visible.length === 0;
  $("#emptyState").classList.toggle("d-none", !empty);
  if (empty) {
    $("#emptyText").textContent = hasFilters
      ? "No books match these filters. Clear them to see the whole shelf."
      : "Your bookshelf is empty.";
    $("#btnNewEmpty").classList.toggle("d-none", hasFilters);
    $("#btnClearFilters").classList.toggle("d-none", !hasFilters);
  }
}

/* --------------------------------------------------------------------------
   Modal — create and edit
   -------------------------------------------------------------------------- */

const bookModal = new bootstrap.Modal("#bookModal");

function openModal(book) {
  $("#bookForm").reset();
  $("#bookForm").classList.remove("was-validated");
  $("#modalTitle").textContent = book ? "Edit book" : "New book";
  $("#fieldId").value = book ? book.id : "";
  $("#fieldTitle").value = book?.title ?? "";
  $("#fieldAuthor").value = book?.author ?? "";
  $("#fieldGenre").value = book?.genre ?? "";
  $("#fieldYear").value = book?.year ?? "";
  $("#fieldIsbn").value = book?.isbn ?? "";
  $("#fieldShelfmark").value = book?.shelfmark ?? "";
  $("#fieldStatus").value = book?.status ?? "available";
  $("#fieldBorrower").value = book?.borrower ?? "";
  syncBorrowerField();
  bookModal.show();
}

/* The borrower name only makes sense for a book that is out. */
function syncBorrowerField() {
  const isLoaned = $("#fieldStatus").value === "loaned";
  $("#borrowerWrap").classList.toggle("d-none", !isLoaned);
  if (!isLoaned) $("#fieldBorrower").value = "";
}

$("#fieldStatus").addEventListener("change", syncBorrowerField);
$("#bookModal").addEventListener("shown.bs.modal", () => $("#fieldTitle").focus());

$("#bookForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const record = normalise({
    id: $("#fieldId").value ? Number($("#fieldId").value) : makeId(),
    title: $("#fieldTitle").value,
    author: $("#fieldAuthor").value,
    genre: $("#fieldGenre").value,
    year: $("#fieldYear").value,
    isbn: $("#fieldIsbn").value,
    shelfmark: $("#fieldShelfmark").value,
    status: $("#fieldStatus").value,
    borrower: $("#fieldBorrower").value
  });

  const index = books.findIndex(b => b.id === record.id);
  if (index === -1) {
    books.push(record);
    notify(`Added “${record.title}”.`);
  } else {
    books[index] = record;
    notify(`Updated “${record.title}”.`);
  }

  saveData();
  renderUI();
  bookModal.hide();
});

/* --------------------------------------------------------------------------
   Toolbar and card actions
   -------------------------------------------------------------------------- */

$("#search").addEventListener("input", e => { state.search = e.target.value; renderUI(); });
$("#filterGenre").addEventListener("change", e => { state.genre = e.target.value; renderUI(); });
$("#filterStatus").addEventListener("change", e => { state.status = e.target.value; renderUI(); });
$("#sortBy").addEventListener("change", e => { state.sortBy = e.target.value; renderUI(); });

$("#btnNew").addEventListener("click", () => openModal(null));
$("#btnNewEmpty").addEventListener("click", () => openModal(null));

$("#btnClearFilters").addEventListener("click", () => {
  state.search = "";
  state.genre = "";
  state.status = "";
  $("#search").value = "";
  $("#filterStatus").value = "";
  renderUI();
});

$("#grid").addEventListener("click", e => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (button.dataset.action === "edit") {
    openModal(book);
  } else if (button.dataset.action === "toggle") {
    book.status = book.status === "loaned" ? "available" : "loaned";
    if (book.status === "available") book.borrower = "";
    saveData();
    renderUI();
    notify(book.status === "loaned" ? `“${book.title}” is on loan.` : `“${book.title}” is back on the shelf.`);
  } else if (button.dataset.action === "delete") {
    if (!confirm(`Remove “${book.title}” from the catalogue?`)) return;
    books = books.filter(b => b.id !== id);
    saveData();
    renderUI();
    notify(`Removed “${book.title}”.`);
  }
});

/* --------------------------------------------------------------------------
   Export
   -------------------------------------------------------------------------- */

$("#btnExport").addEventListener("click", () => {
  if (!books.length) {
    notify("There is nothing to export yet.");
    return;
  }
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `my-library-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify(`Exported ${books.length} ${books.length === 1 ? "book" : "books"}.`);
});

/* --------------------------------------------------------------------------
   Import
   -------------------------------------------------------------------------- */

/* A record is usable only if it has at least a title or an author. */
const looksLikeBook = value =>
  value && typeof value === "object" && !Array.isArray(value)
  && (String(value.title ?? "").trim() || String(value.author ?? "").trim());

/* Same title + same author = same book, regardless of id. */
const fingerprint = b => `${b.title.toLowerCase()}|${b.author.toLowerCase()}`;

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsText(file);
  });
}

function parseCatalogue(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This is not a valid JSON file.");
  }
  // Accept both a bare array and an object wrapping one, e.g. { books: [...] }.
  const list = Array.isArray(data) ? data : data?.books;
  if (!Array.isArray(list)) throw new Error("The file does not contain a list of books.");

  const usable = list.filter(looksLikeBook).map(normalise);
  if (!usable.length) throw new Error("No readable book was found in the file.");
  return usable;
}

/* Index of what is already on the shelf, keyed by fingerprint. */
function indexByFingerprint() {
  const map = new Map();
  books.forEach((book, position) => map.set(fingerprint(book), position));
  return map;
}

function countOverlap(incoming) {
  const known = indexByFingerprint();
  const matched = incoming.filter(b => known.has(fingerprint(b))).length;
  return { matched, fresh: incoming.length - matched };
}

/* mode: "replace" wipes first, "add" skips known books, "update" overwrites them. */
function applyImport(incoming, mode) {
  if (mode === "replace") {
    books = incoming;
    return { added: incoming.length, updated: 0 };
  }

  const known = indexByFingerprint();
  const usedIds = new Set(books.map(b => b.id));
  let added = 0, updated = 0;

  for (const book of incoming) {
    const position = known.get(fingerprint(book));

    if (position === undefined) {
      if (usedIds.has(book.id)) book.id = makeId();
      usedIds.add(book.id);
      known.set(fingerprint(book), books.length);
      books.push(book);
      added++;
    } else if (mode === "update") {
      // Keep the existing id so edits and deletions still target the right card.
      const current = books[position];
      const merged = { ...book, id: current.id };
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        books[position] = merged;
        updated++;
      }
    }
  }
  return { added, updated };
}

function describeResult({ added, updated }) {
  const parts = [];
  if (added) parts.push(`${added} added`);
  if (updated) parts.push(`${updated} updated`);
  return parts.length ? `Import complete: ${parts.join(", ")}.` : "Nothing changed.";
}

/* --------------------------------------------------------------------------
   Import — file picker, then the three-way dialog
   -------------------------------------------------------------------------- */

const importModal = new bootstrap.Modal("#importModal");
let pendingImport = null;

$("#btnImport").addEventListener("click", () => $("#fileImport").click());

$("#fileImport").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const incoming = parseCatalogue(await readFile(file));

    // Empty shelf: no decision to make.
    if (!books.length) {
      const result = applyImport(incoming, "replace");
      saveData();
      renderUI();
      notify(describeResult(result));
      return;
    }

    const { matched, fresh } = countOverlap(incoming);
    pendingImport = incoming;
    $("#importSummary").textContent =
      `${file.name} contains ${incoming.length} ${incoming.length === 1 ? "book" : "books"}: `
      + `${matched} already on your shelf, ${fresh} new. How should they be applied?`;
    importModal.show();
  } catch (error) {
    notify(error.message);
  } finally {
    // Reset, otherwise re-selecting the same file fires no change event.
    e.target.value = "";
  }
});

$("#importModal").addEventListener("click", e => {
  const button = e.target.closest("button[data-mode]");
  if (!button || !pendingImport) return;

  const mode = button.dataset.mode;
  if (mode === "replace" && !confirm(`Discard the ${books.length} books currently on the shelf?`)) return;

  const result = applyImport(pendingImport, mode);
  pendingImport = null;
  saveData();
  renderUI();
  importModal.hide();
  notify(describeResult(result));
});

$("#importModal").addEventListener("hidden.bs.modal", () => { pendingImport = null; });


renderUI();