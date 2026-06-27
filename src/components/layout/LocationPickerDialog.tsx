import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationContext } from "@/context/LocationContext";
import { loadGoogleMaps } from "@/lib/mapLoader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Loader2, 
  Check, 
  AlertCircle,
  Building,
  Map,
  Compass
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationPickerDialog({ isOpen, onClose }: LocationPickerDialogProps) {
  const { location, setLocationData } = useLocationContext();
  const { toast } = useToast();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const isGoogleMaps = !!apiKey;

  // Map state
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingLib, setLoadingLib] = useState(false);

  // Position state (Default to New Delhi)
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.209 });
  const [isLocating, setIsLocating] = useState(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Detailed address form state
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [streetDetails, setStreetDetails] = useState("");
  const [buildingDetails, setBuildingDetails] = useState("");
  const [landmark, setLandmark] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Set initial coordinates and form details if location is already saved
  useEffect(() => {
    if (isOpen) {
      if (location) {
        if (location.coordinates) {
          setCoords(location.coordinates);
        }
        setPincode(location.pincode || "");
        setCity(location.city || "");
        setStateName(location.state || "");
        
        // Parse street details if they exist in saved address
        const addr = location.address || "";
        setStreetDetails(addr);
      }
    }
  }, [isOpen, location]);

  // Load Map Library
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    let active = true;
    setLoadingLib(true);

    const initMap = async () => {
      try {
        if (isGoogleMaps) {
          const google = await loadGoogleMaps(apiKey);
          if (!active) return;
          
          const map = new google.maps.Map(mapRef.current!, {
            center: coords,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          mapInstanceRef.current = map;

          const marker = new google.maps.Marker({
            position: coords,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          // Handle marker dragend
          google.maps.event.addListener(marker, "dragend", async () => {
            const pos = marker.getPosition();
            if (pos) {
              const newCoords = { lat: pos.lat(), lng: pos.lng() };
              setCoords(newCoords);
              await reverseGeocode(newCoords.lat, newCoords.lng);
            }
          });

          setMapInstance(map);
          setMarkerInstance(marker);
        } else {
          // Leaflet fallback
          if (!active) return;

          // Standard Leaflet marker icon fix
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });

          // Create map div if not initialized
          const map = L.map(mapRef.current!).setView([coords.lat, coords.lng], 15);
          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);

          // Handle marker dragend
          marker.on("dragend", async () => {
            const pos = marker.getLatLng();
            const newCoords = { lat: pos.lat, lng: pos.lng };
            setCoords(newCoords);
            await reverseGeocode(newCoords.lat, newCoords.lng);
          });

          // Leaflet invalidation resize fix (runs repeatedly for 1.5s during entry animation)
          let count = 0;
          const interval = setInterval(() => {
            if (map && !mapInstanceRef.current) {
              clearInterval(interval);
              return;
            }
            try {
              map.invalidateSize();
            } catch (e) {
              console.error("Error invalidating size", e);
            }
            count++;
            if (count >= 15) {
              clearInterval(interval);
            }
          }, 100);

          setMapInstance(map);
          setMarkerInstance(marker);
        }
        setMapLoaded(true);
      } catch (err) {
        console.error("Map load error:", err);
        toast({
          variant: "destructive",
          title: "Map Load Error",
          description: "Could not load the interactive map. Check your connection or API configuration.",
        });
      } finally {
        setLoadingLib(false);
      }
    };

    initMap();

    return () => {
      active = false;
      // Clean up map instance
      if (mapInstanceRef.current) {
        if (!isGoogleMaps) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.error("Error removing map instance", e);
          }
        }
        mapInstanceRef.current = null;
      }
      setMapInstance(null);
      setMarkerInstance(null);
      setMapLoaded(false);
    };
  }, [isOpen, isGoogleMaps]);

  // Update map center and marker when coords state changes
  useEffect(() => {
    if (!mapInstance || !markerInstance || !mapLoaded) return;

    if (isGoogleMaps) {
      const latLng = new (window as any).google.maps.LatLng(coords.lat, coords.lng);
      mapInstance.panTo(latLng);
      markerInstance.setPosition(latLng);
    } else {
      mapInstance.panTo([coords.lat, coords.lng]);
      markerInstance.setLatLng([coords.lat, coords.lng]);
    }
  }, [coords, mapInstance, markerInstance, mapLoaded, isGoogleMaps]);

  // Reverse Geocoding: Coords -> Address Details
  const reverseGeocode = async (lat: number, lng: number) => {
    if (isGoogleMaps) {
      const google = (window as any).google;
      if (!google || !google.maps) return;
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const result = results[0];
          setStreetDetails(result.formatted_address);
          
          let pin = "";
          let cty = "";
          let st = "";
          
          for (const comp of result.address_components) {
            if (comp.types.includes("postal_code")) pin = comp.long_name;
            if (comp.types.includes("locality")) cty = comp.long_name;
            if (comp.types.includes("administrative_area_level_1")) st = comp.long_name;
          }
          
          if (pin) setPincode(pin);
          if (cty) setCity(cty);
          if (st) setStateName(st);
        }
      });
    } else {
      // OSM Nominatim Reverse Geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        if (response.ok) {
          const data = await response.json();
          setStreetDetails(data.display_name || "");
          
          const addr = data.address || {};
          const pin = addr.postcode || "";
          const cty = addr.city || addr.town || addr.suburb || addr.village || addr.county || "";
          const st = addr.state || "";
          
          if (pin) setPincode(pin);
          if (cty) setCity(cty);
          if (st) setStateName(st);
        }
      } catch (err) {
        console.error("OSM Geocoding error:", err);
      }
    }
  };

  // Autocomplete search handlers
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    if (isGoogleMaps) {
      const google = (window as any).google;
      if (!google || !google.maps || !google.maps.places) {
        setSearching(false);
        return;
      }
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: value, componentRestrictions: { country: "in" } },
        (predictions: any, status: any) => {
          setSearching(false);
          if (status === "OK" && predictions) {
            setSuggestions(
              predictions.map((p: any) => ({
                id: p.place_id,
                description: p.description,
                source: "google",
              }))
            );
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      // OSM search
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&countrycodes=in&limit=5&addressdetails=1`
        );
        setSearching(false);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(
            data.map((item: any, index: number) => ({
              id: `osm-${index}`,
              description: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              address: item.address || {},
              source: "osm",
            }))
          );
        }
      } catch (err) {
        console.error("OSM Search error:", err);
        setSearching(false);
      }
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setSearchQuery("");
    setSuggestions([]);

    if (suggestion.source === "google") {
      const google = (window as any).google;
      const mapDiv = document.createElement("div");
      const service = new google.maps.places.PlacesService(mapDiv);
      
      service.getDetails({ placeId: suggestion.id }, (place: any, status: any) => {
        if (status === "OK" && place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newCoords = { lat, lng };
          
          setCoords(newCoords);
          setStreetDetails(place.formatted_address || place.name || "");
          
          let pin = "";
          let cty = "";
          let st = "";
          
          for (const comp of place.address_components) {
            if (comp.types.includes("postal_code")) pin = comp.long_name;
            if (comp.types.includes("locality")) cty = comp.long_name;
            if (comp.types.includes("administrative_area_level_1")) st = comp.long_name;
          }
          
          if (pin) setPincode(pin);
          if (cty) setCity(cty);
          if (st) setStateName(st);
        }
      });
    } else {
      // OSM Suggestion selection
      const newCoords = { lat: suggestion.lat, lng: suggestion.lng };
      setCoords(newCoords);
      setStreetDetails(suggestion.description);
      
      const addr = suggestion.address || {};
      const pin = addr.postcode || "";
      const cty = addr.city || addr.town || addr.suburb || addr.village || addr.county || "";
      const st = addr.state || "";
      
      if (pin) setPincode(pin);
      if (cty) setCity(cty);
      if (st) setStateName(st);
    }
  };

  // Browser Geolocation: GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        await reverseGeocode(newCoords.lat, newCoords.lng);
        setIsLocating(false);
        toast({
          title: "Location detected",
          description: "Coordinates successfully updated from your device.",
        });
      },
      (error) => {
        console.error("GPS Error:", error);
        setIsLocating(false);
        let msg = "Could not access location. Please check browser permissions.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser settings.";
        }
        toast({
          variant: "destructive",
          title: "Location Access Failed",
          description: msg,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit address details
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || !city || !stateName || !streetDetails) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill in all the required fields (Street, Pincode, City, State).",
      });
      return;
    }

    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      toast({
        variant: "destructive",
        title: "Invalid Pincode",
        description: "Pincode must be a 6-digit number.",
      });
      return;
    }

    setIsFormSubmitting(true);

    const fullFormattedAddress = [
      buildingDetails ? `Building: ${buildingDetails}` : "",
      streetDetails,
      landmark ? `Landmark: ${landmark}` : "",
      `${city}, ${stateName} - ${pincode}`,
    ]
      .filter(Boolean)
      .join(", ");

    setLocationData({
      address: fullFormattedAddress,
      pincode,
      city,
      state: stateName,
      coordinates: coords,
    });

    // Update logged-in user profile address if logged in
    const userStr = localStorage.getItem("customer_user");
    const token = localStorage.getItem("customer_token");
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        // Save locally to user object
        user.address = fullFormattedAddress;
        localStorage.setItem("customer_user", JSON.stringify(user));
        
        // Push update to backend database
        fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: user.name,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            address: fullFormattedAddress
          })
        }).catch(err => console.error("Error updating profile address", err));
      } catch (e) {
        console.error("Error parsing user on save", e);
      }
    }

    setIsFormSubmitting(false);
    toast({
      title: "Location Saved!",
      description: `Delivery location set to ${city} - ${pincode}`,
    });
    onClose();
    // Dispatch custom event to let pages know location changed
    window.dispatchEvent(new Event("locationChanged"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[92vw] sm:max-w-4xl p-0 overflow-hidden rounded-3xl border shadow-2xl h-[90vh] max-h-[850px] flex flex-col sm:flex-row bg-background">
        
        {/* Left Column - Map Canvas & Search Autocomplete */}
        <div className="w-full sm:w-1/2 relative bg-muted/20 flex flex-col border-b sm:border-b-0 sm:border-r h-[45%] sm:h-full">
          {/* Autocomplete Search input container (Sits at the top, map renders below it) */}
          <div className="relative p-4 bg-background border-b z-40">
            <div className="relative shadow-sm rounded-full overflow-hidden bg-muted/40 border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search location, society, road..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-11 pl-11 pr-4 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/80 font-medium"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
              )}
            </div>

            {/* Suggestions Overlay */}
            {suggestions.length > 0 && (
              <div className="absolute top-[calc(100%-8px)] left-4 right-4 bg-white rounded-2xl shadow-xl border overflow-hidden max-h-[220px] overflow-y-auto divide-y z-50 mt-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors flex items-start gap-2.5 font-medium text-foreground/90"
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{suggestion.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map canvas */}
          <div className="flex-1 w-full relative z-10" ref={mapRef} style={{ height: "100%", width: "100%" }}>
            {loadingLib && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-30">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">Loading map renderer...</p>
              </div>
            )}
          </div>

          {/* Detect my location button overlay */}
          <div className="absolute bottom-4 right-4 z-20">
            <Button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              size="sm"
              className="rounded-full shadow-lg gap-2 cursor-pointer font-bold px-4 bg-primary hover:bg-primary/95 text-white h-10 border border-primary/10 transition-transform active:scale-95"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 animate-pulse text-white" />
                  Detect Location
                </>
              )}
            </Button>
          </div>

          {/* Map Info Overlay Banner */}
          {!isGoogleMaps && (
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <span className="text-[9px] bg-black/75 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-white/10">
                <Compass className="h-3 w-3 text-secondary animate-spin-slow" />
                Powered by OpenStreetMap
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Address details Form */}
        <div className="w-full sm:w-1/2 flex flex-col h-[55%] sm:h-full bg-background">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address Details
            </DialogTitle>
          </DialogHeader>

          {/* Form Scroll Area */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Warning Alert if no Google Key is provided to instruct users */}
            {!isGoogleMaps && (
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/50 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 leading-normal">
                  <strong>OpenStreetMap Mode:</strong> Drag the map marker, click "Detect Location" or search to automatically resolve address details.
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5 text-primary" /> Street Address / Location*
                </label>
                <textarea
                  required
                  rows={2}
                  value={streetDetails}
                  onChange={(e) => setStreetDetails(e.target.value)}
                  placeholder="Street name, locality, area details"
                  className="flex w-full rounded-xl border border-input bg-transparent px-3.5 py-2 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 resize-none font-medium"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" /> House / Flat No, Building Name
                </label>
                <Input
                  value={buildingDetails}
                  onChange={(e) => setBuildingDetails(e.target.value)}
                  placeholder="Flat 102, Blossom Apartments"
                  className="rounded-xl border h-10 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                  Pincode*
                </label>
                <Input
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit pincode"
                  className="rounded-xl border h-10 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                  City*
                </label>
                <Input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Noida"
                  className="rounded-xl border h-10 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                  State*
                </label>
                <Input
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="rounded-xl border h-10 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                  Landmark (Optional)
                </label>
                <Input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="rounded-xl border h-10 font-medium"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-5 mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl h-11 px-5 font-bold cursor-pointer transition-all border-muted hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isFormSubmitting}
                className="rounded-xl h-11 px-6 font-bold bg-primary hover:bg-primary/95 text-white cursor-pointer shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                {isFormSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save & Confirm
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
