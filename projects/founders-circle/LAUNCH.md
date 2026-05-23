# Founders' Circle Launch Notes

## Freedom Unchained placement

This project now lives inside the Freedom Unchained site at:

- `projects/founders-circle/index.html`

The existing Freedom Unchained project link at `projects/founders-circle.html` redirects into this folder.

If this folder is published on a static host, the pages will load and the forms can still work in the visitor's browser, but applications, bookings, admin availability, and date overrides will not be shared across people or saved server-side. For the alignment-call calendar to work properly online, deploy this folder as the Node app described below.

## Local production-style run

```bash
npm install
ADMIN_PASSWORD="choose-a-private-password" npm start
```

Then open:

- Public site: `http://localhost:4173`
- Apply page: `http://localhost:4173/apply.html`
- Admin availability: `http://localhost:4173/admin-availability.html`

## Required production settings

Set these environment variables on the host:

- `ADMIN_PASSWORD`: protects the admin availability page and availability-editing API routes.
- `DATA_DIR`: optional path for saved data. Use a persistent disk/path on the host.

The app stores applications, bookings, availability, and date overrides in `data/store.json` by default.

## Suggested first launch host

Use a Node host that supports persistent storage, such as Render, Railway, Fly.io, or a small VPS. Static-only hosts are not enough because availability and bookings must be shared and saved server-side.
