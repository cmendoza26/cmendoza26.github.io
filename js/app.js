const appState = {
    selectedCity: '',
    cities: [],
    isRunning: true,
    updateInterval: null,
    theme: 'dark',
    currentPhase: 1,
};

const dom = {
    citySelect: document.getElementById('city-select'),
    currentCity: document.getElementById('current-city'),
    currentTime: document.getElementById('current-time'),
    currentTimezone: document.getElementById('current-timezone'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    basicSection: document.getElementById('basic-section'),
    citiesSection: document.getElementById('cities-section'),
    addCityBtn: document.getElementById('add-city-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    citiesList: document.getElementById('cities-list'),
    toastContainer: document.getElementById('toast-container'),
    clockCanvas: document.getElementById('3d-clock'),
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadSettings();
    setupEventListeners();
    populateCityDropdown();
    applyTheme(appState.theme);
    updateThemeButtonUI();
    activatePhase2();
    
    if (appState.cities.length > 0) {
        updateCitiesDisplay();
    }
    
    startTimeUpdates();

    console.log('Global Time App initialized');
}

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    appState.theme = savedTheme;
    
    const savedCities = localStorage.getItem('cities');
    if (savedCities) {
        try {
            appState.cities = JSON.parse(savedCities);
        } catch (e) {
            appState.cities = [];
        }
    }
    
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        appState.selectedCity = savedCity;
    }
}

function saveSettings() {
    localStorage.setItem('theme', appState.theme);
    localStorage.setItem('cities', JSON.stringify(appState.cities));
    localStorage.setItem('selectedCity', appState.selectedCity);
}

function setupEventListeners() {
    dom.citySelect.addEventListener('change', (e) => {
        const cityName = e.target.value;
        if (cityName) {
            setSelectedCity(cityName);
        }
    });

    dom.themeToggle?.addEventListener('click', toggleTheme);

    dom.addCityBtn?.addEventListener('click', showAddCityDialog);
    dom.clearAllBtn?.addEventListener('click', clearAllCities);
}

function populateCityDropdown() {
    const cityNames = getCityNames();
    
    while (dom.citySelect.children.length > 1) {
        dom.citySelect.removeChild(dom.citySelect.lastChild);
    }
    
    cityNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dom.citySelect.appendChild(option);
    });
    
    if (appState.selectedCity) {
        dom.citySelect.value = appState.selectedCity;
    }
}

function setSelectedCity(cityName) {
    appState.selectedCity = cityName;
    dom.citySelect.value = cityName;
    saveSettings();
    updateTimeDisplay();
}

function updateTimeDisplay() {
    if (!appState.selectedCity) {
        dom.currentCity.textContent = 'Select a city';
        dom.currentTime.textContent = '--:--:--';
        dom.currentTimezone.textContent = 'Timezone: UTC';
        draw3DClock(null);
        return;
    }

    const city = getCityByName(appState.selectedCity);
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

    dom.currentCity.textContent = city.name;
    dom.currentTime.textContent = timeString;
    dom.currentTimezone.textContent = `Timezone: ${city.timezone}`;

    // Draw 3D clock with current time
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    draw3DClock({ hours, minutes, seconds });
}

function startTimeUpdates() {
    updateTimeDisplay();

    appState.updateInterval = setInterval(() => {
        updateTimeDisplay();
        if (appState.currentPhase >= 2) {
            updateCitiesDisplay();
        }
    }, 1000);
}

function activatePhase2() {
    appState.currentPhase = 2;
    dom.citiesSection.style.display = 'block';
}

function addCity(cityName) {
    if (!appState.cities.includes(cityName)) {
        appState.cities.push(cityName);
        saveSettings();
        updateCitiesDisplay();
        showToast(`Added ${cityName}`, 'success');
    }
}

function removeCity(cityName) {
    appState.cities = appState.cities.filter(c => c !== cityName);
    saveSettings();
    updateCitiesDisplay();
    showToast(`Removed ${cityName}`, 'success');
}

function clearAllCities() {
    if (appState.cities.length === 0) return;
    
    if (confirm('Are you sure you want to clear all cities?')) {
        appState.cities = [];
        saveSettings();
        updateCitiesDisplay();
        showToast('All cities cleared', 'success');
    }
}

function updateCitiesDisplay() {
    if (appState.cities.length === 0) {
        dom.citiesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No cities added. Click "Add City" to get started.</p>';
        return;
    }
    
    dom.citiesList.innerHTML = appState.cities.map(cityName => {
        const city = getCityByName(cityName);
        if (!city) return '';
        
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: city.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const timeString = formatter.format(now);
        
        return `
            <div class="city-item">
                <div class="city-item-header">
                    <h4>${city.name}</h4>
                    <button class="city-item-remove" title="Remove ${city.name}" 
                            onclick="removeCity('${city.name}')">×</button>
                </div>
                <div class="city-time">${timeString}</div>
                <div class="city-timezone">${city.timezone}</div>
            </div>
        `;
    }).join('');
}

function showAddCityDialog() {
    const availableCities = getCityNames().filter(name => !appState.cities.includes(name));
    
    if (availableCities.length === 0) {
        showToast('All cities already added!', 'info');
        return;
    }
    
    let html = '<select id="dialog-city-select" style="width: 100%; padding: 8px; margin-bottom: 12px;">\n';
    html += '<option value="">-- Select a city --</option>\n';
    availableCities.forEach(name => {
        html += `<option value="${name}">${name}</option>\n`;
    });
    html += '</select>';
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: var(--bg-primary);
        padding: 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-hover);
        max-width: 400px;
        width: 90%;
    `;
    
    dialog.innerHTML = `
        <h3 style="margin-bottom: 12px;">Add a City</h3>
        ${html}
        <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary" id="dialog-add-btn" style="flex: 1;">Add</button>
            <button class="btn btn-secondary" id="dialog-cancel-btn" style="flex: 1;">Cancel</button>
        </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    const selectEl = dialog.querySelector('#dialog-city-select');
    
    document.getElementById('dialog-add-btn').addEventListener('click', () => {
        const cityName = selectEl.value;
        if (cityName) {
            addCity(cityName);
            document.body.removeChild(modal);
        }
    });
    
    document.getElementById('dialog-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    selectEl.focus();
}

function applyTheme(theme) {
    appState.theme = theme;
    document.body.className = theme;
    updateThemeButtonUI();
    saveSettings();
}

function updateThemeButtonUI() {
    if (!dom.themeToggle) return;
    
    const isDark = appState.theme === 'dark';
    dom.themeIcon.textContent = isDark ? '☀️' : '🌙';
    dom.themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
    const newTheme = appState.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            dom.toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

function draw3DClock(timeData) {
    const canvas = dom.clockCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Get computed colors from the document
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-tertiary').trim();
    const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
    const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim();
    const borderColor = computedStyle.getPropertyValue('--border-color').trim();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!timeData) {
        // Draw placeholder
        ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    // Draw 3D clock face with depth effect
    // Shadow/3D effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 2, radius * 1.15, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clock face background with slight 3D effect
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Clock border with 3D depth
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner circle for depth
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    // Draw hour markers
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = centerX + Math.cos(angle) * (radius * 0.75);
        const y = centerY + Math.sin(angle) * (radius * 0.75);
        ctx.fillText(i, x, y);
    }

    // Draw minute markers
    ctx.strokeStyle = textSecondary;
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) {
            const angle = (i * 6 - 90) * Math.PI / 180;
            const x1 = centerX + Math.cos(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius * 0.92);
            const y1 = centerY + Math.sin(angle) * radius;
            const y2 = centerY + Math.sin(angle) * (radius * 0.92);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    const hours = timeData.hours % 12;
    const minutes = timeData.minutes;
    const seconds = timeData.seconds;

    // Hour hand
    const hourAngle = (hours * 30 + minutes * 0.5 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(hourAngle) * (radius * 0.5),
        centerY + Math.sin(hourAngle) * (radius * 0.5)
    );
    ctx.strokeStyle = textPrimary;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const minuteAngle = (minutes * 6 + seconds * 0.1 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(minuteAngle) * (radius * 0.65),
        centerY + Math.sin(minuteAngle) * (radius * 0.65)
    );
    ctx.strokeStyle = textPrimary;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Second hand
    const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(secondAngle) * (radius * 0.7),
        centerY + Math.sin(secondAngle) * (radius * 0.7)
    );
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center circle (3D effect)
    ctx.fillStyle = textPrimary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Center circle highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY - 2, 4, 0, Math.PI * 2);
    ctx.fill();
}

window.globalTimeApp = {
    // State
    getState: () => appState,
    getCities: getCityNames,

    // City Management
    addCity: addCity,
    removeCity: removeCity,
    setSelectedCity: setSelectedCity,
    clearAllCities: clearAllCities,

    // Theme
    toggleTheme: toggleTheme,
    getTheme: () => appState.theme,

    // Phases
    activatePhase2: activatePhase2,
};

// Log available commands for development
console.log('%c=== Global Time App Debug Commands ===', 'color: #2563eb; font-weight: bold;');
console.log('%cState & Cities:', 'font-weight: bold;');
console.log('  globalTimeApp.getState() - View app state');
console.log('  globalTimeApp.getCities() - List all available cities');
console.log('  globalTimeApp.addCity("CityName") - Add a city');
console.log('  globalTimeApp.removeCity("CityName") - Remove a city');
console.log('  globalTimeApp.clearAllCities() - Clear all selected cities');
console.log('%cTheme:', 'font-weight: bold;');
console.log('  globalTimeApp.toggleTheme() - Switch dark/light mode');
console.log('  globalTimeApp.getTheme() - Get current theme');
