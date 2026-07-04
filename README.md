# Splidot

Splidot is a user-friendly payment manager designed to help you split expenses among friends effortlessly. With Splidot, you can create groups, add expenses, and have the app calculate equal splits for everyone. The app ensures transparency and ease of managing shared costs.

![alt text](image-1.png)

---

## Getting Started

### Prerequisites
To run Splidot locally, you need:
- Node.js (v18+ recommended)
- A PostgreSQL database (a free [Neon](https://neon.tech) database works out of the box)
- A package manager like npm or yarn
- Google Chrome installed (only needed to run the end-to-end tests — see [Testing](#testing))

### Installation

1. Clone the repository:
   ```bash
   git clone 'https://github.com/Rov95/splidot.git'
   cd splidot
   ```

2. Install dependencies for both the frontend and backend:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Configure the environment variables:
   - For the backend, create a `.env` file in the `server` directory (see `server/.env.example`):
     ```env
     # Postgres connection string (e.g. from Neon)
     DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require

     # Secret used to sign JWTs
     SECRET_KEY=<a-long-random-string>
     ```

### Running the Application

1. Start the backend server (TypeScript, runs with hot reload):
   ```bash
   cd server
   npm run dev
   ```
   The API listens on `http://localhost:3000`.

2. Start the frontend development server:
   ```bash
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to use Splidot.

### Backend scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the server in watch mode with `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server from `dist/` |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run the Vitest test suite in watch mode |

### Frontend scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the Vite dev server with hot reload |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run the Vitest test suite in watch mode |

---

## Testing

Splidot has three layers of automated tests:

| Layer | Location | Framework | What it covers |
| --- | --- | --- | --- |
| Backend unit/integration | `server/tests` | Vitest + Supertest | Route handlers (`/users`, `/groups`, `/expenses`, `/categories`) against an in-memory SQLite database, plus the `errorMessage` util and `authMiddleware` |
| Frontend unit/component | `client/src/**/*.test.tsx` | Vitest + React Testing Library | Forms, dashboard components, and the pure `calculateSettlements` splitting algorithm, with services mocked |
| End-to-end | `e2e/` (repo root) | Playwright | Full golden path in a real browser against the real dev servers and Neon database: sign up → sign in → create group → add expense → settle up → log out |

Backend tests never touch the real Neon database — `server/src/config/database.ts` switches to an in-memory SQLite instance whenever `NODE_ENV=test` (set automatically by Vitest). The E2E suite does use the real Neon database (via the dev servers) but cleans up everything it creates before and after each run.

Run each suite from its own directory:

```bash
cd server && npm test      # backend tests
cd client && npm test      # frontend tests
npm run test:e2e           # from the repo root — starts both dev servers automatically
```

The E2E suite uses your system-installed Google Chrome (`channel: 'chrome'` in `playwright.config.ts`) instead of downloading a bundled Chromium, so no browser download is required.

---

## Tech Stack

### Frontend
- **Language:** TypeScript (strict mode)
- **Framework:** React with Vite for fast development and build performance
- **Styling:** CSS for responsive and modern design

### Backend
- **Language:** TypeScript (strict mode) compiled for Node.js
- **Framework:** Express for building the server and API
- **Database:** PostgreSQL (hosted on Neon) for robust and scalable data management
- **ORM:** Sequelize with typed models for managing database models and queries
- **Authentication:** Stateless JWT (Bearer token, 90-day expiry) stored in `localStorage` on the client

---

## Contributors

Splidot was developed by:
- **[Andres Menco](https://github.com/Rov95)** - Full-stack development

Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Rov95/splidot.git).

---


