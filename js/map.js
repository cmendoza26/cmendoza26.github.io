let mapInstance = null;
let mapMarkers = {};

function initLeafletMap() {
    if (mapInstance) return;
    
    mapInstance = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        backgroundColor: 'var(--bg-primary)',
    }).addTo(mapInstance);
    
    addAllCityMarkers();
    
    console.log('Leaflet map initialized');
}

function addAllCityMarkers() {
    if (!mapInstance) return;
    
    Object.values(mapMarkers).forEach(marker => mapInstance.removeLayer(marker));
    mapMarkers = {};
    
    appState.cities.forEach(cityName => {
        addCityMarker(cityName);
    });
}

/**
 * Add a marker for a specific city
 * @param {string} cityName - City name
 */
function addCityMarker(cityName) {
    if (!mapInstance) return;
    
    const city = getCityByName(cityName);
    if (!city || mapMarkers[cityName]) return;
    
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: city.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const timeString = formatter.format(now);
    
    const marker = L.circleMarker(city.coords, {
        radius: 8,
        fillColor: 'var(--accent-color)',
        color: 'var(--accent-color)',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
    }).addTo(mapInstance);
    
    const popupContent = `
        <div style="text-align: center;">
            <strong>${city.name}</strong><br>
            <span style="font-family: monospace; font-size: 1.2em;">${timeString}</span><br>
            <small>${city.timezone}</small>
        </div>
    `;
    marker.bindPopup(popupContent);
    
    marker.on('mouseover', () => {
        marker.setStyle({
            radius: 10,
            fillOpacity: 0.9,
        });
        marker.openPopup();
    });
    
    marker.on('mouseout', () => {
        marker.setStyle({
            radius: 8,
            fillOpacity: 0.7,
        });
        marker.closePopup();
    });
    
    marker.on('click', () => {
        mapInstance.setView(city.coords, 4);
        
        const cityCards = document.querySelectorAll('.city-item');
        cityCards.forEach(card => card.classList.remove('active'));
        
        const selectedCard = Array.from(cityCards).find(card => 
            card.textContent.includes(city.name)
        );
        if (selectedCard) {
            selectedCard.classList.add('active');
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    mapMarkers[cityName] = marker;
}

/**
 * Remove marker for a specific city
 * @param {string} cityName - City name
 */
function removeCityMarker(cityName) {
    if (mapInstance && mapMarkers[cityName]) {
        mapInstance.removeLayer(mapMarkers[cityName]);
        delete mapMarkers[cityName];
    }
}

function updateMapMarkers() {
    if (!mapInstance) return;
    addAllCityMarkers();
}

function updateMarkerPopups() {
    if (!mapInstance) return;
    
    Object.entries(mapMarkers).forEach(([cityName, marker]) => {
        const city = getCityByName(cityName);
        if (!city) return;
        
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: city.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const timeString = formatter.format(now);
        
        const popupContent = `
            <div style="text-align: center;">
                <strong>${city.name}</strong><br>
                <span style="font-family: monospace; font-size: 1.2em;">${timeString}</span><br>
                <small>${city.timezone}</small>
            </div>
        `;
        
        if (marker.isPopupOpen()) {
            marker.setPopupContent(popupContent);
        }
    });
}

function onCityAdded(cityName) {
    if (mapInstance) {
        addCityMarker(cityName);
    }
}

function onCityRemoved(cityName) {
    removeCityMarker(cityName);
}
