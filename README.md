# Haven Housing Solutions

A comprehensive property management platform for insurance, corporate, and government relocation services.

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom brand theme
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Maps**: Google Maps SDK
- **Hosting**: Netlify

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Maps API key (for property search)
- Netlify account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cbuth20/haven-housing.git
   cd haven-housing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase (Client-side)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Supabase (Server-side - Netlify Functions)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Walk Score
   NEXT_PUBLIC_WALKSCORE_API_KEY=your-walkscore-api-key

   # Salesforce (optional, configure when ready)
   SALESFORCE_LOGIN_URL=https://login.salesforce.com
   SALESFORCE_USERNAME=your-salesforce-username
   SALESFORCE_PASSWORD=your-salesforce-password
   SALESFORCE_SECURITY_TOKEN=your-salesforce-token
   ```

4. **Set up Supabase**

   Run the database migrations in order:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually in Supabase SQL Editor:
   # 1. Run supabase/migrations/001_initial_schema.sql
   # 2. Run supabase/migrations/002_rls_policies.sql
   # 3. Run supabase/migrations/003_helper_functions.sql
   ```

   Create a storage bucket for property photos:
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `property-photos`
   - Set it to public

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

6. **Test Netlify Functions locally**
   ```bash
   netlify dev
   ```

## 📁 Project Structure

```
haven-housing/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── login/                    # Authentication pages
│   ├── register/
│   ├── properties/               # Property search & detail
│   ├── services/                 # Service pages with forms
│   ├── contact/                  # Contact page
│   ├── submit-property/          # Public property submission
│   └── admin/                    # Admin dashboard
├── components/                   # React components
│   ├── common/                   # Reusable UI components
│   ├── layout/                   # Layout components
│   ├── forms/                    # Form components
│   └── property/                 # Property-related components
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client
│   ├── api.ts                    # API client
│   └── utils.ts                  # Helper functions
├── hooks/                        # Custom React hooks
├── store/                        # Zustand state management
├── types/                        # TypeScript types
├── netlify/functions/            # Serverless functions
│   └── utils/                    # Shared utilities
├── supabase/migrations/          # Database migrations
└── public/                       # Static assets
```

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to all features including property management, user management, and submission review
- **Client**: Can view properties and submit inquiries (default role)

### Creating Your First Admin User

1. Register a user account through the UI at `/register`
2. Go to your Supabase Dashboard → Table Editor → `user_profiles`
3. Find your user and update the `role` column from `client` to `admin`:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
4. Sign out and sign back in to see admin features

### Security Model

The application uses a multi-layer security approach:

1. **Database Layer**: Row Level Security (RLS) policies in Supabase
2. **API Layer**: Auth middleware in Netlify Functions
3. **Frontend Layer**: Route guards and conditional rendering

## 🗄️ Database Schema

### Core Tables

- **user_profiles**: User accounts with roles
- **properties**: Property listings with full details
- **property_submissions**: Public property submissions awaiting review
- **form_submissions**: All form submissions (insurance, corporate, government, contact)
- **points_of_contact**: Property contact persons
- **property_pocs**: Many-to-many junction table

### Key Features

- **Geolocation Search**: Built-in `search_properties()` function for radius-based search
- **Automatic Timestamps**: `updated_at` triggers on all tables
- **Salesforce Integration**: Fields for tracking sync status
- **Flexible Storage**: JSONB columns for extensible form data

## 🚀 Deployment

### Netlify Deployment

1. **Connect repository to Netlify**
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure environment variables**
   - In Netlify Dashboard → Site settings → Environment variables
   - Add all variables from `.env.local`

3. **Build settings** (should auto-detect from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

4. **Deploy**
   - Push to main branch
   - Netlify will automatically build and deploy

### Custom Domain

1. Go to Netlify Dashboard → Domain settings
2. Add your custom domain
3. Configure DNS records as instructed

## 📝 API Documentation

### Properties API

**Create Property** (Admin only)
```
POST /.netlify/functions/properties-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful 2BR Apartment",
  "street_address": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zip_code": "78701",
  "beds": 2,
  "baths": 2,
  "monthly_rent": 2500,
  "status": "published"
}
```

**Update Property** (Admin only)
```
POST /.netlify/functions/properties-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "property-uuid",
  "title": "Updated Title",
  "monthly_rent": 2600
}
```

**Delete Property** (Admin only)
```
POST /.netlify/functions/properties-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "property-uuid"
}
```

**Search Properties** (Public)
```
POST /.netlify/functions/properties-search
Content-Type: application/json

{
  "lat": 30.2672,
  "lon": -97.7431,
  "radius": 20,
  "minBeds": 2,
  "minBaths": 2,
  "allowsPets": true,
  "maxRent": 3000
}
```

### Form Submission APIs

All form submission endpoints are public (no authentication required):

- `POST /.netlify/functions/form-submit-insurance`
- `POST /.netlify/functions/form-submit-corporate`
- `POST /.netlify/functions/form-submit-government`
- `POST /.netlify/functions/form-submit-contact`

## 🎨 Branding

### Colors

- **Navy**: `#063665` (Primary)
- **Orange**: `#F58A07` (Secondary/CTA)
- **Yellow**: `#FFCE00` (Accent)

### Typography

- **Headings**: Walter (serif)
- **Body**: Termina (sans-serif)

### Tailwind Classes

```jsx
<h1 className="text-navy font-heading">Heading</h1>
<button className="bg-orange text-white">Button</button>
<div className="bg-yellow-50">Highlighted section</div>
```

## 🧪 Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm start
```

## 🔌 Integrations

### Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create API credentials
5. Add your domain to API restrictions
6. Copy API key to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Salesforce Setup (Optional)

The Salesforce integration is currently a placeholder. When ready to implement:

1. Create a Connected App in Salesforce
2. Generate API credentials
3. Add credentials to environment variables
4. Implement sync logic in `netlify/functions/utils/salesforce-client.ts`

## 📋 Features Checklist

### Implemented

- ✅ Next.js project setup with TypeScript and Tailwind
- ✅ Supabase database schema with RLS policies
- ✅ User authentication (sign up, sign in, sign out)
- ✅ Role-based access control (admin/client)
- ✅ Netlify Functions setup
- ✅ Property CRUD APIs
- ✅ Form submission handlers
- ✅ Salesforce integration placeholders
- ✅ Professional homepage and navigation
- ✅ Responsive layout with header/footer

### To Be Implemented

- ⏳ Admin property management interface
- ⏳ Property search with Google Maps
- ⏳ Property detail pages
- ⏳ Service pages with forms
- ⏳ Property submission workflow
- ⏳ Photo upload functionality
- ⏳ Admin dashboard
- ⏳ User management interface
- ⏳ Complete Salesforce integration

## 🐛 Troubleshooting

### Build Errors

**Issue**: `tailwindcss` PostCSS error
```bash
npm install -D @tailwindcss/postcss
```

**Issue**: Module format errors
- Remove `"type": "commonjs"` from package.json

### Runtime Errors

**Issue**: Supabase connection fails
- Check that environment variables are set correctly
- Verify Supabase project is active
- Check RLS policies are applied

**Issue**: 401 Unauthorized on API calls
- Ensure you're signed in
- Check that auth token is being sent in Authorization header
- Verify user has correct role for the operation

## 📞 Support

For questions or issues:
- Email: dev@havenhousing.com
- GitHub Issues: https://github.com/cbuth20/haven-housing/issues

## 📄 License

Copyright © 2026 Haven Housing Solutions. All rights reserved.
