const CITIES = [
    // North America
    { name: 'New York', timezone: 'America/New_York', coords: [40.7128, -74.0060] },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', coords: [34.0522, -118.2437] },
    { name: 'Chicago', timezone: 'America/Chicago', coords: [41.8781, -87.6298] },
    { name: 'Toronto', timezone: 'America/Toronto', coords: [43.6532, -79.3832] },
    { name: 'Mexico City', timezone: 'America/Mexico_City', coords: [19.4326, -99.1332] },
    
    // South America
    { name: 'São Paulo', timezone: 'America/Sao_Paulo', coords: [-23.5505, -46.6333] },
    { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', coords: [-34.6037, -58.3816] },
    { name: 'Lima', timezone: 'America/Lima', coords: [-12.0464, -77.0428] },
    
    // Europe
    { name: 'London', timezone: 'Europe/London', coords: [51.5074, -0.1278] },
    { name: 'Paris', timezone: 'Europe/Paris', coords: [48.8566, 2.3522] },
    { name: 'Berlin', timezone: 'Europe/Berlin', coords: [52.5200, 13.4050] },
    { name: 'Madrid', timezone: 'Europe/Madrid', coords: [40.4168, -3.7038] },
    { name: 'Rome', timezone: 'Europe/Rome', coords: [41.9028, 12.4964] },
    { name: 'Amsterdam', timezone: 'Europe/Amsterdam', coords: [52.3676, 4.9041] },
    { name: 'Dublin', timezone: 'Europe/Dublin', coords: [53.3498, -6.2603] },
    { name: 'Stockholm', timezone: 'Europe/Stockholm', coords: [59.3293, 18.0686] },
    { name: 'Moscow', timezone: 'Europe/Moscow', coords: [55.7558, 37.6173] },
    { name: 'Istanbul', timezone: 'Europe/Istanbul', coords: [41.0082, 28.9784] },
    
    // Africa
    { name: 'Cairo', timezone: 'Africa/Cairo', coords: [30.0444, 31.2357] },
    { name: 'Lagos', timezone: 'Africa/Lagos', coords: [6.5244, 3.3792] },
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg', coords: [-26.2023, 28.0436] },
    { name: 'Nairobi', timezone: 'Africa/Nairobi', coords: [-1.2921, 36.8219] },
    
    // Middle East
    { name: 'Dubai', timezone: 'Asia/Dubai', coords: [25.2048, 55.2708] },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', coords: [13.7563, 100.5018] },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', coords: [22.3193, 114.1694] },
    { name: 'Singapore', timezone: 'Asia/Singapore', coords: [1.3521, 103.8198] },
    { name: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', coords: [3.1390, 101.6869] },
    
    // Asia
    { name: 'Tokyo', timezone: 'Asia/Tokyo', coords: [35.6762, 139.6503] },
    { name: 'Seoul', timezone: 'Asia/Seoul', coords: [37.5665, 126.9780] },
    { name: 'Shanghai', timezone: 'Asia/Shanghai', coords: [31.2304, 121.4737] },
    { name: 'Delhi', timezone: 'Asia/Kolkata', coords: [28.7041, 77.1025] },
    { name: 'Mumbai', timezone: 'Asia/Kolkata', coords: [19.0760, 72.8777] },
    { name: 'Manila', timezone: 'Asia/Manila', coords: [14.5995, 120.9842] },
    { name: 'Jakarta', timezone: 'Asia/Jakarta', coords: [-6.2088, 106.8456] },
    { name: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh', coords: [21.0285, 105.8542] },
    { name: 'Ho Chi Minh City', timezone: 'Asia/Ho_Chi_Minh', coords: [10.7769, 106.7009] },
    { name: 'Bengaluru', timezone: 'Asia/Kolkata', coords: [12.9716, 77.5946] },
    { name: 'Karachi', timezone: 'Asia/Karachi', coords: [24.8607, 67.0011] },
    
    // Oceania
    { name: 'Sydney', timezone: 'Australia/Sydney', coords: [-33.8688, 151.2093] },
    { name: 'Melbourne', timezone: 'Australia/Melbourne', coords: [-37.8136, 144.9631] },
    { name: 'Auckland', timezone: 'Pacific/Auckland', coords: [-37.7870, 174.7669] },
    { name: 'Fiji', timezone: 'Pacific/Fiji', coords: [-17.7134, 178.0650] },
    
    // Additional Major Cities
    { name: 'Doha', timezone: 'Asia/Qatar', coords: [25.2854, 51.5310] },
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg', coords: [-26.2023, 28.0436] },
    { name: 'Tel Aviv', timezone: 'Asia/Jerusalem', coords: [32.0954, 34.7694] },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', coords: [13.7563, 100.5018] },
    { name: 'Vancouver', timezone: 'America/Vancouver', coords: [49.2827, -123.1207] },
];

/**
 * Get a city by name
 * @param {string} name - City name
 * @returns {Object|null} City object or null if not found
 */
function getCityByName(name) {
    return CITIES.find(city => city.name === name) || null;
}

/**
 * Get all city names sorted alphabetically
 * @returns {Array<string>} Array of city names
 */
function getCityNames() {
    return CITIES.map(city => city.name).sort();
}

/**
 * Get timezone for a city
 * @param {string} name - City name
 * @returns {string} Timezone identifier
 */
function getCityTimezone(name) {
    const city = getCityByName(name);
    return city ? city.timezone : 'UTC';
}

/**
 * Get coordinates for a city
 * @param {string} name - City name
 * @returns {Array<number>} [latitude, longitude]
 */
function getCityCoords(name) {
    const city = getCityByName(name);
    return city ? city.coords : [0, 0];
}
