# 🚀 Vercel Deployment Guide

## Prerequisites

1. Vercel account (sign up at vercel.com)
2. GitHub account
3. Your code pushed to a GitHub repository

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
cd C:\Users\AmanKumar\Downloads\gavith-build\gavith-build
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/gavith-build.git
git push -u origin main
```

### 1.2 Verify Files

Make sure these files exist:

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.js` - API handler for Vercel
- ✅ `src/lib/api-config.ts` - API configuration

## Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `gavith-build` folder as root directory

### 2.2 Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
SUPABASE_URL=https://wbrncnvgnoozshekeebc.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DB_HOST=db.wbrncnvgnoozshekeebc.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
NEXT_PUBLIC_API_URL=
FRONTEND_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### 2.3 Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `gavith-build`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 4: Test Your Deployment

### 4.1 Check API Endpoints

- `https://your-app-name.vercel.app/api/health`
- `https://your-app-name.vercel.app/api/db/purchases`
- `https://your-app-name.vercel.app/api/db/expenses`
- `https://your-app-name.vercel.app/api/db/vehicles`
- `https://your-app-name.vercel.app/api/db/vendors`

### 4.2 Test Frontend

- Navigate to your Vercel URL
- Check that all components load real data
- Verify vehicle selection works
- Check that vendors show real data

## Troubleshooting

### Common Issues:

1. **API calls failing**: Check environment variables are set correctly
2. **Database connection issues**: Verify Supabase credentials
3. **Build failures**: Check for TypeScript errors
4. **CORS issues**: Verify FRONTEND_URL is set correctly

### Debug Steps:

1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

## Your Real Data

Once deployed, your app will show:

- ✅ 348 Purchase Records
- ✅ 114 Expense Records
- ✅ 123 Vehicles
- ✅ 3 Vendors (SANDROCK, SVE, SMM)
- ✅ 1 Site (Gudibande)
- ✅ Total Value: ₹85,11,893.28

## Next Steps

1. Set up custom domain (optional)
2. Configure monitoring
3. Set up CI/CD for automatic deployments
4. Add authentication (if needed)
