# Profile art generator

This folder builds the animated SVGs for the `neuraljatin` GitHub profile README. Nothing here talks to third-party stats or snake services. Animations are CSS `@keyframes` inside each SVG (GitHub strips JavaScript).

## Generate locally

```bash
npm run generate          # sample data, labelled SAMPLE
npm run generate:live     # fetch stats, then render
npm run validate
```

Portrait options (the photo itself is never written into the repo):

```bash
node scripts/generate-all.js --sample --mark NJ    # default
node scripts/generate-all.js --sample --mark JB
node scripts/generate-all.js --sample --photo /path/to/face.jpg
```

Photo mode needs Python 3 and Pillow. Switch palettes with `THEME=teal npm run generate` (see `theme.json`). The default theme is `yellow_blue`.

## Daily Action

`.github/workflows/refresh.yml` runs once a day (and on `workflow_dispatch`). It uses only `GITHUB_TOKEN`, writes no GitHub API data, and commits only generated `*_dark.svg` / `*_light.svg` files.

Private contributions appear only if you enable **Include private contributions on my profile** in GitHub settings, and only if the token can see them.

## Manual achievements

Edit `achievements.json` to fill up to three confirmed slots. Leave titles empty to hide them. Do not invent entries.
