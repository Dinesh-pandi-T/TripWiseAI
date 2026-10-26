-- Database Schema for Smart Trip Planning and Recommendation System

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    best_season TEXT,
    avg_daily_budget REAL,
    image_url TEXT,
    latitude REAL,
    longitude REAL
);

CREATE TABLE IF NOT EXISTS attractions (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    rating REAL,
    price REAL,
    duration REAL,
    popularity INTEGER,
    latitude REAL,
    longitude REAL,
    indoor_outdoor TEXT,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS hotels (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    price_per_night REAL,
    rating REAL,
    latitude REAL,
    longitude REAL,
    amenities TEXT
);

CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    cuisine TEXT,
    average_cost REAL,
    rating REAL,
    latitude REAL,
    longitude REAL
);

CREATE TABLE IF NOT EXISTS transport (
    id INTEGER PRIMARY KEY,
    destination TEXT NOT NULL,
    transport_type TEXT NOT NULL,
    average_cost REAL,
    distance REAL
);

CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    destination TEXT NOT NULL,
    budget REAL,
    travelers INTEGER,
    days INTEGER,
    interests TEXT,
    itinerary_data TEXT, -- JSON structure of generated days and slots
    total_cost REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
