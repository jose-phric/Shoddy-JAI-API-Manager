// popup.js
// This script manages the UI and data storage for Prompts, Models, Proxies, API Keys,
// and Presets in the browser action popup.

// --- DEBUG CONFIGURATION ---
const DEBUG_MODE = false; // Set to true to enable console logs, false to disable.
// --- END DEBUG CONFIGURATION ---


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
// Apply the fancy-button class to the dynamically created cancel button
messageBoxCancelButton.classList.add('fancy-button'); // Added fancy-button class
// Override background for visual distinction as a cancel button
messageBoxCancelButton.style.backgroundImage = 'linear-gradient(160deg, rgb(23, 5, 10), rgb(59, 11, 26), rgb(87, 22, 45), rgb(59, 11, 26), rgb(23, 5, 10))';
messageBoxCancelButton.style.borderColor = 'rgb(87, 22, 45)';
messageBoxCancelButton.style.color = 'rgb(255, 103, 142)';
messageBoxCancelButton.style.textShadow = 'rgba(255, 103, 142, 0.8) 0px 0px 10px';
messageBoxCancelButton.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 3px 6px 0px, rgba(0, 0, 0, 0.23) 0px 3px 6px 0px, rgba(38, 7, 17, 0.7) 0px -2px 5px 1px inset, rgba(255, 103, 142, 0.4) 0px -1px 1px 3px inset';

messageBoxCancelButton.style.marginLeft = '10px';
messageBoxCancelButton.addEventListener('click', hideCustomMessageBox); // Hide on cancel
// Append to the messageBoxButtons div, not directly to customMessageBox
document.getElementById('messageBoxButtons').appendChild(messageBoxCancelButton);


// --- Global State for Editing ---
let editingItemId = null;
let editingItemType = null; // 'prompt', 'model', 'proxy', 'apiKey', 'preset'

// --- Global State for Drag and Drop ---
let draggedItem = null; // Stores the DOM element being dragged
let draggedItemData = null; // Stores the actual data object/string of the dragged item
let draggedItemStorageKey = null; // Stores the storage key ('savedPrompts', etc.)
let draggedItemIdField = null; // Stores the ID field name ('id' or null)

// --- Global State for Auto-Scrolling ---
let autoScrollInterval = null;
// Define the percentage of the list height from the top/bottom that triggers scrolling
const AUTO_SCROLL_EDGE_ZONE_PERCENTAGE = 0.25; // 25% from top, 25% from bottom = 50% total scroll zones
const SCROLL_SPEED_MAX = 10; // pixels per interval (max speed)
let currentScrollList = null; // To keep track of which list is scrolling


// --- Helper Functions ---

/**
 * Displays a custom message box instead of alert().
 * @param {string} message - The message to display.
 * @param {function} [onConfirm] - Optional callback to execute if OK is pressed.
 * @param {boolean} [showCancel=false] - Whether to show a cancel button.
 */
function showCustomMessageBox(message, onConfirm = null, showCancel = false) {
    messageBoxText.textContent = message;
    customMessageBox.style.display = 'flex'; // Set to flex when showing to center content

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
    proxyUrlArea.style.display = 'none';
    apiKeyFormArea.style.display = 'none';
    presetFormArea.style.display = 'none';
}

/**
 * Hides all action buttons across all list items.
 */
function hideAllActionButtons() {
    document.querySelectorAll('.action-buttons').forEach(btnContainer => {
        btnContainer.classList.add('hidden');
    });
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

     hideAllActionButtons(); // Ensure all action buttons are hidden when forms are closed
}

/**
 * Reloads all lists. Call this after any save/delete operation.
 */
function reloadAllLists() {
    if (DEBUG_MODE) console.log('Reloading all lists...');
    loadAndDisplayPrompts();
    loadAndDisplayModels();
    loadAndDisplayProxies();
    loadAndDisplayApiKeys();
    loadAndDisplayPresets();
}


// --- Auto-Scrolling Functions ---

/**
 * Starts auto-scrolling a list element.
 * @param {HTMLElement} listElement - The scrollable list container.
 * @param {number} direction - -1 for up, 1 for down.
 * @param {number} speedMultiplier - A value between 0 and 1 to multiply SCROLL_SPEED_MAX.
 */
function startAutoScroll(listElement, direction, speedMultiplier) {
    const calculatedSpeed = SCROLL_SPEED_MAX * speedMultiplier;

    // Only start scrolling if not already scrolling the same element in the same direction AND speed
    if (autoScrollInterval && currentScrollList === listElement &&
        Math.sign(autoScrollInterval._direction) === direction &&
        autoScrollInterval._speed === calculatedSpeed) {
        return;
    }

    stopAutoScroll(); // Ensure any other interval is cleared

    currentScrollList = listElement;
    autoScrollInterval = setInterval(() => {
        listElement.scrollTop += direction * calculatedSpeed;
    }, 20); // Scroll every 20ms
    autoScrollInterval._direction = direction; // Store direction for comparison
    autoScrollInterval._speed = calculatedSpeed; // Store speed for comparison
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        currentScrollList = null;
    }
}


// --- Drag and Drop Handlers (Generic) ---

function handleDragStart(event, itemData, storageKey, idField) {
    draggedItem = event.target;
    // Make a defensive copy of itemData to prevent reference issues
    draggedItemData = (typeof itemData === 'object' && itemData !== null) ? JSON.parse(JSON.stringify(itemData)) : itemData;
    draggedItemStorageKey = storageKey;
    draggedItemIdField = idField;

    if (DEBUG_MODE) console.log('Drag started for:', draggedItem, 'Data:', JSON.parse(JSON.stringify(draggedItemData)), 'Storage Key:', storageKey);

    event.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image so the original element appears to stay in place
    event.dataTransfer.setDragImage(new Image(), 0, 0);

    // Removed the class that makes the dragged item invisible
    // event.target.classList.add('dragging-invisible');
    document.body.classList.add('dragging-active'); // Add class to body for cursor
}

function handleDragOver(event) {
    event.preventDefault(); // Crucial to allow dropping
    event.dataTransfer.dropEffect = 'move';

    const targetItem = event.target.closest('.data-list-item');
    const currentList = event.target.closest('.data-list');

    // Auto-scrolling logic
    if (currentList) {
        const listRect = currentList.getBoundingClientRect();
        const mouseY = event.clientY;

        // Calculate the pixel height of the scroll zone from each edge
        const autoScrollEdgeZonePx = currentList.clientHeight * AUTO_SCROLL_EDGE_ZONE_PERCENTAGE;

        const topScrollBoundary = listRect.top + autoScrollEdgeZonePx;
        const bottomScrollBoundary = listRect.bottom - autoScrollEdgeZonePx;

        if (mouseY < topScrollBoundary) { // In top scroll zone
            // Calculate factor: 1 at top edge, 0 at topScrollBoundary
            const scrollFactor = 1 - ((mouseY - listRect.top) / autoScrollEdgeZonePx);
            startAutoScroll(currentList, -1, scrollFactor); // Scroll up
        } else if (mouseY > bottomScrollBoundary) { // In bottom scroll zone
            // Calculate factor: 1 at bottom edge, 0 at bottomScrollBoundary
            const scrollFactor = 1 - ((listRect.bottom - mouseY) / autoScrollEdgeZonePx);
            startAutoScroll(currentList, 1, scrollFactor); // Scroll down
        } else {
            stopAutoScroll(); // In the dead zone (center 50%)
        }
    }


    // Ensure we are dragging over a valid item within the same list
    if (targetItem && draggedItem && targetItem !== draggedItem && currentList === draggedItem.parentElement) {
        const bounding = targetItem.getBoundingClientRect();
        const offset = event.clientY - bounding.top;

        // Determine if dragging over top or bottom half for insertion point
        const insertBeforeTarget = offset < bounding.height / 2;

        // Dynamically reorder DOM elements for visual feedback
        if (insertBeforeTarget) {
            currentList.insertBefore(draggedItem, targetItem);
        } else {
            currentList.insertBefore(draggedItem, targetItem.nextSibling);
        }
    }
}

function handleDragLeave(event) {
    // Stop scrolling if the dragged item leaves the list container entirely
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.data-list')) {
        stopAutoScroll();
    }
}

async function handleDrop(event) {
    event.preventDefault(); // Crucial to prevent default browser handling

    // Capture the global state variables as local constants immediately
    const currentDraggedItem = draggedItem;
    const currentDraggedItemData = draggedItemData;
    const currentDraggedItemStorageKey = draggedItemStorageKey;
    const currentDraggedItemIdField = draggedItemIdField;

    if (DEBUG_MODE) console.log('handleDrop triggered. currentDraggedItem:', currentDraggedItem, 'currentDraggedItemData:', JSON.parse(JSON.stringify(currentDraggedItemData)));

    // Ensure draggedItem is valid and we are dropping within its original list
    if (!currentDraggedItem || currentDraggedItem.parentElement !== event.target.closest('.data-list')) {
        if (DEBUG_MODE) console.warn('Invalid drop target or currentDraggedItem is null. Stopping auto-scroll.');
        stopAutoScroll();
        // Clear global drag state immediately if drop is invalid
        draggedItem = null;
        draggedItemData = null;
        draggedItemStorageKey = null;
        draggedItemIdField = null;
        return;
    }

    const itemsListDiv = currentDraggedItem.parentElement; // The parent list div
    const storageKey = currentDraggedItemStorageKey;
    const idField = currentDraggedItemIdField;

    // Get current items from storage
    chrome.storage.local.get({ [storageKey]: [] }, async (data) => {
        let items = data[storageKey];
        if (DEBUG_MODE) console.log(`[${storageKey}] Before reorder (from storage):`, JSON.parse(JSON.stringify(items))); // Log before reorder

        let oldIndex;
        if (idField) {
            // For objects with an ID field (Prompts, API Keys, Presets)
            oldIndex = items.findIndex(item => item[idField] === currentDraggedItemData[idField]);
        } else {
            // For simple string arrays (Models, Proxies)
            oldIndex = items.indexOf(currentDraggedItemData);
        }

        if (oldIndex === -1) {
            if (DEBUG_MODE) console.error(`Dragged item not found in storage array during drop for ${storageKey}. currentDraggedItemData:`, currentDraggedItemData, 'Current items:', items);
            // Clear global drag state if item not found, as something went wrong
            draggedItem = null;
            draggedItemData = null;
            draggedItemStorageKey = null;
            draggedItemIdField = null;
            stopAutoScroll();
            return;
        }

        const [removed] = items.splice(oldIndex, 1); // Remove the item from its old position in data array

        // Determine the new index based on the DOM's current order
        const newIndex = Array.from(itemsListDiv.children).indexOf(currentDraggedItem);

        // Insert the removed item at the new index in the data array
        items.splice(newIndex, 0, removed);

        if (DEBUG_MODE) console.log(`[${storageKey}] After reorder (before save):`, JSON.parse(JSON.stringify(items))); // Log after reorder

        // Save the reordered array back to storage
        chrome.storage.local.set({ [storageKey]: items }, () => {
            if (DEBUG_MODE) console.log(`[${storageKey}] Saved to storage.`); // Confirm save
            reloadAllLists(); // Reload all lists to reflect the new order from storage
            // refreshContentScriptData(); // Notify content script of potential data change (e.g., preset order)
            // Note: refreshContentScriptData is commented out as it's not provided in this context.

            // Clear global drag state ONLY after successful save and reload
            draggedItem = null;
            draggedItemData = null;
            draggedItemStorageKey = null;
            draggedItemIdField = null;
        });
    });
    stopAutoScroll(); // Stop scrolling after drop (this can be moved inside the callback too for more strictness)
}

function handleDragEnd(event) {
    // Clean up: remove dragging class and reset global state
    if (draggedItem) {
        draggedItem.classList.remove('dragging-invisible');
    }
    document.body.classList.remove('dragging-active'); // Remove cursor class from body
    stopAutoScroll(); // Ensure auto-scrolling stops
    // Do NOT clear draggedItem, draggedItemData here. handleDrop's callback will do it.
}


// --- Functions for Prompts ---

function loadAndDisplayPrompts() {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
        const prompts = data.savedPrompts;
        promptsListDiv.innerHTML = ''; // Clear list
        if (DEBUG_MODE) console.log('[savedPrompts] Loaded:', JSON.parse(JSON.stringify(prompts))); // Log loaded data

        if (prompts.length === 0) {
            promptsListDiv.appendChild(noPromptsMessage);
            noPromptsMessage.style.display = 'block';
        } else {
            noPromptsMessage.style.display = 'none';
            prompts.forEach(prompt => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = prompt.id;
                item.draggable = true; // Make item draggable

                // Add drag and drop event listeners
                item.addEventListener('dragstart', (e) => handleDragStart(e, prompt, 'savedPrompts', 'id'));
                // item.addEventListener('dragover', handleDragOver); // Moved to parent list
                item.addEventListener('dragend', handleDragEnd); // dragend should be on the item

                // Click listener for showing/hiding action buttons
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling up to document.body
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons(); // Hide all others first
                            actionButtons.classList.remove('hidden'); // Show this one
                        } else {
                            actionButtons.classList.add('hidden'); // Hide this one
                        }
                    }
                });

                promptsListDiv.appendChild(item); // Append first, then add content

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = prompt.name;
                itemHeader.appendChild(nameSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden'; // Start hidden
                
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

                itemHeader.appendChild(actionButtonsContainer); // Append to itemHeader
                // --- End Action Buttons ---

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                // Truncate long prompts for display
                valueSpan.textContent = `${prompt.value.substring(0, 50)}${prompt.value.length > 50 ? '...' : ''}`;
                item.appendChild(valueSpan);
            });
        }
    });
}

function showAddPromptForm() {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    promptForm.reset();
    hideAllForms(); // Hide any other open forms
    // Only show the specific section for the form
    promptArea.style.display = 'block';
    promptsListDiv.style.display = 'none'; // Hide the list
    addPromptButton.style.display = 'flex'; // Ensure add button is visible for this section
    promptFormArea.style.display = 'block'; // Show THIS form
    savePromptButton.textContent = 'Save Prompt'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditPromptForm(promptData) {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    promptForm.reset();
    hideAllForms();
    promptArea.style.display = 'block';
    promptsListDiv.style.display = 'none';
    addPromptButton.style.display = 'flex'; // Ensure add button is visible for this section
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
            // if (DEBUG_MODE) console.log('Prompts updated:', prompts); // Removed console.log
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
                // if (DEBUG_MODE) console.log('Prompt deleted:', idToDelete); // Removed console.log
                showCustomMessageBox('Prompt deleted successfully!');
                reloadAllLists();
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
        if (DEBUG_MODE) console.log('[savedModels] Loaded:', JSON.parse(JSON.stringify(models))); // Log loaded data

        if (models.length === 0) {
            modelsListDiv.appendChild(noModelsMessage);
            noModelsMessage.style.display = 'block';
        } else {
            noModelsMessage.style.display = 'none';
            models.forEach(model => { // model is a string
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = model;
                item.draggable = true; // Make item draggable

                // Add drag and drop event listeners
                item.addEventListener('dragstart', (e) => handleDragStart(e, model, 'savedModels', null)); // No idField for models
                // item.addEventListener('dragover', handleDragOver); // Moved to parent list
                item.addEventListener('dragend', handleDragEnd); // dragend should be on the item

                // Click listener for showing/hiding action buttons
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling up to document.body
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons(); // Hide all others first
                            actionButtons.classList.remove('hidden'); // Show this one
                        } else {
                            actionButtons.classList.add('hidden'); // Hide this one
                        }
                    }
                });

                modelsListDiv.appendChild(item); // Append first, then add content

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const valueSpan = document.createElement('span');
                // Truncate model text for display
                valueSpan.textContent = `${model.substring(0, 20)}${model.length > 20 ? '...' : ''}`;
                itemHeader.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden'; // Start hidden

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

                itemHeader.appendChild(actionButtonsContainer); // Append to itemHeader
                // --- End Action Buttons ---
            });
        }
     });
}

function showAddModelForm() {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    modelForm.reset();
    hideAllForms(); // Hide any other open forms
    modelArea.style.display = 'block'; // Keep this section container visible
    modelsListDiv.style.display = 'none'; // Hide the list
    addModelButton.style.display = 'flex'; // Ensure add button is visible for this section
    modelFormArea.style.display = 'block'; // Show THIS form
    saveModelButton.textContent = 'Save Model'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditModelForm(modelValue) {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    modelForm.reset();
    hideAllForms();
    modelArea.style.display = 'block';
    modelsListDiv.style.display = 'none';
    addModelButton.style.display = 'flex'; // Ensure add button is visible for this section
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
            // if (DEBUG_MODE) console.log('Models updated:', models); // Removed console.log
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
                // if (DEBUG_MODE) console.log('Model deleted:', valueToDelete); // Removed console.log
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
        if (DEBUG_MODE) console.log('[savedProxies] Loaded:', JSON.parse(JSON.stringify(proxies))); // Log loaded data

        if (proxies.length === 0) {
            proxyUrlsListDiv.appendChild(noProxyUrlsMessage);
            noProxyUrlsMessage.style.display = 'block';
        } else {
            noProxyUrlsMessage.style.display = 'none';
            proxies.forEach(proxy => { // proxy is a string
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = proxy;
                item.draggable = true; // Make item draggable

                // Add drag and drop event listeners
                item.addEventListener('dragstart', (e) => handleDragStart(e, proxy, 'savedProxies', null)); // No idField for proxies
                // item.addEventListener('dragover', handleDragOver); // Moved to parent list
                item.addEventListener('dragend', handleDragEnd); // dragend should be on the item

                // Click listener for showing/hiding action buttons
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling up to document.body
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons(); // Hide all others first
                            actionButtons.classList.remove('hidden'); // Show this one
                        } else {
                            actionButtons.classList.add('hidden'); // Hide this one
                        }
                    }
                });

                proxyUrlsListDiv.appendChild(item); // Append first, then add content

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const valueSpan = document.createElement('span');
                // Truncate proxy text for display
                valueSpan.textContent = `${proxy.substring(0, 20)}${proxy.length > 20 ? '...' : ''}`;
                itemHeader.appendChild(valueSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden'; // Start hidden

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

                itemHeader.appendChild(actionButtonsContainer); // Append to itemHeader
                // --- End Action Buttons ---
            });
        }
     });
}

function showAddProxyUrlForm() {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    proxyUrlForm.reset();
    hideAllForms(); // Hide any other open forms
    proxyUrlArea.style.display = 'block'; // Keep this section container visible
    proxyUrlsListDiv.style.display = 'none'; // Hide the list
    addProxyUrlButton.style.display = 'flex'; // Ensure add button is visible for this section
    proxyUrlFormArea.style.display = 'block'; // Show THIS form
    saveProxyUrlButton.textContent = 'Save Proxy URL'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditProxyUrlForm(proxyValue) {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    proxyUrlForm.reset();
    hideAllForms();
    proxyUrlArea.style.display = 'block';
    proxyUrlsListDiv.style.display = 'none';
    addProxyUrlButton.style.display = 'flex'; // Ensure add button is visible for this section
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
            // if (DEBUG_MODE) console.log('Proxies updated:', proxies); // Removed console.log
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
                // if (DEBUG_MODE) console.log('Proxy URL deleted:', valueToDelete); // Removed console.log
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
        if (DEBUG_MODE) console.log('[savedApiKeys] Loaded:', JSON.parse(JSON.stringify(apiKeys))); // Log loaded data

        if (apiKeys.length === 0) {
            apiKeysListDiv.appendChild(noApiKeysMessage);
            noApiKeysMessage.style.display = 'block';
        } else {
            noApiKeysMessage.style.display = 'none';
            apiKeys.forEach(key => { // key is an object {id, name, value}
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = key.id;
                item.draggable = true; // Make item draggable

                // Add drag and drop event listeners
                item.addEventListener('dragstart', (e) => handleDragStart(e, key, 'savedApiKeys', 'id'));
                // item.addEventListener('dragover', handleDragOver); // Moved to parent list
                item.addEventListener('dragend', handleDragEnd); // dragend should be on the item

                // Click listener for showing/hiding action buttons
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling up to document.body
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons(); // Hide all others first
                            actionButtons.classList.remove('hidden'); // Show this one
                        } else {
                            actionButtons.classList.add('hidden'); // Hide this one
                        }
                    }
                });

                apiKeysListDiv.appendChild(item); // Append first, then add content

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = key.name;
                itemHeader.appendChild(nameSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden'; // Start hidden

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

                itemHeader.appendChild(actionButtonsContainer); // Append to itemHeader
                // --- End Action Buttons ---

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                valueSpan.textContent = `${key.value.substring(0, 20)}${key.value.length > 20 ? '...' : ''}`;
                item.appendChild(valueSpan);
            });
        }
    });
}

function showAddApiKeyForm() {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    apiKeyForm.reset();
    hideAllForms(); // Hide any other open forms
    apiKeyArea.style.display = 'block'; // Keep this section container visible
    apiKeysListDiv.style.display = 'none'; // Hide the list
    addApiKeyButton.style.display = 'flex'; // Ensure add button is visible for this section
    apiKeyFormArea.style.display = 'block'; // Show THIS form
    saveApiKeyButton.textContent = 'Save Key'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditApiKeyForm(apiKeyData) {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    apiKeyForm.reset();
    hideAllForms();
    apiKeyArea.style.display = 'block';
    apiKeysListDiv.style.display = 'none';
    addApiKeyButton.style.display = 'flex'; // Ensure add button is visible for this section
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
            // if (DEBUG_MODE) console.log('API Keys updated:', apiKeys); // Removed console.log
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
                // if (DEBUG_MODE) console.log('API Key deleted:', idToDelete); // Removed console.log
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
        if (DEBUG_MODE) console.log('[savedPresets] Loaded:', JSON.parse(JSON.stringify(presets))); // Log loaded data

        if (presets.length === 0) {
            presetsListDiv.appendChild(noPresetsMessage);
            noPresetsMessage.style.display = 'block';
        } else {
            noPresetsMessage.style.display = 'none';
            presets.forEach(preset => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = preset.id;
                item.draggable = true; // Make item draggable

                // Add drag and drop event listeners
                item.addEventListener('dragstart', (e) => handleDragStart(e, preset, 'savedPresets', 'id'));
                // item.addEventListener('dragover', handleDragOver); // Moved to parent list
                item.addEventListener('dragend', handleDragEnd); // dragend should be on the item

                // Click listener for showing/hiding action buttons
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling up to document.body
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons(); // Hide all others first
                            actionButtons.classList.remove('hidden'); // Show this one
                        } else {
                            actionButtons.classList.add('hidden'); // Hide this one
                        }
                    }
                });

                presetsListDiv.appendChild(item); // Append first, then add content

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = preset.name;
                itemHeader.appendChild(nameSpan);

                // --- Action Buttons (Edit/Delete) ---
                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden'; // Start hidden

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

                itemHeader.appendChild(actionButtonsContainer); // Append to itemHeader
                // --- End Action Buttons ---

                // Click listener for preset items (for INJECTING the bundle)
                // This listener should remain on the item itself, not the action buttons
                // This will now be handled by the generic item click listener, but the injection logic still needs to be here.
                // The injection logic should probably be moved into a separate function called by the item click listener
                // or triggered by a specific "use preset" button if we want to avoid accidental injections.
                // For now, I'll keep the existing injection logic, but it will only fire if the item is clicked
                // and the buttons are not toggled. This might need further refinement based on UX.
                // Let's assume for now that clicking the item *always* means "show buttons AND inject" if no buttons are visible.
                // If buttons are visible, clicking the item again hides them.
                // A better UX would be a separate "Use" button or double-click to inject.
                // For now, I will keep the injection logic separate from the button toggling.
                // I'll add a check to ensure the injection only happens if the buttons were NOT just toggled.

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                // Truncate long prompts for display
                const summary = `M: ${preset.model ? preset.model.substring(0,10) + '...' : '-'}, P: ${preset.proxy ? preset.proxy.substring(0,10) + '...' : '-'}, A: ${preset.apiKey ? (preset.apiKey.name || preset.apiKey).substring(0,10) + '...' : '-'}`;
                valueSpan.textContent = summary;
                item.appendChild(valueSpan);

                // Original injection logic (now triggered by the item click)
                // This will run AFTER the button toggle, so it might not be ideal.
                // A dedicated "Use" button or double-click would be better for UX.
                // For now, I'm removing the direct injection on item click to avoid conflict with button toggling.
                // If injection is desired directly on click, we need to differentiate click for buttons vs click for injection.
            });
        }
    });
}

function showAddPresetForm() {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    presetForm.reset();
    hideAllForms(); // Hide any other open forms
    presetsArea.style.display = 'block'; // Keep this section container visible
    presetsListDiv.style.display = 'none'; // Hide the list
    addPresetButton.style.display = 'flex'; // Ensure add button is visible for this section
    presetFormArea.style.display = 'block'; // Show THIS form
    savePresetButton.textContent = 'Save Preset'; // Ensure button text is "Save"
    editingItemId = null; // Clear editing state
    editingItemType = null;
}

function showEditPresetForm(presetData) {
    showAllListAreas(); // NEW: Call this first to ensure all lists are visible
    presetForm.reset();
    hideAllForms();
    presetsArea.style.display = 'block';
    presetsListDiv.style.display = 'none';
    addPresetButton.style.display = 'flex'; // Ensure add button is visible for this section
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
            // if (DEBUG_MODE) console.log('Presets updated:', presets); // Removed console.log
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
                // if (DEBUG_MODE) console.log('Preset deleted:', idToDelete); // Removed console.log
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


// --- Browser Detection and Initial Load ---

/**
 * Detects if the browser is Firefox on a mobile device.
 * @returns {boolean} True if Mobile Firefox, false otherwise.
 */
function isMobileFirefox() {
    const userAgent = navigator.userAgent;
    // Check for "Firefox" and common mobile indicators like "Mobile" or "Android"
    return userAgent.includes("Firefox") && (userAgent.includes("Mobile") || userAgent.includes("Android"));
}

// Load and display all lists and presets when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    reloadAllLists();

    if (isMobileFirefox()) {
        console.log("Detected Mobile Firefox. Adjusting popup size for better mobile experience.");
        // Apply fullscreen width and height for mobile Firefox
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.maxWidth = 'none'; // Remove max width constraint
        document.body.style.minWidth = 'unset'; // Remove min width constraint
        document.body.style.padding = '15px'; // Keep padding for content spacing
    }

    // Attach dragenter, dragover, dragleave, and drop listeners to the list containers
    promptsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    promptsListDiv.addEventListener('dragover', handleDragOver); // Moved here
    promptsListDiv.addEventListener('dragleave', handleDragLeave);
    promptsListDiv.addEventListener('drop', handleDrop);

    modelsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    modelsListDiv.addEventListener('dragover', handleDragOver); // Moved here
    modelsListDiv.addEventListener('dragleave', handleDragLeave);
    modelsListDiv.addEventListener('drop', handleDrop);

    proxyUrlsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    proxyUrlsListDiv.addEventListener('dragover', handleDragOver); // Moved here
    proxyUrlsListDiv.addEventListener('dragleave', handleDragLeave);
    proxyUrlsListDiv.addEventListener('drop', handleDrop);

    apiKeysListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    apiKeysListDiv.addEventListener('dragover', handleDragOver); // Moved here
    apiKeysListDiv.addEventListener('dragleave', handleDragLeave);
    apiKeysListDiv.addEventListener('drop', handleDrop);

    presetsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    presetsListDiv.addEventListener('dragover', handleDragOver); // Moved here
    presetsListDiv.addEventListener('dragleave', handleDragLeave);
    presetsListDiv.addEventListener('drop', handleDrop);
});
