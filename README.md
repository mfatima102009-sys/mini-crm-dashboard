# Orbit CRM — Mini CRM Dashboard

A responsive mini CRM for managing business enquiries (leads). It includes an overview, lead creation/editing/deletion, search, status filtering, and persistent storage through Supabase.

## Features

- Dashboard totals for all leads, New leads, and Converted leads
- Create, edit, and delete leads
- Lead fields: name, email, phone, business name, and status
- Search by name or email
- Filter by New, Contacted, or Converted
- Update a lead's status directly in the table
- Client-side required-field and email validation, plus backend validation
- Loading, empty, and error states
- Responsive layout for desktop and mobile

## Technology choices

- **React + Vite:** straightforward component-based frontend and fast local development.
- **CSS:** custom responsive styling without a large UI dependency.
- **Node.js + Express:** small REST API for CRUD operations and server-side validation.
- **Supabase (PostgreSQL):** hosted relational database with persistent records.

## Requirements

- Node.js 18 or newer
- npm
- A Supabase account and project

## Database setup

1. Create a project at [Supabase](https://supabase.com/).
2. Open **SQL Editor** in your Supabase project.
3. Copy the contents of `supabase/schema.sql` into a new query and run it.
4. In **Project Settings → API**, copy the Project URL and `service_role` key.
5. Copy `.env.example` to a new file named `.env` in the project root.
6. Add your values:

   ```env
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   PORT=5000
   ```

   Keep the service-role key private. Never commit `.env` or put this key in frontend code.

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase values
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The Express API runs on port `5000`.

For a production frontend build:

```bash
npm run build
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/leads` | Fetch all leads |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |

The API expects JSON for POST and PUT requests, for example:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "phone": "+1 555 010 2020",
  "business_name": "Northstar Studio",
  "status": "New"
}
```

## Deployment guide

This repository is structured so the API and frontend can be deployed separately.

### Backend (Render)

1. Push this project to your GitHub repository.
2. Create a **Web Service** on [Render](https://render.com/) and connect the repository.
3. Set the build command to `npm install` and start command to `npm run server`.
4. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `PORT` as environment variables.
5. Note the deployed API URL.

### Frontend (Vercel)

1. Create a project on [Vercel](https://vercel.com/) and import the same repository.
2. Set the framework preset to Vite and build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add a Vite proxy/rewrite from `/api/:path*` to your Render API URL, or update the frontend fetch base URL to your deployed API URL and configure CORS on the server.
5. Deploy and test create, update, delete, search, filtering, and refresh persistence.

For a simple same-origin deployment, you can instead host the built frontend and Express server behind one web service with static-file serving configured.

## Validation and error handling

The frontend uses HTML required fields and `type="email"` validation. The API independently checks required values, email format, and allowed statuses. Network/API errors are shown in the dashboard, and the UI includes loading and empty states.

## Challenges and notes

A key design decision is keeping the Supabase service-role key on the backend rather than exposing it in the browser. Another important part is validating data in both the frontend and API: browser validation improves usability, while server validation protects the database from invalid requests.

## Before submission

- [ ] Add your Supabase credentials to your private deployment environment.
- [ ] Run the SQL schema.
- [ ] Test all CRUD actions and refresh persistence.
- [ ] Deploy the API and frontend.
- [ ] Add your actual live URL below.
- [ ] Push the source code to your GitHub repository.
- [ ] Replace this section with your own brief explanation of what you learned.

**Live demo:** _Add your deployed URL here._

**GitHub repository:** _Add your repository URL here._
