import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

def train_model():
    # Load dataset
    df = pd.read_csv("data/students_sample.csv")
    
    # Feature Selection
    features = ["prior_gpa", "attendance_pct", "quiz_avg", "assign_avg", "midterm", "study_hours_wk"]
    X = df[features]
    y = df["passed"]
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Simple Model
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Save
    joblib.dump(model, "models/student_model.pkl")
    print("Model trained and saved to models/student_model.pkl")
    
if __name__ == "__main__":
    train_model()
