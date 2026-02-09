# Google Maps API Setup Guide

## Overview
The Haven Housing property search uses Google Maps to display properties on an interactive map with markers, info windows, and location-based search. This guide walks you through setting up the Google Maps API.

## Step-by-Step Setup

### 1. Create Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (create one if needed)
3. Accept the terms of service

### 2. Create a New Project
1. Click the project dropdown at the top (says "Select a project")
2. Click "New Project"
3. Enter project name: **Haven Housing**
4. Leave organization as "No organization" (unless you have one)
5. Click "Create"
6. Wait for the project to be created (takes a few seconds)
7. Make sure your new project is selected in the dropdown

### 3. Enable Billing
**Important**: Google Maps requires a billing account, but offers a generous free tier.

1. Go to "Billing" in the left sidebar
2. Click "Link a billing account"
3. Click "Create billing account"
4. Fill in your information and add a credit card
5. **Don't worry**: You get **$200 free credit per month**
6. Most small applications stay within the free tier

**Free Tier Details**:
- First $200/month is free
- After that: $7 per 1,000 map loads
- Typical usage for small site: $0-5/month

### 4. Enable Required APIs

You need to enable three APIs:

#### a) Maps JavaScript API
1. Go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it
4. Click "Enable"
5. Wait for it to enable (takes a few seconds)

#### b) Geocoding API
1. Still in "Library", search for "Geocoding API"
2. Click on it
3. Click "Enable"

#### c) Places API (Optional but Recommended)
1. Search for "Places API"
2. Click on it
3. Click "Enable"
4. (This enables address autocomplete in the future)

### 5. Create API Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. A dialog appears with your API key - **COPY IT NOW**
5. Click "EDIT API KEY" to restrict it (important for security)

### 6. Restrict Your API Key (IMPORTANT!)

Never use an unrestricted API key in production!

#### Application Restrictions
1. Under "Application restrictions", select **"HTTP referrers (web sites)"**
2. Click "+ ADD AN ITEM"
3. Add these referrers:
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   https://your-netlify-site.netlify.app/*
   https://your-custom-domain.com/*
   ```
4. Replace `your-netlify-site` with your actual Netlify domain
5. Add your custom domain if you have one

#### API Restrictions
1. Under "API restrictions", select **"Restrict key"**
2. Select these APIs:
   - ☑ Maps JavaScript API
   - ☑ Geocoding API
   - ☑ Places API
3. Click "Save"

### 7. Add API Key to Your Project

1. Open your `.env.local` file in the project root
2. Find or add this line:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```
3. Replace `your-actual-api-key-here` with the API key you copied
4. Save the file
5. Restart your development server:
   ```bash
   npm run dev
   ```

### 8. Verify Setup

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/properties
3. The map should load with property markers
4. If you see errors, check the browser console

## Troubleshooting

### "Failed to load map" Error
**Cause**: API key not set or invalid

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...`
2. Make sure you copied the entire key (they're long!)
3. Restart your dev server
4. Clear browser cache

### "This API key is not authorized" Error
**Cause**: API key restrictions

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click your API key
3. Under "Application restrictions", make sure you added:
   - `http://localhost:3000/*`
   - `http://127.0.0.1:3000/*`
4. Save and wait 5 minutes for changes to propagate

### "You must enable Billing" Error
**Cause**: No billing account linked

**Solution**:
1. Go to "Billing" in Google Cloud Console
2. Link or create a billing account
3. Add a credit card (you won't be charged if you stay under $200/month)

### Map Loads but No Markers
**Cause**: Properties don't have coordinates

**Solution**:
1. Go to Admin → Properties
2. Edit properties and add latitude/longitude
3. You can use [latlong.net](https://www.latlong.net/) to find coordinates

### "Access denied" in console
**Cause**: API restrictions too strict

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click your API key
3. Under "API restrictions", ensure you enabled all three APIs
4. Save and wait 5 minutes

## Testing Your Setup

### Test 1: Map Loads
1. Go to `/properties`
2. You should see a map of the USA
3. Properties with coordinates should show as markers

### Test 2: Location Search
1. Enter "Austin, TX" in the search box
2. Click "Search Properties"
3. Map should zoom to Austin
4. Nearby properties should appear

### Test 3: Use My Location
1. Click "Use My Location" button
2. Browser will ask for permission
3. Allow location access
4. Map should zoom to your location
5. Nearby properties should appear

### Test 4: Marker Click
1. Click any property marker on the map
2. Info window should appear
3. Should show property photo, title, and details

## Cost Estimation

### Free Tier (First $200/month)
- ~28,000 map loads
- ~40,000 geocoding requests
- More than enough for development and small sites

### After Free Tier
- Map loads: $7 per 1,000 loads
- Geocoding: $5 per 1,000 requests
- Most small businesses: $0-20/month

### Tips to Minimize Costs
1. Cache geocoding results in your database
2. Don't reload map unnecessarily
3. Use static maps for emails/thumbnails
4. Set up budget alerts in Google Cloud

## Security Best Practices

### ✅ DO:
- Restrict API key to specific domains
- Restrict API key to specific APIs
- Use environment variables
- Keep API key out of git
- Monitor usage in Google Cloud Console
- Set up budget alerts

### ❌ DON'T:
- Commit API key to git
- Share API key publicly
- Use unrestricted keys
- Expose keys in client-side code (that's why we use NEXT_PUBLIC_)
- Skip billing setup

## Monitoring Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "Haven Housing" project
3. Go to "APIs & Services" → "Dashboard"
4. View charts showing your API usage
5. Set up budget alerts under "Billing"

## Environment Variables

Your `.env.local` should have:

```env
# Google Maps (Required for property search)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy... (your actual key)

# Optional: Walk Score (for property details)
NEXT_PUBLIC_WALKSCORE_API_KEY=your-walkscore-key
```

## Production Deployment

When deploying to Netlify:

1. Go to Netlify Dashboard → Your Site → Site settings
2. Go to "Environment variables"
3. Add:
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
4. Save
5. Redeploy your site
6. Update API key restrictions in Google Cloud:
   - Add: `https://your-site.netlify.app/*`
   - Add your custom domain if applicable

## Support

If you run into issues:

1. Check the browser console for errors
2. Verify API key is set correctly
3. Check Google Cloud Console for API errors
4. Ensure billing is enabled
5. Wait 5-10 minutes after making changes to API key restrictions

## Summary Checklist

- [ ] Created Google Cloud project
- [ ] Enabled billing (with credit card)
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Geocoding API
- [ ] Enabled Places API
- [ ] Created API key
- [ ] Restricted API key (HTTP referrers)
- [ ] Restricted API key (APIs)
- [ ] Added key to `.env.local`
- [ ] Restarted dev server
- [ ] Map loads at `/properties`
- [ ] Property markers appear
- [ ] Location search works
- [ ] "Use My Location" works

Once all items are checked, your Google Maps integration is ready! 🎉
