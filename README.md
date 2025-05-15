# AI Powered ATS

A modern, open-source Applicant Tracking System (ATS) powered by AI. Built with React, Supabase, and modern web technologies.

## Features
- Job listing and management
- Candidate tracking and scoring
- Modern, responsive UI (Material-UI)
- Supabase/Postgres backend
- Easy to extend and customize

## Tech Stack
- **Frontend:** React, TypeScript, Material-UI, React Query
- **Backend:** Supabase (Postgres, Auth, Storage)
- **CI/CD:** GitHub Actions
- **Dev Tools:** Vite, Yarn, Docker (for Supabase)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup
1. **Clone the repo:**
   ```bash
   git clone https://github.com/EdgarJob/ai-powered-ats.git
   cd ai-powered-ats
   ```
2. **Start Supabase locally:**
   ```bash
   supabase start
   ```
3. **Seed the database (optional):**
   ```bash
   PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f sample_data.sql
   ```
4. **Install frontend dependencies:**
   ```bash
   cd frontend
   yarn install
   ```
5. **Run the frontend app:**
   ```bash
   yarn dev
   ```
6. **Open your browser:**
   - Go to [http://localhost:5173](http://localhost:5173)

## Contributing
- Fork the repo and create a feature branch
- Make your changes (add features, fix bugs, improve docs)
- Open a pull request!

## License
MIT

---

**Learning Reflection:**
- This project is a great way to learn full-stack development, CI/CD, and modern web best practices.
- You can reuse these patterns for any web app: forms, database, authentication, and deployment. 