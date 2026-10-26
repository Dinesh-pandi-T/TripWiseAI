import re
import math
import numpy as np
import pandas as pd

def clean_text(text):
    """Clean and standardize text for TF-IDF processing."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def create_combined_features(row):
    """Combine category, tags, description, and indoor_outdoor into a unified text feature."""
    category = str(row.get("category", ""))
    tags = str(row.get("tags", ""))
    description = str(row.get("description", ""))
    indoor_outdoor = str(row.get("indoor_outdoor", ""))
    
    # Weight category and tags higher by repeating
    combined = f"{category} {category} {tags} {tags} {description} {indoor_outdoor}"
    return clean_text(combined)

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth in kilometers
    using the Haversine formula.
    """
    R = 6371.0  # Earth's radius in km
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return round(R * c, 2)

def min_max_scale(val, min_val, max_val):
    """Scale a numerical value to [0, 1] range safely."""
    if max_val == min_val:
        return 1.0
    val = max(min_val, min(max_val, val))
    return (val - min_val) / (max_val - min_val)
