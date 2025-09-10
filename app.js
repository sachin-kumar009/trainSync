// Application State
let appState = {
    isLoggedIn: false,
    currentPage: 'login',
    theme: 'light',
    currentUser: null,
    trains: [],
    currentStation: 'NDLS',
    apiKey: 'demo-key' // Mock API key
};

// Sample data
const sampleTrainData = [
    {
        TrainNo: "12029",
        TrainName: "New Delhi Shatabdi",
        ExpectedArrival: "14:25",
        ActualArrival: "14:30",
        ExpectedDeparture: "14:30",
        ActualDeparture: "14:35",
        DelayMinutes: 5,
        Platform: "3",
        Type: "Express"
    },
    {
        TrainNo: "12426",
        TrainName: "Jammu Rajdhani",
        ExpectedArrival: "14:40",
        ActualArrival: "14:40",
        ExpectedDeparture: "14:45",
        ActualDeparture: "14:45",
        DelayMinutes: 0,
        Platform: "1",
        Type: "Passenger"
    },
    {
        TrainNo: "19024",
        TrainName: "FZR BCT Janta",
        ExpectedArrival: "14:55",
        ActualArrival: "15:05",
        ExpectedDeparture: "15:05",
        ActualDeparture: "15:15",
        DelayMinutes: 10,
        Platform: "5",
        Type: "Goods"
    }
];

const stationData = {
    'NDLS': sampleTrainData,
    'BCT': [
        {
            TrainNo: "12951",
            TrainName: "Mumbai Rajdhani",
            ExpectedArrival: "16:15",
            ActualArrival: "16:20",
            ExpectedDeparture: "16:25",
            ActualDeparture: "16:30",
            DelayMinutes: 5,
            Platform: "2",
            Type: "Express"
        },
        {
            TrainNo: "16031",
            TrainName: "Andaman Express",
            ExpectedArrival: "17:00",
            ActualArrival: "17:00",
            ExpectedDeparture: "17:05",
            ActualDeparture: "17:05",
            DelayMinutes: 0,
            Platform: "4",
            Type: "Passenger"
        }
    ],
    'HWH': [
        {
            TrainNo: "12345",
            TrainName: "Howrah Express",
            ExpectedArrival: "18:30",
            ActualArrival: "18:45",
            ExpectedDeparture: "18:35",
            ActualDeparture: "18:50",
            DelayMinutes: 15,
            Platform: "1",
            Type: "Express"
        }
    ],
    'MAS': [
        {
            TrainNo: "12601",
            TrainName: "Chennai Express",
            ExpectedArrival: "19:15",
            ActualArrival: "19:15",
            ExpectedDeparture: "19:20",
            ActualDeparture: "19:20",
            DelayMinutes: 0,
            Platform: "3",
            Type: "Passenger"
        }
    ]
};

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function updateClock() {
    const clockElements = document.querySelectorAll('#clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    clockElements.forEach(clock => {
        if (clock) clock.textContent = timeString;
    });
}

function setTheme(theme) {
    appState.theme = theme;
    document.documentElement.setAttribute('data-color-scheme', theme);
    
    // Update all theme toggle buttons
    const sunIcons = document.querySelectorAll('#sun-icon, #sun-icon-station');
    const moonIcons = document.querySelectorAll('#moon-icon, #moon-icon-station');
    
    sunIcons.forEach(icon => {
        icon.classList.toggle('hidden', theme === 'dark');
    });
    
    moonIcons.forEach(icon => {
        icon.classList.toggle('hidden', theme === 'light');
    });
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = pageId;
    }
    
    // Update navigation
    updateNavigation();
}

function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const pageId = href.replace('#', '');
            link.classList.toggle('active', pageId === appState.currentPage);
        }
    });
}

// Mock API Functions
async function mockLogin(username, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === 'admin' && password === 'hackathon123') {
        appState.isLoggedIn = true;
        appState.currentUser = { username: 'admin', role: 'operator' };
        return { success: true, token: 'mock-jwt-token' };
    } else {
        return { success: false, error: 'Invalid credentials' };
    }
}

async function mockFetchTrains(stationCode) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const trains = stationData[stationCode] || [];
    
    // Add some randomization to simulate real-time data
    return trains.map(train => ({
        ...train,
        DelayMinutes: train.DelayMinutes + Math.floor(Math.random() * 3) - 1 // +/- 1 minute variation
    }));
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    try {
        const result = await mockLogin(username, password);
        
        if (result.success) {
            errorElement.classList.add('hidden');
            showToast('Login successful! Welcome to Railway Control System.');
            
            // Load initial train data
            await loadTrainData('NDLS');
            
            // Navigate to dashboard and set dark mode as per user flow
            setTheme('dark');
            showPage('dashboard');
            startPeriodicUpdates();
        } else {
            errorElement.textContent = result.error;
            errorElement.classList.remove('hidden');
        }
    } catch (error) {
        errorElement.textContent = 'Login failed. Please try again.';
        errorElement.classList.remove('hidden');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    appState.isLoggedIn = false;
    appState.currentUser = null;
    appState.trains = [];
    
    // Stop periodic updates
    if (window.trainDataInterval) {
        clearInterval(window.trainDataInterval);
    }
    
    setTheme('light');
    showPage('login');
    showToast('Logged out successfully.');
}

// Train Data Functions
async function loadTrainData(stationCode) {
    try {
        const trains = await mockFetchTrains(stationCode);
        appState.trains = trains;
        appState.currentStation = stationCode;
        
        updateRecommendations();
        updateKPIMetrics();
        updateTrainTable();
        updateCurrentStationDisplay();
        
        return trains;
    } catch (error) {
        showToast('Failed to load train data', 'error');
        return [];
    }
}

function updateRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    const delayedTrains = appState.trains.filter(train => train.DelayMinutes > 3);
    
    if (delayedTrains.length === 0) {
        recommendationsList.innerHTML = `
            <div style="text-align: center; color: var(--color-text-secondary); padding: var(--space-16);">
                <p>All trains are running on schedule. No recommendations at this time.</p>
            </div>
        `;
        return;
    }
    
    const recommendations = delayedTrains.map(train => {
        const actions = [
            `Dispatch ${train.TrainNo} immediately`,
            `Hold ${train.TrainNo} at platform ${train.Platform}`,
            `Reroute ${train.TrainNo} via alternate track`,
            `Update passenger information for ${train.TrainName}`
        ];
        
        return {
            priority: train.DelayMinutes > 10 ? 'HIGH' : 'MED',
            text: actions[Math.floor(Math.random() * actions.length)]
        };
    });
    
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="recommendation-priority">${rec.priority}</span>
            <span class="recommendation-text">${rec.text}</span>
        </div>
    `).join('');
}

function updateKPIMetrics() {
    // Update delay progress bar
    const delayProgress = document.getElementById('delay-progress');
    const delayText = document.getElementById('delay-text');
    
    if (delayProgress && delayText) {
        const avgDelay = appState.trains.reduce((sum, train) => sum + train.DelayMinutes, 0) / appState.trains.length || 0;
        const delayPercentage = Math.min((avgDelay / 15) * 100, 100); // Max 15 minutes for 100%
        
        delayProgress.style.width = `${delayPercentage}%`;
        delayText.textContent = `${Math.round(avgDelay)} minutes`;
    }
    
    // Update throughput chart
    updateThroughputChart();
}

function updateThroughputChart() {
    const canvas = document.getElementById('throughput-chart');
    if (!canvas) return;
    
    // Generate sample throughput data
    const hours = [];
    const throughputData = [];
    
    for (let i = 6; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);
        hours.push(hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        throughputData.push(Math.floor(Math.random() * 20) + 10); // Random throughput between 10-30
    }
    
    // Destroy existing chart if it exists
    if (window.throughputChart) {
        window.throughputChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    window.throughputChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Trains per Hour',
                data: throughputData,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'var(--color-text-secondary)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'var(--color-border)'
                    },
                    ticks: {
                        color: 'var(--color-text-secondary)'
                    }
                }
            }
        }
    });
}

function updateTrainTable() {
    const tableBody = document.getElementById('train-table-body');
    if (!tableBody) return;
    
    if (appState.trains.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: var(--space-24); color: var(--color-text-secondary);">
                    No trains found for this station.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = appState.trains.map(train => {
        const delayClass = train.DelayMinutes === 0 ? 'delay-none' : 
                          train.DelayMinutes <= 5 ? 'delay-minor' : 'delay-major';
        
        const typeClass = `type-${train.Type.toLowerCase()}`;
        
        return `
            <tr class="train-row">
                <td>${train.TrainNo}</td>
                <td>${train.TrainName}</td>
                <td>${train.ExpectedArrival}</td>
                <td>${train.ActualArrival}</td>
                <td>${train.Platform}</td>
                <td class="delay-cell ${delayClass}">
                    ${train.DelayMinutes === 0 ? 'On Time' : `+${train.DelayMinutes} min`}
                </td>
                <td>
                    <span class="train-type ${typeClass}">${train.Type}</span>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCurrentStationDisplay() {
    const currentStationElements = document.querySelectorAll('#current-station');
    currentStationElements.forEach(element => {
        if (element) element.textContent = appState.currentStation;
    });
}

// Station Search Functions
async function handleStationSearch(event) {
    event.preventDefault();
    
    const stationCode = document.getElementById('station-code').value.toUpperCase();
    
    if (!stationCode) {
        showToast('Please enter a station code', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Searching...';
    submitBtn.disabled = true;
    
    try {
        await loadTrainData(stationCode);
        showToast(`Train data loaded for station ${stationCode}`);
    } catch (error) {
        showToast('Failed to load train data', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Periodic Updates
function startPeriodicUpdates() {
    // Update clock every second
    setInterval(updateClock, 1000);
    
    // Update train data every 20 seconds
    window.trainDataInterval = setInterval(() => {
        if (appState.isLoggedIn && appState.currentPage === 'dashboard') {
            loadTrainData(appState.currentStation);
        }
    }, 20000);
}

// Event Handlers
function setupEventHandlers() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Theme toggle buttons
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-station');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const newTheme = appState.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            showToast(`Switched to ${newTheme} mode`);
        });
    });
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                const pageId = href.replace('#', '');
                showPage(pageId);
            }
        });
    });
    
    // Logout buttons
    const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-station');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
    
    // Station search form
    const stationSearchForm = document.getElementById('station-search-form');
    if (stationSearchForm) {
        stationSearchForm.addEventListener('submit', handleStationSearch);
    }
    
    // Control bar buttons
    const acceptBtn = document.getElementById('accept-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            console.log('Accept Recommendation clicked');
            showToast('Recommendation accepted and implemented');
        });
    }
    
    const overrideBtn = document.getElementById('override-btn');
    if (overrideBtn) {
        overrideBtn.addEventListener('click', () => {
            console.log('Override Signal clicked');
            showToast('Manual override activated');
        });
    }
    
    const simulationBtn = document.getElementById('simulation-btn');
    if (simulationBtn) {
        simulationBtn.addEventListener('click', () => {
            console.log('Trigger Disruption Simulation clicked');
            showToast('Disruption simulation triggered');
            
            // Simulate adding delays to trains
            appState.trains = appState.trains.map(train => ({
                ...train,
                DelayMinutes: train.DelayMinutes + Math.floor(Math.random() * 10) + 5
            }));
            
            updateRecommendations();
            updateKPIMetrics();
            updateTrainTable();
        });
    }
    
    // Signal control modal
    const signalControlBtn = document.getElementById('signal-control-btn');
    const signalModal = document.getElementById('signal-modal');
    const closeModalBtn = document.getElementById('close-modal');
    
    if (signalControlBtn && signalModal) {
        signalControlBtn.addEventListener('click', () => {
            signalModal.classList.remove('hidden');
        });
    }
    
    if (closeModalBtn && signalModal) {
        closeModalBtn.addEventListener('click', () => {
            signalModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        signalModal.addEventListener('click', (e) => {
            if (e.target === signalModal) {
                signalModal.classList.add('hidden');
            }
        });
    }
    
    // Signal control buttons in modal
    const signalControlButtons = document.querySelectorAll('.signal-controls .btn');
    signalControlButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const signalText = btn.textContent;
            console.log(`Signal control: ${signalText}`);
            showToast(`Signal control activated: ${signalText}`);
            signalModal.classList.add('hidden');
        });
    });
}

// Hash-based routing
function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'login';
    
    // Only allow navigation to certain pages when logged in
    if (!appState.isLoggedIn && hash !== 'login') {
        window.location.hash = '#login';
        return;
    }
    
    showPage(hash);
}

// Initialize Application
function initializeApp() {
    // Set initial theme to light
    setTheme('light');
    
    // Set up event handlers
    setupEventHandlers();
    
    // Handle hash-based routing
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial hash
    handleHashChange();
    
    // Initialize clock
    updateClock();
    
    // Initialize with login page
    showPage('login');
    
    console.log('Railway Control System initialized');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}