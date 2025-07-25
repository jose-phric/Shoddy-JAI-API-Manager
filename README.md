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

<img width="588" height="1173" alt="image" src="https://github.com/user-attachments/assets/3bd13370-3aa3-4bb5-8881-87658b38931d" />

What the preset buttons look like (all the way at the bottom of the J.AI page):

<img width="384" height="116" alt="image" src="https://github.com/user-attachments/assets/a19af98c-cfdc-4e86-8400-82814815ec5d" />

What the dropdowns look like:

<img width="555" height="305" alt="image" src="https://github.com/user-attachments/assets/6dc7bdb5-c7aa-4489-9b64-57c682931945" />

**The look of the actual extension popup itself looks like (when you click the icon in the top right):**

What the popup/extension looks like when you click on it:

<img width="326" height="606" alt="image" src="https://github.com/user-attachments/assets/f7de550a-6ae0-4ae0-8103-de03d06d81a8" />

What adding a prompt looks like:

<img width="319" height="486" alt="image" src="https://github.com/user-attachments/assets/b17583c5-33f7-4623-a98b-21ef9598a5dc" />

What adding a preset looks like:

<img width="298" height="531" alt="image" src="https://github.com/user-attachments/assets/464a95e8-f22f-420e-92f7-9ecb54c86873" />

On click edit/delete button: (Could probably use another tweak to look better :P)

<img width="304" height="266" alt="image" src="https://github.com/user-attachments/assets/aa5cd87d-a454-424d-b209-8c795014922b" />

Settings page:

<img width="329" height="604" alt="image" src="https://github.com/user-attachments/assets/3fbc2f7d-a3db-4298-9d1d-a8026d5629a1" />

Here is a dump of a few of the different themes!:

<img width="329" height="602" alt="image" src="https://github.com/user-attachments/assets/b431a106-2d3a-4383-a4a3-db9a25ebb596" />
<img width="322" height="604" alt="image" src="https://github.com/user-attachments/assets/0be05fbd-ecd0-4aa1-8ae1-a011d86e7baa" />
<img width="328" height="606" alt="image" src="https://github.com/user-attachments/assets/72f2c748-e07a-4926-ac88-9c3f2f0a2daf" />
<img width="327" height="604" alt="image" src="https://github.com/user-attachments/assets/5e7d0c3d-a739-4d77-998f-d66b44532ad7" />
<img width="325" height="605" alt="image" src="https://github.com/user-attachments/assets/6d2bafcb-a0cf-48cc-ac47-76cd97d70e57" />
<img width="328" height="606" alt="image" src="https://github.com/user-attachments/assets/36aaee35-8b3c-4e70-89cc-b7162e73738a" />
<img width="329" height="605" alt="image" src="https://github.com/user-attachments/assets/6b47575c-35a2-4cf5-872b-0cb3135f32b2" />
<img width="325" height="604" alt="image" src="https://github.com/user-attachments/assets/6276c97f-7e22-4839-bbfe-b0b886f38d15" />
<img width="327" height="600" alt="image" src="https://github.com/user-attachments/assets/7ca961af-b1b2-4f7f-b4ad-7389583af397" />

Alternatively, easily create your own theme using the built in theme creator:

<img width="322" height="602" alt="image" src="https://github.com/user-attachments/assets/1d747ff5-129b-4ddc-a4ee-6592f7127264" />
<img width="323" height="601" alt="image" src="https://github.com/user-attachments/assets/b96c39c8-3311-40c6-9794-6d840e3793fa" />


