// content.js
// This script runs on JanitorAI pages to inject UI elements for managing API settings.

// --- DEBUG CONFIGURATION ---
const DEBUG_MODE = false; // Set to true to enable console logs
// --- END DEBUG CONFIGURATION ---

if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Content script loaded.");

// --- Constants for JanitorAI UI Selectors ---
// These selectors are based on the HTML provided by the user.
const API_SETTINGS_MODAL_SELECTOR = 'div._modalOverlay_1adus_2';
const PROXY_CONFIG_FORM_SECTION_SELECTOR = 'div._formSection_e31mh_203';

// Input field selectors within the proxy configuration form
const CONFIG_NAME_INPUT_ID = 'config-name'; // Native input, no dropdown needed
const MODEL_NAME_INPUT_ID = 'model-name';
const PROXY_URL_INPUT_ID = 'proxy-url';
const API_KEY_INPUT_ID = 'api-key';
const CUSTOM_PROMPT_TEXTAREA_ID = 'custom-prompt';

// Generic form control class for consistent injection point
const FORM_CONTROL_CLASS = '_formControl_e31mh_220';


// --- Global State ---
let savedData = {
    savedPrompts: [],
    savedModels: [],
    savedProxies: [],
    savedApiKeys: []
};

// Flags to prevent multiple injections
let hasInjectedDropdowns = false;

// --- Utility Functions ---

/**
 * Fetches saved data from chrome.storage.local.
 * @returns {Promise<Object>} A promise that resolves with the saved data.
 */
async function fetchSavedData() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['savedPrompts', 'savedModels', 'savedProxies', 'savedApiKeys'], (data) => {
            savedData.savedPrompts = data.savedPrompts || [];
            savedData.savedModels = data.savedModels || [];
            savedData.savedProxies = data.savedProxies || [];
            savedData.savedApiKeys = data.savedApiKeys || [];
            if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Fetched saved data:", savedData);
            resolve(savedData);
        });
    });
}

/**
 * Creates a <select> dropdown element populated with options.
 * @param {Array<Object|string>} items - Array of items to populate the dropdown. Can be strings or objects with 'name' and 'value'.
 * @param {string} placeholder - Text for the default placeholder option. (Now only used for logging/context, not added as an option)
 * @param {string} [valueKey] - The key to use for the option's value if items are objects.
 * @param {string} [textKey] - The key to use for the option's text if items are objects.
 * @returns {HTMLSelectElement} The created select element.
 */
function createDropdown(items, placeholder, valueKey = null, textKey = null) {
    const select = document.createElement('select');
    select.classList.add('shoddy-api-manager-dropdown'); // Add a custom class for styling/identification
    select.style.width = '100%';
    select.style.padding = '8px';
    select.style.marginBottom = '10px';
    select.style.border = '1px solid #404040'; // Example border color, try to match JanitorAI
    select.style.borderRadius = '4px';
    select.style.backgroundColor = '#2B2B2B'; // Example background, try to match JanitorAI
    select.style.color = '#E0E0E0'; // Example text color
    select.style.fontFamily = 'inherit'; // Inherit font from parent
    select.style.fontSize = 'inherit'; // Inherit font size

    // The dropdown will only be injected if there are actual items.
    items.forEach(item => {
        const option = document.createElement('option');
        if (valueKey && textKey) {
            option.value = item[valueKey];
            option.textContent = item[textKey];
        } else {
            option.value = item;
            option.textContent = item;
        }
        select.appendChild(option);
    });
    return select;
}

/**
 * Injects a dropdown into the DOM at a specified target element.
 * @param {HTMLElement} targetElement - The parent form control element where the dropdown should be injected.
 * @param {HTMLSelectElement} dropdown - The dropdown element to inject.
 * @param {HTMLElement} nativeInput - The native input/textarea element to update when dropdown changes.
 */
function injectAndAttachDropdown(targetElement, dropdown, nativeInput) {
    if (targetElement && !targetElement.querySelector('.shoddy-api-manager-dropdown')) {
        const label = targetElement.querySelector('label');
        if (label) {
            if (nativeInput.id === CUSTOM_PROMPT_TEXTAREA_ID) {
                // For custom prompt, insert after the label (between label and textarea)
                label.parentNode.insertBefore(dropdown, label.nextSibling);
                if (DEBUG_MODE) console.log(`Injected dropdown for ${nativeInput.id} (after label).`);
            } else {
                // For other inputs (model, proxy, api key), insert after the native input
                nativeInput.parentNode.insertBefore(dropdown, nativeInput.nextSibling);
                if (DEBUG_MODE) console.log(`Injected dropdown for ${nativeInput.id} (after input).`);
            }

            dropdown.addEventListener('change', (event) => {
                if (event.target.value) {
                    nativeInput.value = event.target.value;
                    // Trigger input event to ensure JanitorAI's internal state updates
                    nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    if (DEBUG_MODE) console.log(`Updated ${nativeInput.id} with: ${event.target.value}`);
                }
            });

            // Set dropdown's initial value if native input has a value
            if (nativeInput.value) {
                dropdown.value = nativeInput.value;
            }
        } else {
            if (DEBUG_MODE) console.warn(`Could not find label within target element for ${nativeInput.id}.`);
        }
    } else {
        if (DEBUG_MODE) console.log(`Dropdown already exists or target not found for ${nativeInput.id}.`);
    }
}

/**
 * Injects all necessary dropdowns into the API settings form.
 */
async function injectDropdownsIntoForm() {
    if (hasInjectedDropdowns) {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Dropdowns already injected, skipping.");
        return;
    }

    const formSection = document.querySelector(PROXY_CONFIG_FORM_SECTION_SELECTOR);
    if (!formSection) {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Proxy config form section not found yet.");
        return;
    }

    if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Proxy config form section found. Attempting to inject dropdowns.");

    await fetchSavedData(); // Ensure we have the latest data

    // Get native input elements
    const modelInput = document.getElementById(MODEL_NAME_INPUT_ID);
    const proxyUrlInput = document.getElementById(PROXY_URL_INPUT_ID);
    const apiKeyInput = document.getElementById(API_KEY_INPUT_ID);
    const customPromptTextarea = document.getElementById(CUSTOM_PROMPT_TEXTAREA_ID);

    if (!modelInput || !proxyUrlInput || !apiKeyInput || !customPromptTextarea) {
        if (DEBUG_MODE) console.warn("Shoddy JAI API Manager: One or more native input elements not found. Retrying...");
        return; // Not all inputs are ready yet, try again on next observation
    }

    // Find the parent formControl div for each input
    const modelFormControl = modelInput.closest(`.${FORM_CONTROL_CLASS}`);
    const proxyUrlFormControl = proxyUrlInput.closest(`.${FORM_CONTROL_CLASS}`);
    const apiKeyFormControl = apiKeyInput.closest(`.${FORM_CONTROL_CLASS}`);
    const customPromptFormControl = customPromptTextarea.closest(`.${FORM_CONTROL_CLASS}`);

    if (!modelFormControl || !proxyUrlFormControl || !apiKeyFormControl || !customPromptFormControl) {
        if (DEBUG_MODE) console.warn("Shoddy JAI API Manager: One or more form control parents not found. Retrying...");
        return;
    }

    // Inject Model Name dropdown ONLY if savedModels exist
    if (savedData.savedModels.length > 0) {
        const modelDropdown = createDropdown(savedData.savedModels, '-- Select a Model --');
        injectAndAttachDropdown(modelFormControl, modelDropdown, modelInput);
    } else {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: No saved models, skipping model dropdown injection.");
    }

    // Inject Proxy URL dropdown ONLY if savedProxies exist
    if (savedData.savedProxies.length > 0) {
        const proxyUrlDropdown = createDropdown(savedData.savedProxies, '-- Select a Proxy URL --');
        injectAndAttachDropdown(proxyUrlFormControl, proxyUrlDropdown, proxyUrlInput);
    } else {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: No saved proxies, skipping proxy URL dropdown injection.");
    }

    // Inject API Key dropdown ONLY if savedApiKeys exist
    if (savedData.savedApiKeys.length > 0) {
        const apiKeyDropdown = createDropdown(savedData.savedApiKeys, '-- Select an API Key --', 'value', 'name');
        injectAndAttachDropdown(apiKeyFormControl, apiKeyDropdown, apiKeyInput);
    } else {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: No saved API keys, skipping API Key dropdown injection.");
    }

    // Inject Custom Prompt dropdown ONLY if savedPrompts exist
    if (savedData.savedPrompts.length > 0) {
        const promptDropdown = createDropdown(savedData.savedPrompts, '-- Select a Prompt --', 'value', 'name');
        injectAndAttachDropdown(customPromptFormControl, promptDropdown, customPromptTextarea);
    } else {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: No saved prompts, skipping custom prompt dropdown injection.");
    }

    hasInjectedDropdowns = true;
    if (DEBUG_MODE) console.log("Shoddy JAI API Manager: All relevant dropdowns injected successfully.");
}


// --- MutationObserver to detect modal and form changes ---

const observerConfig = { childList: true, subtree: true };

const bodyObserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if the API settings modal is added or removed
            const apiSettingsModal = document.querySelector(API_SETTINGS_MODAL_SELECTOR);

            if (apiSettingsModal && apiSettingsModal.style.display !== 'none') {
                // Modal is visible, now observe its content for the form
                if (DEBUG_MODE) console.log("Shoddy JAI API Manager: API Settings modal detected and visible.");
                // Start observing the modal's subtree for the form
                modalObserver.observe(apiSettingsModal, observerConfig);
                // Attempt injection immediately in case form is already present
                injectDropdownsIntoForm();
            } else if (!apiSettingsModal || apiSettingsModal.style.display === 'none') {
                // Modal is not visible or removed, reset injection flag
                if (DEBUG_MODE) console.log("Shoddy JAI API Manager: API Settings modal not visible, resetting injection flag.");
                hasInjectedDropdowns = false;
                modalObserver.disconnect(); // Stop observing the modal
            }
        }
    }
});

const modalObserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
            const formSection = document.querySelector(PROXY_CONFIG_FORM_SECTION_SELECTOR);
            if (formSection && formSection.style.display !== 'none') {
                // Form is visible, attempt to inject dropdowns
                injectDropdownsIntoForm();
            } else if (!formSection || formSection.style.display === 'none') {
                // Form is not visible, reset injection flag if it was previously injected
                if (hasInjectedDropdowns) {
                    if (DEBUG_MODE) console.log("Shoddy JAI API Manager: Proxy config form not visible, resetting injection flag.");
                    hasInjectedDropdowns = false; // Allow re-injection if form reappears
                    // Optionally, remove injected elements here if they are not automatically cleaned up by JanitorAI
                    document.querySelectorAll('.shoddy-api-manager-dropdown').forEach(el => el.remove());
                }
            }
        }
    }
});


// Start observing the document body for the API settings modal
bodyObserver.observe(document.body, observerConfig);

// Initial check in case the modal is already present on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector(API_SETTINGS_MODAL_SELECTOR)) {
        if (DEBUG_MODE) console.log("Shoddy JAI API Manager: API Settings modal found on DOMContentLoaded. Attempting initial injection.");
        injectDropdownsIntoForm();
    }
});
