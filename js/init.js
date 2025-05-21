// Track loaded scripts
const loadedScripts = {
    jquery: false,
    pastefrom: false,
    capsLock: false,
    emojiSession: false,
    typing: false,
    malayalam: false,
    keyboard: false,
    webFrame: false,
    fixDropdown: false
};

// Check if all required scripts are loaded
function checkAllScriptsLoaded() {
    return Object.values(loadedScripts).every(loaded => loaded === true);
}

// Update loading status
function updateStatus(message) {
    console.log('Status:', message);
    const loadingText = document.querySelector('#loading-screen .loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

// Initialize the application
function initApp() {
    console.log('Initializing application...');
    updateStatus('Starting application...');

    try {
        // Initialize typing notification if available
        if (typeof Typing === 'function') {
            const typing = Typing("Make sure your CapsLock is off when you type in Malayalam.", 5);
            typing();
        } else {
            console.warn('Typing function not found. Make sure typing.js is loaded correctly.');
        }

        // Initialize other components
        if (typeof initKeyboard === 'function') {
            initKeyboard();
        }

        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
                console.log('Loading screen removed');
            }, 500);
        }

        console.log('Application initialized');
    } catch (error) {
        console.error('Error during initialization:', error);
        updateStatus('Error initializing application. Please check console for details.');
    }
}

// Handle script loading
function handleScriptLoad(scriptName) {
    return function() {
        console.log(`${scriptName} loaded`);
        loadedScripts[scriptName] = true;
        
        // If this is the last script to load and DOM is ready, initialize the app
        if (checkAllScriptsLoaded() && document.readyState === 'complete') {
            initApp();
        }
    };
}

// Set up script loading handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // If all scripts are already loaded, initialize the app
    if (checkAllScriptsLoaded()) {
        initApp();
    }
});

// If DOM is already loaded, initialize on next tick
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (checkAllScriptsLoaded()) {
            initApp();
        }
    }, 0);
}

// Toggle app banner visibility
function toggleBanner() {
    const banner = document.getElementById('appBanner');
    banner.classList.toggle('show');
}

// Hide banner when clicking outside
function bannerHide(event) {
    // Only hide if clicking on the overlay, not the content
    if (event && event.target.id === 'appBanner') {
        const banner = document.getElementById('appBanner');
        banner.classList.remove('show');
    }
}

// Create a new file
function createNewFile() {
    // Clear the textarea
    const textarea = document.getElementById('ta');
    if (textarea) {
        textarea.value = '';
        textarea.focus();
    }
    
    // Update the title
    const titleElement = document.getElementById('title');
    if (titleElement) {
        titleElement.textContent = 'Untitled file';
    }
    
    // Hide the banner
    const banner = document.getElementById('appBanner');
    if (banner) {
        banner.classList.remove('show');
    }
    
    console.log('Created new file');
}

// Expose functions to window for inline handlers
window.handleScriptLoad = handleScriptLoad;
window.toggleBanner = toggleBanner;
window.bannerHide = bannerHide;
window.createNewFile = createNewFile;
