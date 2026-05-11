# 📊 DataTool – Chrome Extension

**DataTool** is a Chrome extension designed to automate data extraction and processing workflows directly from the browser.

It allows users to:

* Select a custom date range
* Fetch data from a remote endpoint
* Normalize and transform the data
* Automatically generate structured `.csv` outputs

The goal is to eliminate repetitive manual work and provide fast, consistent data processing.

---

## 🚀 Features

* 📅 Date range selection (single or multiple days)
* 🔄 Automated data fetching
* 🧹 Data normalization pipeline
* 📈 Automatic CSV generation
* 🌗 Light / Dark mode UI
* ⚡ Fast processing directly in the browser

---

## 🧠 Tech Stack

* **JavaScript (Vanilla)**
* **Chrome Extensions API (Manifest V3)**
* **Danfo.js** for data manipulation (similar to Pandas in Python)

---

## ⚙️ Setup

Before running the extension, you need to configure the API endpoint.

### 1. Create configuration file

Create a file named `config.js` in the src directory:

```js
export const API_URL = "YOUR_ENDPOINT_HERE";
```

---

### 2. Update `manifest.json`

Replace the placeholder in `host_permissions` with your domain:

```json
"host_permissions": [
  "https://your-domain.com/*"
]
```

---

### 3. Load the extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the src folder inside the project folder

---

## ▶️ Usage

1. Open the extension popup
2. Select a date range
3. Click **"Start Processing"**
4. Wait for the process to complete
5. The extension automaticaly downloads the final `.csv` file

---

## 📦 Data Processing

DataTool uses **Danfo.js** to:

* Parse raw data
* Clean and normalize fields
* Merge datasets when needed
* Transform data into a structured format
* Export results as `.csv`

This brings a **Python Pandas-like workflow into JavaScript**, enabling powerful data handling directly in the browser.

---

## ⚠️ Notes

* The file `config.js` is intentionally **not included in the repository**
* You must create it manually before running the extension
* Do not include sensitive credentials in client-side code

---

## 📌 Summary

DataTool is a lightweight but powerful solution for automating browser-based data workflows, combining:

* UI simplicity
* Automated processing
* Data analysis capabilities

All in a single Chrome extension.

---