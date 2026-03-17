# Admin Onboarding Workflow + UI Compact

**Date:** 2026-03-17
**Status:** Approved

## Overview

Two changes to the haven-housing admin area:
1. Replace the current user creation flow with a proper onboarding workflow using magic links (default) or temporary passwords (optional), delivered via Postmark
2. Compact the admin page UI — smaller buttons, text, icons, and centered content

## 1. Database Changes

### Migration: Add `is_onboarded` to `user_profiles`

```sql
ALTER TABLE user_profiles ADD COLUMN is_onboarded BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing users as onboarded
UPDATE user_profiles SET is_onboarded = true;
```

No trigger changes needed — the column default (`false`) handles new users automatically.

### Type Updates

Update `UserProfile` interface in both locations:
- `/types/user.ts`
- `/hooks/useUsers.ts`

Add: `is_onboarded: boolean`

## 2. Email Service: Switch from Resend to Postmark

### Remove Resend
- Remove `resend` package from `package.json`
- Rewrite `/netlify/functions/utils/email-service.ts` to use `postmark` package (already installed)

### Postmark Email Service

Rewrite `email-service.ts` to export:

- `sendInvitationEmail({ to, fullName, magicLink })` — magic link invite
- `sendTempPasswordEmail({ to, fullName, email, tempPassword, loginUrl })` — temp password invite

Env vars (already configured):
- `POSTMARK_API_KEY`
- `POSTMARK_FROM_EMAIL` (noreply@havenhousingsolutions.com)

### Email Templates

**Magic link invitation:**
- Haven Housing branded (navy theme)
- Subject: "You've been invited to Haven Housing"
- Body: greeting with name, "Set Up Your Account" CTA button linking to magic link URL
- Footer: "This link expires in 24 hours"

**Temp password invitation:**
- Haven Housing branded (navy theme)
- Subject: "Your Haven Housing Account"
- Body: greeting with name, login URL, email, temporary password
- Footer: "Please change your password on first login"

## 3. Backend: User Creation (`users-create.ts`)

### Two modes

**Magic link mode (default):** `use_temp_password` is false or absent
1. Validate input (email, full_name, role)
2. Check for duplicate email in `user_profiles`
3. Create auth user: `supabaseAdmin.auth.admin.createUser({ email, password: crypto.randomUUID(), email_confirm: true, user_metadata: { full_name, role } })`
4. Update `user_profiles` with full_name, role
5. Generate magic link: `supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email })`
6. Build URL: `${APP_URL}/auth/callback?token_hash=${data.properties.hashed_token}&type=magiclink`
7. Send invitation email via Postmark with magic link
8. Return success

**Temp password mode:** `use_temp_password` is true, `temp_password` provided
1. Validate input (email, full_name, role, temp_password — min 8 chars, uppercase, lowercase, number)
2. Check for duplicate email
3. Create auth user with provided temp_password + `email_confirm: true`
4. Update `user_profiles` with full_name, role
5. Send temp password email via Postmark
6. Return success

### Validation Schema Update

Replace the existing `temporary_password` required field. New schema:
- Remove: `temporary_password` (required string)
- Add: `use_temp_password: boolean` (optional, default false)
- Add: `temp_password: string` (optional, required if `use_temp_password` is true, same validation: min 8 chars, uppercase, lowercase, number)

When `use_temp_password` is false, `temp_password` is ignored and no password field is needed in the request.

### Error Handling for Magic Link Generation

If `generateLink` fails after user creation:
1. Log the error
2. Delete the orphaned auth user via `supabaseAdmin.auth.admin.deleteUser(userId)`
3. Return error to the admin: "Failed to generate invitation link"

This prevents orphaned users with no way to log in.

## 4. Backend: Onboarding Endpoint (`users-onboard.ts`)

New Netlify function: `POST /.netlify/functions/users-onboard`

**Auth:** `requireAuth` middleware (any authenticated user)

**Request body:**
```typescript
{ password: string; full_name?: string }
```

**Flow:**
1. Validate password (min 8 chars, uppercase, lowercase, number — same rules as user creation)
2. Set password: `supabaseAdmin.auth.admin.updateUserById(userId, { password })`
3. Update profile: `UPDATE user_profiles SET is_onboarded = true, full_name = COALESCE(full_name_input, existing) WHERE id = userId`
4. Verify the update succeeded — re-query `is_onboarded` to confirm it's `true`
5. Return updated profile

**Critical:** Use `admin.updateUserById` (service role), not client-side `updateUser`. Re-read `is_onboarded` after update to confirm it persisted.

## 5. Frontend: Auth Callback Page

**New file:** `/app/auth/callback/page.tsx`

**Flow:**
1. Read `token_hash` and `type` from URL search params
2. If `token_hash` present: call `supabase.auth.verifyOtp({ token_hash, type: "magiclink" })`
3. On success: fetch user profile, check `is_onboarded` — redirect to `/onboard` if false, `/admin` if true
4. On error: redirect to `/login?error=invalid_link` (login page must read this param and show "Your sign-in link is invalid or expired. Please request a new one.")
5. Show loading spinner during verification

## 6. Frontend: Onboarding Page

**New file:** `/app/onboard/page.tsx`

**Form fields:**
- Full Name (text input)
- Password (min 8 chars)
- Confirm Password

**Submit flow:**
1. Client-side validation (passwords match, min length)
2. POST to `/.netlify/functions/users-onboard` with `{ password, full_name }`
3. On success: update auth store profile, navigate to `/admin`
4. On error: show error message

**Access:** This page requires authentication (redirect to `/login` if no session) but must NOT check `is_onboarded` — it's outside the admin layout. Unauthenticated users visiting `/onboard` should be redirected to `/login`.

**Temp password users:** Users created with a temp password log in via `/login`, hit the admin layout gate (`is_onboarded === false`), and get redirected to `/onboard` to set a new password. Same flow, different entry point.

## 7. Frontend: Dashboard Layout Gate

**File:** `/app/admin/layout.tsx`

After loading the user profile, check `is_onboarded`:
- If `is_onboarded === false` → redirect to `/onboard`
- If `is_onboarded === true` → render admin layout normally

## 8. Frontend: UserForm Update

**File:** `/components/forms/UserForm.tsx`

Changes:
- Default mode: show Name, Email, Role fields only (no password)
- Add toggle/checkbox: "Use temporary password instead"
- When toggled on: show password field with validation
- Update form submission to pass `use_temp_password` and `temp_password` to the API
- Update success message: "Invitation sent" (magic link) or "User created" (temp password)

## 9. UI Compact Pass

### Scope
All admin content areas (not sidebar):
- `/app/admin/page.tsx` (dashboard)
- `/app/admin/users/page.tsx`
- `/app/admin/properties/page.tsx`
- `/app/admin/submissions/page.tsx`
- `/app/admin/profile/page.tsx`

### Changes
- **Buttons:** Reduce padding, font size. Target: `text-sm px-3 py-1.5` instead of large sizes
- **Icons:** Reduce from `w-8 h-8` / `w-6 h-6` to `w-4 h-4` / `w-5 h-5`
- **Headings:** Reduce from `text-2xl`/`text-3xl` to `text-lg`/`text-xl`
- **Cards/containers:** Reduce padding, add `max-w-*` with `mx-auto` for centering
- **Tables:** Compact row padding
- **Modals:** Reduce padding and font sizes
- **General:** Ensure content is centered in the available space

## 10. Cleanup

- Remove `resend` package from `package.json`
- Remove any Resend-specific env var references from code (keep in `.env.local` for now, user can clean up)
- Ensure `NEXT_PUBLIC_APP_URL` or equivalent is available for magic link URL construction

## Security Considerations

- No email enumeration: magic link generation returns generic success regardless
- Password minimum 8 characters enforced server-side
- `email_confirm: true` on user creation to skip Supabase auto-emails
- Admin-only user creation enforced via `requireAdmin` middleware
- Bearer token pattern on all authenticated requests (existing)
- Magic link expiration: verify Supabase project settings — if default is less than 24 hours, update email template copy to match actual expiration
- HTML-encode `fullName` in email templates to prevent XSS via admin-supplied names
- App URL for magic links: use `process.env.URL` (Netlify auto-set) with `NEXT_PUBLIC_APP_URL` as fallback
