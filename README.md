# Career Sathi

Career Sathi is a React frontend and Express API. It includes Gemini-powered resume drafts, interview reports, an in-app career guide, and an application tracker. MongoDB stores user accounts, interview reports, and applications; resume drafts and guide conversations are not saved to the app database.

## Deploy to Vercel

The repository is configured as one Vercel project with two Services: an Express backend rooted at `Backend/` and a Vite frontend rooted at `Frontend/`. Project-level rewrites send `/api/*` and `/health` to the backend and all other paths to the frontend. The services share one public origin, so leave `VITE_API_URL` unset. No service binding is needed because the browser calls the same-origin API path; neither service makes server-side requests to the other.

1. Import this repository into Vercel, keep the project root at the repository root, and ensure Vercel Services is enabled for your account.
2. Add `MONGO_URI`, `JWT_SECRET` (at least 32 characters), `GOOGLE_GENAI_API_KEY`, and `FRONTEND_URL` to the backend service environment. Set `FRONTEND_URL` to the exact HTTPS origin users visit, without a path or trailing slash. Add comma-separated origins if needed.
3. Deploy. In production, session cookies are HTTP-only and Secure, and the API shares the frontend's domain.

For preview deployments, configure `FRONTEND_URL` with the preview origin(s) you intend to use; write requests from origins not listed there are rejected.

Use Node.js `22.12.x` for local development and deployment. The backend function is configured for up to 60 seconds per request, subject to your Vercel plan limits.

Run `npm run dev` at the repository root to start the frontend and backend together. Press Ctrl+C to stop both. Use `vercel dev` from the repository root to test Vercel Services routing locally.

## Backend environment

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: long, random secret used to sign sessions.
- `GOOGLE_GENAI_API_KEY`: Google Gemini API key. It stays on the backend and must not be added to frontend variables.
- `FRONTEND_URL`: frontend origin allowed by CORS and the write-request origin check. Multiple exact origins can be comma-separated.
- `NODE_ENV`: set to `production` in the deployed backend.
- `PORT`: optional; hosting providers usually set this.
- `GEMINI_MODEL`: optional; defaults to `gemini-3.8-flash`.

Authentication is throttled per client IP (10 sign-in attempts per 15 minutes and 5 account creations per hour). AI resume drafts and career guide requests are throttled per signed-in user using expiring MongoDB counters, so limits are shared across serverless instances.

Keep `.env` files out of source control. The root `.gitignore` excludes them.

## Local development

Put backend values in `Backend/.env`, then run `npm run dev` from the repository root. The frontend defaults to `http://localhost:3000` for the API; override that with `Frontend/.env.local` and `VITE_API_URL` if needed. The individual `npm run dev:backend` and `npm run dev:frontend` commands are also available.

Run `npm run check` from the repository root to run the backend test suite, frontend lint, and frontend production build.

## Privacy and data

Users can remove individual report and application records from the dashboard. Account deletion is currently handled by the operator of each deployment. Before publishing, provide users with the deployment operator's privacy contact details and review the Privacy Policy for that deployment.
