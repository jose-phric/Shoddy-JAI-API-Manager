// --- Configuration ---
const targetModalSelector = '._modalOverlay_1adus_2';
// Removed: const originalPresetButtonsContainerSelector = '._presetButtons_1u589_156';
const TEXT_INPUT_SELECTOR = 'textarea#custom-prompt'; // Main prompt textarea
const MODEL_INPUT_SELECTOR = 'input._input_1mhqu_61'; // Model input
const PROXY_URL_INPUT_SELECTOR = 'input#proxy-url._input_zf221_61'; // Proxy URL input
const API_KEY_INPUT_SELECTOR = 'input#api-key._input_zf221_61'; // API Key input

// New selectors for custom preset buttons insertion
const CUSTOM_PROMPT_FORM_CONTROL_SELECTOR = 'div._formControl_zf221_15:has(textarea#custom-prompt)'; // Selector for the custom prompt's form control div
const PRESET_BUTTONS_INSERTION_POINT_SELECTOR = CUSTOM_PROMPT_FORM_CONTROL_SELECTOR; // Insert custom preset buttons after this element

// Parent containers/insertion points for injecting dropdowns (as string selectors)
const MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING = '._container_zf221_1'; // Main container for form controls

// For Prompt: Insert after the Prompt label
const PROMPT_DROPDOWN_PARENT_SELECTOR_STRING = CUSTOM_PROMPT_FORM_CONTROL_SELECTOR; // Changed: Parent is the custom prompt's form control div
const PROMPT_INSERTION_POINT_SELECTOR_STRING = 'label[for="custom-prompt"]._label_zf221_21'; // Changed: Insert AFTER the prompt label

// Model dropdown goes in the main container, inserted after the model input's form control div
const MODEL_DROPDOWN_PARENT_SELECTOR_STRING = MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING;
const MODEL_INSERTION_POINT_SELECTOR_STRING = 'div._formControl_1mhqu_1:has(input._input_1mhqu_61)'; // Insert AFTER the model input's form control div

// Proxy dropdown goes in the main container, inserted directly after the proxy URL input itself
const PROXY_DROPDOWN_PARENT_SELECTOR_STRING = 'div._inputGroup_zf221_61'; // Changed: Insert within the input group div
const PROXY_INSERTION_POINT_SELECTOR_STRING = 'input#proxy-url._input_zf221_61'; // Insert DIRECTLY AFTER the proxy URL input itself

// API Key dropdown goes in its form control div, inserted directly after the API Key input itself
const API_KEY_DROPDOWN_PARENT_SELECTOR_STRING = 'div._formControl_zf221_15:has(input#api-key._input_zf221_61)'; // Changed: Parent is the form control div
const API_KEY_INSERTION_POINT_SELECTOR_STRING = 'input#api-key._input_zf221_61'; // Changed: Insert DIRECTLY AFTER the API Key input itself


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
 * @param {string} parentSelector - CSS selector for the parent container.
 * @param {string} referenceSelector - CSS selector for the element to insert before.
 * @param {string} cyclerType - 'model', 'proxy', 'api-key' for logging.
 */
function insertCyclerIntoDOM(newElement, parentSelector, referenceSelector, cyclerType) {
    const parentElement = document.querySelector(parentSelector);
    const referenceElement = document.querySelector(referenceSelector);

    if (!parentElement) {
        console.warn(`Could not inject ${cyclerType} cycler: Parent element "${parentSelector}" not found.`);
        return;
    }

    if (!referenceElement) {
        console.warn(`Could not inject ${cyclerType} cycler: Reference element "${referenceSelector}" not found. Appending to parent.`);
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
        console.warn(`Could not find a suitable insertion point for ${cyclerType} cycler within parent "${parentSelector}". Appending instead.`);
        parentElement.appendChild(newElement);
        // console.log(`${cyclerType} cycler appended.`); // Removed console.log
    }
}


// --- Functions to create and inject Cycler Dropdowns ---

const createAndInjectPromptCycler = (prompts) => {
    let promptInput = document.querySelector(TEXT_INPUT_SELECTOR);
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

    insertCyclerIntoDOM(promptSelect, PROMPT_DROPDOWN_PARENT_SELECTOR_STRING, PROMPT_INSERTION_POINT_SELECTOR_STRING, 'Prompt');
};


const createAndInjectModelCycler = (models) => {
    let modelInput = document.querySelector(MODEL_INPUT_SELECTOR);
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
    insertCyclerIntoDOM(modelSelect, MODEL_DROPDOWN_PARENT_SELECTOR_STRING, MODEL_INSERTION_POINT_SELECTOR_STRING, 'Model');
};


const createAndInjectProxyCycler = (proxies) => {
    let proxyInput = document.querySelector(PROXY_URL_INPUT_SELECTOR);
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

    insertCyclerIntoDOM(proxySelect, PROXY_DROPDOWN_PARENT_SELECTOR_STRING, PROXY_INSERTION_POINT_SELECTOR_STRING, 'Proxy');
};


const createAndInjectApiKeyCycler = (apiKeys) => {
    let apiKeyInput = document.querySelector(API_KEY_INPUT_SELECTOR);
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

    insertCyclerIntoDOM(apiKeySelect, API_KEY_DROPDOWN_PARENT_SELECTOR_STRING, API_KEY_INSERTION_POINT_SELECTOR_STRING, 'API Key');
};


/**
 * Populates the main custom prompt textarea with a given text.
 * @param {string} text - The text to inject.
 */
const populateCustomPrompt = (text) => {
    const textarea = document.querySelector(TEXT_INPUT_SELECTOR);
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

    // Get the main form container where our new buttons will reside
    const mainFormContainer = document.querySelector(MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING);

    if (!mainFormContainer) {
        console.warn('Main form container not found, cannot inject preset buttons.');
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
        // Insert after the custom prompt form control div
        const insertionPoint = document.querySelector(PRESET_BUTTONS_INSERTION_POINT_SELECTOR);
        if (insertionPoint) {
            insertionPoint.parentElement.insertBefore(customButtonsContainer, insertionPoint.nextSibling);
        } else {
            // Fallback if the specific insertion point is not found
            mainFormContainer.appendChild(customButtonsContainer);
        }
        // console.log('New custom buttons container created and inserted.'); // Removed console.log
    }


    if (presets.length === 0) {
        const noPresetsMessage = document.createElement('span');
        noPresetsMessage.textContent = 'No presets saved.';
        noPresetsMessage.style.cssText = `
            color: #6a737d;
            font-style: italic;
            padding: 5px;
        `;
        customButtonsContainer.appendChild(noPresetsMessage);
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

                const modelInput = document.querySelector(MODEL_INPUT_SELECTOR);
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

                const proxyInput = document.querySelector(PROXY_URL_INPUT_SELECTOR);
                if (proxyInput && preset.proxy) {
                    proxyInput.value = preset.proxy;
                    const event_ = new Event('input', { bubbles: true });
                    proxyInput.dispatchEvent(event_);
                } else if (proxyInput) {
                    proxyInput.value = '';
                    const event_ = new Event('input', { bubbles: true });
                    proxyInput.dispatchEvent(event_);
                }

                const apiKeyInput = document.querySelector(API_KEY_INPUT_SELECTOR);
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
            customButtonsContainer.appendChild(button);
        });
    }

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

// --- New logic using MutationObserver to detect the modal overlay ---

// Function to execute when the modal is found
const onModalAppears = () => {
  // console.log('Modal overlay detected! Running your script...'); // Removed console.log

  // Find the main form container for cyclers
  const mainFormContainerForCyclers = document.querySelector(MAIN_FORM_CONTROLS_CONTAINER_SELECTOR_STRING);

  if (mainFormContainerForCyclers) {
    // console.log('Main form container found for cyclers:', mainFormContainerForCyclers); // Removed console.log

    // Initial injection of buttons and cyclers
    chrome.storage.local.get(['savedPresets'], (data) => {
        const presets = data.savedPresets || [];
        createAndInjectPresetButtons(presets);
    });
  } else {
    console.warn('Main form container for cyclers not found on modal appearance.');
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

        const modelInput = document.querySelector(MODEL_INPUT_SELECTOR);
        if (modelInput && request.presetData.model) {
            modelInput.value = request.presetData.model;
            const event_ = new Event('input', { bubbles: true });
            modelInput.dispatchEvent(event_);
        } else if (modelInput) {
            modelInput.value = '';
            const event_ = new Event('input', { bubbles: true });
            modelInput.dispatchEvent(event_);
        }

        const proxyInput = document.querySelector(PROXY_URL_INPUT_SELECTOR);
        if (proxyInput && request.presetData.proxy) {
            proxyInput.value = request.presetData.proxy;
            const event_ = new Event('input', { bubbles: true });
            proxyInput.dispatchEvent(event_);
        } else if (proxyInput) {
            proxyInput.value = '';
            const event_ = new Event('input', { bubbles: true });
            proxyInput.dispatchEvent(event_);
        }

        const apiKeyInput = document.querySelector(API_KEY_INPUT_SELECTOR);
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
            // or re-observe as needed. For now, we'll assume it might be re-opened,
            // so we're not disconnecting globally. The `createAndInjectPresetButtons`
            // function handles clearing/re-adding the elements.
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
