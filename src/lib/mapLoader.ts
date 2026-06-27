/**
 * Dynamically loads Leaflet (OpenStreetMap) CSS and JS from CDN
 */
export function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }

    // Check if stylesheet is already added
    let cssLink = document.querySelector('link[href*="leaflet.css"]');
    if (!cssLink) {
      cssLink = document.createElement("link");
      (cssLink as any).rel = "stylesheet";
      (cssLink as any).href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);
    }

    // Load Leaflet script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).L) {
        resolve((window as any).L);
      } else {
        reject(new Error("Leaflet script loaded but L is not defined"));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load Leaflet script"));
    };
    document.body.appendChild(script);
  });
}

/**
 * Dynamically loads Google Maps JavaScript SDK
 */
export function loadGoogleMaps(apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve((window as any).google);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to finish loading
      const interval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(interval);
          resolve((window as any).google);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Google Maps load timeout"));
      }, 15000);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google);
      } else {
        reject(new Error("Google Maps loaded but namespace is missing"));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script"));
    };
    document.body.appendChild(script);
  });
}
