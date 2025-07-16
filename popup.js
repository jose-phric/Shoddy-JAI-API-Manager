// popup.js
// This script manages the UI and data storage for Prompts, Models, Proxies, API Keys,
// and Presets in the browser action popup.

// --- Data Structures in chrome.storage.local ---
// savedPrompts: Array of { id: 'unique-id', name: 'Prompt Name', value: 'Prompt Text' }
// savedModels: Array of String ('Model Name')
// savedProxies: Array of String ('Proxy URL')
// savedApiKeys: Array of { id: 'unique-id', name: 'Key Name', value: 'Key Value' }
// savedPresets: Array of { id: 'unique-id', name: 'Preset Name', prompt: 'Prompt Text', model: 'Model Name', proxy: 'Proxy URL', apiKey: 'Key Value' }


// --- Element References ---

// Main sections (Containers for list + add button + form)
const promptArea = document.getElementById('promptArea');
const modelArea = document.getElementById('modelArea');
const proxyUrlArea = document.getElementById('proxyUrlArea');
const apiKeyArea = document.getElementById('apiKeyArea');
const presetsArea = document.getElementById('presetsArea');

// List divs (direct parent of items)
const promptsListDiv = document.getElementById('promptsList');
const modelsListDiv = document.getElementById('modelsList');
const proxyUrlsListDiv = document.getElementById('proxyUrlsList');
const apiKeysListDiv = document.getElementById('apiKeysList');
const presetsListDiv = document.getElementById('presetsList');

// Add buttons
const addPromptButton = document.getElementById('addPromptButton');
const addModelButton = document.getElementById('addModelButton');
const addProxyUrlButton = document.getElementById('addProxyUrlButton');
const addApiKeyButton = document.getElementById('addApiKeyButton');
const addPresetButton = document.getElementById('addPresetButton');

// "No items" messages
const noPromptsMessage = document.getElementById('noPromptsMessage');
const noModelsMessage = document.getElementById('noModelsMessage');
const noProxyUrlsMessage = document.getElementById('noProxyUrlsMessage');
const noApiKeysMessage = document.getElementById('noApiKeysMessage');
const noPresetsMessage = document.getElementById('noPresetsMessage');


// Form Areas (Containers for forms)
const promptFormArea = document.getElementById('promptFormArea');
const modelFormArea = document.getElementById('modelFormArea');
const proxyUrlFormArea = document.getElementById('proxyUrlFormArea');
const apiKeyFormArea = document.getElementById('apiKeyFormArea');
const presetFormArea = document.getElementById('presetFormArea');

// Forms themselves
const promptForm = document.getElementById('promptForm');
const modelForm = document.getElementById('modelForm');
const proxyUrlForm = document.getElementById('proxyUrlForm');
const apiKeyForm = document.getElementById('apiKeyForm');
const presetForm = document.getElementById('presetForm');


// Form Inputs
const promptNameInput = document.getElementById('promptNameInput');
const promptValueInput = document.getElementById('promptValueInput');
const modelValueInput = document.getElementById('modelValueInput');
const proxyUrlValueInput = document.getElementById('proxyUrlValueInput');
const apiKeyNameInput = document.getElementById('apiKeyNameInput');
const apiKeyValueInput = document.getElementById('apiKeyValueInput');
const presetNameInput = document.getElementById('presetNameInput');
const presetPromptInput = document.getElementById('presetPromptInput');
const presetModelInput = document.getElementById('presetModelInput');
const presetProxyInput = document.getElementById('presetProxyInput');
const presetApiKeyInput = document.getElementById('presetApiKeyInput');

// Form Submit Buttons (for text change)
const savePromptButton = promptForm.querySelector('button[type="submit"]');
const saveModelButton = modelForm.querySelector('button[type="submit"]');
const saveProxyUrlButton = proxyUrlForm.querySelector('button[type="submit"]');
const saveApiKeyButton = apiKeyForm.querySelector('button[type="submit"]');
const savePresetButton = presetForm.querySelector('button[type="submit"]');


// Cancel buttons
const cancelPromptButton = document.getElementById('cancelPromptButton');
const cancelModelButton = document.getElementById('cancelModelButton');
const cancelProxyUrlButton = document.getElementById('cancelProxyUrlButton');
const cancelApiKeyButton = document.getElementById('cancelApiKeyButton');
const cancelPresetButton = document.getElementById('cancelPresetButton');


// Custom Message Box Elements
const customMessageBox = document.getElementById('customMessageBox');
const messageBoxText = document.getElementById('messageBoxText');
const messageBoxOkButton = document.getElementById('messageBoxOkButton');
// New: Cancel button for the custom message box
const messageBoxCancelButton = document.createElement('button');
messageBoxCancelButton.textContent = 'Cancel';
messageBoxCancelButton.style.backgroundColor = '#e06c75'; // Red color for cancel
messageBoxCancelButton.style.marginLeft = '10px';
messageBoxCancelButton.addEventListener('click', hideCustomMessageBox); // Hide on cancel
customMessageBox.appendChild(messageBoxCancelButton); // Append to message box


// --- Global State for Editing ---
let editingItemId = null;
let editingItemType = null; // 'prompt', 'model', 'proxy', 'apiKey', 'preset'


// --- Helper Functions ---

/**
 * Displays a custom message box instead of alert().
 * @param {string} message - The message to display.
 * @param {function} [onConfirm] - Optional callback to execute if OK is pressed.
 * @param {boolean} [showCancel=false] - Whether to show a cancel button.
 */
function showCustomMessageBox(message, onConfirm = null, showCancel = false) {
    messageBoxText.textContent = message;
    customMessageBox.style.display = 'block';

    // Clear previous event listeners
    messageBoxOkButton.onclick = null;
    messageBoxCancelButton.onclick = null;

    if (onConfirm) {
        messageBoxOkButton.onclick = () => {
            hideCustomMessageBox();
            onConfirm();
        };
        messageBoxCancelButton.onclick = hideCustomMessageBox;
        messageBoxCancelButton.style.display = showCancel ? 'inline-block' : 'none';
    } else {
        messageBoxOkButton.onclick = hideCustomMessageBox;
        messageBoxCancelButton.style.display = 'none';
    }
}

/**
 * Hides the custom message box.
 */
function hideCustomMessageBox() {
    customMessageBox.style.display = 'none';
}

/**
 * Generates a simple unique ID.
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Hides all form areas.
 */
function hideAllForms() {
    promptFormArea.style.display = 'none';
    modelFormArea.style.display = 'none';
    proxyUrlFormArea.style.display = 'none';
    apiKeyFormArea.style.display = 'none';
    presetFormArea.style.display = 'none';
}

/**
 * Shows all main list areas and add buttons.
 * This function now also ensures the list divs and add buttons are visible.
 */
function showAllListAreas() {
     promptArea.style.display = 'block';
     promptsListDiv.style.display = 'block';
     addPromptButton.style.display = 'flex';

     modelArea.style.display = 'block';
     modelsListDiv.style.display = 'block';
     addModelButton.style.display = 'flex';

     proxyUrlArea.style.display = 'block';
     proxyUrlsListDiv.style.display = 'block';
     addProxyUrlButton.style.display = 'flex';

     apiKeyArea.style.display = 'block';
     apiKeysListDiv.style.display = 'block';
     addApiKeyButton.style.display = 'flex';

     presetsArea.style.display = 'block';
     presetsListDiv.style.display = 'block';
     addPresetButton.style.display = 'flex';

     // Reset editing state and button texts
     editingItemId = null;
     editingItemType = null;
     savePromptButton.textContent = 'Save Prompt';
     saveModelButton.textContent = 'Save Model';
     saveProxyUrlButton.textContent = 'Save Proxy URL';
     saveApiKeyButton.textContent = 'Save Key';
     savePresetButton.textContent = 'Save Preset';
}

/**
 * Reloads all lists. Call this after any save/delete operation.
 */
function reloadAllLists() {
    loadAndDisplayPrompts();
    loadAndDisplayModels();
    loadAndDisplayProxies();
    loadAndDisplayApiKeys();
    loadAndDisplayPresets();
}


// --- Functions for Prompts ---

function loadAndDisplayPrompts() {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
        const prompts = data.savedPrompts;
        promptsListDiv.innerHTML = ''; // Clear list

        if (prompts.length === 0) {
            promptsListDiv.appendChild(noPromptsMessage);
            noPromptsMessage.style.display = 'block';
        } else {
            noPromptsMessage.style.display = 'none';
            prompts.forEach(prompt => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = prompt.id;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = prompt.name;
                item.appendChild(nameSpan);

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                // Truncate long prompts for display
                valueSpan.textContent = `${prompt.value.substring(0, 50)}${prompt.value.length > 50 ? '...' : ''}`;
                item.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button'; // Add a class for styling
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent item click listener from firing
                    showEditPromptForm(prompt);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent item click listener from firing
                    showCustomMessageBox(`Are you sure you want to delete "${prompt.name}"?`, () => handleDeletePrompt(prompt.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                item.appendChild(actionButtonsContainer);
                // --- End Action Buttons ---

                promptsListDiv.appendChild(item);
            });
        }
    });
}

function showAddPromptForm() {
    promptForm.reset();
    hideAllForms(); // Hide any other open forms
    // Only show the specific section for the form
    promptArea.style.display = 'block';
    promptsListDiv.style.display = 'none'; // Hide the list
    addPromptButton.style.display = 'none'; // Hide the add button
    promptFormArea.style.display = 'block'; // Show THIS form
    savePromptButton.textContent = 'Save Prompt'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditPromptForm(promptData) {
    promptForm.reset();
    hideAllForms();
    promptArea.style.display = 'block';
    promptsListDiv.style.display = 'none';
    addPromptButton.style.display = 'none';
    promptFormArea.style.display = 'block';

    // Pre-fill form with existing data
    promptNameInput.value = promptData.name;
    promptValueInput.value = promptData.value;

    savePromptButton.textContent = 'Update Prompt'; // Change button text
    editingItemId = promptData.id; // Set editing state
    editingItemType = 'prompt';
}


function handleSavePrompt(event) {
    event.preventDefault();
    const name = promptNameInput.value.trim();
    const value = promptValueInput.value.trim();

    if (!name || !value) {
        showCustomMessageBox('Name and value are required for Prompt.');
        return;
    }

    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
        let prompts = data.savedPrompts;

        if (editingItemId && editingItemType === 'prompt') {
            // Update existing prompt
            const index = prompts.findIndex(p => p.id === editingItemId);
            if (index !== -1) {
                prompts[index] = { id: editingItemId, name: name, value: value };
                // showCustomMessageBox(`Prompt "${name}" updated!`); // Removed success message
            } else {
                showCustomMessageBox('Error: Prompt not found for update.');
            }
        } else {
            // Add new prompt
            const newItem = {
                id: generateUniqueId(),
                name: name,
                value: value
            };
            prompts.push(newItem);
            // showCustomMessageBox(`Prompt "${name}" saved!`); // Removed success message
        }

        chrome.storage.local.set({ savedPrompts: prompts }, () => {
            // console.log('Prompts updated:', prompts); // Removed console.log
            promptFormArea.style.display = 'none';
            showAllListAreas(); // Show all list containers and add buttons
            reloadAllLists(); // Reload all lists
        });
    });
}

function handleDeletePrompt(idToDelete) {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
        let prompts = data.savedPrompts;
        const initialLength = prompts.length;
        prompts = prompts.filter(p => p.id !== idToDelete);

        if (prompts.length < initialLength) {
            chrome.storage.local.set({ savedPrompts: prompts }, () => {
                // console.log('Prompt deleted:', idToDelete); // Removed console.log
                showCustomMessageBox('Prompt deleted successfully!');
                reloadAllLists(); // Reload all lists
            });
        } else {
            showCustomMessageBox('Error: Prompt not found for deletion.');
        }
    });
}

function handleCancelPromptForm() {
    promptFormArea.style.display = 'none';
    showAllListAreas(); // Show all list containers and add buttons
    reloadAllLists(); // Reload all lists
}

// --- Functions for Models ---

function loadAndDisplayModels() {
     chrome.storage.local.get({ savedModels: [] }, (data) => {
        const models = data.savedModels; // Array of strings
        modelsListDiv.innerHTML = ''; // Clear list

        if (models.length === 0) {
            modelsListDiv.appendChild(noModelsMessage);
            noModelsMessage.style.display = 'block';
        } else {
            noModelsMessage.style.display = 'none';
            models.forEach(model => { // model is a string
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = model;

                const valueSpan = document.createElement('span');
                // Truncate model text for display
                valueSpan.textContent = `${model.substring(0, 20)}${model.length > 20 ? '...' : ''}`;
                item.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button'; // Add a class for styling
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditModelForm(model); // Pass the model string
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${model}"?`, () => handleDeleteModel(model), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                item.appendChild(actionButtonsContainer);
                // --- End Action Buttons ---

                modelsListDiv.appendChild(item);
            });
        }
     });
}

function showAddModelForm() {
    modelForm.reset();
    hideAllForms(); // Hide any other open forms
    modelArea.style.display = 'block'; // Keep this section container visible
    modelsListDiv.style.display = 'none'; // Hide the list
    addModelButton.style.display = 'none'; // Hide the add button
    modelFormArea.style.display = 'block'; // Show THIS form
    saveModelButton.textContent = 'Save Model'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditModelForm(modelValue) {
    modelForm.reset();
    hideAllForms();
    modelArea.style.display = 'block';
    modelsListDiv.style.display = 'none';
    addModelButton.style.display = 'none';
    modelFormArea.style.display = 'block';

    // Pre-fill form with existing data
    modelValueInput.value = modelValue;

    saveModelButton.textContent = 'Update Model'; // Change button text
    editingItemId = modelValue; // Use value as ID for models/proxies
    editingItemType = 'model';
}

function handleSaveModel(event) {
    event.preventDefault();
    const value = modelValueInput.value.trim();

    if (!value) {
        showCustomMessageBox('Model name is required.');
        return;
    }

    chrome.storage.local.get({ savedModels: [] }, (data) => {
        let models = data.savedModels;

        if (editingItemId && editingItemType === 'model') {
            // Update existing model
            const index = models.indexOf(editingItemId); // Find by value
            if (index !== -1) {
                if (models.includes(value) && models[index] !== value) { // Check if new value already exists, but allow current item to keep its value
                    showCustomMessageBox('Model already exists!');
                    return;
                }
                models[index] = value; // Update the value
                // showCustomMessageBox(`Model "${value}" updated!`); // Removed success message
            } else {
                showCustomMessageBox('Error: Model not found for update.');
            }
        } else {
            // Add new model
            if (models.includes(value)) {
                showCustomMessageBox('Model already exists!');
                return;
            }
            models.push(value);
            // showCustomMessageBox(`Model "${value}" saved!`); // Removed success message
        }

        chrome.storage.local.set({ savedModels: models }, () => {
            // console.log('Models updated:', models); // Removed console.log
            modelFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
        });
    });
}

function handleDeleteModel(valueToDelete) {
    chrome.storage.local.get({ savedModels: [] }, (data) => {
        let models = data.savedModels;
        const initialLength = models.length;
        models = models.filter(m => m !== valueToDelete);

        if (models.length < initialLength) {
            chrome.storage.local.set({ savedModels: models }, () => {
                // console.log('Model deleted:', valueToDelete); // Removed console.log
                showCustomMessageBox('Model deleted successfully!');
                reloadAllLists();
            });
        } else {
            showCustomMessageBox('Error: Model not found for deletion.');
        }
    });
}

function handleCancelModelForm() {
     modelFormArea.style.display = 'none';
     showAllListAreas();
     reloadAllLists();
}

// --- Functions for Proxies ---

function loadAndDisplayProxies() {
    chrome.storage.local.get({ savedProxies: [] }, (data) => {
        const proxies = data.savedProxies; // Array of strings
        proxyUrlsListDiv.innerHTML = ''; // Clear list

        if (proxies.length === 0) {
            proxyUrlsListDiv.appendChild(noProxyUrlsMessage);
            noProxyUrlsMessage.style.display = 'block';
        } else {
            noProxyUrlsMessage.style.display = 'none';
            proxies.forEach(proxy => { // proxy is a string
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = proxy;

                const valueSpan = document.createElement('span');
                // Truncate proxy text for display
                valueSpan.textContent = `${proxy.substring(0, 20)}${proxy.length > 20 ? '...' : ''}`;
                item.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button'; // Add a class for styling
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditProxyUrlForm(proxy);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${proxy}"?`, () => handleDeleteProxyUrl(proxy), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                item.appendChild(actionButtonsContainer);
                // --- End Action Buttons ---

                proxyUrlsListDiv.appendChild(item);
            });
        }
     });
}

function showAddProxyUrlForm() {
    proxyUrlForm.reset();
    hideAllForms(); // Hide any other open forms
    proxyUrlArea.style.display = 'block'; // Keep this section container visible
    proxyUrlsListDiv.style.display = 'none'; // Hide the list
    addProxyUrlButton.style.display = 'none'; // Hide the add button
    proxyUrlFormArea.style.display = 'block'; // Show THIS form
    saveProxyUrlButton.textContent = 'Save Proxy URL'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditProxyUrlForm(proxyValue) {
    proxyUrlForm.reset();
    hideAllForms();
    proxyUrlArea.style.display = 'block';
    proxyUrlsListDiv.style.display = 'none';
    addProxyUrlButton.style.display = 'none';
    proxyUrlFormArea.style.display = 'block';

    // Pre-fill form with existing data
    proxyUrlValueInput.value = proxyValue;

    saveProxyUrlButton.textContent = 'Update Proxy URL'; // Change button text
    editingItemId = proxyValue; // Use value as ID for models/proxies
    editingItemType = 'proxy';
}

function handleSaveProxyUrl(event) {
    event.preventDefault();
    const value = proxyUrlValueInput.value.trim();

    if (!value) {
        showCustomMessageBox('Proxy URL is required.');
        return;
    }

    chrome.storage.local.get({ savedProxies: [] }, (data) => {
        let proxies = data.savedProxies;

        if (editingItemId && editingItemType === 'proxy') {
            // Update existing proxy
            const index = proxies.indexOf(editingItemId);
            if (index !== -1) {
                if (proxies.includes(value) && proxies[index] !== value) {
                    showCustomMessageBox('Proxy URL already exists!');
                    return;
                }
                proxies[index] = value;
                // showCustomMessageBox(`Proxy URL "${value}" updated!`); // Removed success message
            } else {
                showCustomMessageBox('Error: Proxy URL not found for update.');
            }
        } else {
            // Add new proxy
            if (proxies.includes(value)) {
                showCustomMessageBox('Proxy URL already exists!');
                return;
            }
            proxies.push(value);
            // showCustomMessageBox(`Proxy URL "${value}" saved!`); // Removed success message
        }

        chrome.storage.local.set({ savedProxies: proxies }, () => {
            // console.log('Proxies updated:', proxies); // Removed console.log
            proxyUrlFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
        });
    });
}

function handleDeleteProxyUrl(valueToDelete) {
    chrome.storage.local.get({ savedProxies: [] }, (data) => {
        let proxies = data.savedProxies;
        const initialLength = proxies.length;
        proxies = proxies.filter(p => p !== valueToDelete);

        if (proxies.length < initialLength) {
            chrome.storage.local.set({ savedProxies: proxies }, () => {
                // console.log('Proxy URL deleted:', valueToDelete); // Removed console.log
                showCustomMessageBox('Proxy URL deleted successfully!');
                reloadAllLists();
            });
        } else {
            showCustomMessageBox('Error: Proxy URL not found for deletion.');
        }
    });
}

function handleCancelProxyUrlForm() {
     proxyUrlFormArea.style.display = 'none';
     showAllListAreas();
     reloadAllLists();
}


// --- Functions for API Keys ---

function loadAndDisplayApiKeys() {
    chrome.storage.local.get({ savedApiKeys: [] }, (data) => {
        const apiKeys = data.savedApiKeys; // Array of objects {id, name, value}
        apiKeysListDiv.innerHTML = ''; // Clear list

        if (apiKeys.length === 0) {
            apiKeysListDiv.appendChild(noApiKeysMessage);
            noApiKeysMessage.style.display = 'block';
        } else {
            noApiKeysMessage.style.display = 'none';
            apiKeys.forEach(key => { // key is an object {id, name, value}
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = key.id;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = key.name;
                item.appendChild(nameSpan);

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                valueSpan.textContent = `${key.value.substring(0, 20)}${key.value.length > 20 ? '...' : ''}`;
                item.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button'; // Add a class for styling
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditApiKeyForm(key);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${key.name}"?`, () => handleDeleteApiKey(key.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                item.appendChild(actionButtonsContainer);
                // --- End Action Buttons ---

                apiKeysListDiv.appendChild(item);
            });
        }
    });
}

function showAddApiKeyForm() {
    apiKeyForm.reset();
    hideAllForms(); // Hide any other open forms
    apiKeyArea.style.display = 'block'; // Keep this section container visible
    apiKeysListDiv.style.display = 'none'; // Hide the list
    addApiKeyButton.style.display = 'none'; // Hide the add button
    apiKeyFormArea.style.display = 'block'; // Show THIS form
    saveApiKeyButton.textContent = 'Save Key'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditApiKeyForm(apiKeyData) {
    apiKeyForm.reset();
    hideAllForms();
    apiKeyArea.style.display = 'block';
    apiKeysListDiv.style.display = 'none';
    addApiKeyButton.style.display = 'none';
    apiKeyFormArea.style.display = 'block';

    // Pre-fill form with existing data
    apiKeyNameInput.value = apiKeyData.name;
    apiKeyValueInput.value = apiKeyData.value;

    saveApiKeyButton.textContent = 'Update Key'; // Change button text
    editingItemId = apiKeyData.id; // Set editing state
    editingItemType = 'apiKey';
}

function handleSaveApiKey(event) {
    event.preventDefault();
    const name = apiKeyNameInput.value.trim();
    const value = apiKeyValueInput.value.trim();

    if (!name || !value) {
        showCustomMessageBox('Name and value are required for API Key.');
        return;
    }

    chrome.storage.local.get({ savedApiKeys: [] }, (data) => {
        let apiKeys = data.savedApiKeys;

        if (editingItemId && editingItemType === 'apiKey') {
            // Update existing API Key
            const index = apiKeys.findIndex(k => k.id === editingItemId);
            if (index !== -1) {
                // Check for duplicate name if changed to a new name that already exists
                const existingWithName = apiKeys.find(k => k.name === name && k.id !== editingItemId);
                if (existingWithName) {
                    showCustomMessageBox('An API Key with this name already exists!');
                    return;
                }
                apiKeys[index] = { id: editingItemId, name: name, value: value };
                // showCustomMessageBox(`API Key "${name}" updated!`); // Removed success message
            } else {
                showCustomMessageBox('Error: API Key not found for update.');
            }
        } else {
            // Add new API Key
            if (apiKeys.some(k => k.name === name)) {
                showCustomMessageBox('An API Key with this name already exists!');
                return;
            }
            const newItem = {
                id: generateUniqueId(),
                name: name,
                value: value
            };
            apiKeys.push(newItem);
            // showCustomMessageBox(`API Key "${name}" saved!`); // Removed success message
        }

        chrome.storage.local.set({ savedApiKeys: apiKeys }, () => {
            // console.log('API Keys updated:', apiKeys); // Removed console.log
            apiKeyFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
        });
    });
}

function handleDeleteApiKey(idToDelete) {
    chrome.storage.local.get({ savedApiKeys: [] }, (data) => {
        let apiKeys = data.savedApiKeys;
        const initialLength = apiKeys.length;
        apiKeys = apiKeys.filter(k => k.id !== idToDelete);

        if (apiKeys.length < initialLength) {
            chrome.storage.local.set({ savedApiKeys: apiKeys }, () => {
                // console.log('API Key deleted:', idToDelete); // Removed console.log
                showCustomMessageBox('API Key deleted successfully!');
                reloadAllLists();
            });
        } else {
            showCustomMessageBox('Error: API Key not found for deletion.');
        }
    });
}

function handleCancelApiKeyForm() {
     apiKeyFormArea.style.display = 'none';
     showAllListAreas();
     reloadAllLists();
}


// --- Functions for Presets ---

function loadAndDisplayPresets() {
    chrome.storage.local.get({ savedPresets: [] }, (data) => {
        const presets = data.savedPresets;
        presetsListDiv.innerHTML = ''; // Clear list

        if (presets.length === 0) {
            presetsListDiv.appendChild(noPresetsMessage);
            noPresetsMessage.style.display = 'block';
        } else {
            noPresetsMessage.style.display = 'none';
            presets.forEach(preset => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = preset.id;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = preset.name;
                item.appendChild(nameSpan);

                // Removed the summarySpan to only display the name
                // const summarySpan = document.createElement('span');
                // summarySpan.className = 'item-value';
                // const summary = `M: ${preset.model ? preset.model.substring(0,10) + '...' : '-'}, P: ${preset.proxy ? preset.proxy.substring(0,10) + '...' : '-'}, A: ${preset.apiKey ? (preset.apiKey.name || preset.apiKey).substring(0,10) + '...' : '-'}, Q: ${preset.prompt ? preset.prompt.substring(0,10) + '...' : '-'}`;
                // summarySpan.textContent = summary;
                // item.appendChild(summarySpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-button'; // Add a class for styling
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditPresetForm(preset);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${preset.name}"?`, () => handleDeletePreset(preset.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                item.appendChild(actionButtonsContainer);
                // --- End Action Buttons ---

                // Click listener for preset items (for INJECTING the bundle)
                // This listener should remain on the item itself, not the action buttons
                item.addEventListener('click', () => {
                   // console.log('Preset item clicked (injection trigger):', preset.name, preset); // Removed console.log
                   // Send a message to the content script with the entire preset bundle
                   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                       if (tabs.length > 0) {
                           chrome.tabs.sendMessage(tabs[0].id, {
                               action: 'injectPresetBundle',
                               presetData: preset
                           }, (response) => {
                               if (chrome.runtime.lastError) {
                                   console.error("Error sending message:", chrome.runtime.lastError.message);
                               } else if (response && response.status === 'success') {
                                   // console.log('Preset bundle injected successfully.'); // Removed console.log
                                   // Optionally close the popup after injection
                                   // window.close();
                               } else {
                                   console.warn('Preset bundle injection failed or no response from content script.');
                               }
                           });
                       } else {
                           console.warn('No active tab found to send message to.');
                       }
                   });
                });

                presetsListDiv.appendChild(item);
            });
        }
    });
}

function showAddPresetForm() {
    presetForm.reset();
    hideAllForms(); // Hide any other open forms
    presetsArea.style.display = 'block'; // Keep this section container visible
    presetsListDiv.style.display = 'none'; // Hide the list
    addPresetButton.style.display = 'none'; // Hide the add button
    presetFormArea.style.display = 'block'; // Show THIS form
    savePresetButton.textContent = 'Save Preset'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditPresetForm(presetData) {
    presetForm.reset();
    hideAllForms();
    presetsArea.style.display = 'block';
    presetsListDiv.style.display = 'none';
    addPresetButton.style.display = 'none';
    presetFormArea.style.display = 'block';

    // Pre-fill form with existing data
    presetNameInput.value = presetData.name;
    presetPromptInput.value = presetData.prompt;
    presetModelInput.value = presetData.model;
    presetProxyInput.value = presetData.proxy;
    presetApiKeyInput.value = presetData.apiKey; // API Key is stored as string value

    savePresetButton.textContent = 'Update Preset'; // Change button text
    editingItemId = presetData.id; // Set editing state
    editingItemType = 'preset';
}

function handleSavePreset(event) {
     event.preventDefault();

    const name = presetNameInput.value.trim();
    const prompt = presetPromptInput.value.trim();
    const model = presetModelInput.value.trim();
    const proxy = presetProxyInput.value.trim();
    const apiKey = presetApiKeyInput.value.trim(); // This will be the value (string)

    if (!name || !prompt) {
        showCustomMessageBox('Preset Name and Prompt are required.');
        return;
    }

    chrome.storage.local.get({ savedPresets: [] }, (data) => {
        let presets = data.savedPresets;

        if (editingItemId && editingItemType === 'preset') {
            // Update existing preset
            const index = presets.findIndex(p => p.id === editingItemId);
            if (index !== -1) {
                // Check for duplicate name if changed to a new name that already exists
                const existingWithName = presets.find(p => p.name === name && p.id !== editingItemId);
                if (existingWithName) {
                    showCustomMessageBox('A Preset with this name already exists!');
                    return;
                }
                presets[index] = {
                    id: editingItemId,
                    name: name,
                    prompt: prompt,
                    model: model,
                    proxy: proxy,
                    apiKey: apiKey
                };
                // showCustomMessageBox(`Preset "${name}" updated!`); // Removed success message
            } else {
                showCustomMessageBox('Error: Preset not found for update.');
            }
        } else {
            // Add new preset
            if (presets.some(p => p.name === name)) {
                showCustomMessageBox('A Preset with this name already exists!');
                return;
            }
            const newItem = {
                id: generateUniqueId(),
                name: name,
                prompt: prompt,
                model: model,
                proxy: proxy,
                apiKey: apiKey
            };
            presets.push(newItem);
            // showCustomMessageBox(`Preset "${name}" saved!`); // Removed success message
        }

        chrome.storage.local.set({ savedPresets: presets }, () => {
            // console.log('Presets updated:', presets); // Removed console.log
            presetFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
        });
    });
}

function handleDeletePreset(idToDelete) {
    chrome.storage.local.get({ savedPresets: [] }, (data) => {
        let presets = data.savedPresets;
        const initialLength = presets.length;
        presets = presets.filter(p => p.id !== idToDelete);

        if (presets.length < initialLength) {
            chrome.storage.local.set({ savedPresets: presets }, () => {
                // console.log('Preset deleted:', idToDelete); // Removed console.log
                showCustomMessageBox('Preset deleted successfully!');
                reloadAllLists();
            });
        } else {
            showCustomMessageBox('Error: Preset not found for deletion.');
        }
    });
}

function handleCancelPresetForm() {
    presetFormArea.style.display = 'none';
    showAllListAreas();
    reloadAllLists();
}

// --- Event Listeners ---

// Prompts
addPromptButton.addEventListener('click', showAddPromptForm);
promptForm.addEventListener('submit', handleSavePrompt);
cancelPromptButton.addEventListener('click', handleCancelPromptForm);

// Models
addModelButton.addEventListener('click', showAddModelForm);
modelForm.addEventListener('submit', handleSaveModel);
cancelModelButton.addEventListener('click', handleCancelModelForm);

// Proxies
addProxyUrlButton.addEventListener('click', showAddProxyUrlForm);
proxyUrlForm.addEventListener('submit', handleSaveProxyUrl);
cancelProxyUrlButton.addEventListener('click', handleCancelProxyUrlForm);

// API Keys
addApiKeyButton.addEventListener('click', showAddApiKeyForm);
apiKeyForm.addEventListener('submit', handleSaveApiKey);
cancelApiKeyButton.addEventListener('click', handleCancelApiKeyForm);

// Presets
addPresetButton.addEventListener('click', showAddPresetForm);
presetForm.addEventListener('submit', handleSavePreset);
cancelPresetButton.addEventListener('click', handleCancelPresetForm);


// Custom Message Box
messageBoxOkButton.addEventListener('click', hideCustomMessageBox);

// --- Initial Load ---
// Load and display all lists and presets when the popup is opened
reloadAllLists();
