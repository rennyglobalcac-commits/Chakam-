# Chakam! Accountability App - Daily Focus Reset, Dedicated Habits & Friends Page

Enhance **Chakam!** with daily auto-refreshing nursing focus study sessions and a dedicated **Habits & Friends** page prioritizing daily reading, sleeping at home, and home cooking alongside social accountability circles.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Summary of Key Adjustments in this Revision:**
> 1. **Daily Refresh for Nursing Study Focus Sessions**:
>    - Nursing focus study sessions (`studySessionsToday` and `focusMinutesToday`) automatically reset to 0 at midnight every day (and during manual daily reset).
>    - Past study stats are archived into daily performance history so users can review total weekly study hours without carrying over yesterday's session tally.
> 2. **Dedicated Habits & Friends Page (Prioritizing Core Life Habits)**:
>    - **Reading Habit**: Track current nonfiction book, pages read today, daily target (e.g. 15–20 pages), reading streaks, and key chapter notes.
>    - **Sleeping at Home (Sanctuary Tracker)**: Monthly target nights at home (e.g. 20+ nights), daily log of sleeping in vs. sleeping away, and night streak.
>    - **Cooking at Home**: Fresh home-cooking tracker (breakfast, lunch, dinner), avoiding takeaway spending, home cooking meal checklist, and weekly cooking streak.
>    - **Other Customizable Habits**: Water intake, skincare, prayer/gratitude, bedtime phone cutoff with "+ Add Habit" button.
>    - **Friends & Accountability Circle**: Directory of close friends/accountability partners, WhatsApp direct action, last contact date, birthday alerts, and microphone speech-to-text notes.
> 3. **Streamlined 6-Tab Navigation (Settings & Review as the Last Page)**:
>    - **1. Home**: Daily to-do timeline, morning top 3 priorities, daily performance card, and daily auto-reset.
>    - **2. Nurse**: Clinical reading topics & post-study summaries, daily-refreshed focus timer (resets to 0 daily), career goals, and outreach.
>    - **3. Designer**: Fashion couture studio, garment projects, client measurements vault, and sketch ideas.
>    - **4. Budget**: Dedicated ₦50,000 monthly limit, category progress bars, and expense logs.
>    - **5. Habits & Friends**: Reading tracker, sleeping-at-home tracker, cooking-at-home logs, habit streaks, and friends circle.
>    - **6. Settings & Review**: Daily & weekly performance reviews, past days to-do history archive, partner stakes (Beeminder/Forfeit style), and clean demo data reset.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a structured daily discipline hub for a Nigerian nurse and fashion designer. The app enforces real-world habit tracking (reading non-fiction, sleeping in one's sanctuary, cooking fresh food), daily-refreshed study blocks, financial limits, and escalating consequences for broken commitments.
- **Key Value**:
  - Eliminates study session clutter by refreshing focus timers daily while storing cumulative study time in weekly performance reports.
  - Combines vital personal habits (Reading, Sleeping at Home, Cooking) with social accountability on a single cohesive page.
  - Preserves clean zero-states and automated midnight to-do archiving with no lingering demo data.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CHAKAM! 6-TAB ARCHITECTURE                               │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┬──────────────┤
│ 1. HOME     │ 2. NURSE    │ 3. DESIGNER │ 4. BUDGET   │ 5. HABITS & FR. │ 6. SETTINGS  │
│ Daily Tasks │ Study Topics│ Sewing Board│ ₦50k Limit  │ Reading Tracker │ Performance  │
│ Top 3 Prios │ Summaries   │ Measurements│ Categories  │ Sleep at Home   │ To-Do Archive│
│ Day AutoReset│ Daily Timer │ Idea Vault  │ Expense Log │ Home Cooking    │ Stakes/Rules │
│ Live Score  │ Refresh 00:0│ + Add Btns  │ Pace Meter  │ Friends Circle  │ Clear Data   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┴──────────────┘
```

1. **Daily Refresh for Nursing Focus Sessions (Nurse Tab)**:
   - When the user opens the app on a new day or taps "Reset Day", `studySessionsToday` and `focusMinutesToday` reset to 0.
   - The focus timer offers quick 45-minute clinical sprint blocks.
   - Completing a study block increments today's study count and logs focus minutes for today's accountability score.
   - Yesterday's study minutes are archived into the daily performance history.

2. **Habits & Friends Experience (Habits & Friends Tab)**:
   - **Reading Habit Card**:
     - Visual book cover / progress bar showing current page vs. total pages (e.g. 184/320 pages of *Atomic Habits*).
     - Daily target indicator: *"15 pages read today (Target: 15/day) ✓"*.
     - Quick **"+ Log Pages Read"** button to log pages and attach chapter notes/quotes.
     - Book vault to add new books or edit reading targets.
   - **Sleeping at Home (Apartment Sanctuary Tracker)**:
     - Monthly progress: *"14/20 Nights at Home this month"*.
     - One-tap evening prompt: **"Slept at Home 🏡"** vs. **"Slept Away 🚗"**.
     - Aunty feedback: Encourages resting in one's personal haven and triggers gentle warnings if staying away exceeds limits.
   - **Cooking at Home Tracker**:
     - Daily meal status: Cooked breakfast, lunch, or dinner at home.
     - Saves money against the ₦50,000 budget by preventing takeaway temptations.
     - Checklist: Kitchen reset, meal prepped, groceries cooked fresh.
   - **Habits List & Streaks**:
     - Daily checkboxes for hydration (2.5L), morning skincare, Bible reading & devotion, and bedtime phone curfew.
     - Streak badges (e.g., 🔥 12-day streak).
     - **"+ Add Custom Habit"** modal.
   - **Friends & Accountability Circle**:
     - Directory of supportive friends and accountability partners.
     - Details: Name, WhatsApp quick chat, last contact date, birthday reminder, notes.
     - Microphone button for speech-to-text dictation to record notes about friends.
     - **"+ Add Friend"** modal.

3. **Settings & Review (Final Page)**:
   - Retains full accountability app settings (Beeminder/Forfeit/Opal style).
   - Past to-do archive browser for inspecting any past day's completed and missed tasks.
   - Daily and weekly performance graphs and Aunty's weekly assessment.

---

## 3. Key Product Decisions & Trade-Offs

- **Daily Refresh of Nursing Focus Sessions**:
  - *Chosen*: Automatic reset to 0 at midnight during the `performDailyResetCheck` pass, with cumulative tracking stored in `dailyPerformanceHistory`.
  - *Why*: Study sessions should measure today's active dedication rather than an ever-accumulating number from past weeks.
- **Combined Habits & Friends Tab**:
  - *Chosen*: Integrating core personal habits (Reading, Sleeping at Home, Cooking) alongside social accountability contacts in Tab 5.
  - *Why*: Keeps the bottom navigation bar clean (6 standard tabs) while grouping holistic personal discipline and relationships together.
- **Specialized UI for Reading, Sleeping, and Cooking**:
  - *Chosen*: Giving Reading, Sleeping at Home, and Cooking dedicated feature modules rather than generic single-line checkboxes.
  - *Why*: These three habits represent major lifestyle anchors that directly affect health, sleep, focus, and financial savings.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW & PERSISTENCE                         │
├────────────────────────────────────────────────────────────────────────┤
│ storage.js (State Store)                                               │
│  ├── user: { name, role, partnerName, partnerPhone, partnerBank }      │
│  ├── tasks: [] (Resets daily at 00:00)                                 │
│  ├── taskHistory: [] (Archived past days to-do lists)                  │
│  ├── nurse: {                                                          │
│  │     readingTopics: [...],                                           │
│  │     studySessionsToday: 0, // Resets daily to 0                     │
│  │     focusMinutesToday: 0   // Resets daily to 0                     │
│  │   }                                                                 │
│  ├── budget: { monthlyLimit: 50000, categories: [], transactions: [] } │
│  ├── habitsFriends: {                                                  │
│  │     reading: { currentBook, dailyTarget, pagesReadToday, notes },   │
│  │     apartment: { targetNightsAtHome, currentNightsHome, checklist },│
│  │     cooking: { cookedToday: [], mealsPrepped: 0, streak: 0 },       │
│  │     habits: [ { id, name, streak, completedToday, history } ],      │
│  │     friends: [ { id, name, phone, birthday, notes } ]               │
│  │   }                                                                 │
│  └── dailyPerformanceHistory: [...]                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Components to Update / Create
1. **`src/utils/storage.js`**:
   - Update `performDailyResetCheck` and `manualDailyReset` to reset `nurse.studySessionsToday = 0` and `nurse.focusMinutesToday = 0` daily.
   - Consolidate habit structures (Reading, Sleeping at Home, Cooking, Custom Habits) and Friends into state.
2. **`src/tabs/NurseTab.jsx`**:
   - Ensure the focus study session counter clearly displays *"Today: 0 sessions / 0 mins"* and increments only on today's completed study blocks.
   - Include a manual "Reset Study Session Count" or auto-refresh indicator.
3. **`src/tabs/HabitsFriendsTab.jsx`** *(New / Refactored)*:
   - **Reading Module**: Current book, pages read today, target slider, chapter notes, book library.
   - **Sleep at Home Module**: Sanctuary target, log slept home vs. away, nights streak.
   - **Home Cooking Module**: Cooked fresh meals log, takeaway prevention counter, grocery checklist.
   - **Custom Habits List**: Daily streaks, completed toggles, "+ Add Habit".
   - **Friends Circle**: Friends cards, WhatsApp chat launch, birthday alerts, "+ Add Friend", microphone voice notes.
4. **`src/components/Navigation.jsx`**:
   - 6 bottom tabs: `Home`, `Nurse`, `Designer`, `Budget`, `Habits & Friends`, `Settings`.
5. **`src/App.jsx`**:
   - Wire up `HabitsFriendsTab` in tab switcher.

---

## 5. Verification Plan

- **Daily Focus Refresh Verification**:
  - Test completing a 45-min focus session; verify `studySessionsToday` increments.
  - Trigger `manualDailyReset`; verify focus study session count and minutes return to 0 for the fresh day.
- **Habits & Friends Page Verification**:
  - Test logging pages read in the Reading tracker; verify daily reading target completes.
  - Test logging "Slept at Home" and verify apartment nights count updates.
  - Test logging fresh home-cooked meals.
  - Test adding a custom habit and toggling habit completion.
  - Test adding a friend, updating details, and opening WhatsApp link.
- **App Compilation**:
  - Run `compile_applet` to ensure error-free compilation.
