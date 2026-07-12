# FieConnect — Premium Property Management & Rental Portal

FieConnect is a premium, state-of-the-art property management and rental marketplace designed specifically for Ghanaian real estate. It bridges the gap between reliable landlords and professional tenants with trust, security, and digital transparency.

## Project Structure

This repository is split into two primary workspaces:
- `/backend`: Node.js, Express, Apollo Server (GraphQL), and Mongoose (MongoDB).
- `/frontend`: Next.js (Turbopack), TailwindCSS, Apollo Client, and React Hook Form.

---

## Live Deployments

### Backend
- **Production URL**: [https://backend-beryl-alpha-86.vercel.app](https://backend-beryl-alpha-86.vercel.app)
- **Test/Preview URL**: [https://fie-connect-backend-pt8zyy0s9-joes-projects-6b487cdb.vercel.app](https://fie-connect-backend-pt8zyy0s9-joes-projects-6b487cdb.vercel.app)

### Frontend
- **Production URL**: [https://fie-connect.vercel.app](https://fie-connect.vercel.app)
- **Test/Preview URL**: [https://fie-connect-1s1hs2m8r-joes-projects-6b487cdb.vercel.app](https://fie-connect-1s1hs2m8r-joes-projects-6b487cdb.vercel.app)

---

## Features

- **Tenant Property Discovery**: Advanced search interface filtering through Ghanaian regions, property types, price ranges, and parking preferences.
- **Tenancy Management**: Complete lease lifecycle tracking, lease approvals, and signed lease agreement storage.
- **Dispute Mediation Board**: Interactive complaint ticket system with real-time comment threads, evidence uploads, and read tracking.
- **Dynamic Dashboards**: User-centric dashboards displaying live lease, application, notification, and dispute stats for both Landlords and Tenants.
- **Profile Customization**: Password changes, photo avatar uploads to Supabase, and metadata updates.

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas instance)
- Supabase account (for file/photo storage)

### 2. Environment Variables

Create a `.env` file in `/backend`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

Create a `.env.local` file in `/frontend`:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 3. Install Dependencies
Run from the root workspace:
```bash
# Install backend packages
cd backend && yarn install

# Install frontend packages
cd ../frontend && yarn install
```

### 4. Running Development Servers
Run the backend server:
```bash
cd backend
yarn dev
```
Run the frontend server:
```bash
cd frontend
yarn dev
```

---

## Database Seeding

To clear existing property listings and generate **75 premium property listings** distributed across all 16 Ghanaian regions:
```bash
cd backend
npx tsx src/seed.ts
```
This runs the automated seeding script using mock location data and Unsplash imagery.
