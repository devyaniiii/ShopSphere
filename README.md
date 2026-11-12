# ShopSphere

ShopSphere is an e-commerce project developed as part of a simulated company internship. The repository uses a monorepo structure with a React frontend and a Node.js backend.

## Project Scope

- Set up a React website using TypeScript and Tailwind CSS.
- Set up a backend using Node.js and Express.
- Provide a health-check endpoint to verify backend availability.
- Maintain clear project structure and development conventions.

## Tech Stack

**Client:** React, TypeScript, Vite, Tailwind CSS

**Server:** Node.js, Express, TypeScript, dotenv

## Prerequisites

- Node.js and npm
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/devyaniiii/ShopSphere.git
cd ShopSphere
```

### 2. Start the client

```bash
cd client
npm install
```

Copy `.env.example` to `.env.local` if environment configuration is needed.

```bash
npm run dev
```

The client runs at http://localhost:5173.

### 3. Start the server

Open another terminal.

```bash
cd server
npm install
```

Copy `.env.example` to `.env` if environment configuration is needed.

```bash
npm run dev
```

The server runs on port 5000 by default.

### 4. Verify the server

Open http://localhost:5000/api/health.

The endpoint returns a JSON response confirming that the server is running.

## Folder Structure

```text
ShopSphere/
├── client/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Environment Variables

Environment templates are provided in each project directory. Do not commit real credentials or secret values.

## Development Workflow

Create a task-specific branch from `main`, make focused changes, verify the implementation, and submit a pull request or commit according to the internship instructions.

## Environment Configuration

ShopSphere uses environment variables to configure the backend safely. Sensitive credentials must never be committed to Git.

### Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your local MongoDB connection details.

4. Start the development server:

   ```bash
   npm run dev
   ```

### Environment Variables

| Variable    | Required | Default / Example                    | Description                                                                         |
| ----------- | -------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| NODE_ENV    | No       | development                          | Application environment: development, production, or test. Defaults to development. |
| PORT        | Yes      | 5000                                 | Port on which the backend server listens.                                           |
| MONGODB_URI | Yes      | mongodb://127.0.0.1:27017/shopsphere | MongoDB connection URI.                                                             |

### Environment Safety

- `server/.env` contains local secrets and is ignored by Git.
- `server/.env.example` contains example configuration only.
- Never commit database usernames, passwords, or production credentials.
- Environment variables are loaded and validated centrally through `server/src/config/env.js`.
- Invalid or missing required variables prevent the server from starting.
- Development and production modes are identified using `NODE_ENV`.

## Logging, CORS & Request Validation

### Request Logging
The backend includes request logging middleware that records:
- HTTP method
- Request path
- Response status code
- Request duration in milliseconds
- Timestamp

### CORS Configuration
CORS uses an environment-based origin allowlist.

Configure `CORS_ORIGINS` in `server/.env`:

```env
CORS_ORIGINS=http://localhost:4200
```

For multiple allowed origins, separate them with commas.

### Request Validation
Zod is used to validate incoming request data.

Validation middleware is available at:
`server/src/middleware/validate.js`

### Sample Validated Endpoint

**POST** `/api/validation/feedback`

Example request:

```json
{
  "name": "Devyani",
  "email": "devyani@example.com",
  "message": "This is a sample feedback message."
}
```

Valid requests return HTTP 201. Invalid requests return HTTP 400 with validation errors.

This endpoint demonstrates validation only; it does not store feedback in the database.
