# CareLoop

CareLoop is a disability assistance management platform for browsing support
services, submitting service requests, and coordinating participants and staff.
It is built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, and Drizzle
ORM.

## Features

- Browse nine disability support services, including personal care, transport,
  meal preparation, community access, and allied health support.
- Create and view participant service requests.
- Manage participants, staff, and service requests from the dashboard.
- Search and filter requests by status, participant, staff member, and service.
- Track request priority, status, preferred date and time, and staff assignment.
- Check application and database availability through `/api/health`.

## Requirements

- Node.js (LTS recommended) and npm
- A [Neon](https://neon.tech/) account and PostgreSQL project

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a project in Neon. In its SQL Editor, connect to the default database
   and create the application database:

   ```sql
   CREATE DATABASE careloopdb;
   ```

3. In the Neon project, open **Connect** and copy the direct (non-pooler)
   connection string for `careloopdb`. Copy `.env.example` to `.env` in the
   project root and replace the example `DATABASE_URL` with that connection
   string:

   ```dotenv
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/careloopdb?sslmode=require
   ```

   Use the credentials and host provided by Neon, and ensure the URL targets
   `careloopdb` and includes `sslmode=require`. If your password contains
   reserved URL characters, URL-encode them. Keep `.env` private; environment
   files are excluded from Git.

4. Apply the Drizzle schema to the Neon database:

   ```bash
   npx drizzle-kit push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

For production, set `DATABASE_URL` to the same Neon connection string in your
web hosting provider's environment variables, then deploy the application.
Never commit the real connection string or add it to client-side (`NEXT_PUBLIC_`)
variables.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server (after building) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript type checker |

## Main pages

| Path | Description |
| --- | --- |
| `/` | CareLoop home page |
| `/services` | Browse available support services |
| `/request` | Submit a service request |
| `/my-requests` | View participant requests |
| `/dashboard` | Review and manage service requests |
| `/dashboard/participants` | Manage participant records |
| `/dashboard/team` | Manage staff records |

## API

The application exposes JSON API routes for managing participants, staff, and
service requests:

- `GET` and `POST /api/participants`
- `GET`, `POST`, `PATCH`, and `DELETE /api/participants/:id`
- `GET` and `POST /api/staff`
- `GET`, `PATCH`, and `DELETE /api/staff/:id`
- `GET` and `POST /api/requests`
- `GET`, `PATCH`, and `DELETE /api/requests/:id`
- `GET /api/health` checks the database connection

The list endpoints accept search or filter query parameters where applicable.

## Database

The Drizzle schema is defined in [`src/db/schema.ts`](./src/db/schema.ts). The
application connects to Neon PostgreSQL using the `DATABASE_URL` environment
variable. The Node.js PostgreSQL driver used by the app supports Neon
connection strings. Drizzle Kit reads the same variable through
[`drizzle.config.ts`](./drizzle.config.ts).

Before starting the application, ensure the Neon database exists, `.env` has a
valid Neon connection string, and the schema has been applied.
