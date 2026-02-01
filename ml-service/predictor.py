# Model loader and prediction logic
# Loads ML model and vectorizer once at startup

import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import warnings

warnings.filterwarnings('ignore')

# Global variables for model and vectorizer
vectorizer = None
model = None
model_loaded = False

# Model file paths
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")


def load_models():
    """
    Load the TF-IDF vectorizer and phishing detection model.
    If files don't exist, create dummy models for testing.
    """
    global vectorizer, model, model_loaded
    
    try:
        # Try to load existing models
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            print("📦 Loading existing models...")
            vectorizer = joblib.load(VECTORIZER_PATH)
            model = joblib.load(MODEL_PATH)
            print("✅ Models loaded successfully from disk")
            model_loaded = True
        else:
            # Create dummy models for testing
            print("⚠️  Model files not found. Creating dummy models for testing...")
            print(f"   Expected: {VECTORIZER_PATH}")
            print(f"   Expected: {MODEL_PATH}")
            
            # Create a simple TF-IDF vectorizer
            vectorizer = TfidfVectorizer(max_features=3000, stop_words='english')
            
            # Fit with dummy data
            dummy_texts = [
                "Congratulations! You won a prize. Click here to claim.",
                "Your account has been suspended. Verify now.",
                "Meeting scheduled for tomorrow at 3pm.",
                "Please review the attached document.",
                "URGENT: Your password will expire today!"
            ]
            dummy_labels = [1, 1, 0, 0, 1]  # 1=phishing, 0=safe
            
            # Fit vectorizer and train dummy model
            X_dummy = vectorizer.fit_transform(dummy_texts)
            model = MultinomialNB()
            model.fit(X_dummy, dummy_labels)
            
            print("✅ Dummy models created successfully")
            print("💡 To use real models, train and save:")
            print("   - vectorizer.pkl")
            print("   - phishing_model.pkl")
            model_loaded = True
            
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        model_loaded = False
        raise


def get_model_status():
    """
    Get the current model loading status.
    Returns: Dictionary with status information
    """
    return {
        "loaded": model_loaded,
        "vectorizer_exists": os.path.exists(VECTORIZER_PATH),
        "model_exists": os.path.exists(MODEL_PATH),
        "vectorizer_path": VECTORIZER_PATH,
        "model_path": MODEL_PATH
    }


# Load models when module is imported
print("\n" + "="*50)
print("🚀 Initializing ML Service")
print("="*50)
load_models()
print("="*50 + "\n")
