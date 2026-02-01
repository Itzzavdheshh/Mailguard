# ML Service - Phishing Detection Engine

This is the Python-based machine learning microservice for email phishing detection.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Run Server

```bash
uvicorn app:app --reload --port 8000
```

## Tech Stack

- **FastAPI**: Modern Python web framework
- **scikit-learn**: Machine learning library
- **joblib**: Model serialization
- **pandas**: Data processing
