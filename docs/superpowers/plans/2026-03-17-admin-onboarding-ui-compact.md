# Admin Onboarding Workflow + UI Compact Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace user creation with magic link/temp password invite flow via Postmark, add onboarding page, and compact admin UI.

**Architecture:** Netlify Functions backend with Supabase auth. Magic links use `admin.generateLink()` + custom `token_hash` URL. Onboarding page at `/onboard` gates on `is_onboarded` column. Postmark replaces Resend for all user emails.

**Tech Stack:** Next.js 16 (App Router), Supabase, Netlify Functions, Postmark, Tailwind CSS, Zustand, Zod

---

### Task 1: Database Migration + Type Updates

**Files:**
- Create: `supabase/migrations/007_add_is_onboarded.sql`
- Modify: `types/user.ts`
- Modify: `hooks/useUsers.ts`

- [ ] **Step 1: Create migration file**

```sql
-- Add is_onboarded column to user_profiles
ALTER TABLE user_profiles ADD COLUMN is_onboarded BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing users as onboarded
UPDATE user_profiles SET is_onboarded = true;
```

- [ ] **Step 2: Update UserProfile type in `types/user.ts`**

Add `is_onboarded: boolean` to the `UserProfile` interface.

- [ ] **Step 3: Update UserProfile type in `hooks/useUsers.ts`**

Add `is_onboarded: boolean` to the duplicate `UserProfile` interface. Also update `CreateUserInput` to replace `temporary_password` with `use_temp_password?: boolean` and `temp_password?: string`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/007_add_is_onboarded.sql types/user.ts hooks/useUsers.ts
git commit -m "feat: add is_onboarded column and update types"
```

---

### Task 2: Rewrite Email Service (Resend -> Postmark)

**Files:**
- Modify: `netlify/functions/utils/email-service.ts`

- [ ] **Step 1: Rewrite email-service.ts**

Replace entire file. Use `postmark` package (already installed). Export:
- `sendInvitationEmail({ to, fullName, magicLink })` — magic link invite
- `sendTempPasswordEmail({ to, fullName, email, tempPassword, loginUrl })` — temp password invite

Use the existing Postmark client pattern from `notification-service.ts` (`getPostmarkClient()`, `getFromEmail()`, `getAppUrl()`).

HTML templates: Haven Housing branded with navy (#1e40af) header, same table-based layout as existing notification emails. HTML-encode `fullName` to prevent XSS.

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/utils/email-service.ts
git commit -m "feat: switch email service from Resend to Postmark"
```

---

### Task 3: Update Validation Schema

**Files:**
- Modify: `netlify/functions/utils/validation.ts`

- [ ] **Step 1: Update CreateUserSchema**

Replace the existing `temporary_password` required field with:
- `use_temp_password: z.boolean().optional().default(false)`
- `temp_password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).optional()`

Add `.refine()` to require `temp_password` when `use_temp_password` is true.

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/utils/validation.ts
git commit -m "feat: update user creation schema for magic link / temp password modes"
```

---

### Task 4: Update User Creation Endpoint

**Files:**
- Modify: `netlify/functions/users-create.ts`

- [ ] **Step 1: Rewrite users-create.ts**

Two modes based on `use_temp_password`:

**Magic link (default):**
1. Create user with `crypto.randomUUID()` as password + `email_confirm: true`
2. Update profile with retry loop (existing pattern)
3. Generate magic link: `supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email })`
4. If generateLink fails: delete auth user (rollback), return error
5. Build URL: `${process.env.URL || process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${data.properties.hashed_token}&type=magiclink`
6. Send invitation email via `sendInvitationEmail()`

**Temp password:**
1. Create user with provided `temp_password` + `email_confirm: true`
2. Update profile with retry loop
3. Send temp password email via `sendTempPasswordEmail()`

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/users-create.ts
git commit -m "feat: support magic link and temp password invite modes"
```

---

### Task 5: Create Onboarding Endpoint

**Files:**
- Create: `netlify/functions/users-onboard.ts`

- [ ] **Step 1: Create users-onboard.ts**

`POST /.netlify/functions/users-onboard`

Protected by `requireAuth`. Accepts `{ password, full_name? }`.

1. Validate password (8+ chars, uppercase, lowercase, number)
2. Set password via `supabaseAdmin.auth.admin.updateUserById(userId, { password })`
3. Update profile: `is_onboarded = true`, optionally `full_name`
4. Re-query to verify `is_onboarded = true`
5. Return updated profile

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/users-onboard.ts
git commit -m "feat: add onboarding endpoint for password setup"
```

---

### Task 6: Create Auth Callback Page

**Files:**
- Create: `app/auth/callback/page.tsx`

- [ ] **Step 1: Create callback page**

Client component. On mount:
1. Read `token_hash` and `type` from `useSearchParams()`
2. Call `supabase.auth.verifyOtp({ token_hash, type: "magiclink" })`
3. On success: fetch profile from `user_profiles`, check `is_onboarded`
   - If false: `router.push('/onboard')`
   - If true: `router.push('/admin')`
4. On error: `router.push('/login?error=invalid_link')`
5. Show loading spinner during verification

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/page.tsx
git commit -m "feat: add auth callback page for magic link verification"
```

---

### Task 7: Create Onboarding Page

**Files:**
- Create: `app/onboard/page.tsx`

- [ ] **Step 1: Create onboarding page**

Client component. Requires authentication (redirect to `/login` if no session).

Form: Full Name, Password, Confirm Password.

Submit:
1. Client validation (passwords match, complexity)
2. POST to `/.netlify/functions/users-onboard` with Bearer token
3. On success: call `refreshUser()` from auth store, navigate to `/admin`
4. On error: show error message

Haven Housing branded: navy header, clean centered card layout.

- [ ] **Step 2: Commit**

```bash
git add app/onboard/page.tsx
git commit -m "feat: add onboarding page for first-time user setup"
```

---

### Task 8: Update Admin Layout (is_onboarded Gate)

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Add is_onboarded check**

After the existing `!isAdmin` check, add:
```
if (user && !user.is_onboarded) → router.push('/onboard')
```

This redirects users who haven't completed onboarding.

- [ ] **Step 2: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: add onboarding gate to admin layout"
```

---

### Task 9: Update Login Page (Error Param)

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Read `error` search param and display message**

If `?error=invalid_link` is present, show: "Your sign-in link is invalid or expired. Please request a new one."

- [ ] **Step 2: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: show magic link error on login page"
```

---

### Task 10: Update UserForm + useUsers Hook

**Files:**
- Modify: `components/forms/UserForm.tsx`
- Modify: `hooks/useUsers.ts`

- [ ] **Step 1: Update UserForm**

- Default mode: Name, Email, Role only (no password)
- Add toggle: "Use temporary password instead" (checkbox/switch)
- When toggled: show password field with existing validation
- Update schema to match new API shape
- Update success messaging: "Invitation sent" vs "User created"

- [ ] **Step 2: Update useUsers hook**

Update `CreateUserInput` type and `createUser` function to pass new field names (`use_temp_password`, `temp_password` instead of `temporary_password`).

- [ ] **Step 3: Commit**

```bash
git add components/forms/UserForm.tsx hooks/useUsers.ts
git commit -m "feat: update user form for magic link / temp password modes"
```

---

### Task 11: UI Compact Pass - All Admin Pages

**Files:**
- Modify: `app/admin/page.tsx` (dashboard)
- Modify: `app/admin/users/page.tsx`
- Modify: `app/admin/properties/page.tsx`
- Modify: `app/admin/submissions/page.tsx`
- Modify: `app/admin/profile/page.tsx`

- [ ] **Step 1: Dashboard (`app/admin/page.tsx`)**

- `h1`: `text-3xl` → `text-xl`
- Stat card values: `text-3xl` → `text-2xl`
- Stat card icons: `h-8 w-8` → `h-5 w-5`, `p-3` → `p-2`
- Quick actions heading: `text-xl` → `text-base`
- Card padding: `p-6` → `p-4`
- Section spacing: `space-y-8` → `space-y-5`
- Add `max-w-6xl mx-auto` wrapper for centering

- [ ] **Step 2: Users page (`app/admin/users/page.tsx`)**

- `h1`: `text-3xl` → `text-xl`
- Add User button icon: `h-5 w-5` → `h-4 w-4`, button size `sm`
- Add `max-w-6xl mx-auto` wrapper

- [ ] **Step 3: Properties page (`app/admin/properties/page.tsx`)**

- `h1`: `text-3xl` → `text-xl`
- Add Property button: size `sm`, icon `h-4 w-4`
- Stats grid values: `text-2xl` → `text-xl`
- Stats card padding: `p-4` → `p-3`
- Add `max-w-6xl mx-auto` wrapper

- [ ] **Step 4: Submissions page (`app/admin/submissions/page.tsx`)**

- `h1`: `text-3xl` → `text-xl`
- Submission card heading: `text-xl` → `text-base`
- Card padding: `p-6` → `p-4`
- Add `max-w-6xl mx-auto` wrapper

- [ ] **Step 5: Profile page (`app/admin/profile/page.tsx`)**

- `h1`: `text-3xl` → `text-xl`
- Section headings: `text-xl` → `text-base`
- Card padding: `p-6` → `p-4`

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx app/admin/users/page.tsx app/admin/properties/page.tsx app/admin/submissions/page.tsx app/admin/profile/page.tsx
git commit -m "style: compact admin page UI - smaller text, buttons, centered content"
```

---

### Task 12: Remove Resend Package

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove resend**

```bash
npm uninstall resend
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove resend package, consolidated on Postmark"
```

---

### Task 13: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Final commit if fixes needed**
