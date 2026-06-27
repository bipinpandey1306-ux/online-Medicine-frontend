import React, { createContext, useContext, useState, useEffect } from "react";

export interface LocationData {
  address: string;
  pincode: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

interface LocationContextType {
  location: LocationData | null;
  setLocationData: (data: LocationData | null) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);

  // Load saved location on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("current_location_address");
    const savedPincode = localStorage.getItem("current_location_pincode");
    const savedCity = localStorage.getItem("current_location_city");
    const savedState = localStorage.getItem("current_location_state");
    const savedCoordsStr = localStorage.getItem("current_location_coords");

    if (savedAddress || savedPincode) {
      let coordinates: { lat: number; lng: number } | null = null;
      if (savedCoordsStr) {
        try {
          coordinates = JSON.parse(savedCoordsStr);
        } catch (e) {
          console.error("Error parsing saved coordinates", e);
        }
      }

      setLocation({
        address: savedAddress || "",
        pincode: savedPincode || "",
        city: savedCity || "",
        state: savedState || "",
        coordinates,
      });
    }
  }, []);

  const setLocationData = (data: LocationData | null) => {
    setLocation(data);
    if (data) {
      localStorage.setItem("current_location_address", data.address);
      localStorage.setItem("current_location_pincode", data.pincode);
      localStorage.setItem("current_location_city", data.city);
      localStorage.setItem("current_location_state", data.state);
      if (data.coordinates) {
        localStorage.setItem("current_location_coords", JSON.stringify(data.coordinates));
      } else {
        localStorage.removeItem("current_location_coords");
      }
    } else {
      clearLocation();
    }
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem("current_location_address");
    localStorage.removeItem("current_location_pincode");
    localStorage.removeItem("current_location_city");
    localStorage.removeItem("current_location_state");
    localStorage.removeItem("current_location_coords");
  };

  return (
    <LocationContext.Provider value={{ location, setLocationData, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
