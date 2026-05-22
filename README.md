# Akiba live

## X auto posting

New articles pushed to `main` are posted after GitHub Pages deploy.

Set these GitHub Secrets for the X app connected to `@akiba_live_`:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

Local dry run:

```sh
pnpm tweet:new -- --dry-run --slug article-slug
```
