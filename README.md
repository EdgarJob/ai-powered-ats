# AI-Powered Applicant Tracking System

An intelligent ATS that uses AI to analyze resumes, match candidates to jobs, and streamline the hiring process.

## Project Structure

```
.
├── frontend/     # React 18 + Vite frontend application
├── edge/         # Supabase Edge Functions (TypeScript/Deno)
├── api/          # FastAPI backend service
└── infra/        # Terraform infrastructure code
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- pnpm
- Supabase CLI
- Terraform
- Docker & Docker Compose

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install              # Install Node.js dependencies
   cd api
   python -m venv venv      # Create Python virtual environment
   source venv/bin/activate # Activate virtual environment
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the development servers:
   ```bash
   # In separate terminals:
   pnpm --filter frontend dev  # Start frontend
   pnpm --filter edge dev      # Start edge functions
   uvicorn api.main:app --reload  # Start FastAPI server
   ```

4. For local development with Supabase:
   ```bash
   supabase start  # Start local Supabase
   ```

## Testing

```bash
pnpm test         # Run all tests
pnpm lint         # Run linters
```

## Deployment

The project uses GitHub Actions for CI/CD. Pushing to main will:
1. Run tests and linters
2. Deploy edge functions to Supabase
3. Deploy frontend to Netlify
4. Apply Terraform changes

## License

MIT 