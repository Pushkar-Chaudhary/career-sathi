# Career Sathi

Career Sathi is a career preparation workspace for job seekers. Users can create interview preparation reports, generate an editable resume draft, ask an in-app career guide, and track job applications.

## Architecture

- **Frontend:** React 19, Vite, React Router, and Axios in `Frontend/`.
- **Backend:** Express 5 JSON API in `Backend/`, organized into routes, controllers, middleware, services, models, and config.
- **Database:** MongoDB through Mongoose. Accounts, interview reports, application records, rate-limit counters, and revoked-session token hashes are stored in MongoDB.
- **Authentication:** bcrypt password hashes and a signed, 24-hour JWT in an HTTP-only cookie. Protected API operations verify the session and scope personal records to the authenticated user.
- **AI integration:** Google Gemini is called only by the backend. Resume and guide requests are not stored in the app database; interview report inputs and generated reports are stored in the user's account.

## Requirements

- Node.js 22.12.x or 24.x (the supported versions in the deployment configuration).
- npm.
- A MongoDB database and a Google Gemini API key for the full application.

## Setup

1. Install dependencies: `npm ci --prefix Backend` and `npm ci --prefix Frontend`.
2. Edit `Backend/.env` and set `MONGO_URI`, a random `JWT_SECRET` of at least 32 characters, and `GOOGLE_GENAI_API_KEY`. To enable password reset emails, also set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` using credentials from your email provider. Use an SMTP submission port such as 587 (STARTTLS) or 465 (TLS).
3. Keep `NODE_ENV=development` for local work. Production also requires `FRONTEND_URL` containing the exact HTTPS frontend origin, with no trailing slash; multiple allowed origins can be comma-separated.
4. Optionally create `Frontend/.env.local` with `VITE_API_URL=http://localhost:3000` if your local API is on a different origin. Never put backend secrets in frontend variables.
5. Start both services from the repository root with `npm run dev`. The frontend is at `http://localhost:5173`; the API is at `http://localhost:3000` and its health endpoint is `/health`.

The backend loads `Backend/.env` on startup and validates required configuration before opening the port. MongoDB indexes are declared by the Mongoose models and are created by Mongoose. No destructive database setup command is required.

## Development commands

- `npm start` or `npm run dev` — start frontend and backend together.
- `npm run dev:backend` / `npm run dev:frontend` — start one service.
- `npm run test` — run backend unit and HTTP tests.
- `npm run lint` — lint the frontend.
- `npm run build` — create the frontend production bundle.
- `npm run check` — run tests, lint, and production build.

## Authentication and data access

Registration and login issue a signed session cookie. The cookie is HTTP-only, uses SameSite=Lax, and is Secure in production. Password reset requests send a single-use link that expires after 30 minutes; reset tokens are stored as hashes, reset sessions are invalidated, and responses do not reveal whether an email belongs to an account. Password reset email delivery requires the SMTP environment variables above. The API checks allowed origins on state-changing requests, rate-limits registration, login, and password reset by client IP, and rate-limits AI endpoints per signed-in user. Report and application queries include the authenticated user's ID; record updates and deletion are similarly scoped.

## Deployment

The root `vercel.json` configures separate Vercel services for the Express backend and Vite frontend, with `/api/*` and `/health` routed to the backend. Configure `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, and the exact production `FRONTEND_URL` in the backend service. The frontend uses same-origin API paths in production, so leave `VITE_API_URL` unset for this deployment. For local Vercel routing, run `vercel dev` from the repository root.

## Privacy and operations

Review the in-app Privacy Policy and provide deployment-specific operator contact details before publishing. Users can delete individual reports and applications; account deletion is currently an operator-managed request. AI features send user-submitted text to Google Gemini only after explicit in-app consent.
