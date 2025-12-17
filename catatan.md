Here is the updated **Prompt for Frontend (React)**, incorporating your new backend logic. I have adjusted the requirements to ensure the frontend **displays the preview number** but **does not send it** in the payload (since the backend rejects manual input).

### 2. Prompt for Frontend (React) - Updated
**Target:** React Developer

> **Context:**
> I am building a **Multi-step SPK (Vehicle Order) Form** in a React Web App.
>
> **Backend Context (Crucial):**
> The Strapi v5 backend has been customized with Lifecycle Hooks and Custom Controllers.
> *   **Auto-Numbering:** The backend automatically generates the `noSPK` (e.g., `001/SPK/X/2023`) inside the `beforeCreate` hook.
> *   **Constraint:** The backend **rejects** manual `noSPK` values in the POST request.
> *   **New Endpoint:** `GET /api/spks/generate-next-number` returns the *predicted* next number (for display purposes only).
>
> **Pre-conditions:**
> 1.  User is logged in.
> 2.  `sales_uid` (e.g., "001.251215.001") is stored in `localStorage`.
>
> **Data Sources:**
> *   Vehicle Types: `GET /api/vehicle-types`
> *   Sales Profile: `GET /api/sales-profiles?filters[sales_uid][$eq]={stored_uid}`
> *   **Next SPK Preview:** `GET /api/spks/generate-next-number`
>
> **Feature Requirements:**
>
> 1.  **Form Initialization (UX):**
>     *   On mount, fetch the **Next SPK Number** and display it at the top of the form as a **Read-Only Label** (e.g., "Draft for SPK: 001/SPK/XII/2023").
>     *   Fetch the **Sales Profile ID** based on the `localStorage` UID for the relation link.
>
> 2.  **Unit Section Logic (Price Automation):**
>     *   Dropdown for `vehicle-types`.
>     *   **Event:** When a vehicle is selected:
>         1.  Find the `harga_otr` from the vehicle object.
>         2.  **Logic:** If the `hargaOtr` input is currently empty or 0, auto-fill it.
>         3.  **Important:** The user must still be able to edit/override this price manually.
>
> 3.  **Form Structure & State:**
>     *   Use a single state object separated logically (Master, Detail, Unit, Payment).
>     *   UI: Accordion or Stepper layout.
>
> 4.  **Payload Preparation (Submission):**
>     *   **Do NOT send `noSPK` in the JSON payload.** The backend will handle this.
>     *   Format the payload for Strapi Components:
>         ```json
>         {
>           "data": {
>             // "noSPK": "OMIT THIS FIELD",
>             "salesProfile": 2, // ID from relation lookup
>             "detailInfo": { ... },
>             "unitInfo": { "vehicleType": 5, "hargaOtr": ... },
>             "paymentInfo": { ... }
>           }
>         }
>         ```
>     *   Handle File Uploads: Use `FormData`. Upload files to `/api/upload` first to get IDs, then bind them to the specific component fields in the final POST, OR use the Strapi FormData structure for entry creation (nested `refId`). *Recommendation: Upload first, then attach IDs.*
>
> **Task:**
> Write a functional **React Component (`CreateSpkForm.jsx`)** using `axios` and `useState`.
> *   Implement the **Next Number Preview** (fetch on mount).
> *   Implement the **Price Auto-load vs Manual Override** logic.
> *   Ensure the final POST request **omits** the `noSPK` field.