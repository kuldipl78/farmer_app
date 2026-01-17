from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config_simple import settings
from .routes import auth, products, orders, categories

# Create FastAPI app
app = FastAPI(
    title="Farmer Marketplace API",
    description="A marketplace connecting farmers directly with customers",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(categories.router)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Welcome to Farmer Marketplace API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )