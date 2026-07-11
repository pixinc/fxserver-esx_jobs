# Build with Carlyto — Website

Single-page static site for the **Build with Carlyto** project.

> Don't invest in a company. Build with the entrepreneur.

## Contents

- `index.html` — the entire site: markup, styles, and scripts in one self-contained file. No build step, no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
npx serve build-with-carlyto
# or
python3 -m http.server -d build-with-carlyto 8000
```

## Notes

- Single deliberate theme: white ground, near-black text, amber accent.
- Uses system fonts only (Charter/Georgia for text, system monospace for labels), so it renders identically offline and needs no font CDN.
- The primary call-to-action button is a placeholder (`Get the collection — coming soon`); point it at the mint/marketplace URL when available.
- The builder section contains a portrait placeholder (`.portrait .frame`); replace the inner `<span>` with `<img src="portrait.jpg" alt="Carlyto — portrait, lower face">` once the photo is ready.
