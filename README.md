# My Library

A personal book catalogue that runs entirely in the browser. No server, no build
step, no dependencies to install — open `index.html` and start cataloguing.

Books are stored in the browser's `localStorage` and can be exported to, or
restored from, a JSON file.

Since this was my first project written in JavaScript, it wasn’t easy for me to work 
directly with the code. I tried to start with the pseudocode, first focusing on 
defining the logic of the different functions required.
I then used AI to support me with the actual implementation of the JavaScript code.

## Features

- **Catalogue** — add, edit and delete books with title, author, genre, year,
  ISBN and shelfmark
- **Lending** — mark a book as out on loan and record who has it
- **Search** — by title, author or ISBN
- **Filter and sort** — by genre, by status, ordered by title, author or year
- **Statistics** — totals for books on the shelf, on loan, and distinct genres
- **Export** — download the whole catalogue as a dated JSON file
- **Import** — load a JSON file in one of three modes:
  - *Update and add* — overwrite books already on the shelf, add the new ones
  - *Add new only* — leave existing books untouched
  - *Replace everything* — discard the current catalogue

## Getting started

Download the three files into the same folder:

```
my-library/
├── index.html
├── style.css
└── app.js
```


## Project structure

| File | Contents |
|---|---|
| `index.html` | Page structure, form and dialogs |
| `style.css` | Design tokens and all custom styling |
| `app.js` | State, persistence, rendering and event handling |


## Data format

Exported files are a plain JSON array. The same shape is accepted on import,
and an object wrapping the array under a `books` key works too.

```json
[
  {
    "id": 101,
    "title": "Nineteen Eighty-Four",
    "author": "George Orwell",
    "genre": "Fiction",
    "year": 1949,
    "isbn": "978-0141036144",
    "shelfmark": "A-01",
    "status": "available",
    "borrower": ""
  }
]
```

Every field except `title` and `author` is optional — missing values are filled
in on import. `status` is either `available` or `loaned`.

On import, two books count as the same book when **title and author match**,
ignoring case. Correcting a title in the file therefore produces a new entry
rather than an update.

## Known limitations

- Data lives in one browser on one machine. Clearing browsing data, switching
  browser or using private mode will lose it — **export regularly**.
- Roughly 5 MB of storage, which is thousands of books but not unlimited.
- No cover images, no reading progress, no multi-user support.

## Pseudocode 

## 1. Constants and global state

```
CONSTANT STORAGE_KEY ← "uk_library_catalog"
CONSTANT DEFAULT_BOOKS ← list of 3 sample books

FUNCTION $(selector)
    RETURN the first element on the page matching the selector

VARIABLE books ← loadData()          // the working list, held in memory
VARIABLE state ← { search: "", genre: "", status: "", sortBy: "title" }
```

`books` is the single source of truth: everything else — cards, statistics,
filter options — is recomputed from it.

## 2. Persistence

```
FUNCTION loadData()
    TRY
        text ← read STORAGE_KEY from browser storage
        IF text is empty
            data ← nothing
        ELSE
            data ← parse text into a structure

        IF data is NOT a list
            RETURN a copy of DEFAULT_BOOKS

        RETURN every element of data passed through normalise()
    ON FAILURE
        RETURN a copy of DEFAULT_BOOKS

FUNCTION saveData()
    TRY
        serialise books to text and write it to STORAGE_KEY
    ON FAILURE
        notify("changes could not be saved to this browser")

## 3. Identifiers and normalisation

```
VARIABLE idCounter ← 0

FUNCTION makeId()
    RETURN current_timestamp concatenated with idCounter
    increment idCounter          // prevents duplicate ids within one millisecond

FUNCTION normalise(book)
    RETURN a new object where:
        id        ← book.id if it is a number, otherwise makeId()
        title     ← text, trimmed
        author    ← text, trimmed
        genre     ← text, trimmed
        year      ← whole number, or nothing if not convertible
        isbn      ← text, trimmed
        shelfmark ← text, trimmed
        status    ← "loaned" only if it equals "loaned", otherwise "available"
        borrower  ← text, trimmed
```

## 3. Identifiers and normalisation

```
VARIABLE idCounter ← 0

FUNCTION makeId()
    RETURN current_timestamp concatenated with idCounter
    increment idCounter          // prevents duplicate ids within one millisecond

FUNCTION normalise(book)
    RETURN a new object where:
        id        ← book.id if it is a number, otherwise makeId()
        title     ← text, trimmed
        author    ← text, trimmed
        genre     ← text, trimmed
        year      ← whole number, or nothing if not convertible
        isbn      ← text, trimmed
        shelfmark ← text, trimmed
        status    ← "loaned" only if it equals "loaned", otherwise "available"
        borrower  ← text, trimmed
```

`normalise` is the funnel: **every** book entering the application goes through
it, whether it comes from storage, from the form, or from an imported file.

---

## 4. Helpers

```
FUNCTION escapeHtml(value)
    replace & < > " ' with their HTML entities
    RETURN the result          // defence against code injection

FUNCTION compareBooks(a, b)
    IF sortBy is "year"
        IF both years are equal
            RETURN alphabetical comparison of titles
        books without a year sort last
        RETURN b.year − a.year          // newest first
    ELSE
        RETURN alphabetical comparison of the chosen field

FUNCTION getVisibleBooks()
    q ← state.search in lower case

    filtered ← books for which all three hold:
        q is empty OR q appears in title, author or isbn
        state.genre  is empty OR matches the book's genre
        state.status is empty OR matches the book's status

    RETURN filtered, sorted with compareBooks

FUNCTION notify(message)
    write the message into the toast and show it
```

---

## 5. Rendering

```
FUNCTION renderStats()
    onLoan ← how many books have status "loaned"
    display: total, total − onLoan, onLoan, number of distinct genres

FUNCTION renderGenreFilter()
    genres ← sorted list of the genres in use, without repeats
    IF the selected genre no longer exists → clear that filter
    fill the genre dropdown and the form's datalist

FUNCTION cardTemplate(book)
    RETURN the HTML text of one card containing:
        spine showing the shelfmark
        title, author, genre · year, isbn
        badge reading "on loan" or "on shelf"
        IF on loan and a name is set → line reading "with <name>"
        three buttons: lend/return, edit, delete
    every field passes through escapeHtml

FUNCTION renderUI()
    renderStats()
    renderGenreFilter()

    visible ← getVisibleBooks()
    fill the grid with cardTemplate applied to each element
    update the "showing X of Y" counter

    IF visible is empty
        show the empty state
        IF any filter is active → "no matches" text + clear-filters button
        ELSE                     → "shelf is empty" text + add-book button
    ELSE
        hide the empty state
```

> `renderUI()` redraws **everything** each time. With a few hundred books it is
> instant, and it makes it impossible for the screen and the data to drift apart.

---

## 6. Add and edit form

```
FUNCTION openModal(book)
    clear the form
    IF book exists
        dialog title ← "Edit book"
        fill every field from the book
    ELSE
        dialog title ← "New book"
        id field ← empty            // this is what distinguishes the two cases
    syncBorrowerField()
    show the dialog

FUNCTION syncBorrowerField()
    show the "lent to" field only when status is "loaned"
    otherwise clear and hide it

WHEN the form is submitted
    prevent the page from reloading
    IF required fields are invalid
        highlight the errors and stop

    record ← normalise(values collected from the fields)

    position ← index in books of the book with the same id
    IF not found
        append record to books
    ELSE
        replace books[position] with record

    saveData(); renderUI(); close the dialog; notify(...)
```

---

## 7. Toolbar and card actions

```
WHEN typing in the search box   → state.search ← value; renderUI()
WHEN the genre filter changes   → state.genre  ← value; renderUI()
WHEN the status filter changes  → state.status ← value; renderUI()
WHEN the sort order changes     → state.sortBy ← value; renderUI()

WHEN "add book" is pressed      → openModal(nothing)
WHEN "clear filters" is pressed → reset the three filters; renderUI()

WHEN a click lands inside the grid
    button ← the clicked element, or the button containing it
    IF it is not a button carrying an action → stop

    book ← the book whose id the button names
    IF it does not exist → stop

    ACCORDING TO the action:
        "edit"   → openModal(book)
        "toggle" → flip the book's status
                   if it becomes available, clear the borrower's name
                   saveData(); renderUI(); notify(...)
        "delete" → ask for confirmation; if yes, remove the book from books
                   saveData(); renderUI(); notify(...)
```

> One listener on the whole grid, not one per button: the cards are rebuilt on
> every `renderUI()`, and listeners attached to individual cards would vanish
> with them. This pattern is called *event delegation*.

---

## 8. Export

```
WHEN "export JSON" is pressed
    IF books is empty
        notify("nothing to export"); stop

    text ← books serialised as readable JSON
    create a temporary in-memory file from that text
    create an invisible link pointing at it
    file name ← "my-library-<today's date>.json"
    simulate a click on the link          // starts the download
    remove the link and release the memory
    notify("exported N books")
```

---

## 9. Import

### 9.1 Reading and validation

```
FUNCTION looksLikeBook(value)
    RETURN true if value is an object
           and has at least a non-empty title or author

FUNCTION fingerprint(book)
    RETURN title + "|" + author, all in lower case
    // the key by which "the same book" is recognised

FUNCTION readFile(file)
    RETURN a promise that
        resolves with the file's text content
        rejects if reading fails

FUNCTION parseCatalogue(text)
    TRY to parse the text into a structure
    ON FAILURE → raise "this is not a valid JSON file"

    list ← the structure itself if it is a list,
           otherwise its "books" field
    IF list is not a list → raise "the file contains no list of books"

    usable ← elements passing looksLikeBook, each through normalise
    IF usable is empty → raise "no readable book was found"
    RETURN usable
```

### 9.2 Comparing against the current catalogue

```
FUNCTION indexByFingerprint()
    RETURN a map   fingerprint → position in books

FUNCTION countOverlap(incoming)
    known ← indexByFingerprint()
    matched ← how many elements of incoming are already in the map
    RETURN { matched, fresh: total − matched }
```

### 9.3 Applying, in the three modes

```
FUNCTION applyImport(incoming, mode)

    IF mode is "replace"
        books ← incoming
        RETURN { added: count, updated: 0 }

    known   ← indexByFingerprint()
    usedIds ← set of ids already in use
    added ← 0 ; updated ← 0

    FOR EACH book IN incoming
        position ← known[fingerprint(book)]

        IF position does not exist                 // a new book
            IF its id is already taken → assign it makeId()
            record the id and the fingerprint
            append the book to books
            added ← added + 1

        ELSE IF mode is "update"                   // a book already on the shelf
            current ← books[position]
            merged ← the incoming book's fields, but with current's id
            IF merged differs from current
                books[position] ← merged
                updated ← updated + 1

        // in "add" mode, books already present are simply skipped

    RETURN { added, updated }

FUNCTION describeResult(outcome)
    build a sentence from the non-zero counts only
    if both are zero → "nothing changed"
```

### 9.4 The interaction flow

```
VARIABLE pendingImport ← nothing     // books read from file, awaiting a choice

WHEN "import JSON" is pressed
    open the file picker

WHEN a file is chosen
    IF no file → stop
    TRY
        incoming ← parseCatalogue(readFile(file))

        IF books is empty                   // there is no decision to make
            applyImport(incoming, "replace")
            saveData(); renderUI(); notify(...)
            stop

        counts ← countOverlap(incoming)
        pendingImport ← incoming
        write the summary into the dialog and show it
    ON FAILURE
        notify(the error's message)
    IN EITHER CASE
        reset the file picker's value
        // otherwise re-choosing the same file fires no event at all

WHEN a click lands inside the import dialog
    button ← the clicked element
    IF it carries no mode, or nothing is pending → stop

    IF mode is "replace" and the user does not confirm → stop

    outcome ← applyImport(pendingImport, mode)
    pendingImport ← nothing
    saveData(); renderUI(); close the dialog; notify(describeResult(outcome))

WHEN the import dialog closes by any means
    pendingImport ← nothing        // never leave data dangling
```

---

## 10. Start-up

```
renderUI()      // last line of the file: draws the initial state
```

---

## The loop that holds it all together

Four steps, repeated identically after every user action:

```
1. change books (or state)
2. saveData()      → write to storage        [skip if only state changed]
3. renderUI()      → redraw from the data
4. notify(...)     → confirm to the user     [when the action warrants it]
```


---



## Author

Siro Corriga
