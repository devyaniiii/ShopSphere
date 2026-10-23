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
