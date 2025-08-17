# Schema Checks

This folder provides automated verification of the MySQL schema against the project specification.

## Usage
1. Set environment variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to point to the read-only database.
2. Run `npm run schema:check` from the repository root.
3. Reports are generated in `server/db/checks/schema_report.json` and `server/db/checks/schema_report.md`.
4. Raw snapshots for each table are saved under `server/db/checks/snapshots/`.

The script performs only read operations and does not alter the database.
