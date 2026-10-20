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
