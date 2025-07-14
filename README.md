# Express + Prisma Base

This is a basic Express.js project setup with Prisma for database management.

## Getting Started

This repository provides a clean Express + Prisma + PostgreSQL backend starter. You can clone this template in three ways:

1.  **Use as a GitHub Template:**
    Click the "Use this template" button on GitHub to create a new repository from this template.

2.  **Clone with Git (and reset history):**
    This method clones the repository and then removes its Git history, allowing you to start fresh.

    ```bash
    git clone https://github.com/andeluw/express-prisma-base.git your-app-name
    cd your-app-name
    rm -rf .git # For Windows, use `del .git`
    git init
    git add .
    git commit -m "Initial commit"
    ```

3.  **Using `degit` (cleanest method):**
    `degit` clones the project without any commit history or `.git` folder, providing the cleanest way to start fresh.

    ```bash
    npx degit andeluw/express-prisma-base your-app-name
    cd your-app-name
    ```

## Installation

Install the dependencies:

```bash
npm install
```

## Configuration

1.  Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and fill in the required environment variables, especially your `DATABASE_URL`.

## Database

This project uses Prisma for database management.

1.  **Generate Prisma Client:**
    After installing the dependencies, generate the Prisma client:
    ```bash
    npm run prisma:generate
    ```
2.  **Run Migrations:**
    To create the database tables based on your schema, run the following command:
    ```bash
    npm run prisma:migrate
    ```

## Usage

- **Development:**
  To run the application in development mode with hot-reloading, use:
  ```bash
  npm run dev
  ```
- **Production:**
  To run the application in production mode, use:
  ```bash
  npm run start
  ```

## Dependencies

- **@prisma/client:** Prisma client for database access.
- **cookie-parser:** Parse Cookie header and populate `req.cookies`.
- **cors:** Enable Cross-Origin Resource Sharing.
- **dotenv:** Loads environment variables from a `.env` file.
- **express:** Fast, unopinionated, minimalist web framework for Node.js.
- **morgan:** HTTP request logger middleware for node.js.
- **zod:** TypeScript-first schema validation with static type inference.

## Scripts

- `dev`: Starts the development server using `nodemon`.
- `start`: Starts the production server.
- `prisma:generate`: Generates the Prisma client.
- `prisma:migrate`: Runs database migrations.
