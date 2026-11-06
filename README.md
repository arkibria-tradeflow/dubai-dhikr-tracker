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
