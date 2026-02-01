# FastAPI ML Service for Phishing Detection
# Main application entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="Phishing Detection ML Service",
    description="Machine Learning microservice for email phishing detection",
    version="1.0.0"
)

# Configure CORS to allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify service is running
    Returns: Status message
    """
    return {"status": "ok"}

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with service information
    Returns: Service name and version
    """
    return {
        "service": "Phishing Detection ML Service",
        "version": "1.0.0",
        "status": "running"
    }
