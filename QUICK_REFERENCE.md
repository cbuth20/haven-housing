# Haven Housing Solutions - Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
netlify dev             # Start dev server with Netlify Functions

# Building
npm run build           # Build for production
npm start               # Start production server

# Linting
npm run lint            # Run ESLint

# Git
git status              # Check status
git add .               # Stage all changes
git commit -m "message" # Commit with message
git push                # Push to remote
```

## 📁 Key File Locations

### Configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind theme (brand colors)
- `netlify.toml` - Netlify deployment config
- `.env.local` - Environment variables (not in git)
- `.env.example` - Environment variable template

### Database
- `supabase/migrations/001_initial_schema.sql` - All tables
- `supabase/migrations/002_rls_policies.sql` - Security policies
- `supabase/migrations/003_helper_functions.sql` - Geolocation search

### API (Netlify Functions)
- `netlify/functions/properties-*.ts` - Property CRUD
- `netlify/functions/form-submit-*.ts` - Form handlers
- `netlify/functions/utils/auth-middleware.ts` - Auth
- `netlify/functions/utils/validation.ts` - Zod schemas

### Frontend
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Homepage
- `components/layout/Header.tsx` - Navigation
- `components/common/` - Reusable UI components

### Auth & State
- `lib/supabase.ts` - Supabase client
- `store/auth-store.ts` - Auth state (Zustand)
- `hooks/useAuth.ts` - Auth hook
- `hooks/usePermissions.ts` - RBAC hook

### Types
- `types/user.ts` - User and auth types
- `types/property.ts` - Property types
- `types/form.ts` - Form submission types

## 🎨 Brand Colors (Tailwind Classes)

```tsx
// Navy (Primary)
className="text-navy bg-navy border-navy"
className="text-navy-700 bg-navy-50"

// Orange (Secondary/CTA)
className="text-orange bg-orange hover:bg-orange-600"

// Yellow (Accent)
className="text-yellow bg-yellow-50"
```

## 🔐 Environment Variables

### Required for Development
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Optional
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxx...
NEXT_PUBLIC_WALKSCORE_API_KEY=xxx
SALESFORCE_USERNAME=xxx
SALESFORCE_PASSWORD=xxx
SALESFORCE_SECURITY_TOKEN=xxx
```

## 📊 Database Schema Quick Reference

### Tables
- `user_profiles` - Users with roles (admin/client)
- `properties` - Property listings
- `property_submissions` - Public submissions (pending review)
- `form_submissions` - All inquiry forms
- `points_of_contact` - Contact persons
- `property_pocs` - Junction table

### Key Columns
```sql
-- Properties
id, title, street_address, city, state, zip_code
latitude, longitude  -- For geolocation
beds, baths, monthly_rent
status ('draft' | 'published' | 'archived')
created_by, owner_id  -- Foreign keys to user_profiles

-- User Profiles
id, email, full_name, role ('admin' | 'client')
```

## 🔑 Common Code Patterns

### Using Authentication
```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()

  if (!isAuthenticated) return <Login />

  return <div>Welcome {user?.full_name}</div>
}
```

### Checking Permissions
```tsx
import { usePermissions } from '@/hooks/usePermissions'

function AdminButton() {
  const { canCreateProperty } = usePermissions()

  if (!canCreateProperty) return null

  return <Button>Create Property</Button>
}
```

### Calling API
```tsx
import { api } from '@/lib/api'

// Create property (admin only)
const property = await api.properties.create({
  title: 'My Property',
  city: 'Austin',
  // ...
})

// Search properties (public)
const { properties } = await api.properties.search({
  lat: 30.2672,
  lon: -97.7431,
  radius: 20,
  minBeds: 2
})

// Submit form (public)
await api.forms.submitInsurance({
  fullName: 'John Doe',
  email: 'john@example.com',
  // ...
})
```

### Direct Supabase Queries
```tsx
import { supabase } from '@/lib/supabase'

// Get all published properties
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'published')

// Get property by ID
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('id', propertyId)
  .single()
```

## 🛠️ Creating New API Endpoint

1. Create file: `netlify/functions/my-endpoint.ts`
2. Use middleware if needed:
```typescript
import { Handler } from '@netlify/functions'
import { requireAdmin } from './utils/auth-middleware'
import { supabaseAdmin } from './utils/supabase-client'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    // Your logic here
    const { data, error } = await supabaseAdmin
      .from('table_name')
      .insert(body)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    }
  }
})

export { handler }
```

## 🎯 Creating New Page

```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-navy mb-6">
        My Page
      </h1>
      {/* Content */}
    </div>
  )
}
```

## 🧩 Creating New Component

```typescript
// components/MyComponent.tsx
import { ReactNode } from 'react'

interface MyComponentProps {
  title: string
  children: ReactNode
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {children}
    </div>
  )
}
```

## 🗺️ Routes Map

### Public Routes
- `/` - Homepage
- `/login` - Sign in
- `/register` - Sign up
- `/properties` - Property search (to be implemented)
- `/properties/[id]` - Property detail (to be implemented)
- `/services` - Services overview (to be implemented)
- `/services/insurance-relocation` - Insurance form (to be implemented)
- `/services/corporate-relocation` - Corporate form (to be implemented)
- `/services/government-lodging` - Government form (to be implemented)
- `/contact` - Contact form (to be implemented)
- `/submit-property` - Property submission (to be implemented)

### Protected Routes (Admin Only)
- `/admin` - Dashboard (to be implemented)
- `/admin/properties` - Property management (to be implemented)
- `/admin/submissions` - Review submissions (to be implemented)
- `/admin/users` - User management (to be implemented)

## 🚨 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists and has correct values
- Restart dev server after changing env vars

### "Unauthorized - No token provided"
- Sign in again (token may have expired)
- Check Authorization header is being sent

### "Forbidden - Admin access required"
- Verify your user has `role = 'admin'` in user_profiles table
- Sign out and sign in again after role change

### Build fails with Zod error
- Make sure Zod schemas use correct syntax
- For `z.record()`, provide key type: `z.record(z.string(), z.any())`

### Tailwind classes not working
- Ensure file is in `content` array in tailwind.config.ts
- Restart dev server
- Check PostCSS config has `@tailwindcss/postcss`

## 📞 Getting Help

1. Check README.md for detailed documentation
2. Review IMPLEMENTATION_STATUS.md for progress
3. Search issues: https://github.com/cbuth20/haven-housing/issues
4. Check Supabase logs for database errors
5. Check Netlify function logs for API errors

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Zod Validation](https://zod.dev/)
