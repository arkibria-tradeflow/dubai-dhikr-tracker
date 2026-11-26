# যিকির — Dubai Dhikr Tracker v5

Premium dark, emerald and gold iPhone web app implementing the approved UI mockup. Hosted using GitHub Pages.

## Features
- Home with live Dubai prayer timetable and current prayer, five prayer-time gated dhikr checklists.
- Prayers: five obligatory prayers and Tahajjud (night voluntary prayer) *inside the same Prayers section*.
- Tahajjud: 2-rakaat activity record, Witr reminder, 11 topical duas and dhikr.
- Qur'an: separate menu with an index of 114 surahs. Verified available written Bengali transliteration for 10 small surahs (not Fatiha). Others appear as titles only and are honestly labelled as not yet available.
- Duas: separate menu with topical categories and reading log.
- Large full-screen focus and reader views, fixed action dock, completion transitions and large type options.
- Local-only saved records, export/import JSON backup including legacy sessions, Tahajjud, Qur'an and Dua reading records.

## Privacy & data compatibility
All records are stored on-device in localStorage. Existing keys `dhikr_dubai_records_v1` and `dhikr_dubai_tahajjud_v1` are **not migrated or reset**. Separate logs use `dhikr_dubai_quran_v5` and `dhikr_dubai_dua_v5`.

## Prayer & script limitations
Times are obtained from AlAdhan's Dubai calculation method, not the official IACAD schedule. No future prayers unlock without a validated timetable. Night prayer can be logged after Isha and before Fajr. Bengali-script transliterations do not replace correct Arabic recitation during salah. Supplications do not guarantee a worldly outcome.

## Deployment
Publish repository's `main` branch root using GitHub Pages. The site manifest and service worker use relative asset paths. Offline cache is `dubai-dhikr-v5.0.0`.


## Version 6 — Qur'an & Asma-ul-Husna

- The easy ten surahs include original Arabic ayat, Bengali pronunciation, and Bengali meanings in three tabs.
- Tapping **পড়া শেষ** now saves completion without toggling it off, shows a success overlay, and advances to the next unread surah. After the collection is complete, it returns to the surah list.
- **আরও → আসমাউল হুসনা** opens 99 commonly taught names with Arabic, Bengali pronunciation, meaning, search, and general source-grounded virtue.
- Existing iPhone-local records and storage keys are retained. Do not delete the Home Screen app before taking a JSON backup.
- Evidence for general merits of the Names: [Quran 7:180](https://quran.com/7/180), [Sahih al-Bukhari 2736](https://sunnah.com/bukhari:2736). Source for the traditional list: [Islamic Relief](https://islamic-relief.org/99-names-of-allah-al-asma-ul-husna/). Scholarly enumerations vary; no individual name is claimed to guarantee a specific worldly result after a particular number of repetitions.

## Daily 21-count zikr (November 2026)

- A separate **দৈনিক ২১ বার যিকির** routine is available from Home and **আরও**; it does not modify the established post-salah zikr counts.
- Three items: **লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহিল আলিয়্যিল আযীম**, **আস্তাগফিরুল্লাহ, ইন্নাল্লাহা গাফুরুর রাহীম**, and **আল্লাহুম্মা সাল্লি ওয়া সাল্লিম আলা নাবিয়্যিনা মুহাম্মাদ**.
- Each has a personal daily target of 21 repetitions, Arabic text, Bengali pronunciation, meaning, source context, and a tap counter with undo and progress.
- The 21-repetition count is a **personal preference, not an authenticated Sunnah prescription or a claim of specific guaranteed merit**.
- Records are separated under `dhikr_dubai_daily21_v1`, keyed to Dubai local dates. Current records are retained when switching views, included in JSON backup/restore, and cleared by the existing global reset with confirmation.
- Offline PWA assets include `daily-zikr.js` and `daily-zikr.css` using cache `dubai-dhikr-v10.7.0`.

## Phase 2 UX improvements (v10.9.0)

This release improves presentation and navigation without changing the existing five-waqt, Tahajjud, Qur'an, Dua or daily-21 counting storage keys.

- **Home:** shows the next available post-prayer dhikr action first, then clear five-waqt and personal-dhikr totals, next prayer time, and concise routes to other practices.
- **History:** adds a date-specific summary of five-waqt dhikr sessions, 21-count practice, Qur'an completions, Dua completions and recorded night-prayer rakaat. It explicitly distinguishes *post-prayer dhikr sessions* from actual prayer performance.
- **Dua reader:** adds simple Bengali-pronunciation and meaning tabs, an explicit daily completion button and familiar reader geometry while keeping existing previous/next and library controls. The Dua data does not include verified Arabic text, so an Arabic tab is **not** fabricated.
- **Qur'an:** retains the supported 30-surah flow, improves tab semantics and preserves search and list return position in browser **session storage**.
- **Onboarding:** keeps city/GPS selection prominent, with optional advanced calculation-method controls in a disclosure.
- **Reading controls:** harmonizes touch targets, safe-area padding and focused styling across the existing reader types.
- **Compatibility:** new `phase2-experience.js` and `phase2-experience.css` load after earlier modules; the offline PWA cache name is `dubai-dhikr-v10.9.0`. Existing JSON export/import remains unchanged.

Automated source-based regression checks are in `tests/phase2-experience.mjs`. Device-specific layout and VoiceOver acceptance should still be checked on iPhone before declaring visual QA complete.

## Phase 3: accessibility, polish and offline resilience (v11.0.0)

- Updated Bengali typography and interface labels for clarity, with a compact reflow at narrow (320–360 CSS px) widths, improved reader-safe areas and visible keyboard focus.
- Higher readability on Home, History, prayer choices and reader footers, plus styling for reduced motion and increased contrast preferences.
- A polite network-status notice on Home and Namaz explains when saved prayer times are being shown offline, when prayer times are loading, and how to retry when the service fails. It **does not invent prayer times**.
- Improved reader screen navigation focus and a single screen-reader announcement region to avoid repeated whole-page announcements.
- The stand-alone Qur'an reader now shows a clearly labeled **আবার চেষ্টা করুন** action when online surah content fails. Existing navigation and completion remain unchanged.
- Fixed the service worker's offline fallback for versioned local assets such as `app.js?v=9.0.0`: cache reads use `ignoreSearch:true` to match precached canonical filenames, and cache misses return a meaningful 503 response instead of an undefined response.
- Updated PWA cache to `dubai-dhikr-v11.0.0` and corrected the installed-app description for location-aware functionality.
- Source/offline regression tests: `node --test tests/phase1-core.mjs tests/phase2-experience.mjs tests/phase3-polish.mjs`.
- Chromium mobile smoke tests: `tests/phase3-mobile.spec.mjs` use 320px, 375px and 430px viewports, daily-reader count, online/offline transitions, Qur'an completion and text enlargement checks. GitHub Actions runs these on PRs.

**Unverified without an actual device:** iPhone Safari/PWA, VoiceOver gestures, iOS Dynamic Type, true 200% browser text enlargement and all device/safe-area combinations. Do not claim formal WCAG 2.2 AA conformance from code tests alone.

**Privacy/data:** Phase 3 does not change, clear, migrate or upload existing local counts and personal reading records. Reinstalling a PWA can remove its local storage; update via reopening rather than uninstalling.

## Phase 4 — Stage A1: Screen Stability (v11.1.0)

- Home and post-prayer Dhikr session screens are **not rebuilt every 15 seconds**. The timer still runs but only refreshes the visible view when a newly available prayer changes the actionable state.
- A day rollover still performs the existing safe reset of the navigation view and retrieves that day's timetable. Returning from a backgrounded app triggers an immediate time check.
- Calendar downloads for earlier or later months update the local prayer-time cache **without resetting the visible Home/session** unless the selected day's timetable actually changed. Tahajjud overview can still refresh when date-relevant prayer times arrive.
- No changes to counters, stored records, backup formats, Arabic/Bengali dhikr content, or prayer calculation methods.
- `phase4-stability.js` is loaded after the existing three UX phases. Offline assets and script versions now use PWA cache `dubai-dhikr-v11.1.0`.
- Tests include clock-boundary and idle-update unit checks, plus Playwright browser checks of focus, DOM continuity, monthly calendar refresh, and existing Dhikr workflows.

This stage addresses only screen stability. Counter-write integrity and data backup improvements remain separate, subsequent Stage A tasks.

## Phase 4 — Stage A2: Counter Save Reliability (v11.2.0)

- Five-waqt Dhikr and Tahajjud/Witr counters **prepare a new record first** and update the displayed/in-memory count **only after local device storage confirms the write**. Failed saves do not create ghost progress, trigger completion or show a misleading successful record.
- The legacy Qur'an and Dua completion toggles now follow the same save-first pattern. Success messages and vibration only occur after the saved value is committed.
- Personal Daily 21 was already transactional; its existing save-before-display pattern, one-tap decrement and 21-per-item targets are preserved.
- Completed five-waqt Dhikr sessions now request explicit confirmation before **resetting an entire recitation**. Regular minus-one undo remains immediate; Tahajjud still supports minus-two and Witr/reading completion can be untoggled.
- On-device JSON formats, record keys, saved counts and existing exports/imports are unchanged.
- PWA cache is now `dubai-dhikr-v11.2.0`, with updated versioned script references.
- Regression coverage includes injected storage errors, saved-state integrity, finish-state suppression on failed writes, per-item undo and successful save semantics. Playwright mobile tests cover real interactions and reload persistence.

This is Stage A2 only. Future backup/restore safeguards and broader multi-tab synchronization are separate improvements. Storage errors remain visible in the app's existing Bengali error toast.

## Phase 4 — Stage A3: Backup & Recovery (v11.3.0)

Backup and restore now have an explicit local-device safety workflow:

- **Preview before replacement:** after selecting a JSON archive, users see its name, version, export date and five activity-category totals, compared with the current device's records. The Replace button remains disabled until the user acknowledges the impact.
- **Legacy support:** versions 1–4 remain supported. Missing categories in older backups are preserved from the current device, rather than silently wiped. Unknown future versions and malformed sections are rejected before any data is written.
- **Safer transactions:** all five activity keys are written with read-back verification. A write-ahead recovery journal captures the exact prior localStorage strings. Failed operations restore the original strings, rather than leaving partly replaced records. An interrupted restore or delete is rolled back early on the next app launch, before any activity module reads storage. If rollback itself fails, further destructive changes are blocked and an error is shown.
- **Delete protection:** the Delete All action shows a separate five-category summary, requires an acknowledgment checkbox and provides a Download Backup option before removal.
- **Honest backup status:** the app distinguishes **download initiated** from a file verified as saved. Users must keep the JSON file securely in iPhone Files or another location. There is no account, cloud sync or server-side backup.
- **Privacy:** exports remain user-initiated, local JSON downloads; no personal records are transmitted. Backup timestamps describe download requests only and do not certify file retention.
- **Compatibility:** no changes to saved record keys, existing counts, prayer calculations or reader data. The new pre-app guard is in `backup-journal.js`; the UI is in `backup-recovery.js` and `backup-recovery.css`. PWA cache is `dubai-dhikr-v11.3.0`.
- **Automated checks:** Node verifies correct rollback and restart recovery under simulated storage errors; Chromium tests the actual preview, cancel, legacy import, export, failed restore, and guarded Delete All flows.

**Limitations:** localStorage is device/browser-specific, and backups are not verified after an external download. An unavailable or completely cleared browser storage area cannot be reconstructed without a separately saved backup file. iPhone Safari and VoiceOver require real-device acceptance.

## Qur'an Library compact header (v11.3.1)

- Reduced the duplicated heading/intro stack on the **Qur'an catalogue** only: the app header is smaller, and the tall decorative Reading Journey card is replaced with a single compact title and live daily reading count.
- The short subtitle shows **30 currently available surahs**, including **10 locally embedded offline readings**; 20 additional readings may need internet connectivity.
- Both library tabs, search, settings action, all 30 supported reading links, unavailable-surah indicators, and on-device reading records are unchanged.
- Search and surah list begin substantially higher on mobile. Phone-width browser checks ensure the first available surah is visible above the bottom navigation on 320px, 375px and 430px screens.
- Scoped CSS in `quran-compact.css` affects **only** the Qur'an catalogue; the Home, Dua, Namaz and reading screens retain their styling.
- Versioned catalogue script `v9-native-links.js?v=9.2.0` and PWA cache `dubai-dhikr-v11.3.1` deliver the update without uninstalling the app or clearing records.

## Dua Library compact layout (v11.3.2)

The Dua collection now uses a focused, space-efficient header consistent with the updated Qur'an catalogue:
- Smaller brand header and one clearly labeled Bengali title, without the redundant English kicker or decorative promotional card
- Compact total Dua count, and a separate contextual count of how many readings were marked as read today
- Search by Bengali Dua title, topic or citation (including Bengali digits), with an empty-results message and input focus retained
- Readable swipeable topic filters with selected state and keyboard focus preservation when changing topics
- Faster access to the first Dua card, consistent 44px filter tap targets and mobile layouts at 320/375/430 CSS pixels
- Existing `data-exp="dua-open"` and `data-exp="dua-filter"` action paths remain unchanged; no modification to the reader, sources, completion records or other screens

Implementation: `dua-compact.js`, `dua-compact.css`, loaded after other existing app modules. PWA cache `dubai-dhikr-v11.3.2`. No localStorage keys or record formats changed.

QA: `node --test tests/dua-compact.mjs` and Playwright `tests/dua-compact.spec.mjs`, together with previous Quran, mobile and recovery suites.

## Smart Mobile Header — scroll direction controls (v11.3.3)

- On phone-sized screens (up to 767 CSS px), the app's existing page header stays in its normal position near the top. After scrolling past the header, a compact fixed version slides into view **when scrolling upward**; it disappears again **when scrolling downward**.
- The overlay preserves the active screen's existing back/settings controls; for the primary app header it also provides an accessible **back to top** button. The existing five-tab bottom navigation remains unchanged.
- Home, Namaz, Qur'an, Dua, More, History, Settings, daily practice and applicable prayer-guidance pages can reuse their current header content without changing their original page components.
- It is deliberately hidden for full-screen readers, while the user is typing in a search field, or while a recovery/location/dialog modal is open. It is not shown on desktop sizes.
- The overlay does not occupy document layout space or change scroll position. Input focus and the primary app controls are retained. Safe-area padding, 44px controls, reduced-motion preferences and focus visibility are supported.
- New isolated files are `smart-header.js` and `smart-header.css`, loaded last after all current rendering modules. PWA cache: `dubai-dhikr-v11.3.3`.
- Automated checks cover mobile scrolling up/down, active navigation, reader exclusion, iPhone-sized viewports and existing Quran/Dua interactions.

No change to on-device counts, saved records, prayer timing, prayer content, reader storage or backup formats.

## Unified Qur'an verse reader (v11.4.0)

The stand-alone `reader.html` now renders each ayah as a **single vertically stacked reading block** in its natural order: Arabic (right-to-left), verified Bengali-script pronunciation and Bengali meaning. Arabic, pronunciation and meaning are three **independently selectable checkboxes**; at least one layer stays selected. The choices are saved locally for subsequent surahs.

- The small top-right font controls **A− / A+** support five presets, including **two sizes smaller** than the default. The previous larger-font setting is honored on first use. Font and content toggles preserve the visible ayah position rather than moving to the beginning.
- The bottom dock keeps **Previous / Save / Next on a single row** above the device's safe area. Saving remains explicit, retains the selected prayer-location timezone and does not happen merely by navigating to another surah.
- The floating page scroll arrows are hidden; the reader uses natural touch scrolling and keeps the existing Back link and supported-surah navigation.
- Offline surahs retain the matching source arrays for all three layers. The online 20-surah reader still sources Arabic and Bengali meaning from the existing API and Bengali pronunciation only from the verified local pronunciation files. If pronunciation cannot be verified, its checkbox is disabled, an explanation appears, and Arabic + meaning remain readable. No guessed pronunciation is generated.
- No changes to Qur'an content, existing completion records, other activity counters, import/export formats or app navigation. New preferences are isolated under `dhikr_dubai_reader_views_v1` and `dhikr_dubai_reader_size_v4`.
- Files: `quran-unified-reader.js`, `quran-unified-reader.css` and small compatibility changes to `reader.html` and `reader-phase1.js`. PWA cache `dubai-dhikr-v11.4.0`.
- Automated tests check verse alignment, selected layer combinations, five text sizes, mobile widths, a single-row footer, current progress, saved state and online pronunciation failure. Device-specific iPhone Safari/VoiceOver review remains necessary.

## Qur'an reader mobile compactness and wrapping (v11.4.1)

Following iPhone feedback, the stand-alone Qur'an reader has a tighter but accessible layout:

- **Top-left X:** closes the reader back to the original Qur'an catalogue (rather than a backward arrow). The separate Previous/Next surah actions remain in the footer.
- **Less dominant controls:** the Arabic / Bengali pronunciation / Bengali meaning checkboxes use restrained styling and compact visual spacing while preserving 44px touch targets. The header and A−/A+ font controls are lighter.
- **Denser reading flow:** smaller but readable default Arabic, pronunciation and meaning font sizes and line heights; less space between layers and between ayahs. The bottom Previous / Save / Next row has shorter 44px buttons and respects the iPhone bottom safe area.
- **No clipped Arabic:** the ayah column and each text layer have explicit width constraints and line-wrap behavior. Long Arabic verses wrap naturally and may shrink by at most 5px **only within that ayah**, while shorter ayahs retain the selected font size. Font-size preferences still apply across the reader.
- **Avoid unintended Bismillah duplication:** where a source-fetched surah prefixes its first Arabic ayah with Bismillah, the display removes that redundant prefix when a separate Bismillah is already shown above the verses. Underlying Arabic source and associated records are **not** changed.
- Tested at 320/375/430px Chromium viewports with a simulated very long Arabic ayah, duplicate-prefix case, normal offline surah, close navigation and compact three-action footer. Real iPhone Safari and VoiceOver review remains separately necessary.

Files: `reader.html`, `quran-unified-reader.js`, `quran-unified-reader.css`, plus automated tests. PWA cache version `dubai-dhikr-v11.4.1`. Existing completion counts, backup format and language selection preferences are preserved.
