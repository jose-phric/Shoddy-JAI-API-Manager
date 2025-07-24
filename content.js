// --- Configuration ---
// Function to find an element by trying multiple selectors in order
function findElementBySelectors(selectorsArray) {
    for (const selector of selectorsArray) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }
    return null;
}

const targetModalSelector = '._modalOverlay_1adus_2'; // Primary selector for the modal overlay

// Selectors for the original preset buttons container (re-introduced)
// Changed from 'const' to 'var' to potentially mitigate rare loading/parsing race conditions
var originalPresetButtonsContainerSelectors = [
    'div._presetButtons_1u589_156', // Current dynamic class
    'div:has(button._presetButton_1u589_156)', // Find div containing any preset button
    'div._formControl_1u589_15:has(p._helpText_1u589_139:contains("You can also select a preset below")) > div:last-child' // Find based on help text and structure
];
// console.log('originalPresetButtonsContainerSelectors defined (using var):', originalPresetButtonsContainerSelectors); // For debugging

// Main prompt textarea
const TEXT_INPUT_SELECTOR_OPTIONS = [
    'textarea#custom-prompt', // Most stable: ID
];

// Model input
const MODEL_INPUT_SELECTOR_OPTIONS = [
    'input._input_1mhqu_61', // Current dynamic class
    'input[placeholder="model"]', // Stable: Placeholder attribute
];

// Proxy URL input
const PROXY_URL_INPUT_SELECTOR_OPTIONS = [
    'input#proxy-url._input_1u589_61', // Most stable: ID + current class
    'input#proxy-url', // Stable: ID only
    'input[placeholder="https://url.com/v1"]', // Stable: Placeholder attribute
];

// API Key input
const API_KEY_INPUT_SELECTOR_OPTIONS = [
    'input#api-key._input_1u589_61', // Most stable: ID + current class
    'input#api-key', // Stable: ID only
    'input[placeholder="Some reverse proxy key, do not put OpenAI API key here"]', // Stable: Placeholder attribute
];

// New selectors for custom preset buttons insertion
const CUSTOM_PROMPT_FORM_CONTROL_SELECTOR_OPTIONS = [
    'div._formControl_1u589_15:has(textarea#custom-prompt)', // Current dynamic class with :has()
    'div.form-control:has(textarea#custom-prompt)', // Generic form control class with :has() (if they ever use a more generic class)
];
const PRESET_BUTTONS_INSERTION_POINT_SELECTOR_OPTIONS = originalPresetButtonsContainerSelectors; // Insert after the re-introduced original preset buttons

// Parent containers/insertion points for injecting dropdowns (as string selectors)
const MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING_OPTIONS = [
    'div._container_1u589_1', // Current dynamic class
    'div:has(h3._heading_1u589_7:contains("Proxy API Settings"))', // Find div containing the "Proxy API Settings" heading
];

// For Prompt: Insert after the Prompt label
const PROMPT_DROPDOWN_PARENT_SELECTOR_OPTIONS = CUSTOM_PROMPT_FORM_CONTROL_SELECTOR_OPTIONS;
const PROMPT_INSERTION_POINT_SELECTOR_OPTIONS = [
    'label[for="custom-prompt"]._label_1u589_21', // Current dynamic class with for attribute
    'label[for="custom-prompt"]', // Stable: for attribute only
];

// Model dropdown goes in the main container, inserted after the model input's form control div
const MODEL_DROPDOWN_PARENT_SELECTOR_OPTIONS = MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING_OPTIONS;
const MODEL_INSERTION_POINT_SELECTOR_OPTIONS = [
    'div._formControl_1mhqu_1:has(input._input_1mhqu_61)', // Current dynamic class with :has()
    'div.form-control:has(input[placeholder="model"])', // More stable: generic form control with placeholder
];

// Proxy dropdown goes in the main container, inserted directly after the proxy URL input itself
const PROXY_DROPDOWN_PARENT_SELECTOR_OPTIONS = [
    'div._inputGroup_1u589_61', // Current dynamic class
    'div:has(input#proxy-url)', // Stable: Find div containing the proxy URL input by ID
];
const PROXY_INSERTION_POINT_SELECTOR_OPTIONS = PROXY_URL_INPUT_SELECTOR_OPTIONS; // Insert DIRECTLY AFTER the proxy URL input itself

// API Key dropdown goes in its form control div, inserted directly after the API Key input itself
const API_KEY_DROPDOWN_PARENT_SELECTOR_OPTIONS = [
    'div._formControl_1u589_15:has(input#api-key._input_1u589_61)', // Current dynamic class with :has()
    'div.form-control:has(input#api-key)', // Stable: generic form control with ID
];
const API_KEY_INSERTION_POINT_SELECTOR_OPTIONS = API_KEY_INPUT_SELECTOR_OPTIONS; // Insert DIRECTLY AFTER the API Key input itself


// --- Utility Functions ---

/**
 * Creates a styled select (dropdown) element.
 * @param {string} id - The ID for the select element.
 * @returns {HTMLSelectElement}
 */
function createStyledSelect(id) {
    const select = document.createElement('select');
    select.id = id;
    select.style.cssText = `
        width: 100%;
        padding: 6px;
        margin-bottom: 8px;
        border: 1px solid #5c6370;
        border-radius: 3px;
        box-sizing: border-box;
        background-color: #3e4451;
        color: #abb2bf;
        appearance: none; /* Remove default arrow */
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22%23abb2bf%22%20d%3D%22M216%2096L128%20192%2040%2096z%22%2F%3E%3C%2Fsvg%3E'); /* Custom arrow */
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 12px;
        cursor: pointer;
    `;
    return select;
}

/**
 * Inserts a new element before a reference element, within a specified parent.
 * Handles cases where parent or reference might not exist or are not direct children.
 * @param {HTMLElement} newElement - The element to insert.
 * @param {Array<string>} parentSelectors - Array of CSS selectors for the parent container.
 * @param {Array<string>} referenceSelectors - Array of CSS selectors for the element to insert before.
 * @param {string} cyclerType - 'model', 'proxy', 'api-key' for logging.
 */
function insertCyclerIntoDOM(newElement, parentSelectors, referenceSelectors, cyclerType) {
    const parentElement = findElementBySelectors(parentSelectors);
    const referenceElement = findElementBySelectors(referenceSelectors);

    if (!parentElement) {
        console.warn(`Could not inject ${cyclerType} cycler: Parent element "${parentSelectors.join(' OR ')}" not found.`);
        return;
    }

    if (!referenceElement) {
        console.warn(`Could not inject ${cyclerType} cycler: Reference element "${referenceSelectors.join(' OR ')}" not found. Appending to parent.`);
        parentElement.appendChild(newElement);
        // console.log(`${cyclerType} cycler appended.`); // Removed console.log
        return;
    }

    // Find the closest ancestor of referenceElement that is a direct child of parentElement
    let actualInsertionPoint = referenceElement;
    while (actualInsertionPoint && actualInsertionPoint.parentElement !== parentElement) {
        actualInsertionPoint = actualInsertionPoint.parentElement;
    }

    if (actualInsertionPoint && actualInsertionPoint.parentElement === parentElement) {
        // To insert AFTER the reference element, we insert BEFORE its next sibling.
        // If there's no next sibling, it will be appended to the end of the parent.
        parentElement.insertBefore(newElement, actualInsertionPoint.nextSibling);
        // console.log(`${cyclerType} cycler injected after its logical insertion point.`); // Removed console.log
    } else {
        console.warn(`Could not find a suitable insertion point for ${cyclerType} cycler within parent "${parentSelectors.join(' OR ')}". Appending instead.`);
        parentElement.appendChild(newElement);
        // console.log(`${cyclerType} cycler appended.`); // Removed console.log
    }
}


// --- Functions to create and inject Cycler Dropdowns ---

const createAndInjectPromptCycler = (prompts) => {
    let promptInput = findElementBySelectors(TEXT_INPUT_SELECTOR_OPTIONS);
    if (!promptInput) {
        console.warn('Prompt input (textarea) not found, cannot create prompt cycler.');
        return;
    }

    // Remove existing cycler if present
    const existingCycler = document.getElementById('janitor-prompt-cycler');
    if (existingCycler) {
        existingCycler.remove();
    }

    const promptSelect = createStyledSelect('janitor-prompt-cycler');

    // Add a default "Select Prompt" option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Prompt';
    promptSelect.appendChild(defaultOption);

    prompts.forEach(prompt => {
        const option = document.createElement('option');
        option.value = prompt.value; // The actual prompt text
        option.textContent = prompt.name; // Display the prompt's name
        promptSelect.appendChild(option);
    });

    // Set initial value if the input already has a value that matches a saved prompt
    if (promptInput.value) {
        const matchingPrompt = prompts.find(p => p.value === promptInput.value);
        if (matchingPrompt) {
            promptSelect.value = matchingPrompt.value;
        } else {
            promptSelect.value = ''; // If current value doesn't match, default to blank
        }
    } else {
        promptSelect.value = ''; // If input is empty, default to blank
    }


    promptSelect.addEventListener('change', (event) => {
        promptInput.value = event.target.value;
        const event_ = new Event('input', { bubbles: true });
        promptInput.dispatchEvent(event_);
    });

    insertCyclerIntoDOM(promptSelect, PROMPT_DROPDOWN_PARENT_SELECTOR_OPTIONS, PROMPT_INSERTION_POINT_SELECTOR_OPTIONS, 'Prompt');
};


const createAndInjectModelCycler = (models) => {
    let modelInput = findElementBySelectors(MODEL_INPUT_SELECTOR_OPTIONS);
    if (!modelInput) {
        console.warn('Model input not found, cannot create model cycler.');
        return;
    }

    // Remove existing cycler if present
    const existingCycler = document.getElementById('janitor-model-cycler');
    if (existingCycler) {
        existingCycler.remove();
    }

    const modelSelect = createStyledSelect('janitor-model-cycler');

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });

    // Set initial value to the current model if available in the list
    if (modelInput.value && models.includes(modelInput.value)) {
        modelSelect.value = modelInput.value;
    } else if (models.length > 0) {
        // If current value is not in list, but we have models, select the first one
        modelSelect.value = models[0];
        modelInput.value = models[0]; // Also update the input with the first model
    }

    modelSelect.addEventListener('change', (event) => {
        modelInput.value = event.target.value;
        // Trigger input event on the original input to ensure React/Vue detects change
        const event_ = new Event('input', { bubbles: true });
        modelInput.dispatchEvent(event_);
    });

    // Inject the select element
    insertCyclerIntoDOM(modelSelect, MODEL_DROPDOWN_PARENT_SELECTOR_OPTIONS, MODEL_INSERTION_POINT_SELECTOR_OPTIONS, 'Model');
};


const createAndInjectProxyCycler = (proxies) => {
    let proxyInput = findElementBySelectors(PROXY_URL_INPUT_SELECTOR_OPTIONS);
    if (!proxyInput) {
        console.warn('Proxy URL input not found, cannot create proxy cycler.');
        return;
    }

    // Remove existing cycler if present
    const existingCycler = document.getElementById('janitor-proxy-cycler');
    if (existingCycler) {
        existingCycler.remove();
    }

    const proxySelect = createStyledSelect('janitor-proxy-cycler');

    proxies.forEach(proxy => {
        const option = document.createElement('option');
        option.value = proxy;
        option.textContent = proxy;
        proxySelect.appendChild(option);
    });

    // Set initial value to the current proxy if available in the list
    if (proxyInput.value && proxies.includes(proxyInput.value)) {
        proxySelect.value = proxyInput.value;
    } else if (proxies.length > 0) {
        // If current value is not in list, but we have proxies, select the first one
        proxySelect.value = proxies[0];
        proxyInput.value = proxies[0]; // Also update the input with the first proxy
    }


    proxySelect.addEventListener('change', (event) => {
        proxyInput.value = event.target.value;
        const event_ = new Event('input', { bubbles: true });
        proxyInput.dispatchEvent(event_);
    });

    insertCyclerIntoDOM(proxySelect, PROXY_DROPDOWN_PARENT_SELECTOR_OPTIONS, PROXY_INSERTION_POINT_SELECTOR_OPTIONS, 'Proxy');
};


const createAndInjectApiKeyCycler = (apiKeys) => {
    let apiKeyInput = findElementBySelectors(API_KEY_INPUT_SELECTOR_OPTIONS);
    if (!apiKeyInput) {
        console.warn('API Key input not found, cannot create API Key cycler.');
        return;
    }

    // Remove existing cycler if present
    const existingCycler = document.getElementById('janitor-api-key-cycler');
    if (existingCycler) {
        existingCycler.remove();
    }

    const apiKeySelect = createStyledSelect('janitor-api-key-cycler');

    // Add a default "Select API Key" option (this one will remain as it refers to a named key)
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select API Key';
    apiKeySelect.appendChild(defaultOption);

    apiKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key.value; // Store the actual key value
        option.textContent = key.name; // Display the name
        apiKeySelect.appendChild(option);
    });

    // Set initial value
    if (apiKeyInput.value) { // If the input already has a value, try to select it
        const matchingKey = apiKeys.find(key => key.value === apiKeyInput.value);
        if (matchingKey) {
            apiKeySelect.value = matchingKey.value;
        } else {
            // If the current input value doesn't match a saved key, default to blank
            apiKeySelect.value = '';
        }
    } else {
        // If input is empty, default to blank
        apiKeySelect.value = '';
    }


    apiKeySelect.addEventListener('change', (event) => {
        apiKeyInput.value = event.target.value;
        const event_ = new Event('input', { bubbles: true });
        apiKeyInput.dispatchEvent(event_);
    });

    insertCyclerIntoDOM(apiKeySelect, API_KEY_DROPDOWN_PARENT_SELECTOR_OPTIONS, API_KEY_INSERTION_POINT_SELECTOR_OPTIONS, 'API Key');
};


/**
 * Populates the main custom prompt textarea with a given text.
 * @param {string} text - The text to inject.
 */
const populateCustomPrompt = (text) => {
    const textarea = findElementBySelectors(TEXT_INPUT_SELECTOR_OPTIONS);
    if (textarea) {
        textarea.value = text;
        // Dispatch an 'input' event to trigger any React/Vue listeners
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        // console.log('Custom prompt populated.'); // Removed console.log
    } else {
        console.warn('Custom prompt textarea not found.');
    }
};

/**
 * Creates and injects the custom preset buttons into the JanitorAI modal.
 * This function is called when the modal appears and when data changes.
 * @param {Array<Object>} presets - The array of saved preset objects.
 */
const createAndInjectPresetButtons = (presets) => {
    // console.log('Attempting to create and inject preset buttons with presets:', presets); // Removed console.log

    // Get the original preset buttons container (which is now back)
    const originalPresetButtonsContainer = findElementBySelectors(originalPresetButtonsContainerSelectors);

    if (!originalPresetButtonsContainer) {
        console.warn('Original preset buttons container not found, cannot inject custom preset buttons.');
        // Fallback to main form container if original is not found (though it should be now)
        const mainFormContainer = findElementBySelectors(MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING_OPTIONS);
        if (mainFormContainer) {
            let customButtonsContainer = document.getElementById('janitor-custom-buttons-container');
            if (customButtonsContainer) {
                customButtonsContainer.innerHTML = ''; // Clear existing buttons
            } else {
                customButtonsContainer = document.createElement('div');
                customButtonsContainer.id = 'janitor-custom-buttons-container';
                customButtonsContainer.style.cssText = `
                    display: flex;
                    flex-wrap: wrap; /* Allow buttons to wrap to the next line */
                    gap: 5px; /* Space between buttons */
                    margin-top: 10px; /* Space above your buttons */
                    padding-top: 10px;
                    border-top: 1px solid #3e4451; /* Separator line */
                `;
            }
            mainFormContainer.appendChild(customButtonsContainer); // Append to main form container as fallback
            populatePresetButtons(customButtonsContainer, presets);
        }
        return;
    }

    // Ensure there's only one custom container to avoid duplicates on re-injection
    let customButtonsContainer = document.getElementById('janitor-custom-buttons-container');
    if (customButtonsContainer) {
        customButtonsContainer.innerHTML = ''; // Clear existing buttons
    } else {
        customButtonsContainer = document.createElement('div');
        customButtonsContainer.id = 'janitor-custom-buttons-container';
        customButtonsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap; /* Allow buttons to wrap to the next line */
            gap: 5px; /* Space between buttons */
            margin-top: 10px; /* Space above your buttons */
            padding-top: 10px;
            border-top: 1px solid #3e4451; /* Separator line */
        `;
        // Insert after the original preset buttons container
        originalPresetButtonsContainer.parentElement.insertBefore(customButtonsContainer, originalPresetButtonsContainer.nextSibling);
        // console.log('New custom buttons container created and inserted after original preset buttons.'); // Removed console.log
    }

    populatePresetButtons(customButtonsContainer, presets);

    // Always fetch latest data for cyclers when presets are updated/rendered
    chrome.storage.local.get(['savedPrompts', 'savedModels', 'savedProxies', 'savedApiKeys'], (data) => {
        const prompts = data.savedPrompts || [];
        const models = data.savedModels || [];
        const proxies = data.savedProxies || [];
        const apiKeys = data.savedApiKeys || [];

        // Prompt Cycler
        if (prompts && prompts.length > 0) {
            createAndInjectPromptCycler(prompts);
        } else {
            const existingPromptCycler = document.getElementById('janitor-prompt-cycler');
            if (existingCycler) existingCycler.remove();
        }

        // Model Cycler
        if (models && models.length > 0) {
            createAndInjectModelCycler(models);
        } else {
            const existingModelCycler = document.getElementById('janitor-model-cycler');
            if (existingModelCycler) existingModelCycler.remove();
        }

        // Proxy Cycler
        if (proxies && proxies.length > 0) {
            createAndInjectProxyCycler(proxies);
        } else {
            const existingProxyCycler = document.getElementById('janitor-proxy-cycler');
            if (existingProxyCycler) existingProxyCycler.remove();
        }

        // API Key cycler should still appear even if empty, to allow selection of "Select API Key"
        createAndInjectApiKeyCycler(apiKeys);
    });
};

/**
 * Helper function to populate the custom preset buttons.
 * @param {HTMLElement} container - The container element for the buttons.
 * @param {Array<Object>} presets - The array of saved preset objects.
 */
function populatePresetButtons(container, presets) {
    if (presets.length === 0) {
        const noPresetsMessage = document.createElement('span');
        noPresetsMessage.textContent = 'No presets saved.';
        noPresetsMessage.style.cssText = `
            color: #6a737d;
            font-style: italic;
            padding: 5px;
        `;
        container.appendChild(noPresetsMessage);
    } else {
        presets.forEach(preset => {
            const button = document.createElement('button');
            button.textContent = preset.name;
            button.className = '_button_1u589_1 _ghost_1u589_11'; // Mimic existing JanitorAI button style
            button.style.cssText = `
                padding: 6px 12px;
                border-radius: 4px;
                border: 1px solid #61afef; /* Light blue border */
                background-color: #3e4451; /* Dark background */
                color: #61afef; /* Light blue text */
                cursor: pointer;
                font-size: 13px;
                transition: background-color 0.2s ease, border-color 0.2s ease;
            `;

            // Add hover effect
            button.onmouseover = () => {
                button.style.backgroundColor = '#61afef'; /* Light blue background on hover */
                button.style.color = '#282c34'; /* Dark text on hover */
            };
            button.onmouseout = () => {
                button.style.backgroundColor = '#3e4451'; /* Revert background */
                button.style.color = '#61afef'; /* Revert text */
            };

            button.addEventListener('click', () => {
                // console.log('Preset button clicked:', preset.name); // Removed console.log
                populateCustomPrompt(preset.prompt);

                const modelInput = findElementBySelectors(MODEL_INPUT_SELECTOR_OPTIONS);
                if (modelInput && preset.model) {
                    modelInput.value = preset.model;
                    const event_ = new Event('input', { bubbles: true });
                    modelInput.dispatchEvent(event_);
                    // console.log('Model populated:', preset.model); // Removed console.log
                } else if (modelInput) {
                    modelInput.value = ''; // Clear if preset has no model
                    const event_ = new Event('input', { bubbles: true });
                    modelInput.dispatchEvent(event_);
                    // console.log('Model cleared (preset has no model).'); // Removed console.log
                }

                const proxyInput = findElementBySelectors(PROXY_URL_INPUT_SELECTOR_OPTIONS);
                if (proxyInput && preset.proxy) {
                    proxyInput.value = preset.proxy;
                    const event_ = new Event('input', { bubbles: true });
                    proxyInput.dispatchEvent(event_);
                } else if (proxyInput) {
                    proxyInput.value = '';
                    const event_ = new Event('input', { bubbles: true });
                    proxyInput.dispatchEvent(event_);
                }

                const apiKeyInput = findElementBySelectors(API_KEY_INPUT_SELECTOR_OPTIONS);
                if (apiKeyInput && preset.apiKey) {
                    apiKeyInput.value = preset.apiKey;
                    const event_ = new Event('input', { bubbles: true });
                    apiKeyInput.dispatchEvent(event_);
                } else if (apiKeyInput) {
                    apiKeyInput.value = '';
                    const event_ = new Event('input', { bubbles: true });
                    apiKeyInput.dispatchEvent(event_);
                }

            });
            container.appendChild(button);
        });
    }
}


// --- New logic using MutationObserver to detect the modal overlay ---

// Function to execute when the modal is found
const onModalAppears = () => {
  // console.log('Modal overlay detected! Running your script...'); // Removed console.log

  // Find the original preset buttons container to trigger injection
  const originalPresetButtonsContainer = findElementBySelectors(originalPresetButtonsContainerSelectors);

  if (originalPresetButtonsContainer) {
    // console.log('Original preset buttons container found for cyclers:', originalPresetButtonsContainer); // Removed console.log

    // Initial injection of buttons and cyclers
    chrome.storage.local.get(['savedPresets'], (data) => {
        const presets = data.savedPresets || [];
        createAndInjectPresetButtons(presets);
    });
  } else {
    console.warn('Original preset buttons container not found on modal appearance. Custom buttons and cyclers might not be injected correctly.');
    // Fallback: If the original container is not found, still try to inject cyclers into the main form container
    const mainFormContainerForCyclers = findElementBySelectors(MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING_OPTIONS);
    if (mainFormContainerForCyclers) {
        chrome.storage.local.get(['savedPrompts', 'savedModels', 'savedProxies', 'savedApiKeys'], (data) => {
            const prompts = data.savedPrompts || [];
            const models = data.savedModels || [];
            const proxies = data.savedProxies || [];
            const apiKeys = data.savedApiKeys || [];

            if (prompts && prompts.length > 0) createAndInjectPromptCycler(prompts);
            else { const existingPromptCycler = document.getElementById('janitor-prompt-cycler'); if (existingPromptCycler) existingPromptCycler.remove(); }

            if (models && models.length > 0) createAndInjectModelCycler(models);
            else { const existingModelCycler = document.getElementById('janitor-model-cycler'); if (existingModelCycler) existingModelCycler.remove(); }

            if (proxies && proxies.length > 0) createAndInjectProxyCycler(proxies);
            else { const existingProxyCycler = document.getElementById('janitor-proxy-cycler'); if (existingProxyCycler) existingProxyCycler.remove(); }

            createAndInjectApiKeyCycler(apiKeys); // API Key cycler should always appear
        });
    }
  }
};

// Listen for messages from the popup script (e.g., when a preset is saved/deleted)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshContentScriptData') {
        // console.log('Content script received refresh command.'); // Removed console.log
        // Re-run the logic to create/update buttons and cyclers
        chrome.storage.local.get(['savedPresets'], (data) => {
            const presets = data.savedPresets || [];
            createAndInjectPresetButtons(presets);
        });
        sendResponse({ status: 'refreshed' });
    } else if (request.action === 'injectPresetBundle') {
        // This is triggered when a preset is clicked in the popup
        // console.log('Content script received preset bundle for injection:', request.presetData); // Removed console.log
        populateCustomPrompt(request.presetData.prompt);

        const modelInput = findElementBySelectors(MODEL_INPUT_SELECTOR_OPTIONS);
        if (modelInput && request.presetData.model) {
            modelInput.value = request.request.presetData.model;
            const event_ = new Event('input', { bubbles: true });
            modelInput.dispatchEvent(event_);
        } else if (modelInput) {
            modelInput.value = '';
            const event_ = new Event('input', { bubbles: true });
            modelInput.dispatchEvent(event_);
        }

        const proxyInput = findElementBySelectors(PROXY_URL_INPUT_SELECTOR_OPTIONS);
        if (proxyInput && request.presetData.proxy) {
            proxyInput.value = request.presetData.proxy;
            const event_ = new Event('input', { bubbles: true });
            proxyInput.dispatchEvent(event_);
        } else if (proxyInput) {
            proxyInput.value = '';
            const event_ = new Event('input', { bubbles: true });
            proxyInput.dispatchEvent(event_);
        }

        const apiKeyInput = findElementBySelectors(API_KEY_INPUT_SELECTOR_OPTIONS);
        if (apiKeyInput && request.presetData.apiKey) {
            apiKeyInput.value = request.presetData.apiKey;
            const event_ = new Event('input', { bubbles: true });
            apiKeyInput.dispatchEvent(event_);
        } else if (apiKeyInput) {
            apiKeyInput.value = '';
            const event_ = new Event('input', { bubbles: true });
            apiKeyInput.dispatchEvent(event_);
        }

        sendResponse({ status: 'success' });
    }
});


// Set up a MutationObserver to watch for the modal overlay
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node is the modal itself or contains it
          if (addedNode.matches(targetModalSelector) || addedNode.querySelector(targetModalSelector)) {
            // IMPORTANT: Add a small delay here. Sometimes the content inside the modal
            // is added *after* the modal overlay element itself.
            // Adjust the delay (in milliseconds) if needed. 100ms is often a good starting point.
            setTimeout(onModalAppears, 100);

            // You might want to disconnect the observer here if the modal is a singleton
            // and you only need to react to its first appearance per page load.
            // If the modal can be opened/closed multiple times, keep the observer active
            // or re-observe as needed. For now, we're not disconnecting globally.
            // The `createAndInjectPresetButtons` function handles clearing/re-adding the elements.
            return; // Exit the mutation processing loop once modal is found
          }
        }
      }
    }
  }
});

// Start observing the document body for changes in its children and their descendants
observer.observe(document.body, { childList: true, subtree: true });
// console.log('MutationObserver started, waiting for modal overlay...'); // Removed console.log

// Also check if the modal is already open on window load (e.g., if page reloaded with modal open)
window.addEventListener('load', () => {
    setTimeout(() => {
        if (document.querySelector(targetModalSelector)) {
            onModalAppears();
        }
    }, 200); // Small delay to ensure all page content is likely loaded
});
