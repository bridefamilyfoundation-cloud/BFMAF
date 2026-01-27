# BFMAF - Bride Family Medical Aid Foundation

A faith-based medical assistance platform providing prayer, support, and financial aid to Christians facing overwhelming medical conditions in Jos, Nigeria.

## 🌟 Features

- **Medical Case Management** - Create, view, and manage medical assistance cases
- **Donation System** - Secure donation processing and tracking
- **User Authentication** - Supabase-powered authentication system
- **Admin Dashboard** - Comprehensive content and case management
- **Success Stories** - Showcase successful medical interventions
- **Newsletter System** - Email subscription and communication
- **Responsive Design** - Mobile-friendly interface
- **SEO Optimized** - Full meta tags and structured data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BFMAF-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: TailwindCSS with custom theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (authentication, database, storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/       # Admin-specific components
│   └── ui/          # shadcn/ui components
├── pages/           # Page components (routes)
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Netlify deployment
- Vercel deployment
- GitHub Pages deployment
- Supabase setup

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
```

⚠️ **Never commit `.env` file to version control!**

## 📝 License

Copyright © 2024 Bride Family Medical Aid Foundation

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

- **Location**: Divine Love Christian Assembly Jos, Longwa Phase II Behind Millennium Hotel Jos, Plateau State, Nigeria
- **Phone**: +234-703-212-8927
- **Website**: https://bfmaf.com
