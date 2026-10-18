# যিকির — Dubai Dhikr Tracker v3 (Night Sanctuary)

Free installable iPhone PWA for personal post-prayer dhikr, hosted on GitHub Pages.

## Install on iPhone
Open https://arkibria-tradeflow.github.io/dubai-dhikr-tracker/ in Safari, then Share → Add to Home Screen. If already installed, reopen the existing Home Screen app after a refresh. Do **not** delete the existing app to force an update: that can erase local activity records.

## Experience
- Midnight / emerald / gold dark UI for every view
- Dubai prayer-time locks; future prayer actions disabled
- Immersive, full-screen one-dhikr-at-a-time reading with large counting button
- Bengali pronunciation, Arabic and meaning tabs; scrollable paragraphs for long surahs
- Tap counter auto-completes and automatically moves to the next unfinished item
- Reader text-size toggle (`A+`) persists on this device
- History, completion timestamps, local JSON backup / restore

## Data and time accuracy
Records remain on-device using `localStorage` key `dhikr_dubai_records_v1`. This version uses the same storage key and format as v1 and v2. Back up from Settings before clearing Safari/Home Screen data. No server-side sync. Dubai prayer time calculations are supplied by the AlAdhan API method configured in the app, not guaranteed to match official mosque times; use authoritative local times for prayer.

## Hosting
GitHub Pages source: `main` branch `/ (root)`; static assets in this repository. PWA manifest uses relative file paths and service worker cache version `dubai-dhikr-v3.0.0`.