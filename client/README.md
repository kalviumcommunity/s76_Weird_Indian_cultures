# Cultura Connect (Next.js)

This directory now houses the Cultura Connect frontend powered by **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. It mirrors the original Vite experience but leverages Next.js routing, server/client component boundaries, and TypeScript safety.

## Getting started

```bash
cd client
npm install
npm run dev
```

The development server runs on `http://localhost:3000`.

## Environment variables

The API base URL defaults to `http://localhost:5000`. Override it by creating a `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-host
```

If your media assets are hosted on a different domain, update `next.config.ts` to allow that host under the `images.remotePatterns` section.

## Available pages

- `/` – Landing page with animated hero and slideshow
- `/home` – Culture feed with filters, likes, and comments
- `/form` & `/form/[id]` – Create (and future edit) cultural entries
- `/login` and `/signup` – Authentication flows

## Scripts

- `npm run dev` – Start Next.js in development mode
- `npm run build` – Create an optimized production build
- `npm run start` – Run the production server
- `npm run lint` – Lint the project with Next.js rules
