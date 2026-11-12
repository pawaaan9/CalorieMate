# CalorieMate

Personal calorie and weight tracker with a built-in Sri Lankan food database.
Next.js (App Router, TypeScript), Tailwind CSS, Firebase Auth + Firestore, Recharts.

## One-time Firebase setup

In the [Firebase console](https://console.firebase.google.com/) for the project:

1. **Authentication → Sign-in method**: enable **Email/Password**.
2. **Firestore Database**: create the database (production mode).
3. **Firestore → Rules**: paste the contents of `firestore.rules` and publish,
   or run `npx firebase-tools login` then `npx firebase-tools deploy --only firestore:rules`.
4. Run the app, choose **Create an account** on the login page, and sign up.
5. Optional, recommended: once your account exists, turn off new sign-ups under
   **Authentication → Settings → User actions → Enable create (sign-up)**.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Firebase web config
npm run dev
```

`CALORIE_API_KEY` is optional too. With it, food search also queries
[Calorie API](https://calorieapi.com) (packaged and international foods,
per-100 g values with sugar). Create a REST API key in its dashboard. The free
plan allows 1,000 calls a month; searches are cached in Firestore for 30 days.

`USDA_API_KEY` is optional. Without it the app uses USDA's shared `DEMO_KEY`,
which is limited to about 30 requests an hour. A free key takes a minute:
https://fdc.nal.usda.gov/api-key-signup

## Deploy to Vercel

Import the project in Vercel and add every variable from `.env.example` under
**Settings → Environment Variables**. Then add the Vercel domain under
**Firebase → Authentication → Settings → Authorized domains**.

## Firestore structure

| Path | Contents |
|---|---|
| `users/{uid}` | profile, goals, activity level, daily calorie target |
| `users/{uid}/foods/{foodId}` | food database: built-in Sri Lankan foods, your own foods, saved API foods |
| `users/{uid}/entries/{entryId}` | diary entries (date, meal, portion, quantity, macros) |
| `users/{uid}/dailySummaries/{YYYY-MM-DD}` | per-day totals used by the dashboard charts |
| `users/{uid}/weights/{YYYY-MM-DD}` | weigh-ins |
| `users/{uid}/searchCache/{query}` | cached USDA / Open Food Facts results (30 days) |

Security rules allow each signed-in user to read and write only their own `users/{uid}` tree.

## Project layout

```
src/app/(app)/        dashboard, log, foods, weight, settings (signed-in area)
src/app/login/        sign in / create account
src/app/api/food-search/  server proxy for USDA + Open Food Facts
src/components/       app shell, food picker, food form, charts, UI primitives
src/lib/              Firebase setup, Firestore data layer, nutrition maths, seed foods
firestore.rules       security rules
```

## Notes on nutrition data

The built-in Sri Lankan foods are estimates per 100 g of prepared food and are
marked **Est.** throughout the app. Home recipes vary, so edit any food on the
Foods page to match how it is cooked at home.
