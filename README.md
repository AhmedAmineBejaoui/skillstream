# SkillStream — TypeScript Backend

An Express-based backend project organized around API development, database access and supporting integrations.

## Technology stack

- **Language/runtime:** TypeScript, Node.js
- **API:** Express
- **Database:** MySQL via `mysql2`
- **Validation and security libraries:** Zod, Helmet, rate limiting, bcrypt, JSON Web Tokens
- **Integrations present in dependencies:** Stripe, Nodemailer
- **API documentation tooling:** Swagger JSDoc and Swagger UI
- **Build tooling:** esbuild, TypeScript

## Getting started

**Requirements:** Node.js, npm and a configured MySQL instance.

```bash
git clone https://github.com/AhmedAmineBejaoui/skillstream.git
cd skillstream
npm install
```

Create a local `.env` with the required application and database settings. **Do not reuse any credentials found in version-controlled files; rotate any previously exposed secrets.**

```bash
npm run dev
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development backend via nodemon |
| `npm run build` | Bundle backend into `dist/` with esbuild |
| `npm start` | Run compiled backend with production environment |
| `npm run check` | Run TypeScript type checking |
| `npm run schema:verify` | Verify database schema |
| `npm run schema:check` | Run schema checks |
| `npm run docs:serve` | Start API docs server |

## Project structure

- `server/` — Express backend
- `shared/` — shared definitions
- `uploads/`, `videos/` — repository directories for media-related assets

## Review notes

The presence of a dependency does **not** guarantee a fully configured, deployed integration. Test authentication, payments and data handling before any public deployment.

**Author:** [Ahmed Amin Bejaoui](https://github.com/AhmedAmineBejaoui)
