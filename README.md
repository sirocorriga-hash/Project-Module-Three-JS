# My Library

A personal book catalogue that runs entirely in the browser. No server, no build
step, no dependencies to install — open `index.html` and start cataloguing.

Books are stored in the browser's `localStorage` and can be exported to, or
restored from, a JSON file.

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

## Author

Siro Corriga
