# Business Domain, Entities, State Machines & Invariants

This document outlines the core domain entities, role-based access control (RBAC), domain state machines, and business invariants governing the Vibecoding Platform.

---

## 👥 USER ROLES & ACCESS CONTROL (RBAC)

The platform defines 5 distinct user roles in `userRoleEnum`:

| Role | Privileges & Responsibilities |
| :--- | :--- |
| **`superadmin`** | Full platform access, site settings management, audit logs inspection, role assignment |
| **`admin`** | CRM pipeline management, cohort creation, broadcast notifications, lead management |
| **`manager`** | Lead contact and sales consultation, customer support, lead status updating |
| **`mentor`** | Homework queue grading, student code review, providing feedback & scoring |
| **`student`** | Accessing enrolled LMS courses, watching lessons, submitting homework, receiving certificates |

---

## 🏛️ CORE BUSINESS ENTITIES

Defined authoritatively in `src/db/schema.ts`:

1. **User & Auth**:
   - `users`: Core account identity (phone, email, tgUserId, role, locale).
   - `userProfiles`: Extended profile details (city, profession, goal, bio).
   - `otpCodes`: Temporary SMS verification codes with expiration and attempt counters.
   - `sessions`: Active JWT/cookie sessions tied to users.

2. **Courses & LMS Curriculum**:
   - `courses`: Master course record (title, priceSum, oldPriceSum, status, durationWeeks).
   - `courseSections`: Curricular chapters within a course.
   - `lessons`: Individual lesson video & markdown content, drip unlock rule.
   - `homeworkAssignments`: Homework instructions & acceptance criteria matrix.
   - `homeworkSubmissions`: Student submitted solutions (GitHub URLs, uploaded assets).
   - `homeworkReviews`: Mentor grading, criteria scoring, and markdown feedback.
   - `lessonProgress`: Video playback position and lesson completion timestamps.

3. **Commercial & Cohorts**:
   - `cohorts`: Scheduled course cohorts with fixed seat capacity and start dates.
   - `enrollments`: Student registration in a specific cohort.
   - `payments`: Provider transaction records (Payme, Click, Manual invoice).

4. **CRM & Lead Generation**:
   - `leads`: Inbound leads generated from quiz, forms, telegram, or free masterclass.
   - `broadcastNotifications`: Bulk announcements to Telegram/Email channels.

5. **Trust, SEO & Content**:
   - `certificates`: Official course completion credentials with unique verification codes.
   - `experts`: Instructor profiles and verified skill badges.
   - `testimonials`: Student video and text reviews.
   - `blogPosts`: Educational tech articles and vibe coding guides.

---

## 🔄 DOMAIN STATE MACHINES

### 1. Lead Sales Pipeline (`leadStatusEnum`)
```
 ┌──────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐     ┌──────┐
 │ new  ├────►│ contacted ├────►│ consultation ├────►│ pending ├────►│ paid │
 └──┬───┘     └─────┬─────┘     └──────┬───────┘     └────┬────┘     └──────┘
    │               │                  │                  │
    ▼               ▼                  ▼                  ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                      rejected / cancelled                      │
 └───────────────────────────────────────────────────────────────┘
```
- **Triggers**: Inbound form/quiz submission creates `new`. Manager contact moves to `contacted`/`consultation`. Payment confirmation transitions to `paid` and triggers user enrollment.

### 2. Homework Submission & Grading (`submissionStatusEnum`)
```
 ┌───────────┐     ┌───────────┐     ┌──────────┐
 │ submitted ├────►│ reviewing ├────►│ approved │
 └───────────┘     └─────┬─────┘     └────┬─────┘
                         │                │
                         ▼                ▼
                   ┌──────────┐     ┌───────────┐
                   │ rejected ├────►│ submitted │ (Resubmission / Attempt N+1)
                   └──────────┘     └───────────┘
```
- **Rules**: Student submission creates `submitted`. Mentor inspection moves to `reviewing`. Grading produces a `homeworkReviews` record with status `approved` (passed) or `rejected` (requires revision).

### 3. Payment Processing (`paymentStatusEnum`)
```
 ┌─────────┐     ┌──────┐
 │ pending ├────►│ paid │ ──► Triggers Enrollment Activation & Access
 └────┬────┘     └──────┘
      │
      ├─────────► ┌────────┐
      │           │ failed │
      │           └────────┘
      │
      └─────────► ┌──────────┐
                  │ refunded │ ──► Revokes Enrollment & Deactivates Access
                  └──────────┘
```

### 4. Student Enrollment Status (`enrollmentStatusEnum`)
- `active`: Full access to cohort lessons & homework submission.
- `paused`: Access temporarily held upon student request.
- `finished`: Successfully completed course requirements; certificate generated.
- `expelled`: Access revoked due to refund or policy violation.

---

## 🛡️ CORE BUSINESS INVARIANTS & RULES

1. **Unique Identity Constraint**: A user's phone number (`users.phone`) must be unique across the system.
2. **Strict Homework Prerequisites**: A homework submission (`homeworkSubmissions`) cannot be created without a valid assignment (`homeworkAssignments`).
3. **Mentor Review Invariant**: A review (`homeworkReviews`) can only be conducted by a user with role `mentor`, `admin`, or `superadmin`.
4. **Drip Release Enforcement**: A student cannot access a lesson marked with `dripRuleEnum = 'after_lesson'` unless the preceding lesson is marked as completed in `lessonProgress`.
5. **Certificate Verification**: Certificate codes (`certificates.code`) are globally unique and publicly verifiable at `/shahodatnoma/[code]`.
6. **Payment Idempotency**: Payment webhook handlers for Payme and Click must be strictly idempotent to prevent duplicate credit/enrollment transactions.
