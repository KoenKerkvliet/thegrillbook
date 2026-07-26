# VUUR — kook je eigen shit

Sociaal, besloten kookboek voor BBQ-liefhebbers. Log je eigen recepten (foto, ingrediënten,
stappen, sterren, privénotities), hou ze privé of deel ze met je Collega chefs, en volg wie kan
koken.

## Stack

- Vite + React + TypeScript, Tailwind CSS v4
- Supabase (Postgres + Auth + Storage), toegang via Row Level Security
- Gehost op GitHub Pages via GitHub Actions

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # vul VITE_SUPABASE_URL en VITE_SUPABASE_PUBLISHABLE_KEY in
npm run dev
```

## Deployen

Elke push naar `main` bouwt de site en publiceert 'm naar GitHub Pages via
`.github/workflows/deploy.yml`. Eenmalig instellen in de GitHub-repo:

1. **Settings → Pages** → Source: **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → voeg toe:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

De site draait op `https://<gebruiker>.github.io/thegrillbook/` tot er een custom domain
gekoppeld wordt (dan verandert `base` in `vite.config.ts` naar `/`, en komt er een `public/CNAME`
bestand bij).
