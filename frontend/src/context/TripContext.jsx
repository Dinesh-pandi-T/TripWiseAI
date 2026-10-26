import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripPlan, setTripPlan] = useState({
    destination: 'Ooty',
    budget: 15000,
    days: 3,
    travelers: 2,
    travelType: 'Leisure & Adventure',
    interests: ['Nature', 'Adventure', 'Photography'],
    recommendations: [],
    selectedAttractions: [],
    itinerary: null,
    budgetSummary: null,
    weather: null,
  });

  const updateTripPlan = (fields) => {
    setTripPlan((prev) => ({ ...prev, ...fields }));
  };

  const toggleAttraction = (attraction) => {
    setTripPlan((prev) => {
      const exists = prev.selectedAttractions.some((a) => a.id === attraction.id);
      let updated;
      if (exists) {
        updated = prev.selectedAttractions.filter((a) => a.id !== attraction.id);
      } else {
        updated = [...prev.selectedAttractions, attraction];
      }
      return { ...prev, selectedAttractions: updated };
    });
  };

  return (
    <TripContext.Provider value={{ tripPlan, setTripPlan, updateTripPlan, toggleAttraction }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
