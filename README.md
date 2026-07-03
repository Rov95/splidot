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

     # Secret used to sign session cookies
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

---

## Tech Stack

### Frontend
- **Framework:** React with Vite for fast development and build performance
- **Styling:** CSS for responsive and modern design

### Backend
- **Language:** TypeScript (strict mode) compiled for Node.js
- **Framework:** Express for building the server and API
- **Database:** PostgreSQL (hosted on Neon) for robust and scalable data management
- **ORM:** Sequelize with typed models for managing database models and queries
- **Authentication:** Session-based authentication for secure user sessions

---

## Contributors

Splidot was developed by:
- **[Andres Menco](https://github.com/Rov95)** - Full-stack development

Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Rov95/splidot.git).

---


