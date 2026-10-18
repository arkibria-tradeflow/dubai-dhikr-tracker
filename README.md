# যিকির — Dubai Dhikr Tracker (PWA)

A Bangla-first installable progressive web app for after-salah dhikr, with Dubai prayer-time gating, an Arabic/Bangla-pronunciation accordion, repeat counters, activity history, and JSON backup/restore.

## Run locally

From the extracted project folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` on your computer. For an iPhone or Android phone, publish the folder on any **HTTPS** static host (e.g. GitHub Pages, Netlify, or Cloudflare Pages), open the URL in Safari/Chrome, and add to Home Screen.

To use GitHub Pages, upload all six app files to a repository, then enable **Settings → Pages → Deploy from a branch**, selecting the branch and `/ (root)`.

## Prayer times and locking

- Time zone is pinned to `Asia/Dubai` regardless of the device's configured time zone.
- Source: AlAdhan public API, **method 16 (Dubai, experimental)**, with latitude 25.2048, longitude 55.2708. These are **not official** IACAD times. Mosque or official schedules can differ by a few minutes.
- On October 18, 2026, a published Dubai timetable is bundled as one-day initial fallback. Other days require a successful online prayer-time fetch or a previously cached schedule.
- Each prayer unlocks when its **start time** arrives; earlier prayers remain open through midnight. This is deliberate because the dhikr belongs *after the individual salah*, not after the whole prayer window closes. It resets the day's available prayers at Dubai midnight.
- Missing or invalid prayer-time data fail closed: **all prayer entries stay locked**, with an error shown.
- On initial load the app requests today's timings, then caches current and next month for use when temporarily offline. Browser CORS and API availability govern first-use behavior.
- It relies on the device's clock, converted to Dubai's time zone; changing the device clock can affect the lock.

## Personal record storage

- All counter increments and item completion timestamps are saved to that browser origin's `localStorage` as `dhikr_dubai_records_v1`.
- Sessions are separated by Dubai Gregorian date and prayer name.
- History shows a seven-day chart, total completed sessions, active days, and any day's five prayer summaries.
- **No online account, cloud sync, or ChatGPT-wide persistence.** Losing/clearing browser or PWA storage may erase records. Regularly export a JSON backup and keep it somewhere safe.
- Settings supports JSON backup and restore, and irreversible local record deletion with confirmation.
- Stored records belong only to the browser/profile where this app is opened. Opening the same page inside a different browser or using a different website origin creates a separate local record.

## Religious and language note

- The list follows the supplied printed after-prayer adhkar chart; optionality and variations are not fully documented.
- The Arabic and Bengali pronunciations should be reviewed by a knowledgeable Arabic reader/reciter before use as a formal religious reference. Written Bengali cannot reproduce every Arabic sound precisely.

## Quick single-file demo

`Dubai_Dhikr_Tracker_Demo.html` is provided separately. It contains CSS and JavaScript in one HTML file and can display the app without hosting, but it is **not an installable PWA**, and local-file storage behavior varies by browser (especially on iPhone). For reliable ongoing records, host the ZIP contents at a stable HTTPS origin and add that site to the home screen.