# Shoddy JAI API Manager

Enhance your JanitorAI chat experience with custom presets! Quickly inject your favorite prompts, models, proxy URLs, and API keys directly into the chat modal using convenient buttons and dropdowns.

**Key Features:**

* **Custom Preset Buttons:** Create and save full chat setups (including prompt, model, proxy, and API key) and inject them with a single click from new buttons appearing in the JanitorAI chat modal.

* **Dynamic Dropdowns:** Access your saved prompts, models, proxy URLs, and API keys via intuitive dropdown menus directly within the JanitorAI modal for quick selection and insertion.

* **Comprehensive Data Management & Customization:**

  * **Save & Organize Prompts:** Store your most used custom prompts with descriptive names.

  * **Manage Models:** Keep a list of your preferred models for easy switching.

  * **Store Proxy URLs:** Quickly apply different proxy configurations.

  * **Local API Key Storage:** Save and select your API keys by name.

  * **Drag & Drop Reordering:** Easily reorder items within any list for personalized organization.

  * **Flexible Theming:** Apply default themes or create, edit, and save your own custom color schemes for the extension's popup, ensuring a look that suits your style.

  * **Data Import/Export:** Conveniently export all your saved data (prompts, models, proxies, API keys, presets, and themes) to a JSON file for backup or transfer between browsers/devices. Import functionality allows you to easily restore or migrate your entire configuration.

* **Refined User Experience:**

  * **Intuitive Editing:** Easily modify or remove any saved entries directly from the extension's compact, dark-mode friendly popup.

  * **Improved Navigation:** Enhanced scrolling behavior and UI adjustments provide a smoother, more compact layout.

  * **Clear Feedback:** Custom confirmation pop-ups ensure you're always aware of significant actions like data import/export.

* **Seamless Integration:** Designed to blend visually with the JanitorAI interface, ensuring a smooth user experience.

* **All storage is ENTIRELY local**: Using `chrome.local.storage`, meaning this data will not sync over the cloud in any way, shape or form. The new Import/Export feature helps you manage your data across devices.

**How It Works:**

1. **Open the Extension Popup:** Click the extension icon in your browser toolbar.

2. **Add & Organize Your Data:** Use the intuitive forms to add new prompts, models, proxy URLs, or API keys. Explore the "Settings" view to manage themes and use the new Import/Export features for data backup and transfer. Once data has been added, you can simply click on it to either edit or delete an entry.

3. **Create Presets:** Combine your saved data into powerful "Presets" for one-click setup.

4. **Use in JanitorAI:** When the JanitorAI chat modal appears, you'll see your custom buttons and dropdowns, ready to inject your saved configurations.

**Please Note:**

* **Content Visibility:** Nothing will appear in the JanitorAI modal (no dropdowns or custom buttons) until you have added at least one corresponding entry (e.g., a prompt, model, proxy URL, API key, or preset) via the extension's popup.

* **Button Location:** Your custom preset buttons will be found at the **bottom of the JanitorAI chat modal**, below the existing JanitorAI preset options.

* **Occasional injecting issue:** Sometimes, the UI won't inject. This has mostly happened to me when returning to very old browser instances on PC. A simple page refresh should have it load right away. Sorry for the inconvenience :P

**Janitor.ai's new API Settings menu could look like this once you've configured the extension!:**

What the new J.AI UI will look like: (Assuming you have at least one value saved in each section. The dropdowns will NOT appear if you have nothing stored!)

<img width="631" height="903" alt="image" src="<https://github.com/user-attachments/assets/3e5dcffb-810d-4996-a6ee-18de1f522b73>" />

What the preset buttons look like (all the way at the bottom of the J.AI page):

<img width="596" height="196" alt="image" src="<https://github.com/user-attachments/assets/67d76120-0ee2-439b-b185-eafed9f1118b>" />

What the dropdowns look like:

<img width="612" height="273" alt="image" src="<https://github.com/user-attachments/assets/962e4718-5e40-4218-b637-91ef483f1ebf>" />

**The look of the actual extension popup itself looks like (when you click the icon in the top right):**

What the popup/extension looks like when you click on it:

<img width="346" height="603" alt="image" src="<https://github.com/user-attachments/assets/28376f6a-b863-4f15-8ea4-e2822211526a>" />

What adding a prompt looks like:

<img width="342" height="598" alt="image" src="<https://github.com/user-attachments/assets/34ca6213-15c5-408d-af7f-e07ec375369b>" />

What adding a preset looks like:

<img width="333" height="599" alt="image" src="<https://github.com/user-attachments/assets/aa9611f8-bf76-4eee-a257-4979e7177fa6>" />

On click edit/delete button: (Could probably use another tweak to look better :P)

<img width="343" height="322" alt="image" src="<https://github.com/user-attachments/assets/696a2a83-97c7-4fd4-9418-08b10d712264>" />
