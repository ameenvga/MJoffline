// Fix for keyboard dropdown and language switching issues
(function() {
    // Ensure keyboard variables are properly initialized
    function initializeKeyboardVariables() {
        // Ensure these variables are always defined
        if (typeof userSelectedMlKeyBoard === 'undefined') {
            window.userSelectedMlKeyBoard = 'Phonetic';
        }
        if (typeof userSelectedEnKeyBoard === 'undefined') {
            window.userSelectedEnKeyBoard = 'QWERTY';
        }
        if (typeof userSelectedArKeyBoard === 'undefined') {
            window.userSelectedArKeyBoard = 'Phonetic';
        }
        // Ensure activeLanguageButton is defined
        if (typeof activeLanguageButton === 'undefined') {
            window.activeLanguageButton = 'langMlBtn';
        }
    }

    // Create direct global helper functions for menu handling
    window.fixedHideAll = function() {
        // Hide all context menus
        const menus = [
            'MlKeyboardBoxMenu', 'EnKeyboardBoxMenu', 'ArKeyboardBoxMenu', 
            'langBoxMenu', 'alignBoxMenu', 'menuBox', 'convertBoxMenu',
            'contextMenu', 'pasteFromMenuBox'
        ];
        
        menus.forEach(function(menuId) {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = 'none';
            }
        });
    };
    
    // Improved dropdown positioning function
    window.fixedShowMenu = function(menu, button) {
        if (!menu || !button) return;
        
        // 1. Show the menu
        menu.style.display = 'block';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        
        // 2. Position it correctly
        const buttonRect = button.getBoundingClientRect();
        const menuWidth = menu.offsetWidth;
        
        // Position the menu below the button, centered
        const left = buttonRect.left + (buttonRect.width/2) - (menuWidth/2);
        menu.style.top = (buttonRect.bottom + 2) + 'px';
        menu.style.left = Math.max(5, left) + 'px';
    };

    // Fix the changeKeyboardName function to handle undefined values
    window.originalChangeKeyboardName = window.changeKeyboardName;
    window.changeKeyboardName = function(el) {
        console.log("changekeyBoardName with safeguard", el);
        // Handle undefined value
        if (!el || el === 'undefined') {
            const activeBtn = window.activeLanguageButton || 'langMlBtn';
            if (activeBtn === 'langMlBtn') {
                el = window.userSelectedMlKeyBoard || 'Phonetic';
            } else if (activeBtn === 'langEnBtn') {
                el = window.userSelectedEnKeyBoard || 'QWERTY';
            } else if (activeBtn === 'langArBtn') {
                el = window.userSelectedArKeyBoard || 'Phonetic';
            }
        }
        document.getElementById('keyboardSelect').innerHTML = 'Keyboard: '+ el +' <i id="keyboardArrow" class="fa fa-angle-down" aria-hidden="true"></i>';
    };

    // Override the hideEveryMenu function to fix dropdown issues
    window.originalHideEveryMenu = window.hideEveryMenu;
    window.hideEveryMenu = function(e) {
        console.log('Fixed hideEveryMenu called');
        var elementId = e.target.id;
        console.log('Element clicked:', elementId);
        
        if (elementId == 'keyboardSelect' || elementId == 'keyboardMedIcon' || elementId == 'keyboardArrow') {
            window.fixedHideAll();
            
            // Show the appropriate keyboard menu based on active language
            const keyboardSelect = document.getElementById('keyboardSelect');
            if (window.activeLanguageButton == 'langMlBtn') {
                const mlMenu = document.getElementById('MlKeyboardBoxMenu');
                window.fixedShowMenu(mlMenu, keyboardSelect);
            }
            else if (window.activeLanguageButton == 'langEnBtn') {
                const enMenu = document.getElementById('EnKeyboardBoxMenu');
                window.fixedShowMenu(enMenu, keyboardSelect);
            }
            else if (window.activeLanguageButton == 'langArBtn') {
                const arMenu = document.getElementById('ArKeyboardBoxMenu');
                window.fixedShowMenu(arMenu, keyboardSelect);
            }
            return false;
        }
        else {
            // For all other elements, use the original handler
            return window.originalHideEveryMenu(e);
        }
    };
    
    // Functions to initialize all dropdown menus and event handlers
    function initializeDropdowns() {
        console.log('Initializing all dropdown menus and language switchers');
        
        // Initialize keyboard variables first
        initializeKeyboardVariables();
        
        // 1. Fix the language buttons
        const langEnBtn = document.getElementById('langEnBtn');
        const langMlBtn = document.getElementById('langMlBtn');
        const langArBtn = document.getElementById('langArBtn');
        
        if (langEnBtn) langEnBtn.onclick = function() { makeActiveLanguage('langEnBtn'); return false; };
        if (langMlBtn) langMlBtn.onclick = function() { makeActiveLanguage('langMlBtn'); return false; };
        if (langArBtn) langArBtn.onclick = function() { makeActiveLanguage('langArBtn'); return false; };
        
        // 2. Fix keyboard selector dropdown
        const keyboardSelect = document.getElementById('keyboardSelect');
        if (keyboardSelect) {
            keyboardSelect.onclick = function(e) {
                console.log('Keyboard selector clicked');
                e.stopPropagation();
                hideEveryMenu(e);
                return false;
            };
        }
        
        // 3. Fix keyboard menu options for Malayalam
        const phoneticButton = document.getElementById('phoneticButton');
        const inscriptButton = document.getElementById('inscriptButton');
        const fmlButton = document.getElementById('fmlButton');
        
        if (phoneticButton) phoneticButton.onclick = function(e) {
            e.stopPropagation();
            showMlPhoneticKeyboard();
            window.fixedHideAll(); // Explicitly close all menus
            return false;
        };
        
        if (inscriptButton) inscriptButton.onclick = function(e) {
            e.stopPropagation();
            showMlInscriptKeboard();
            window.fixedHideAll(); // Explicitly close all menus
            return false;
        };
        
        if (fmlButton) fmlButton.onclick = function(e) {
            e.stopPropagation();
            showMlASCKeyboard();
            window.fixedHideAll(); // Explicitly close all menus
            return false;
        };
        
        // 4. Fix Arabic keyboard options
        const arPhoneticButtons = document.querySelectorAll('#ArPhoneticKeyboard');
        arPhoneticButtons.forEach(function(btn, index) {
            if (index === 0) { // First is phonetic
                btn.onclick = function(e) {
                    e.stopPropagation();
                    showArPhoneticKeyboard();
                    window.fixedHideAll(); // Explicitly close all menus
                    return false;
                };
            } else if (index === 1) { // Second is 101 keyboard
                btn.onclick = function(e) {
                    e.stopPropagation();
                    showAr101Keyboard();
                    window.fixedHideAll(); // Explicitly close all menus
                    return false;
                };
            }
        });
        
        // Add click handler on document to close menus when clicking outside
        document.addEventListener('click', function(e) {
            // Only close menus if clicking outside menu areas
            const isMenuClick = e.target.closest('.context-menu') || 
                               e.target.id === 'keyboardSelect' || 
                               e.target.id === 'keyboardArrow' ||
                               e.target.id === 'keyboardMedIcon';
            
            if (!isMenuClick) {
                window.fixedHideAll();
            }
        });
        
        // 5. Fix the medium bar buttons
        const langMedButton = document.getElementById('langMedButton');
        const keyboardMedIcon = document.getElementById('keyboardMedIcon');
        const alignMedButton = document.getElementById('alignMedButton');
        
        if (langMedButton) langMedButton.onclick = function(e) {
            e.stopPropagation();
            hideEveryMenu(e);
            return false;
        };
        
        if (keyboardMedIcon) keyboardMedIcon.onclick = function(e) {
            e.stopPropagation();
            hideEveryMenu(e);
            return false;
        };
        
        if (alignMedButton) alignMedButton.onclick = function(e) {
            e.stopPropagation();
            hideEveryMenu(e);
            return false;
        };
        
        // 6. Ensure the context menus have proper positioning
        const menus = [
            'MlKeyboardBoxMenu', 'EnKeyboardBoxMenu', 'ArKeyboardBoxMenu', 
            'langBoxMenu', 'alignBoxMenu', 'menuBox', 'convertBoxMenu'
        ];
        
        menus.forEach(function(menuId) {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = 'none';
                menu.style.position = 'absolute';
                menu.style.zIndex = '1000';
            }
        });
        
        console.log('All dropdown and language switching components fixed');
    }
    
    // Initialize on DOM ready
    function onDOMReady() {
        // First wait for all variables and functions to be defined
        setTimeout(initializeDropdowns, 500);
    }
    
    // Try both DOMContentLoaded and window.onload for maximum compatibility
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }
    
    // Also initialize on window load as a fallback
    window.addEventListener('load', function() {
        // In case DOM ready didn't fire properly
        setTimeout(initializeDropdowns, 1000);
    });
    
    // Re-initialize periodically in case the app state changes
    setTimeout(initializeDropdowns, 2000);
    setTimeout(initializeDropdowns, 5000);
})();
