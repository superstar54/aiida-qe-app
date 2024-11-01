import uvicorn
import os


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))  # Default to 8001 if PORT is not set
    uvicorn.run("app.api:app", host="0.0.0.0", port=port, reload=True,
                log_level="debug",)
