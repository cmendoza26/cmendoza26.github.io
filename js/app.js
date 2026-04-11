const appState = {
    selectedCity: '',
    cities: [],
    isRunning: true,
    updateInterval: null,
    theme: 'light',
    currentPhase: 1,
};

const dom = {
    citySelect: document.getElementById('city-select'),
    currentCity: document.getElementById('current-city'),
    currentTime: document.getElementById('current-time'),
    currentTimezone: document.getElementById('current-timezone'),
    pauseBtn: document.getElementById('pause-btn'),
    resumeBtn: document.getElementById('resume-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    basicSection: document.getElementById('basic-section'),
    citiesSection: document.getElementById('cities-section'),
    addCityBtn: document.getElementById('add-city-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    citiesList: document.getElementById('cities-list'),
    toastContainer: document.getElementById('toast-container'),
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
    const savedTheme = localStorage.getItem('theme') || 'light';
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
    
    dom.pauseBtn.addEventListener('click', pauseUpdates);
    dom.resumeBtn.addEventListener('click', resumeUpdates);
    
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
}

function startTimeUpdates() {
    updateTimeDisplay();
    
    appState.updateInterval = setInterval(() => {
        if (appState.isRunning) {
            updateTimeDisplay();
            if (appState.currentPhase >= 2) {
                updateCitiesDisplay();
            }
        }
    }, 1000);
}

function pauseUpdates() {
    appState.isRunning = false;
    dom.pauseBtn.style.display = 'none';
    dom.resumeBtn.style.display = 'inline-block';
}

function resumeUpdates() {
    appState.isRunning = true;
    dom.pauseBtn.style.display = 'inline-block';
    dom.resumeBtn.style.display = 'none';
    updateTimeDisplay();
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
    
    // Controls
    pauseUpdates: pauseUpdates,
    resumeUpdates: resumeUpdates,
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
console.log('%cControls:', 'font-weight: bold;');
console.log('  globalTimeApp.pauseUpdates() - Pause timers');
console.log('  globalTimeApp.resumeUpdates() - Resume timers');
