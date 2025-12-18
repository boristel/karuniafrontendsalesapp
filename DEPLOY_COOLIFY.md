# Deploying Sales App to Coolify

This guide details how to deploy the Sales App (React + Vite) to a Coolify instance.

## Prerequisites

- Access to your Coolify dashboard.
- A connected Git repository (GitHub/GitLab) containing this project.
- The project pushed to the repository.

## Step-by-Step Deployment

### 1. Create New Resource
1.  Go to your Coolify Dashboard.
2.  Click **+ New Resource**.
3.  Select **Git Repository** (Public or Private).
4.  Choose your repository: `karuniamotor/salesapp-react` (or your specific repo name).
5.  Select the branch (e.g., `main` or `feature/spk-dashboard-update`).

### 2. Configuration Source
Coolify will attempt to auto-detect the project type.
- **Build Pack**: Select **Nixpacks** (Recommended) or **Static Web Website**.
    - Nixpacks usually handles Vite apps automatically.
    - If you choose *Static Web Website*, ensure to set the output directory to `dist`.

### 3. Build Settings
Verify the settings in the **Configuration** -> **Build** tab:

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Publish Directory**: `dist` (This is where Vite outputs the build)

### 4. Environment Variables
You MUST set the following environment variables in the **Environment Variables** tab. These are critical for the app to function.

| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_STRAPI_BASE_URL` | `https://api.yourdomain.com/api` | **CRITICAL**: The production URL of your Strapi Backend. |
| `VITE_STRAPI_TOKEN` | `your_long_api_token` | The API Token from Strapi (Read-Only or Custom). |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSy...` | Your Google Maps API Key. |
| `VITE_QR_BASE_URL` | `https://app.yourdomain.com/profile/` | The base URL for the Profile QR Code. |

> **Important**: Do not use `localhost` for `VITE_STRAPI_BASE_URL` in production. It must be the public URL of your Strapi server.

### 5. Domains
1.  Go to the **General** tab.
2.  Set your **Domain** (e.g., `https://sales.karuniamotor.com`).
3.  Coolify will handle the SSL certificate generation automatically.

### 6. Deployment
1.  Click **Deploy** in the top right corner.
2.  Watch the logs.
3.  Once the "Deployment Successful" message appears, click your domain to test the app.

## Troubleshooting

- **404 on Refresh**: Since this is a Single Page App (SPA), refreshing pages like `/dashboard` might cause a 404 if the server isn't configured for SPA fallback.
    - **Fix in Coolify (Nixpacks/Static)**: Usually handled automatically. If using a custom Nginx config, ensure `try_files $uri /index.html;` is present.
- **API Errors**: Check the browser console. If you see CORS errors or connection refused, check your `VITE_STRAPI_BASE_URL`.
- **White Screen**: Check the `Publish Directory`. It **must** be `dist`.
