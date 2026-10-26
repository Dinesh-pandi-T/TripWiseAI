import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';


import Home from './pages/Home';
import PlanTrip from './pages/PlanTrip';
import Recommendations from './pages/Recommendations';
import Itinerary from './pages/Itinerary';
import Budget from './pages/Budget';
import Explore from './pages/Explore';
import ExploreDestinations from './pages/ExploreDestinations';
import Analytics from './pages/Analytics';
import About from './pages/About';

function App() {
  return (
    <TripProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/plan" element={<PlanTrip />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/destinations" element={<ExploreDestinations />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TripProvider>
  );
}

export default App;
