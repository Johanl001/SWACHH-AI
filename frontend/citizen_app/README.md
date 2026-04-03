# SWACHH-AI / Citizen App

## Purpose
A gamified React Native engagement application for citizens to earn Green Credits by disposing of waste correctly, view live smart bins on a map, and redeem their rewards. 

## Prerequisites
- Node.js & npm
- React Native CLI (0.73+)
- Android Studio / Xcode

## Setup Steps
1. Navigate to the project directory: `cd citizen_app`
2. Install dependencies: `npm install`
3. Link the necessary assets if required: `npx react-native-asset`
4. Replace Firebase placeholder strings in `src/utils/firebase.js`.

## Run Command
- Android: `npx react-native run-android`
- iOS: `npx react-native run-ios`

## Troubleshooting
1. **Modules not found**: Run `npm install` and be sure not to use `expo install`.
2. **Maps blank**: You need to insert your Google Maps API Key in `android/app/src/main/AndroidManifest.xml` (setup not fully covered for React Native Maps here but documented in its official page).
3. **Firebase errors**: Ensure you replaced `PLACEHOLDER_` vars in `firebase.js`.
4. **Bottom tabs not displaying**: Ensure react-navigation and vector icons are properly linked. 
5. **No demo data loading**: Head to Profile tab and turn ON 'Demo Mode'.
