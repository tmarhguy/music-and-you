"""
Base personality prediction model class.
"""

from abc import ABC, abstractmethod
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_squared_error, r2_score
import logging

from music_and_you.core import BIG_FIVE_TRAITS, MODEL_CONFIG

logger = logging.getLogger(__name__)


class PersonalityPredictor(ABC):
    """
    Abstract base class for personality prediction models.
    
    This class defines the interface that all personality prediction
    models must implement for the Music and You project.
    """
    
    def __init__(self, random_state: int = None):
        """
        Initialize the personality predictor.
        
        Args:
            random_state: Random state for reproducibility
        """
        self.random_state = random_state or MODEL_CONFIG["random_state"]
        self.models = {}  # Dictionary to store models for each trait
        self.feature_names = []
        self.is_fitted = False
        self.feature_importance = {}
        
    @abstractmethod
    def fit(
        self, 
        X: pd.DataFrame, 
        y: pd.DataFrame,
        sample_weight: Optional[np.ndarray] = None
    ) -> 'PersonalityPredictor':
        """
        Fit the personality prediction model.
        
        Args:
            X: Feature matrix
            y: Target personality traits
            sample_weight: Optional sample weights
            
        Returns:
            Self (fitted model)
        """
        pass
    
    @abstractmethod
    def predict(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Predict personality traits for given features.
        
        Args:
            X: Feature matrix
            
        Returns:
            DataFrame with predicted personality traits
        """
        pass
    
    @abstractmethod
    def get_feature_importance(self) -> Dict[str, Dict[str, float]]:
        """
        Get feature importance for each personality trait.
        
        Returns:
            Dictionary mapping traits to feature importance dictionaries
        """
        pass
    
    def cross_validate(
        self, 
        X: pd.DataFrame, 
        y: pd.DataFrame,
        cv_folds: int = None,
        scoring: str = 'r2'
    ) -> Dict[str, Dict[str, float]]:
        """
        Perform cross-validation for all personality traits.
        
        Args:
            X: Feature matrix
            y: Target personality traits
            cv_folds: Number of cross-validation folds
            scoring: Scoring metric
            
        Returns:
            Dictionary with cross-validation results for each trait
        """
        cv_folds = cv_folds or MODEL_CONFIG["cv_folds"]
        kfold = KFold(n_splits=cv_folds, shuffle=True, random_state=self.random_state)
        
        results = {}
        
        for trait in BIG_FIVE_TRAITS:
            if trait not in y.columns:
                logger.warning(f"Trait {trait} not found in target data")
                continue
                
            # Fit a temporary model for this trait
            temp_model = self._create_trait_model()
            
            # Perform cross-validation
            cv_scores = cross_val_score(
                temp_model, X, y[trait], 
                cv=kfold, scoring=scoring
            )
            
            results[trait] = {
                'mean_score': float(np.mean(cv_scores)),
                'std_score': float(np.std(cv_scores)),
                'scores': cv_scores.tolist()
            }
            
            logger.info(f"{trait}: CV {scoring} = {results[trait]['mean_score']:.3f} (+/- {results[trait]['std_score']:.3f})")
        
        return results
    
    def evaluate(
        self, 
        X: pd.DataFrame, 
        y: pd.DataFrame
    ) -> Dict[str, Dict[str, float]]:
        """
        Evaluate the fitted model on test data.
        
        Args:
            X: Test feature matrix
            y: Test target personality traits
            
        Returns:
            Dictionary with evaluation metrics for each trait
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")
        
        predictions = self.predict(X)
        results = {}
        
        for trait in BIG_FIVE_TRAITS:
            if trait not in y.columns or trait not in predictions.columns:
                continue
                
            y_true = y[trait].values
            y_pred = predictions[trait].values
            
            # Calculate metrics
            mse = mean_squared_error(y_true, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_true, y_pred)
            correlation = np.corrcoef(y_true, y_pred)[0, 1]
            
            results[trait] = {
                'mse': float(mse),
                'rmse': float(rmse),
                'r2': float(r2),
                'correlation': float(correlation) if not np.isnan(correlation) else 0.0
            }
            
            logger.info(f"{trait}: R² = {r2:.3f}, Correlation = {correlation:.3f}, RMSE = {rmse:.3f}")
        
        return results
    
    def predict_with_uncertainty(
        self, 
        X: pd.DataFrame,
        n_bootstrap: int = 100
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Predict personality traits with uncertainty estimates using bootstrap.
        
        Args:
            X: Feature matrix
            n_bootstrap: Number of bootstrap samples
            
        Returns:
            Tuple of (predictions, prediction_intervals)
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        # For now, return predictions with zero uncertainty
        # This can be enhanced with actual bootstrap sampling
        predictions = self.predict(X)
        uncertainty = pd.DataFrame(
            np.zeros_like(predictions.values),
            columns=predictions.columns,
            index=predictions.index
        )
        
        return predictions, uncertainty
    
    @abstractmethod
    def _create_trait_model(self):
        """
        Create a model instance for a single trait.
        
        Returns:
            Sklearn-compatible model instance
        """
        pass
    
    def _validate_inputs(self, X: pd.DataFrame, y: pd.DataFrame = None):
        """
        Validate input data.
        
        Args:
            X: Feature matrix
            y: Optional target matrix
        """
        if X.empty:
            raise ValueError("Feature matrix is empty")
        
        if X.isnull().any().any():
            logger.warning("Feature matrix contains null values")
        
        if y is not None:
            if len(X) != len(y):
                raise ValueError("Feature matrix and target matrix must have same length")
            
            # Check for missing traits
            missing_traits = [trait for trait in BIG_FIVE_TRAITS if trait not in y.columns]
            if missing_traits:
                logger.warning(f"Missing personality traits: {missing_traits}")
    
    def save_model(self, filepath: str):
        """
        Save the fitted model to disk.
        
        Args:
            filepath: Path to save the model
        """
        import joblib
        
        if not self.is_fitted:
            raise ValueError("Model must be fitted before saving")
        
        model_data = {
            'models': self.models,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance,
            'random_state': self.random_state,
            'is_fitted': self.is_fitted
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    @classmethod
    def load_model(cls, filepath: str) -> 'PersonalityPredictor':
        """
        Load a fitted model from disk.
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            Loaded model instance
        """
        import joblib
        
        model_data = joblib.load(filepath)
        
        # Create new instance
        instance = cls(random_state=model_data['random_state'])
        instance.models = model_data['models']
        instance.feature_names = model_data['feature_names']
        instance.feature_importance = model_data['feature_importance']
        instance.is_fitted = model_data['is_fitted']
        
        logger.info(f"Model loaded from {filepath}")
        return instance
