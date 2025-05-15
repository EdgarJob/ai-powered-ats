# AI-Powered Applicant Tracking System (ATS)

An intelligent ATS that leverages AI to streamline the recruitment process, match candidates with job openings, and automate initial screening.

## Project Structure

- **frontend/**: React application with TypeScript and Material UI
- **edge/**: Supabase Edge Functions
- **supabase/**: Database schema and configuration
- **api/**: API endpoints

## Features

- Public job board with filtering
- Job application submission
- Admin job management dashboard
- Candidate tracking and scoring
- Resume parsing and analysis
- AI-powered candidate matching

## Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Material UI
  - TailwindCSS (for utility classes)
  - React Router DOM
  - React Query (for data fetching)

- **Backend**:
  - Supabase (PostgreSQL database)
  - Supabase Auth (authentication)
  - Supabase Edge Functions (serverless functions)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # In the root directory
   pnpm install
   ```

3. Set up environment variables:
   ```
   # Create a .env file in the root directory
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   pnpm run --parallel dev
   ```

5. Access the application at http://localhost:5173

## Database Schema

The application uses the following tables:

- **organizations**: Companies using the system
- **users**: Users with different roles
- **jobs**: Job postings
- **candidates**: Applicants for jobs
- **candidate_scores**: AI-generated scores for candidates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

---

**Learning Reflection:**
- This project is a great way to learn full-stack development, CI/CD, and modern web best practices.
- You can reuse these patterns for any web app: forms, database, authentication, and deployment. 