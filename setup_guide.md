
# Google Apps Script Memo App Setup Guide

I have implemented the Memo Dashboard and the API. To connect it to your Google Sheet using **Apps Script**, follow these steps:

## 1. Google Sheets Setup
1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1sUDL_G0i_t_aSKqIf5K0z3JFFel0giyCYyT7p7Zn_tw/edit).
2. Ensure the first row contains these headers:
   `timestamp` | `datetime` | `category` | `content` | `color`
3. Click **Extensions > Apps Script**.
4. Delete all existing code and paste the content of the `google_apps_script.js` file (located in your project root).
5. Click the **Save** (💾) icon.
6. Click **Deploy > New Deployment**.
7. In the 'Select type' gear icon, ensure **Web App** is selected.
8. Settings:
   - **Description**: Memo API
   - **Execute as**: Me
   - **Who has access**: Anyone
9. Click **Deploy**. (Grant permissions if prompted).
10. **Copy the Web App URL**.

## 2. Configure Environment Variables
Create or open the `.env.local` file in your project root and paste the URL you copied:

```bash
APPS_SCRIPT_URL="YOUR_WEB_APP_URL_HERE"
```

---

### Features Implemented:
- **Sticky Note Dashboard**: Beautiful modern design with Post-it colors.
- **Dynamic CRUD**: All changes sync instantly with your Google Sheet.
- **Categories & Colors**: Manage memos with categories and distinct sticky colors.
- **Responsive Layout**: Works on all screen sizes.
