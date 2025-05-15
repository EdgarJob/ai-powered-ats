from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI-Powered ATS API",
    description="""
    AI-Powered Applicant Tracking System API.
    This API provides endpoints for managing candidates and jobs, including AI-powered candidate matching.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client setup
supabase_url = os.getenv("SUPABASE_URL", "http://127.0.0.1:54321")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_key:
    raise ValueError("SUPABASE_ANON_KEY environment variable is not set")

supabase: Client = create_client(supabase_url, supabase_key)

# Custom exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Pydantic models with improved validation and documentation
class CandidateBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of the candidate")
    email: EmailStr = Field(..., description="Email address of the candidate")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number of the candidate")
    resume_url: str = Field(..., min_length=5, description="URL to the candidate's resume")
    status: str = Field(
        "pending",
        description="Current status of the candidate",
        pattern="^(pending|reviewed|shortlisted|rejected)$"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "resume_url": "https://example.com/resume.pdf",
                "status": "pending"
            }
        }

class CandidateCreate(CandidateBase):
    job_id: str = Field(..., description="ID of the job the candidate is applying for")

class CandidateResponse(CandidateBase):
    id: str = Field(..., description="Unique identifier for the candidate")
    job_id: str = Field(..., description="ID of the job the candidate applied for")
    created_at: datetime = Field(..., description="Timestamp when the candidate was created")
    updated_at: datetime = Field(..., description="Timestamp when the candidate was last updated")

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message describing what went wrong")

class MatchResponse(BaseModel):
    candidate_id: str = Field(..., description="ID of the matched candidate")
    full_name: str = Field(..., description="Name of the matched candidate")
    email: str = Field(..., description="Email of the matched candidate")
    score: float = Field(..., ge=0, le=1, description="Match score between 0 and 1")

# Health check endpoint
@app.get(
    "/",
    response_model=Dict[str, Any],
    summary="Health Check",
    description="Returns the health status of the API"
)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

# Create candidate endpoint
@app.post(
    "/candidates/",
    response_model=CandidateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    },
    summary="Create Candidate",
    description="Creates a new candidate in the system"
)
async def create_candidate(candidate: CandidateCreate):
    """
    Create a new candidate with the following steps:
    1. Validates the job exists
    2. Creates the candidate record
    3. Returns the created candidate
    """
    try:
        # Check if job exists
        job_response = supabase.table("jobs").select("id").eq("id", candidate.job_id).execute()
        if not job_response.data:
            raise HTTPException(
                status_code=400,
                detail=f"Job with id {candidate.job_id} not found"
            )

        # Create candidate
        now = datetime.utcnow().isoformat()
        response = supabase.table("candidates").insert({
            **candidate.model_dump(),
            "created_at": now,
            "updated_at": now
        }).execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create candidate"
            )

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get candidates by job endpoint
@app.get(
    "/candidates/{job_id}",
    response_model=List[CandidateResponse],
    responses={
        404: {"model": ErrorResponse, "description": "Job Not Found"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    },
    summary="Get Candidates by Job",
    description="Returns all candidates for a specific job"
)
async def get_candidates_by_job(
    job_id: str = Field(..., description="ID of the job to get candidates for")
):
    """
    Get all candidates for a specific job with the following steps:
    1. Validates the job exists
    2. Retrieves all candidates for the job
    3. Returns the list of candidates
    """
    try:
        # Check if job exists
        job_response = supabase.table("jobs").select("id").eq("id", job_id).execute()
        if not job_response.data:
            raise HTTPException(
                status_code=404,
                detail=f"Job with id {job_id} not found"
            )

        # Get candidates
        response = supabase.table("candidates").select("*").eq("job_id", job_id).execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=str(response.error)
            )

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Match candidates endpoint
@app.get(
    "/candidates/{job_id}/match",
    response_model=List[MatchResponse],
    responses={
        404: {"model": ErrorResponse, "description": "Job Not Found"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    },
    summary="Match Candidates",
    description="Returns matched candidates for a specific job using AI"
)
async def match_candidates(
    job_id: str = Field(..., description="ID of the job to match candidates for"),
    limit: int = Field(10, ge=1, le=100, description="Maximum number of matches to return")
):
    """
    Match candidates for a specific job using AI with the following steps:
    1. Validates the job exists
    2. Calls the match_candidates database function
    3. Returns the matched candidates with their scores
    """
    try:
        # Call the match_candidates function
        response = supabase.rpc(
            "match_candidates",
            {"p_job_id": job_id, "p_limit": limit}
        ).execute()

        if response.error:
            raise HTTPException(
                status_code=500,
                detail=str(response.error)
            )

        if not response.data:
            return []

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port) 