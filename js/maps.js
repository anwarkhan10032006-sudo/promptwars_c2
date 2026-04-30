/**
 * @file maps.js
 * @description Google Maps API integration with mock GeoJSON polling stations.
 */
import { MAP_CONFIG } from './constants.js';

let map = null;

// Mock GeoJSON data for polling stations
const mockStations = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-77.0369, 38.9072] },
            properties: { name: "Downtown Community Center", address: "123 Main St", hours: "7AM - 8PM" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-77.0469, 38.9172] },
            properties: { name: "Northside Library", address: "456 Oak Ave", hours: "7AM - 8PM" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-77.0269, 38.8972] },
            properties: { name: "South High School", address: "789 Pine Ln", hours: "6AM - 9PM" }
        }
    ]
};

/**
 * Initializes the Google Map.
 * Note: Assumes Google Maps script is loaded with a valid API key, or relies on mock implementation if API fails.
 */
export async function initMap() {
    try {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return { source: 'maps', message: 'Map container not found', fallback: true };

        // Check if google maps is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            throw new Error("Google Maps API not loaded");
        }

        map = new google.maps.Map(mapContainer, {
            center: MAP_CONFIG.DEFAULT_CENTER,
            zoom: MAP_CONFIG.DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false
        });

        // Add mock stations
        renderStationList(mockStations.features);
        
        mockStations.features.forEach(station => {
            const marker = new google.maps.Marker({
                position: { lat: station.geometry.coordinates[1], lng: station.geometry.coordinates[0] },
                map: map,
                title: station.properties.name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${station.properties.name}</b><br>${station.properties.address}<br>Hours: ${station.properties.hours}`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });

        return { success: true };
    } catch (error) {
        console.warn("[Maps] Map initialization failed, rendering fallback list.", error);
        renderFallbackMap();
        return { source: 'maps', message: error.message, fallback: true };
    }
}

/**
 * Renders a fallback if maps API fails.
 */
function renderFallbackMap() {
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Interactive map unavailable (offline demo mode). See list below.</div>';
    renderStationList(mockStations.features);
}

/**
 * Renders the list of stations below the map.
 * @param {Array} features 
 */
function renderStationList(features) {
    const listContainer = document.getElementById('map-list');
    listContainer.innerHTML = '<h3>Nearby Polling Stations</h3>';
    
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    
    features.forEach(f => {
        const li = document.createElement('li');
        li.style.padding = '10px';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.innerHTML = `<strong>${f.properties.name}</strong><br><small>${f.properties.address} | ${f.properties.hours}</small>`;
        ul.appendChild(li);
    });
    
    listContainer.appendChild(ul);
}

/**
 * Shows the map section in the UI.
 */
export function showMapSection() {
    const mapSection = document.getElementById('map-section');
    mapSection.classList.remove('hidden');
    // Map needs a resize event if it was hidden when initialized
    if (map && typeof google !== 'undefined') {
        google.maps.event.trigger(map, 'resize');
        map.setCenter(MAP_CONFIG.DEFAULT_CENTER);
    }
}
