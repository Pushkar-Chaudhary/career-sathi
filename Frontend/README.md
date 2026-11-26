# Career Sathi frontend

The Vite and React client lives in `src/`. It uses React Router for navigation and a shared Axios client for the Express API. In local development, API requests default to `http://localhost:3000`; set `VITE_API_URL` in `Frontend/.env.local` only when the API is hosted at a different origin. Production uses same-origin `/api` requests.

From the repository root, run `npm run dev` to start both services. From this directory, use `npm run dev` to start only Vite, `npm run lint` to lint the client, and `npm run build` to create the production bundle.
