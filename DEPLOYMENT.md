# BFMAF Deployment Guide

## Prerequisites

- Node.js 18+ and npm installed
- Git installed
- Supabase account (for backend services)
- GitHub account

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BFMAF-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values with your Supabase credentials:
     ```
     VITE_SUPABASE_PROJECT_ID="your-project-id"
     VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
     VITE_SUPABASE_URL="https://your-project-id.supabase.co"
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Deployment Options

### Option 1: Netlify (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
7. Deploy!

### Option 2: Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Add environment variables in project settings
7. Deploy!

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Update `vite.config.ts` with base path:
   ```typescript
   export default defineConfig({
     base: '/BFMAF-main/',
     // ... rest of config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Set up your database tables (refer to schema in `/supabase/migrations`)
3. Configure authentication providers
4. Set up storage buckets for images
5. Copy your project credentials to `.env`

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_SUPABASE_URL` - Your Supabase project URL

⚠️ **Never commit `.env` file to Git!** Use `.env.example` as a template.

## Post-Deployment

1. Test all features in production
2. Set up custom domain (if using Netlify/Vercel)
3. Configure SSL certificate (usually automatic)
4. Update SEO settings in `index.html`
5. Submit sitemap to Google Search Console

## Troubleshooting

### Build fails
- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Environment variables not working
- Ensure variables start with `VITE_` prefix
- Restart dev server after changing `.env`
- In production, set variables in hosting platform dashboard

### Supabase connection issues
- Verify credentials are correct
- Check Supabase project is active
- Ensure API keys have correct permissions

## Support

For issues or questions, contact the development team or open an issue on GitHub.
