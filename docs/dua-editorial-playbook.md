# Dua Library — Phase 1 Content Architecture and Editorial Rules

**Scope:** data and editorial foundation only. The existing 11 Dua entries remain visible and unchanged. This document does NOT certify existing citations, grading, Bengali transliteration or translation as independently verified.

## Operating principles

1. **One stable Dua ID.** Preserve all existing IDs in reading history, Tahajjud, bookmarks and backup exports. A dua can belong to multiple categories without being duplicated.
2. **Source provenance.** Distinguish Qur'anic excerpts, Hadith supplications, dhikr/adhkar and personally worded Bengali supplications. An ayah encouraging a practice does not automatically establish exact wording, timing or count.
3. **Never invent Arabic, prescribed counts or religious grading.** Source verification comes before adding those fields or claims. Missing Arabic remains null.
4. **No mandatory count by default.** The reading tracker records voluntary reading; special times and repetition counts require independently reviewed source support.
5. **Do not show empty categories as populated.** The 20 categories are a coverage plan, not 20 completed content collections.
6. **Review before new publication.** Drafts never appear automatically in the app. New entries require named reviewer sign-off and acceptance tests.

## Taxonomy — 20 main categories

| ID | Bengali name | Planned subtopics |
| --- | --- | --- |
| daily-life | দৈনন্দিন জীবন | Waking, sleep, eating, clothing, entering/leaving home |
| morning-evening | সকাল ও সন্ধ্যার আমল | Morning and evening |
| salah-worship | নামাজ ও ইবাদত | Salah, sujud, worship, salawat |
| repentance-forgiveness | ক্ষমা ও তওবা | Tawbah, istighfar, self-purification |
| faith-guidance | ঈমান ও হেদায়েত | Guidance, steadfastness, faith |
| gratitude-praise | শোকর ও প্রশংসা | Gratitude, praise, contentment |
| livelihood-debt | রিজিক ও ঋণমুক্তি | Lawful livelihood, poverty, debt |
| work-decisions | কাজ ও সিদ্ধান্ত | Business, work, responsibility, istikhara |
| knowledge-learning | শিক্ষা ও জ্ঞান | Study, understanding, beneficial knowledge |
| marriage-spouses | বিবাহ ও দাম্পত্য | Marriage, spouse, harmony |
| family-children | পরিবার ও সন্তান | Parents, children, family |
| health-healing | স্বাস্থ্য ও আরোগ্য | Illness, pain, healing |
| anxiety-peace | দুশ্চিন্তা ও প্রশান্তি | Anxiety, grief, fear, calm |
| safety-protection | বিপদ ও নিরাপত্তা | Danger, protection, security |
| travel | সফর ও যাতায়াত | Travel, journeys, returning home |
| character-relationships | উত্তম চরিত্র ও সম্পর্ক | Character, fairness, kindness |
| patience-trials | ধৈর্য ও কঠিন সময় | Trials, hardship, loss, patience |
| ramadan-fasting | রমজান ও রোজা | Ramadan and fasting |
| hajj-umrah | হজ ও উমরাহ | Pilgrimage |
| death-hereafter | মৃত্যু ও আখিরাত | Death, Jannah, Hereafter, deceased |

Subtopics are navigational keywords; they do not imply an authentic supplication exists for every proposed topic.

## Canonical record contract

Each Dua entry carries:

- **id:** stable ASCII slug; never rename a published ID
- **title:** Bengali purpose/title
- **primaryCategory and categoryIds:** one primary and optionally several secondary categories
- **tags:** relevant Bengali synonyms; no unsupported benefit claims
- **source:** kind (quran, hadith, dhikr, personal); original reference; HTTPS URL if known; citationScope (excerpt, supplication, general encouragement, personal wording)
- **text:** Arabic only if sourced; Bengali-script pronunciation only for sourced Arabic; Bengali meaning; distinct personally written Bengali text field
- **editorial:** draft/pending_review/verified/published/needs_correction, verification checks, named reviewer, date and notes
- **prescribedCount and prescribedOccasion:** null unless there is precise reviewed support

The existing entries use the exact original title, Bengali pronunciation, meaning, reference and URL. They are wrapped in new search/editorial metadata without modifying NIGHT_DUAS.

## Existing 11-entry mapping — review queue

| ID | Primary category | Source classification | Editorial state |
| --- | --- | --- | --- |
| rizq-need | livelihood-debt | Qur'an excerpt | Pending review |
| rizq-halal | livelihood-debt | Hadith | Pending review |
| rizq-both | death-hereafter | Qur'an excerpt | Pending review |
| work-knowledge | knowledge-learning | Qur'an excerpt | Pending review |
| work-personal | work-decisions | Personal Bengali supplication | Pending attribution review |
| family-calm | marriage-spouses | Qur'an excerpt | Pending review |
| family-offspring | family-children | Qur'an excerpt | Pending review |
| wellness-ayyub | health-healing | Qur'an excerpt | Pending review |
| wellness-shifa | health-healing | Hadith | Pending review |
| remembrance | repentance-forgiveness | Dhikr; reference is general encouragement | Pending attribution review |
| remembrance-salat | salah-worship | Dhikr/salawat; reference is general encouragement | Pending attribution review |

These 11 entries **were already displayed in the app**. The new internal pending_review status does not remove them or make any new independent-authenticity claim.

## Source standards

- **Qur'an:** confirm Arabic against a reliable original; verify surah, ayah number, exact excerpt boundaries, Bengali meaning and pronunciation separately.
- **Hadith:** check the hadith's exact wording, collection, narration, scholarly grading where needed, and the context in which it was used.
- **Dhikr/adhkar:** distinguish a verse about remembering Allah from the exact textual provenance of a particular phrase. Avoid claiming a particular repetition count or time without strong evidence.
- **Personally worded prayer:** clearly label as personal Bengali wording; never generate Arabic or an attributed Hadith citation for it.

## Editorial review and publishing workflow

1. **Candidate:** specify need/use case, canonical ID, Bengali title, category IDs and topic tags. Check for duplicate wording or existing source.
2. **Citation check:** inspect primary Qur'an/Hadith sources. Avoid citing only social-media posts, screenshots or AI-generated content.
3. **Arabic text:** copy and check against a reviewed Arabic source; preserve spelling and diacritics. For personal Bengali dua, leave Arabic null.
4. **Bengali review:** verify pronunciation and meaning independently; note that transliteration does not replace learning Arabic pronunciation with a qualified reciter.
5. **Practice check:** only specify timing, count or promised benefit when explicitly substantiated by a reliable reviewed source.
6. **Editorial sign-off:** record the named reviewer, review date, sourceChecked, wordingChecked, pronunciationChecked and meaningChecked. New entries must pass review before publication.
7. **Rights and safety:** check third-party translation and audio reuse rights; avoid treating voluntary worship as compulsory.
8. **Technical validation:** run the catalog candidate validator, check category search results, confirm no duplicate IDs, and test offline display and old record compatibility.
9. **Publish by pull request:** review the full content diff and only then merge. Pending or failed entries must remain outside the public reader.

## Suggested content batches after Phase 1

- **Batch A:** daily life, morning/evening, Salah, forgiveness and gratitude.
- **Batch B:** family, marriage, education, work and livelihood.
- **Batch C:** health, peace, protection, patience, relationships and travel.
- **Batch D:** Ramadan, Hajj/Umrah, death and Hereafter.

The previously proposed **100+ content count** is a target, not a current inventory or guarantee of specific authentic supplications. Phase 1 adds zero new devotional texts.

## Technical integration

- Catalog implementation: **dua-catalog.js** loaded after **tahajjud.js**.
- API: **window.DhikrDuaCatalog** with categories, entries, get, list, searchText, categoryStats and validateCandidate.
- The existing Dua list remains 11 items and five legacy filter categories until Phase 2. Search gains aliases from the new catalog.
- The draft template at **docs/dua-entry-template.json** is not used by production and must not be interpreted as published content.
- Run **node --test tests/dua-catalog.mjs tests/dua-compact.mjs** plus the mobile search tests before accepting Phase 1.
