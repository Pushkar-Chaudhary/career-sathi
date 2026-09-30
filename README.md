# Career Sathi

Career Sathi is a React frontend and Express API. It includes Gemini-powered resume drafts, interview reports, an in-app career guide, and an application tracker. MongoDB stores user accounts, interview reports, and applications; resume drafts and guide conversations are not saved to the app database.

## Deployment layout

Deploy the frontend and backend as separate services on the same site, for example `app.example.com` and `api.example.com`, or put them behind a same-origin reverse proxy. Browsers can block the session cookie when the services use unrelated site domains, which breaks sign-in.

Deploy the frontend and backend as separate services:

1. Build the static frontend with `npm ci` in `Frontend/`, then `npm run build`. Publish `Frontend/dist/` on a static hosting service.
2. Deploy `Backend/` as a Node service. Run `npm ci` and use `npm start` to start the API.
3. Configure the frontend build variable `VITE_API_URL` to the backend's public origin, such as `https://api.example.com`.
4. Configure the backend environment variables below. Set `FRONTEND_URL` to the exact public frontend origin, without a path or trailing slash.
5. Serve both services over HTTPS. In production, the session cookie is HTTP-only and Secure.

Use Node.js `20.19+` or `22.12+` for the frontend build. The Gemini SDK also requires Node.js 20 or newer.

Run `npm run dev` at the repository root to start the frontend and backend together. Press Ctrl+C to stop both. The root `npm start` command is for the backend service in production and does not serve the built frontend.

## Backend environment

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: long, random secret used to sign sessions.
- `GOOGLE_GENAI_API_KEY`: Google Gemini API key. It stays on the backend and must not be added to frontend variables.
- `FRONTEND_URL`: frontend origin allowed by CORS and the write-request origin check. Multiple exact origins can be comma-separated.
- `NODE_ENV`: set to `production` in the deployed backend.
- `PORT`: optional; hosting providers usually set this.
- `GEMINI_MODEL`: optional; defaults to `gemini-3.8-flash`.

Keep `.env` files out of source control. The root `.gitignore` excludes them.

## Local development

Put backend values in `Backend/.env`, then run `npm run dev` from the repository root. The frontend defaults to `http://localhost:3000` for the API; override that with `Frontend/.env.local` and `VITE_API_URL` if needed. The individual `npm run dev:backend` and `npm run dev:frontend` commands are also available.

Run `npm run check` from the repository root to run the backend test suite, frontend lint, and frontend production build.

## Privacy and data

Users can remove individual report and application records from the dashboard. Account deletion is currently handled by the operator of each deployment. Before publishing, provide users with the deployment operator's privacy contact details and review the Privacy Policy for that deployment.
