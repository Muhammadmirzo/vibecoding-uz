# Platform Context & Business Logic Rules

## Business Rules Summary
1. **Lead Capture**: Every form submission, quiz completion, and free lesson request creates a Lead record in `leads` table with UTM parameters and quiz JSON.
2. **Cohort & Seat Urgency**: Cohort seats are live counters. Early-bird prices expire automatically 3 days before `startsAt` date.
3. **7-Day Money-Back Guarantee Rule**: Refunds are eligible IF `now <= cohort.startsAt + 7 days` AND student has completed Module 1 & 2 homeworks.
4. **Payme / Click Webhook Security**: Server validates `HMAC-SHA256` signatures and checks idempotency before inserting payments into DB.

## Database Entities Reference
- `users`: Standard user table with roles `(superadmin, admin, manager, mentor, student)`.
- `cohorts`: Guruhlar (start dates, price tiers, seats count).
- `homework_submissions`: Submissions with attempt numbers and mentor review criteria results.
- `certificates`: Unique verification code + QR link `https://vibecoding.uz/shahodatnoma/[code]`.
