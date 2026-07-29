/* ==========================================================================
   My Library — application logic
   ========================================================================== */

const STORAGE_KEY = "uk_library_catalog";

const DEFAULT_BOOKS = [
  { id: 101, title: "Nineteen Eighty-Four", author: "George Orwell", genre: "Fiction", year: 1949, isbn: "978-0141036144", shelfmark: "A-01", status: "available", borrower: "Matthew" },
  { id: 102, title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", year: 1813, isbn: "978-0141439518", shelfmark: "A-02", status: "available", borrower: "Emma" },
  { id: 103, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, isbn: "978-0261102217", shelfmark: "B-03", status: "loaned", borrower: "Marta" },
  { id: 104, title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", year: 1988, isbn: "978-0553380163", shelfmark: "C-04", status: "available", borrower: "James" },
  { id: 105, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", year: 1925, isbn: "978-0743273565", shelfmark: "A-05", status: "available", borrower: "Olivia" },
  { id: 106, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", year: 1960, isbn: "978-0061120084", shelfmark: "A-06", status: "loaned", borrower: "John" },
  { id: 107, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", year: 1951, isbn: "978-0316769488", shelfmark: "A-07", status: "available", borrower: "Marco" },
  { id: 108, title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1954, isbn: "978-0261102385", shelfmark: "B-08", status: "available", borrower: "Andrea" },    
  { id: 109, title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", year: 2003, isbn: "978-0307474278", shelfmark: "D-09", status: "available", borrower: "Sophie" },
  { id: 110, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", year: 1988, isbn: "978-0061122415", shelfmark: "A-10", status: "available", borrower: "Lucas" },
  { id: 111, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", year: 2005, isbn: "978-0307949486", shelfmark: "E-11", status: "available", borrower: "Isabella" },
  { id: 112, title: "The Hunger Games", author: "Suzanne Collins", genre: "Dystopian", year: 2008, isbn: "978-0439023528", shelfmark: "F-12", status: "available", borrower: "Liam" },
  { id: 113, title: "The Fault in Our Stars", author: "John Green", genre: "Young Adult", year: 2012, isbn: "978-0142424179", shelfmark: "G-13", status: "available", borrower: "Maria" },
  { id: 114, title: "The Shining", author: "Stephen King", genre: "Horror", year: 1977, isbn: "978-0307743657", shelfmark: "H-14", status: "available", borrower: "Siro" },
  { id: 115, title: "The Chronicles of Narnia", author: "C.S. Lewis", genre: "Fantasy", year: 1950, isbn: "978-0066238500", shelfmark: "B-15", status: "available", borrower: "Doirean" },
  { id: 116, title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction", year: 2003, isbn: "978-1594631931", shelfmark: "A-16", status: "available", borrower: "Ahmed" },
  { id: 117, title: "The Book Thief", author: "Markus Zusak", genre: "Historical Fiction", year: 2005, isbn: "978-0375842207", shelfmark: "I-17", status: "available", borrower: "Lena" },
  { id: 118, title: "The Road", author: "Cormac McCarthy", genre: "Post-Apocalyptic", year: 2006, isbn: "978-0307387899", shelfmark: "J-18", status: "available", borrower: "Thomas" },
  { id: 119, title: "The Handmaid's Tale", author: "Margaret Atwood", genre: "Dystopian", year: 1985, isbn: "978-0385490818", shelfmark: "K-19", status: "available", borrower: "Sarah" },
  { id: 120, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", genre: "Science Fiction", year: 1979, isbn: "978-0345391803", shelfmark: "L-20", status: "available", borrower: "David" },
  { id: 121, title: "The Picture of Dorian Gray", author: "Oscar Wilde", genre: "Fiction", year: 1890, isbn: "978-0141439570", shelfmark: "A-21", status: "available", borrower: "" },
  { id: 122, title: "The Color Purple", author: "Alice Walker", genre: "Fiction", year: 1982, isbn: "978-0156028356", shelfmark: "A-22", status: "available", borrower: "" },
  { id: 123, title: "The Bell Jar", author: "Sylvia Plath", genre: "Fiction", year: 1963, isbn: "978-0060837020", shelfmark: "A-23", status: "available", borrower: "" },
  { id: 124, title: "The Secret Garden", author: "Frances Hodgson Burnett", genre: "Children's Literature", year: 1911, isbn: "978-0064401883", shelfmark: "M-24", status: "available", borrower: "" },
  { id: 125, title: "The Odyssey", author: "Homer", genre: "Epic Poetry", year: -800, isbn: "978-0140268867", shelfmark: "N-25", status: "available", borrower: "" },
  { id: 126, title: "The Iliad", author: "Homer", genre: "Epic Poetry", year: -750, isbn: "978-0140275360", shelfmark: "N-26", status: "available", borrower: "Ravi" },
  { id: 127, title: "The Divine Comedy", author: "Dante Alighieri", genre: "Epic Poetry", year: 1320, isbn: "978-0140448955", shelfmark: "O-27", status: "available", borrower: "" },
  { id: 128, title: "The Canterbury Tales", author: "Geoffrey Chaucer", genre: "Poetry", year: 1400, isbn: "978-0140424386", shelfmark: "P-28", status: "available", borrower: "" },
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

/* Fill in fields older records may be missing, and coerce types. */
function normalise(book) {
  const year = parseInt(book.year, 10);
  return {
    id: book.id ?? Date.now(),
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
    id: $("#fieldId").value ? Number($("#fieldId").value) : Date.now(),
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

renderUI();