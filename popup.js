// popup.js
// This script manages the UI and data storage for Prompts, Models, Proxies, API Keys,
// and Presets in the browser action popup.

// --- DEBUG CONFIGURATION ---
const DEBUG_MODE = true; // Set to true to enable console logs, false to disable.
// --- END DEBUG CONFIGURATION ---


// --- Data Structures in chrome.storage.local ---
// savedPrompts: Array of { id: 'unique-id', name: 'Prompt Name', value: 'Prompt Text' }
// savedModels: Array of String ('Model Name')
// savedProxies: Array of String ('Proxy URL')
// savedApiKeys: Array of { id: 'unique-id', name: 'Key Name', value: 'Key Value' }
// savedThemes: Array of { id: 'unique-id', name: 'Theme Name', colors: { ... } }
// currentThemeId: String (ID of the currently active theme)


// --- Element References ---

// View Containers
const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');

// Top Bar Elements
const mainHeading = document.getElementById('mainHeading');
const settingsButton = document.getElementById('settingsButton');
const backButton = document.getElementById('backButton');


// Main sections (Containers for list + add button + form)
const promptArea = document.getElementById('promptArea');
const modelArea = document.getElementById('modelArea');
const proxyUrlArea = document.getElementById('proxyUrlArea');
const apiKeyArea = document.getElementById('apiKeyArea');
// Presets Area Removed
const defaultThemesArea = document.getElementById('defaultThemesArea');
const customThemesArea = document.getElementById('customThemesArea');
const importExportArea = document.getElementById('importExportArea');


// List divs (direct parent of items)
const promptsListDiv = document.getElementById('promptsList');
const modelsListDiv = document.getElementById('modelsList');
const proxyUrlsListDiv = document.getElementById('proxyUrlsList');
const apiKeysListDiv = document.getElementById('apiKeysList');
// Presets List Div Removed
const defaultThemesListDiv = document.getElementById('defaultThemesList');
const customThemesListDiv = document.getElementById('customThemesList');

// Add buttons
const addPromptButton = document.getElementById('addPromptButton');
const addModelButton = document.getElementById('addModelButton');
const addProxyUrlButton = document.getElementById('addProxyUrlButton');
const addApiKeyButton = document.getElementById('addApiKeyButton');
// Add Preset Button Removed
const addCustomThemeButton = document.getElementById('addCustomThemeButton');

// "No items" messages
const noPromptsMessage = document.getElementById('noPromptsMessage');
const noModelsMessage = document.getElementById('noModelsMessage');
const noProxyUrlsMessage = document.getElementById('noProxyUrlsMessage');
const noApiKeysMessage = document.getElementById('noApiKeysMessage');
// No Presets Message Removed
const noDefaultThemesMessage = document.getElementById('noDefaultThemesMessage');
const noCustomThemesMessage = document.getElementById('noCustomThemesMessage');


// Form Areas (Containers for forms)
const promptFormArea = document.getElementById('promptFormArea');
const modelFormArea = document.getElementById('modelFormArea');
const proxyUrlFormArea = document.getElementById('proxyUrlFormArea');
const apiKeyFormArea = document.getElementById('apiKeyFormArea');
// Preset Form Area Removed
const themeFormArea = document.getElementById('themeFormArea');


// Forms themselves
const promptForm = document.getElementById('promptForm');
const modelForm = document.getElementById('modelForm');
const proxyUrlForm = document.getElementById('proxyUrlForm');
const apiKeyForm = document.getElementById('apiKeyForm');
// Preset Form Removed
const themeForm = document.getElementById('themeForm');


// Form Inputs
const promptNameInput = document.getElementById('promptNameInput');
const promptValueInput = document.getElementById('promptValueInput');
const modelValueInput = document.getElementById('modelValueInput');
const proxyUrlValueInput = document.getElementById('proxyUrlValueInput');
const apiKeyNameInput = document.getElementById('apiKeyNameInput');
const apiKeyValueInput = document.getElementById('apiKeyValueInput');
// Preset Inputs Removed
// Theme form inputs
const themeTemplateInput = document.getElementById('themeTemplateInput');
const themeNameInput = document.getElementById('themeNameInput');
const themePrimaryBgInput = document.getElementById('themePrimaryBgInput');
const themeSecondaryBgInput = document.getElementById('themeSecondaryBgInput');
const themeListItemBgInput = document.getElementById('themeListItemBgInput');
const themeListItemHoverBgInput = document.getElementById('themeListItemHoverBgInput');
const themeTextDefaultInput = document.getElementById('themeTextDefaultInput');
const themeTextHeadingInput = document.getElementById('themeTextHeadingInput');
const themeTextInfoInput = document.getElementById('themeTextInfoInput');
const themeBorderPrimaryInput = document.getElementById('themeBorderPrimaryInput');

// Import/Export Buttons and Input
const exportDataButton = document.getElementById('exportDataButton');
const importDataButton = document.getElementById('importDataButton');
const importFileInput = document.getElementById('importFileInput');


// Form Submit Buttons (for text change)
const savePromptButton = promptForm.querySelector('button[type="submit"]');
const saveModelButton = modelForm.querySelector('button[type="submit"]');
const saveProxyUrlButton = proxyUrlForm.querySelector('button[type="submit"]');
const saveApiKeyButton = apiKeyForm.querySelector('button[type="submit"]');
// Save Preset Button Removed
const saveThemeButton = themeForm.querySelector('button[type="submit"]');


// Cancel buttons
const cancelPromptButton = document.getElementById('cancelPromptButton');
const cancelModelButton = document.getElementById('cancelModelButton');
const cancelProxyUrlButton = document.getElementById('cancelProxyUrlButton');
const cancelApiKeyButton = document.getElementById('cancelApiKeyButton');
// Cancel Preset Button Removed
const cancelThemeButton = document.getElementById('cancelThemeButton');


// Custom Message Box Elements
const customMessageBox = document.getElementById('customMessageBox');
const messageBoxText = document.getElementById('messageBoxText');
const messageBoxOkButton = document.getElementById('messageBoxOkButton');
const messageBoxCancelButton = document.createElement('button');
messageBoxCancelButton.textContent = 'Cancel';
messageBoxCancelButton.classList.add('fancy-button');
messageBoxCancelButton.style.backgroundImage = 'linear-gradient(160deg, rgb(23, 5, 10), rgb(59, 11, 26), rgb(87, 22, 45), rgb(59, 11, 26), rgb(23, 5, 10))';
messageBoxCancelButton.style.borderColor = 'rgb(87, 22, 45)';
messageBoxCancelButton.style.color = 'rgb(255, 103, 142)';
messageBoxCancelButton.style.textShadow = 'rgba(255, 103, 142, 0.8) 0px 0px 10px';
messageBoxCancelButton.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 3px 6px 0px, rgba(0, 0, 0, 0.23) 0px 3px 6px 0px, rgba(38, 7, 17, 0.7) 0px -2px 5px 1px inset, rgba(255, 103, 142, 0.4) 0px -1px 1px 3px inset';

messageBoxCancelButton.style.marginLeft = '10px';
messageBoxCancelButton.addEventListener('click', hideCustomMessageBox);
document.getElementById('messageBoxButtons').appendChild(messageBoxCancelButton);


// --- Global State for Editing ---
let editingItemId = null;
let editingItemType = null;

// --- Global State for Drag and Drop ---
let draggedItem = null;
let draggedItemData = null;
let draggedItemStorageKey = null;
let draggedItemIdField = null;

// --- Global State for Auto-Scrolling ---
let autoScrollInterval = null;
const AUTO_SCROLL_EDGE_ZONE_PERCENTAGE = 0.25;
const SCROLL_SPEED_MAX = 10;
let currentScrollList = null;


// --- Helper Functions ---

/**
 * Displays a custom message box instead of alert().
 * @param {string} message - The message to display.
 * @param {function} [onConfirm] - Optional callback to execute if OK is pressed.
 * @param {boolean} [showCancel=false] - Whether to show a cancel button.
 */
function showCustomMessageBox(message, onConfirm = null, showCancel = false) {
    messageBoxText.textContent = message;
    customMessageBox.style.display = 'flex';

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
    // Preset Form Area Removed
    themeFormArea.style.display = 'none';
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
 * Shows all main list areas and add buttons based on the current view.
 * This function now also ensures the list divs and add buttons are visible.
 */
function showAllListAreas() {
    // Hide all list areas and add buttons first
    [promptArea, modelArea, proxyUrlArea, apiKeyArea, /* presetsArea, */ defaultThemesArea, customThemesArea, importExportArea].forEach(area => {
        area.style.display = 'none';
    });
    [promptsListDiv, modelsListDiv, proxyUrlsListDiv, apiKeysListDiv, /* presetsListDiv, */ defaultThemesListDiv, customThemesListDiv].forEach(list => {
        list.style.display = 'none';
    });
    [addPromptButton, addModelButton, addProxyUrlButton, addApiKeyButton, /* addPresetButton, */ addCustomThemeButton].forEach(button => {
        button.style.display = 'none';
    });

    // Show elements based on active view
    if (mainView.classList.contains('active')) {
        promptArea.style.display = 'flex';
        promptsListDiv.style.display = 'block';
        addPromptButton.style.display = 'flex';

        modelArea.style.display = 'flex';
        modelsListDiv.style.display = 'block';
        addModelButton.style.display = 'flex';

        proxyUrlArea.style.display = 'flex';
        proxyUrlsListDiv.style.display = 'block';
        addProxyUrlButton.style.display = 'flex';

        apiKeyArea.style.display = 'flex';
        apiKeysListDiv.style.display = 'block';
        addApiKeyButton.style.display = 'flex';

        // Presets Area Removed
    } else if (settingsView.classList.contains('active')) {
        defaultThemesArea.style.display = 'flex';
        defaultThemesListDiv.style.display = 'block';
        // No add button for default themes

        customThemesArea.style.display = 'flex';
        customThemesListDiv.style.display = 'block';
        addCustomThemeButton.style.display = 'flex';

        importExportArea.style.display = 'flex';
    }

    // Reset editing state and button texts
    editingItemId = null;
    editingItemType = null;
    savePromptButton.textContent = 'Save Prompt';
    saveModelButton.textContent = 'Save Model';
    saveProxyUrlButton.textContent = 'Save Proxy URL';
    saveApiKeyButton.textContent = 'Save Key';
    // Save Preset Button Removed
    saveThemeButton.textContent = 'Save Theme';

    hideAllActionButtons(); // Ensure all action buttons are hidden when forms are closed
}

/**
 * Switches the active view.
 * @param {HTMLElement} viewToShow - The view element to make active.
 */
function showView(viewToShow) {
    if (viewToShow === mainView) {
        mainView.classList.add('active');
        settingsView.classList.remove('active');
        settingsButton.style.display = 'flex';
        backButton.style.display = 'none';
        mainHeading.textContent = 'Shoddy API Manager';
    } else if (viewToShow === settingsView) {
        settingsView.classList.add('active');
        mainView.classList.remove('active');
        settingsButton.style.display = 'none';
        backButton.style.display = 'flex';
        mainHeading.textContent = 'Settings';
    }
    // Always hide all forms when switching views
    hideAllForms();
    // Then show the relevant lists for the new active view
    showAllListAreas();
    reloadAllLists(); // Reload lists for the newly visible view
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
    // loadAndDisplayPresets(); // Presets function removed
    loadAndDisplayDefaultThemes();
    loadAndDisplayCustomThemes();
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

    document.body.classList.add('dragging-active');
}

function handleDragOver(event) {
    event.preventDefault();
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

        if (mouseY < topScrollBoundary) {
            const scrollFactor = 1 - ((mouseY - listRect.top) / autoScrollEdgeZonePx);
            startAutoScroll(currentList, -1, scrollFactor);
        } else if (mouseY > bottomScrollBoundary) {
            const scrollFactor = 1 - ((listRect.bottom - mouseY) / autoScrollEdgeZonePx);
            startAutoScroll(currentList, 1, scrollFactor);
        } else {
            stopAutoScroll();
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
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.data-list')) {
        stopAutoScroll();
    }
}

async function handleDrop(event) {
    event.preventDefault();

    const currentDraggedItem = draggedItem;
    const currentDraggedItemData = draggedItemData;
    const currentDraggedItemStorageKey = draggedItemStorageKey;
    const currentDraggedItemIdField = draggedItemIdField;

    if (DEBUG_MODE) console.log('handleDrop triggered. currentDraggedItem:', currentDraggedItem, 'currentDraggedItemData:', JSON.parse(JSON.stringify(currentDraggedItemData)));

    if (!currentDraggedItem || currentDraggedItem.parentElement !== event.target.closest('.data-list')) {
        if (DEBUG_MODE) console.warn('Invalid drop target or currentDraggedItem is null. Stopping auto-scroll.');
        stopAutoScroll();
        draggedItem = null;
        draggedItemData = null;
        draggedItemStorageKey = null;
        draggedItemIdField = null;
        return;
    }

    const itemsListDiv = currentDraggedItem.parentElement;
    const storageKey = currentDraggedItemStorageKey;
    const idField = currentDraggedItemIdField;

    chrome.storage.local.get({ [storageKey]: [] }, async (data) => {
        let items = data[storageKey];
        if (DEBUG_MODE) console.log(`[${storageKey}] Before reorder (from storage):`, JSON.parse(JSON.stringify(items)));

        let oldIndex;
        if (idField) {
            oldIndex = items.findIndex(item => item[idField] === currentDraggedItemData[idField]);
        } else {
            oldIndex = items.indexOf(currentDraggedItemData);
        }

        if (oldIndex === -1) {
            if (DEBUG_MODE) console.error(`Dragged item not found in storage array during drop for ${storageKey}. currentDraggedItemData:`, currentDraggedItemData, 'Current items:', items);
            draggedItem = null;
            draggedItemData = null;
            draggedItemStorageKey = null;
            draggedItemIdField = null;
            stopAutoScroll();
            return;
        }

        const [removed] = items.splice(oldIndex, 1);

        const newIndex = Array.from(itemsListDiv.children).indexOf(currentDraggedItem);

        items.splice(newIndex, 0, removed);

        if (DEBUG_MODE) console.log(`[${storageKey}] After reorder (before save):`, JSON.parse(JSON.stringify(items)));

        chrome.storage.local.set({ [storageKey]: items }, () => {
            if (DEBUG_MODE) console.log(`[${storageKey}] Saved to storage.`);
            reloadAllLists();
            draggedItem = null;
            draggedItemData = null;
            draggedItemStorageKey = null;
            draggedItemIdField = null;
        });
    });
    stopAutoScroll();
}

function handleDragEnd(event) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging-invisible');
    }
    document.body.classList.remove('dragging-active');
    stopAutoScroll();
}


// --- Functions for Prompts ---

function loadAndDisplayPrompts() {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
        const prompts = data.savedPrompts;
        promptsListDiv.innerHTML = '';
        if (DEBUG_MODE) console.log('[savedPrompts] Loaded:', JSON.parse(JSON.stringify(prompts)));

        if (prompts.length === 0) {
            promptsListDiv.appendChild(noPromptsMessage);
            noPromptsMessage.style.display = 'block';
        } else {
            noPromptsMessage.style.display = 'none';
            prompts.forEach(prompt => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = prompt.id;
                item.draggable = true;

                item.addEventListener('dragstart', (e) => handleDragStart(e, prompt, 'savedPrompts', 'id'));
                item.addEventListener('dragend', handleDragEnd);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons();
                            actionButtons.classList.remove('hidden');
                        } else {
                            actionButtons.classList.add('hidden');
                        }
                    }
                });

                promptsListDiv.appendChild(item);

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = prompt.name;
                itemHeader.appendChild(nameSpan);

                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden';
                
                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editButton.className = 'edit-button icon-button';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditPromptForm(prompt);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'delete-button icon-button';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${prompt.name}"?`, () => handleDeletePrompt(prompt.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                itemHeader.appendChild(actionButtonsContainer);

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                valueSpan.textContent = `${prompt.value.substring(0, 50)}${prompt.value.length > 50 ? '...' : ''}`;
                item.appendChild(valueSpan);
            });
        }
    });
}

function showAddPromptForm() {
    showAllListAreas();
    promptForm.reset();
    hideAllForms();
    promptArea.style.display = 'flex';
    promptsListDiv.style.display = 'none';
    addPromptButton.style.display = 'flex';
    promptFormArea.style.display = 'block';
    savePromptButton.textContent = 'Save Prompt';
    editingItemId = null;
    editingItemType = null;
}

function showEditPromptForm(promptData) {
    showAllListAreas();
    promptForm.reset();
    hideAllForms();
    promptArea.style.display = 'flex';
    promptsListDiv.style.display = 'none';
    addPromptButton.style.display = 'flex';
    promptFormArea.style.display = 'block';

    promptNameInput.value = promptData.name;
    promptValueInput.value = promptData.value;

    savePromptButton.textContent = 'Update Prompt';
    editingItemId = promptData.id;
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
            const index = prompts.findIndex(p => p.id === editingItemId);
            if (index !== -1) {
                prompts[index] = { id: editingItemId, name: name, value: value };
            } else {
                showCustomMessageBox('Error: Prompt not found for update.');
            }
        } else {
            const newItem = {
                id: generateUniqueId(),
                name: name,
                value: value
            };
            prompts.push(newItem);
        }

        chrome.storage.local.set({ savedPrompts: prompts }, () => {
            promptFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
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
    showAllListAreas();
    reloadAllLists();
}

// --- Functions for Models ---

function loadAndDisplayModels() {
     chrome.storage.local.get({ savedModels: [] }, (data) => {
        const models = data.savedModels;
        modelsListDiv.innerHTML = '';
        if (DEBUG_MODE) console.log('[savedModels] Loaded:', JSON.parse(JSON.stringify(models)));

        if (models.length === 0) {
            modelsListDiv.appendChild(noModelsMessage);
            noModelsMessage.style.display = 'block';
        } else {
            noModelsMessage.style.display = 'none';
            models.forEach(model => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = model;
                item.draggable = true;

                item.addEventListener('dragstart', (e) => handleDragStart(e, model, 'savedModels', null));
                item.addEventListener('dragend', handleDragEnd);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons();
                            actionButtons.classList.remove('hidden');
                        } else {
                            actionButtons.classList.add('hidden');
                        }
                    }
                });

                modelsListDiv.appendChild(item);

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const valueSpan = document.createElement('span');
                valueSpan.textContent = `${model.substring(0, 20)}${model.length > 20 ? '...' : ''}`;
                itemHeader.appendChild(valueSpan);

                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden';

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editButton.className = 'edit-button icon-button';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditModelForm(model);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'delete-button icon-button';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${model}"?`, () => handleDeleteModel(model), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                itemHeader.appendChild(actionButtonsContainer);
            });
        }
     });
}

function showAddModelForm() {
    showAllListAreas();
    modelForm.reset();
    hideAllForms();
    modelArea.style.display = 'flex';
    modelsListDiv.style.display = 'none';
    addModelButton.style.display = 'flex';
    modelFormArea.style.display = 'block';
    saveModelButton.textContent = 'Save Model';
    editingItemId = null;
    editingItemType = null;
}

function showEditModelForm(modelValue) {
    showAllListAreas();
    modelForm.reset();
    hideAllForms();
    modelArea.style.display = 'flex';
    modelsListDiv.style.display = 'none';
    addModelButton.style.display = 'flex';
    modelFormArea.style.display = 'block';

    modelValueInput.value = modelValue;

    saveModelButton.textContent = 'Update Model';
    editingItemId = modelValue;
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
            const index = models.indexOf(editingItemId);
            if (index !== -1) {
                if (models.includes(value) && models[index] !== value) {
                    showCustomMessageBox('Model already exists!');
                    return;
                }
                models[index] = value;
            } else {
                showCustomMessageBox('Error: Model not found for update.');
            }
        } else {
            if (models.includes(value)) {
                showCustomMessageBox('Model already exists!');
                return;
            }
            models.push(value);
        }

        chrome.storage.local.set({ savedModels: models }, () => {
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
        const proxies = data.savedProxies;
        proxyUrlsListDiv.innerHTML = '';
        if (DEBUG_MODE) console.log('[savedProxies] Loaded:', JSON.parse(JSON.stringify(proxies)));

        if (proxies.length === 0) {
            proxyUrlsListDiv.appendChild(noProxyUrlsMessage);
            noProxyUrlsMessage.style.display = 'block';
        } else {
            noProxyUrlsMessage.style.display = 'none';
            proxies.forEach(proxy => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.value = proxy;
                item.draggable = true;

                item.addEventListener('dragstart', (e) => handleDragStart(e, proxy, 'savedProxies', null));
                item.addEventListener('dragend', handleDragEnd);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons();
                            actionButtons.classList.remove('hidden');
                        } else {
                            actionButtons.classList.add('hidden');
                        }
                    }
                });

                proxyUrlsListDiv.appendChild(item);

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const valueSpan = document.createElement('span');
                valueSpan.textContent = `${proxy.substring(0, 20)}${proxy.length > 20 ? '...' : ''}`;
                itemHeader.appendChild(valueSpan);

                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden';

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editButton.className = 'edit-button icon-button';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditProxyUrlForm(proxy);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'delete-button icon-button';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${proxy}"?`, () => handleDeleteProxyUrl(proxy), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                itemHeader.appendChild(actionButtonsContainer);
            });
        }
     });
}

function showAddProxyUrlForm() {
    showAllListAreas();
    proxyUrlForm.reset();
    hideAllForms();
    proxyUrlArea.style.display = 'flex';
    proxyUrlsListDiv.style.display = 'none';
    addProxyUrlButton.style.display = 'flex';
    proxyUrlFormArea.style.display = 'block';
    saveProxyUrlButton.textContent = 'Save Proxy URL';
    editingItemId = null;
    editingItemType = null;
}

function showEditProxyUrlForm(proxyValue) {
    showAllListAreas();
    proxyUrlForm.reset();
    hideAllForms();
    proxyUrlArea.style.display = 'flex';
    proxyUrlsListDiv.style.display = 'none';
    addProxyUrlButton.style.display = 'flex';
    proxyUrlFormArea.style.display = 'block';

    proxyUrlValueInput.value = proxyValue;

    saveProxyUrlButton.textContent = 'Update Proxy URL';
    editingItemId = proxyValue;
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
            const index = proxies.indexOf(editingItemId);
            if (index !== -1) {
                if (proxies.includes(value) && proxies[index] !== value) {
                    showCustomMessageBox('Proxy URL already exists!');
                    return;
                }
                proxies[index] = value;
            } else {
                showCustomMessageBox('Error: Proxy URL not found for update.');
            }
        } else {
            if (proxies.includes(value)) {
                showCustomMessageBox('Proxy URL already exists!');
                return;
            }
            proxies.push(value);
        }

        chrome.storage.local.set({ savedProxies: proxies }, () => {
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
        const apiKeys = data.savedApiKeys;
        apiKeysListDiv.innerHTML = '';
        if (DEBUG_MODE) console.log('[savedApiKeys] Loaded:', JSON.parse(JSON.stringify(apiKeys)));

        if (apiKeys.length === 0) {
            apiKeysListDiv.appendChild(noApiKeysMessage);
            noApiKeysMessage.style.display = 'block';
        } else {
            noApiKeysMessage.style.display = 'none';
            apiKeys.forEach(key => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = key.id;
                item.draggable = true;

                item.addEventListener('dragstart', (e) => handleDragStart(e, key, 'savedApiKeys', 'id'));
                item.addEventListener('dragend', handleDragEnd);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons();
                            actionButtons.classList.remove('hidden');
                        } else {
                            actionButtons.classList.add('hidden');
                        }
                    }
                });

                apiKeysListDiv.appendChild(item);

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = key.name;
                itemHeader.appendChild(nameSpan);

                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden';

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editButton.className = 'edit-button icon-button';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditApiKeyForm(key);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'delete-button icon-button';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete "${key.name}"?`, () => handleDeleteApiKey(key.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                itemHeader.appendChild(actionButtonsContainer);

                const valueSpan = document.createElement('span');
                valueSpan.className = 'item-value';
                valueSpan.textContent = `${key.value.substring(0, 20)}${key.value.length > 20 ? '...' : ''}`;
                item.appendChild(valueSpan);
            });
        }
    });
}

function showAddApiKeyForm() {
    showAllListAreas();
    apiKeyForm.reset();
    hideAllForms();
    apiKeyArea.style.display = 'flex';
    apiKeysListDiv.style.display = 'none';
    addApiKeyButton.style.display = 'flex';
    apiKeyFormArea.style.display = 'block';
    saveApiKeyButton.textContent = 'Save Key';
    editingItemId = null;
    editingItemType = null;
}

function showEditApiKeyForm(apiKeyData) {
    showAllListAreas();
    apiKeyForm.reset();
    hideAllForms();
    apiKeyArea.style.display = 'flex';
    apiKeysListDiv.style.display = 'none';
    addApiKeyButton.style.display = 'flex';
    apiKeyFormArea.style.display = 'block';

    apiKeyNameInput.value = apiKeyData.name;
    apiKeyValueInput.value = apiKeyData.value;

    saveApiKeyButton.textContent = 'Update Key';
    editingItemId = apiKeyData.id;
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

        const existingWithName = apiKeys.find(k => k.name === name && k.id !== editingItemId);
        if (existingWithName) {
            showCustomMessageBox('An API Key with this name already exists!');
            return;
        }

        const existingWithValue = apiKeys.find(k => k.value === value && k.id !== editingItemId);
        if (existingWithValue) {
            showCustomMessageBox(`This API Key value is already saved under the name "${existingWithValue.name}".`);
            return;
        }

        if (editingItemId && editingItemType === 'apiKey') {
            const index = apiKeys.findIndex(k => k.id === editingItemId);
            if (index !== -1) {
                apiKeys[index] = { id: editingItemId, name: name, value: value };
            } else {
                showCustomMessageBox('Error: API Key not found for update.');
            }
        } else {
            const newItem = {
                id: generateUniqueId(),
                name: name,
                value: value
            };
            apiKeys.push(newItem);
        }

        chrome.storage.local.set({ savedApiKeys: apiKeys }, () => {
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


// --- Functions for Themes ---

const DEFAULT_THEME_COLORS = {
    '--bg-primary': '#0A0517',
    '--bg-secondary': '#1A0B3B',
    '--bg-list-item': 'rgba(45, 22, 87, 0.3)',
    '--bg-list-item-hover': 'rgba(45, 22, 87, 0.5)',
    '--text-default': '#ABB2BF',
    '--text-heading': '#8E67FF',
    '--text-info': '#61AFEF',
    '--border-primary': '#2D1657',
};

const THEME_PRESETS = [
    {
        id: 'dark-purple',
        name: 'Dark Purple',
        colors: {
            '--bg-primary': '#0A0517',
            '--bg-secondary': '#1A0B3B',
            '--bg-list-item': 'rgba(45, 22, 87, 0.3)',
            '--bg-list-item-hover': 'rgba(45, 22, 87, 0.5)',
            '--text-default': '#ABB2BF',
            '--text-heading': '#8E67FF',
            '--text-info': '#61AFEF',
            '--border-primary': '#2D1657',
        }
    },
    {
        id: 'light-mode',
        name: 'Light Mode',
        colors: {
            '--bg-primary': '#f0f2f5',
            '--bg-secondary': '#e0e2e5',
            '--bg-list-item': 'rgba(250, 250, 250, 0.8)',
            '--bg-list-item-hover': 'rgba(230, 230, 230, 0.9)',
            '--text-default': '#333',
            '--text-heading': '#000000',
            '--text-info': '#555',
            '--border-primary': '#ccc',
        }
    },
    {
        id: 'dark-mode',
        name: 'Dark Mode',
        colors: {
            '--bg-primary': '#1A1A1A',
            '--bg-secondary': '#2B2B2B',
            '--bg-list-item': 'rgba(45, 45, 45, 0.7)',
            '--bg-list-item-hover': 'rgba(60, 60, 60, 0.9)',
            '--text-default': '#E0E0E0',
            '--text-heading': '#FFFFFF',
            '--text-info': '#BBBBBB',
            '--border-primary': '#404040',
        }
    },
    {
        id: 'darker-mode',
        name: 'Darker Mode',
        colors: {
            '--bg-primary': '#101010',
            '--bg-secondary': '#181818',
            '--bg-list-item': 'rgba(25, 25, 25, 0.7)',
            '--bg-list-item-hover': 'rgba(35, 35, 35, 0.9)',
            '--text-default': '#C0C0C0',
            '--text-heading': '#E0E0E0',
            '--text-info': '#A0A0A0',
            '--border-primary': '#202020',
        }
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        colors: {
            '--bg-primary': '#1a2a2a',
            '--bg-secondary': '#2a3a2a',
            '--bg-list-item': 'rgba(40, 60, 40, 0.5)',
            '--bg-list-item-hover': 'rgba(50, 70, 50, 0.7)',
            '--text-default': '#c0d0c0',
            '--text-heading': '#80c080',
            '--text-info': '#90b090',
            '--border-primary': '#507050',
        }
    },
    {
        id: 'ocean',
        name: 'Ocean',
        colors: {
            '--bg-primary': '#003366',
            '--bg-secondary': '#004488',
            '--bg-list-item': 'rgba(0, 80, 160, 0.5)',
            '--bg-list-item-hover': 'rgba(0, 90, 180, 0.7)',
            '--text-default': '#ADD8E6',
            '--text-heading': '#87CEEB',
            '--text-info': '#6495ED',
            '--border-primary': '#0055AA',
        }
    },
    {
        id: 'sky-blue',
        name: 'Sky Blue',
        colors: {
            '--bg-primary': '#87CEEB',
            '--bg-secondary': '#C8E6F0',
            '--bg-list-item': 'rgba(173, 216, 230, 0.8)',
            '--bg-list-item-hover': 'rgba(150, 200, 220, 0.9)',
            '--text-default': '#000000',
            '--text-heading': '#000000',
            '--text-info': '#5CB8E0',
            '--border-primary': '#A7D9EB',
        }
    },
    {
        id: 'void-new',
        name: 'Void',
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0A0A0A',
            '--bg-list-item': 'rgba(15, 15, 15, 0.8)',
            '--bg-list-item-hover': 'rgba(25, 25, 25, 0.9)',
            '--text-default': '#B0B0B0',
            '--text-heading': '#D0D0D0',
            '--text-info': '#808080',
            '--border-primary': '#151515',
        }
    },
    {
        id: 'pink',
        name: 'Pink',
        colors: {
            '--bg-primary': '#FDEBF7',
            '--bg-secondary': '#F9DCEF',
            '--bg-list-item': 'rgba(255, 220, 240, 0.8)',
            '--bg-list-item-hover': 'rgba(255, 200, 230, 0.9)',
            '--text-default': '#5C2A4F',
            '--text-heading': '#D81B60',
            '--text-info': '#E91E63',
            '--border-primary': '#F2B5D4',
        }
    },
    {
        id: 'honey',
        name: 'Honey',
        colors: {
            '--bg-primary': '#2B210A',
            '--bg-secondary': '#3D3110',
            '--bg-list-item': 'rgba(60, 45, 15, 0.7)',
            '--bg-list-item-hover': 'rgba(70, 55, 20, 0.9)',
            '--text-default': '#F2D79A',
            '--text-heading': '#FFC107',
            '--text-info': '#FFD54F',
            '--border-primary': '#4F3E1A',
        }
    },
    {
        id: 'crimson',
        name: 'Crimson',
        colors: {
            '--bg-primary': '#330000',
            '--bg-secondary': '#440000',
            '--bg-list-item': 'rgba(80, 0, 0, 0.6)',
            '--bg-list-item-hover': 'rgba(100, 0, 0, 0.8)',
            '--text-default': '#FFCCCC',
            '--text-heading': '#DC143C',
            '--text-info': '#FF6347',
            '--border-primary': '#660000',
        }
    },
    {
        id: 'light-purple',
        name: 'Light Purple',
        colors: {
            '--bg-primary': '#2A1A40',
            '--bg-secondary': '#3A2B50',
            '--bg-list-item': 'rgba(61, 38, 97, 0.4)',
            '--bg-list-item-hover': 'rgba(71, 48, 107, 0.6)',
            '--text-default': '#ABB2BF',
            '--text-heading': '#8E67FF',
            '--text-info': '#61AFEF',
            '--border-primary': '#4D3677',
        }
    },
    {
        id: 'monochromatic-grey',
        name: 'Monochromatic Grey',
        colors: {
            '--bg-primary': '#222222',
            '--bg-secondary': '#333333',
            '--bg-list-item': 'rgba(60, 60, 60, 0.7)',
            '--bg-list-item-hover': 'rgba(80, 80, 80, 0.8)',
            '--text-default': '#CCCCCC',
            '--text-heading': '#E0E0E0',
            '--text-info': '#AAAAAA',
            '--border-primary': '#555555',
        }
    },
    {
        id: 'warm-earthy',
        name: 'Warm Tones (Autumn)',
        colors: {
            '--bg-primary': '#4B3F38',
            '--bg-secondary': '#6B5B50',
            '--bg-list-item': 'rgba(139, 69, 19, 0.5)',
            '--bg-list-item-hover': 'rgba(160, 82, 45, 0.7)',
            '--text-default': '#F2E8D7',
            '--text-heading': '#E09B60',
            '--text-info': '#D4B89C',
            '--border-primary': '#8B4513',
        }
    },
    {
        id: 'cool-ice',
        name: 'Cool Tones (Winter)',
        colors: {
            '--bg-primary': '#2C3E50',
            '--bg-secondary': '#4A6278',
            '--bg-list-item': 'rgba(173, 216, 230, 0.3)',
            '--bg-list-item-hover': 'rgba(173, 216, 230, 0.5)',
            '--text-default': '#EBF5F8',
            '--text-heading': '#9AC8E2',
            '--text-info': '#B0D9EA',
            '--border-primary': '#708090',
        }
    },
    {
        id: 'high-contrast-black-yellow',
        name: 'High Contrast (Black & Yellow)',
        colors: {
            '--bg-primary': '#000000',
            '--bg-secondary': '#222222',
            '--bg-list-item': 'rgba(255, 255, 0, 0.2)',
            '--bg-list-item-hover': 'rgba(255, 255, 0, 0.4)',
            '--text-default': '#FFFF00',
            '--text-heading': '#FFFF00',
            '--text-info': '#EEEE00',
            '--border-primary': '#555500',
        }
    },
    {
        id: 'retro-vaporwave',
        name: 'Retro Vaporwave',
        colors: {
            '--bg-primary': '#1A002A',
            '--bg-secondary': '#2A004A',
            '--bg-list-item': 'rgba(80, 0, 120, 0.4)',
            '--bg-list-item-hover': 'rgba(100, 0, 150, 0.6)',
            '--text-default': '#00FFFF',
            '--text-heading': '#FF00FF',
            '--text-info': '#00AAFF',
            '--border-primary': '#550088',
        }
    },
    {
        id: 'nature-green-brown',
        name: 'Nature (Green & Brown)',
        colors: {
            '--bg-primary': '#2F4F4F',
            '--bg-secondary': '#4CAF50',
            '--bg-list-item': 'rgba(60, 110, 60, 0.4)',
            '--bg-list-item-hover': 'rgba(70, 130, 70, 0.6)',
            '--text-default': '#E0E0E0',
            '--text-heading': '#A2CD5A',
            '--text-info': '#C0C0C0',
            '--border-primary': '#6B8E23',
        }
    },
    {
        id: 'ocean-sunset',
        name: 'Ocean Sunset',
        colors: {
            '--bg-primary': '#0A1C2C',
            '--bg-secondary': '#1C3D52',
            '--bg-list-item': 'rgba(255, 102, 0, 0.3)',
            '--bg-list-item-hover': 'rgba(255, 102, 0, 0.5)',
            '--text-default': '#E0F2F7',
            '--text-heading': '#FF8C00',
            '--text-info': '#FFD700',
            '--border-primary': '#0077B6',
        }
    },
    {
        id: 'minimalist-white',
        name: 'Minimalist White',
        colors: {
            '--bg-primary': '#FFFFFF',
            '--bg-secondary': '#F8F8F8',
            '--bg-list-item': 'rgba(240, 240, 240, 0.8)',
            '--bg-list-item-hover': 'rgba(220, 220, 220, 0.9)',
            '--text-default': '#333333',
            '--text-heading': '#000000',
            '--text-info': '#666666',
            '--border-primary': '#CCCCCC',
        }
    },
    {
        id: 'black-red-elements',
        name: 'Black and Red Elements',
        colors: {
            '--bg-primary': '#0A0A0A',
            '--bg-secondary': '#1A1A1A',
            '--bg-list-item': 'rgba(255, 0, 0, 0.3)',
            '--bg-list-item-hover': 'rgba(255, 0, 0, 0.5)',
            '--text-default': '#FFFFFF',
            '--text-heading': '#FFFFFF',
            '--text-info': '#FF6666',
            '--border-primary': '#330000',
        }
    },
];


function applyTheme(themeColors) {
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(themeColors)) {
        root.style.setProperty(prop, value);
    }

    const primaryBg = themeColors['--bg-primary'];
    const secondaryBg = themeColors['--bg-secondary'];
    const borderPrimary = themeColors['--border-primary'];
    const textHeading = themeColors['--text-heading'];

    const formAreaGradient = `linear-gradient(160deg, ${hexToRgba(primaryBg, 0.8)}, ${hexToRgba(secondaryBg, 0.8)}, ${hexToRgba(borderPrimary, 0.8)}, ${hexToRgba(secondaryBg, 0.8)}, ${hexToRgba(primaryBg, 0.8)})`;
    const listContainerGradient = `linear-gradient(160deg, ${hexToRgba(primaryBg, 0.7)}, ${hexToRgba(secondaryBg, 0.7)}, ${hexToRgba(borderPrimary, 0.7)}, ${hexToRgba(secondaryBg, 0.7)}, ${hexToRgba(primaryBg, 0.7)})`;

    root.style.setProperty('--bg-form-area', formAreaGradient);
    root.style.setProperty('--bg-list-container', listContainerGradient);

    root.style.setProperty('--shadow-button-inset-color-glow', hexToRgba(textHeading, 0.4));
    root.style.setProperty('--shadow-button-hover-inset-color-glow', hexToRgba(textHeading, 0.6));
}

function loadAndDisplayDefaultThemes() {
    defaultThemesListDiv.innerHTML = '';
    if (THEME_PRESETS.length === 0) {
        defaultThemesListDiv.appendChild(noDefaultThemesMessage);
        noDefaultThemesMessage.style.display = 'block';
    } else {
        noDefaultThemesMessage.style.display = 'none';
        THEME_PRESETS.forEach(theme => {
            const item = document.createElement('div');
            item.className = 'data-list-item';
            item.dataset.id = theme.id;
            item.draggable = false;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                applyTheme(theme.colors);
                chrome.storage.local.set({ currentThemeId: theme.id });
            });

            defaultThemesListDiv.appendChild(item);

            const itemHeader = document.createElement('div');
            itemHeader.className = 'item-header';
            item.appendChild(itemHeader);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = theme.name;
            itemHeader.appendChild(nameSpan);
        });
    }
}

function loadAndDisplayCustomThemes() {
    chrome.storage.local.get({ savedThemes: [] }, (data) => {
        let themes = data.savedThemes;
        customThemesListDiv.innerHTML = '';
        if (DEBUG_MODE) console.log('[savedThemes] Loaded:', JSON.parse(JSON.stringify(themes)));

        if (themes.length === 0) {
            customThemesListDiv.appendChild(noCustomThemesMessage);
            noCustomThemesMessage.style.display = 'block';
        } else {
            noCustomThemesMessage.style.display = 'none';
            themes.forEach(theme => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.dataset.id = theme.id;
                item.draggable = true;

                item.addEventListener('dragstart', (e) => handleDragStart(e, theme, 'savedThemes', 'id'));
                item.addEventListener('dragend', handleDragEnd);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const actionButtons = item.querySelector('.action-buttons');
                    if (actionButtons) {
                        if (actionButtons.classList.contains('hidden')) {
                            hideAllActionButtons();
                            actionButtons.classList.remove('hidden');
                        } else {
                            actionButtons.classList.add('hidden');
                        }
                    }
                });

                customThemesListDiv.appendChild(item);

                const itemHeader = document.createElement('div');
                itemHeader.className = 'item-header';
                item.appendChild(itemHeader);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = theme.name;
                itemHeader.appendChild(nameSpan);

                const actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.className = 'action-buttons hidden';

                const applyButton = document.createElement('button');
                applyButton.textContent = 'Apply';
                applyButton.className = 'edit-button';
                applyButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    applyTheme(theme.colors);
                    chrome.storage.local.set({ currentThemeId: theme.id });
                });
                actionButtonsContainer.appendChild(applyButton);

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editButton.className = 'edit-button icon-button';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditThemeForm(theme);
                });
                actionButtonsContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'delete-button icon-button';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomMessageBox(`Are you sure you want to delete theme "${theme.name}"?`, () => handleDeleteTheme(theme.id), true);
                });
                actionButtonsContainer.appendChild(deleteButton);

                itemHeader.appendChild(actionButtonsContainer);
            });
        }
    });
}


function showAddThemeForm() {
    showAllListAreas();
    themeForm.reset();
    hideAllForms();
    customThemesArea.style.display = 'flex';
    customThemesListDiv.style.display = 'none';
    addCustomThemeButton.style.display = 'flex';
    themeFormArea.style.display = 'block';
    saveThemeButton.textContent = 'Save Theme';
    editingItemId = null;
    editingItemType = null;

    // Show the template dropdown when adding a new theme
    themeTemplateInput.parentElement.style.display = 'block';

    const rootStyles = getComputedStyle(document.documentElement);
    themePrimaryBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-primary'));
    themeSecondaryBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-secondary'));
    themeListItemBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-list-item'));
    themeListItemHoverBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-list-item-hover'));
    themeTextDefaultInput.value = rgbToHex(rootStyles.getPropertyValue('--text-default'));
    themeTextHeadingInput.value = rgbToHex(rootStyles.getPropertyValue('--text-heading'));
    themeTextInfoInput.value = rgbToHex(rootStyles.getPropertyValue('--text-info'));
    themeBorderPrimaryInput.value = rgbToHex(rootStyles.getPropertyValue('--border-primary'));

    populateThemeTemplateDropdown();
}

function populateThemeTemplateDropdown() {
    themeTemplateInput.innerHTML = '<option value="">-- Select a template --</option>';

    chrome.storage.local.get({ savedThemes: [] }, (data) => {
        const allThemes = [...THEME_PRESETS, ...data.savedThemes];

        allThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            themeTemplateInput.appendChild(option);
        });
    });

    themeTemplateInput.onchange = (event) => {
        const selectedId = event.target.value;
        if (selectedId) {
            chrome.storage.local.get({ savedThemes: [] }, (data) => {
                const allThemes = [...THEME_PRESETS, ...data.savedThemes];
                const selectedTheme = allThemes.find(t => t.id === selectedId);
                if (selectedTheme) {
                    themeNameInput.value = selectedTheme.name + " (Copy)";
                    themePrimaryBgInput.value = selectedTheme.colors['--bg-primary'];
                    themeSecondaryBgInput.value = selectedTheme.colors['--bg-secondary'];
                    themeListItemBgInput.value = selectedTheme.colors['--bg-list-item'];
                    themeListItemHoverBgInput.value = selectedTheme.colors['--bg-list-item-hover'];
                    themeTextDefaultInput.value = selectedTheme.colors['--text-default'];
                    themeTextHeadingInput.value = selectedTheme.colors['--text-heading'];
                    themeTextInfoInput.value = selectedTheme.colors['--text-info'];
                    themeBorderPrimaryInput.value = selectedTheme.colors['--border-primary'];
                }
            });
        } else {
            themeNameInput.value = '';
            const rootStyles = getComputedStyle(document.documentElement);
            themePrimaryBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-primary'));
            themeSecondaryBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-secondary'));
            themeListItemBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-list-item'));
            themeListItemHoverBgInput.value = rgbToHex(rootStyles.getPropertyValue('--bg-list-item-hover'));
            themeTextDefaultInput.value = rgbToHex(rootStyles.getPropertyValue('--text-default'));
            themeTextHeadingInput.value = rgbToHex(rootStyles.getPropertyValue('--text-heading'));
            themeTextInfoInput.value = rgbToHex(rootStyles.getPropertyValue('--text-info'));
            themeBorderPrimaryInput.value = rgbToHex(rootStyles.getPropertyValue('--border-primary'));
        }
    };
}


function showEditThemeForm(themeData) {
    showAllListAreas();
    themeForm.reset();
    hideAllForms();
    customThemesArea.style.display = 'flex';
    customThemesListDiv.style.display = 'none';
    addCustomThemeButton.style.display = 'flex';
    themeFormArea.style.display = 'block';

    // Hide the template dropdown when editing a theme
    themeTemplateInput.parentElement.style.display = 'none';

    themeNameInput.value = themeData.name;
    themePrimaryBgInput.value = themeData.colors['--bg-primary'] || DEFAULT_THEME_COLORS['--bg-primary'];
    themeSecondaryBgInput.value = themeData.colors['--bg-secondary'] || DEFAULT_THEME_COLORS['--bg-secondary'];
    themeListItemBgInput.value = themeData.colors['--bg-list-item'] || DEFAULT_THEME_COLORS['--bg-list-item'];
    themeListItemHoverBgInput.value = themeData.colors['--bg-list-item-hover'] || DEFAULT_THEME_COLORS['--bg-list-item-hover'];
    themeTextDefaultInput.value = themeData.colors['--text-default'] || DEFAULT_THEME_COLORS['--text-default'];
    themeTextHeadingInput.value = themeData.colors['--text-heading'] || DEFAULT_THEME_COLORS['--text-heading'];
    themeTextInfoInput.value = themeData.colors['--text-info'] || DEFAULT_THEME_COLORS['--text-info'];
    themeBorderPrimaryInput.value = themeData.colors['--border-primary'] || DEFAULT_THEME_COLORS['--border-primary'];

    saveThemeButton.textContent = 'Update Theme';
    editingItemId = themeData.id;
    editingItemType = 'theme';
}

function handleSaveTheme(event) {
    event.preventDefault();
    const name = themeNameInput.value.trim();
    if (!name) {
        showCustomMessageBox('Theme name is required.');
        return;
    }

    const newThemeColors = {
        '--bg-primary': themePrimaryBgInput.value,
        '--bg-secondary': themeSecondaryBgInput.value,
        '--bg-list-item': themeListItemBgInput.value,
        '--bg-list-item-hover': themeListItemHoverBgInput.value,
        '--text-default': themeTextDefaultInput.value,
        '--text-heading': themeTextHeadingInput.value,
        '--text-info': themeTextInfoInput.value,
        '--border-primary': themeBorderPrimaryInput.value,
    };

    chrome.storage.local.get({ savedThemes: [] }, (data) => {
        let themes = data.savedThemes;

        if (editingItemId && editingItemType === 'theme') {
            const index = themes.findIndex(t => t.id === editingItemId);
            if (index !== -1) {
                if (themes.some(t => t.name === name && t.id !== editingItemId)) {
                    showCustomMessageBox('A theme with this name already exists!');
                    return;
                }
                themes[index] = { id: editingItemId, name: name, colors: newThemeColors };
            } else {
                    showCustomMessageBox('Error: Theme not found for update.');
            }
        } else {
            if (themes.some(t => t.name === name)) {
                showCustomMessageBox('A theme with this name already exists!');
                return;
            }
            const newTheme = {
                id: generateUniqueId(),
                name: name,
                colors: newThemeColors
            };
            themes.push(newTheme);
        }

        chrome.storage.local.set({ savedThemes: themes }, () => {
            themeFormArea.style.display = 'none';
            showAllListAreas();
            reloadAllLists();
        });
    });
}

function handleDeleteTheme(idToDelete) {
    chrome.storage.local.get({ savedThemes: [], currentThemeId: null }, (data) => {
        let themes = data.savedThemes;
        const initialLength = themes.length;
        themes = themes.filter(t => t.id !== idToDelete);

        if (themes.length < initialLength) {
            chrome.storage.local.set({ savedThemes: themes }, () => {
                showCustomMessageBox('Theme deleted successfully!');
                if (data.currentThemeId === idToDelete) {
                    applyTheme(DEFAULT_THEME_COLORS);
                    chrome.storage.local.set({ currentThemeId: DEFAULT_THEME_COLORS.id });
                }
                reloadAllLists();
            });
        } else {
            showCustomMessageBox('Error: Theme not found for deletion.');
        }
    });
}

function handleCancelThemeForm() {
    themeFormArea.style.display = 'none';
    themeTemplateInput.parentElement.style.display = 'block'; // Show template dropdown again
    showAllListAreas();
    reloadAllLists();
}

// Helper to convert rgb(a) to hex for color input default values
function rgbToHex(rgb) {
    if (!rgb || rgb.startsWith('#')) {
        return rgb;
    }
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return rgb;

    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);

    const toHex = (c) => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper to convert hex to rgba
function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) {
        return hex;
    }
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Import/Export Functions ---

// Promisify chrome.storage.local.set and clear for cleaner async/await usage
function setStorageLocal(data) {
    return new Promise(resolve => {
        chrome.storage.local.set(data, () => {
            if (DEBUG_MODE) console.log('setStorageLocal: Data successfully set.');
            resolve();
        });
    });
}

function clearStorageLocal() {
    return new Promise(resolve => {
        chrome.storage.local.clear(() => {
            if (DEBUG_MODE) console.log('clearStorageLocal: Storage successfully cleared.');
            resolve();
        });
    });
}

function handleExportData() {
    showCustomMessageBox('Are you sure you want to export all your data?', async () => {
        try {
            const data = await chrome.storage.local.get(null); // Get all data
            const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON

            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'shoddy_api_manager_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showCustomMessageBox('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            showCustomMessageBox('Failed to export data. See console for details.');
        }
    }, true); // Show cancel button
}

function handleImportData() {
    showCustomMessageBox('Are you sure you want to import data? This will OVERRIDE all your current data!', () => {
        importFileInput.click(); // Trigger the hidden file input
    }, true); // Show cancel button
}

function handleFileSelect(event) {
    if (DEBUG_MODE) console.log('handleFileSelect triggered.');
    const file = event.target.files[0];
    if (!file) {
        if (DEBUG_MODE) console.log('No file selected.');
        return;
    }

    if (DEBUG_MODE) console.log('File selected:', file.name, file.type, file.size, 'bytes');

    const reader = new FileReader();
    reader.onload = async (e) => {
        if (DEBUG_MODE) console.log('FileReader onload event fired.');
        try {
            const fileContent = e.target.result;
            if (DEBUG_MODE) console.log('File content read. Attempting JSON.parse...');
            const importedData = JSON.parse(fileContent);
            if (DEBUG_MODE) console.log('JSON.parse successful. Imported Data:', importedData);

            // Basic validation: Check if expected top-level keys exist and are objects/arrays
            const expectedKeys = [
                'savedPrompts', 'savedModels', 'savedProxies',
                'savedApiKeys', /* 'savedPresets', */
                'savedThemes', 'currentThemeId'
            ];
            let isValid = true;
            for (const key of expectedKeys) {
                if (!(key in importedData)) {
                    isValid = false;
                    if (DEBUG_MODE) console.warn(`Validation failed: Missing key "${key}" in imported data.`);
                    break;
                }
            }

            if (!isValid) {
                showCustomMessageBox('Invalid data format. Please select a valid Shoddy API Manager export file.');
                return;
            }

            if (DEBUG_MODE) console.log('Data validation passed. Clearing storage...');
            await clearStorageLocal(); // Now correctly awaits the clear operation
            if (DEBUG_MODE) console.log('Storage cleared. Setting new data...');
            await setStorageLocal(importedData); // Now correctly awaits the set operation
            if (DEBUG_MODE) console.log('New data set. Displaying success message and reloading lists.');

            showCustomMessageBox('Data imported successfully! Reloading...');
            reloadAllLists();
            showView(mainView); // Go back to main view after import

        } catch (error) {
            console.error('Error during import process:', error);
            if (error instanceof SyntaxError) {
                showCustomMessageBox('Failed to parse file. Ensure it is a valid JSON file.');
            } else {
                showCustomMessageBox('Failed to import data. See console for details.');
            }
        } finally {
            if (DEBUG_MODE) console.log('Import process finished. Clearing file input.');
            event.target.value = ''; // Clear the file input to allow re-importing the same file
        }
    };
    reader.onerror = (error) => {
        console.error('FileReader error:', error);
        showCustomMessageBox('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}


// --- Event Listeners ---

// View Navigation
settingsButton.addEventListener('click', () => showView(settingsView));
backButton.addEventListener('click', () => showView(mainView));

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

// Presets (Event Listeners Removed)

// Themes
addCustomThemeButton.addEventListener('click', showAddThemeForm);
themeForm.addEventListener('submit', handleSaveTheme);
cancelThemeButton.addEventListener('click', handleCancelThemeForm);

// Import/Export
exportDataButton.addEventListener('click', handleExportData);
importDataButton.addEventListener('click', handleImportData);
importFileInput.addEventListener('change', handleFileSelect);


// Custom Message Box
messageBoxOkButton.addEventListener('click', hideCustomMessageBox);


// --- Browser Detection and Initial Load ---

/**
 * Detects if the browser is Firefox on a mobile device.
 * @returns {boolean} True if Mobile Firefox, false otherwise.
 */
function isMobileFirefox() {
    const userAgent = navigator.userAgent;
    return userAgent.includes("Firefox") && (userAgent.includes("Mobile") || userAgent.includes("Android"));
}

// Load and display all lists and presets when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get({ currentThemeId: null, savedThemes: [] }, (data) => {
        let selectedTheme = THEME_PRESETS[0];

        if (data.currentThemeId) {
            selectedTheme = THEME_PRESETS.find(t => t.id === data.currentThemeId) || selectedTheme;
            selectedTheme = data.savedThemes.find(t => t.id === data.currentThemeId) || selectedTheme;
        }
        applyTheme(selectedTheme.colors);
        chrome.storage.local.set({ currentThemeId: selectedTheme.id });
    });

    reloadAllLists();
    showView(mainView);

    if (isMobileFirefox()) {
        console.log("Detected Mobile Firefox. Adjusting popup size for better mobile experience.");
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.maxWidth = 'none';
        document.body.style.minWidth = 'unset';
        document.body.style.padding = '15px';
    }

    promptsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    promptsListDiv.addEventListener('dragover', handleDragOver);
    promptsListDiv.addEventListener('dragleave', handleDragLeave);
    promptsListDiv.addEventListener('drop', handleDrop);

    modelsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    modelsListDiv.addEventListener('dragover', handleDragOver);
    modelsListDiv.addEventListener('dragleave', handleDragLeave);
    modelsListDiv.addEventListener('drop', handleDrop);

    proxyUrlsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    proxyUrlsListDiv.addEventListener('dragover', handleDragOver);
    proxyUrlsListDiv.addEventListener('dragleave', handleDragLeave);
    proxyUrlsListDiv.addEventListener('drop', handleDrop);

    apiKeysListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    apiKeysListDiv.addEventListener('dragover', handleDragOver);
    apiKeysListDiv.addEventListener('dragleave', handleDragLeave);
    apiKeysListDiv.addEventListener('drop', handleDrop);

    // Presets List Div Event Listeners Removed
    // presetsListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    // presetsListDiv.addEventListener('dragover', handleDragOver);
    // presetsListDiv.addEventListener('dragleave', handleDragLeave);
    // presetsListDiv.addEventListener('drop', handleDrop);

    defaultThemesListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    defaultThemesListDiv.addEventListener('dragover', handleDragOver);
    defaultThemesListDiv.addEventListener('dragleave', handleDragLeave);
    defaultThemesListDiv.addEventListener('drop', handleDrop);

    customThemesListDiv.addEventListener('dragenter', (e) => e.preventDefault());
    customThemesListDiv.addEventListener('dragover', handleDragOver);
    customThemesListDiv.addEventListener('dragleave', handleDragLeave);
    customThemesListDiv.addEventListener('drop', handleDrop);
});
