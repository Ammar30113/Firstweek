# FirstWeek — Mobile (Expo)

A thin native shell (Expo + React Native WebView) that wraps the deployed web
app at **https://firstweekapp.vercel.app** so FirstWeek can ship to the App
Store / Play Store. All product logic stays in the Next.js site at the repo
root — this directory is only the native container.

> **This is a separate app from the Next.js site.** It has its own
> `package.json` / `node_modules`. EAS builds *this* folder, not the repo root.

## One-time linking (required before EAS can build)

EAS needs `extra.eas.projectId` in `app.json` to point at your Expo project.
From this directory, run:

```bash
eas login          # if not already: logs into your Expo account
eas init           # links to your existing Expo project & writes the projectId
```

If your Expo project isn't `@ab3011/firstweek`, update `owner` and `slug` in
`app.json` to match it first (or let `eas init` reconcile).

## Building

```bash
cd mobile

# iOS Simulator build — no Apple Developer account needed (fastest way to see it)
eas build --profile preview --platform ios

# Real iOS build for TestFlight / App Store (needs an Apple Developer account)
eas build --profile production --platform ios

# Android (APK for sideloading via the preview profile, or AAB for production)
eas build --profile preview --platform android
```

For the **GitHub-connected build on expo.dev**: in the Expo project's
**GitHub settings, set the base/root directory to `mobile`** — otherwise EAS
looks at the repo root, finds the Next.js app, and the build fails.

## Run locally

```bash
cd mobile
npm install
npx expo start            # press i (iOS sim) / a (Android) / scan QR in Expo Go
```

## Notes

- Update `APP_URL` / `APP_HOST` in `App.tsx` if the production domain changes.
- Bundle id / package: `com.ab3011.firstweek` (change in `app.json` if needed).
- App Store review guideline **4.2**: a pure website wrapper can be rejected for
  "minimum functionality." Strengthen it with native features (push
  notifications, share, offline screen) before submitting — this shell already
  adds native loading, error/retry, hardware-back, and external-link handling.
