# Gavith Construction Management System

A comprehensive construction management application built with Next.js, TypeScript, and Supabase.

## 🏗️ Features

- **Project Management**: Track sites, materials, and progress
- **Financial Tracking**: Monitor purchases, expenses, and budgets
- **Vehicle Management**: Track vehicle usage, fuel consumption, and maintenance
- **Vendor Management**: Manage suppliers and contractors
- **Real-time Data**: Live updates from Supabase database
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS, Radix UI
- **Deployment**: Vercel

## 📊 Data Overview

- **348 Purchase Records** (₹85,11,893.28 total value)
- **114 Expense Records** (Real diesel consumption data)
- **123 Vehicles** (With working vehicle selection)
- **3 Vendors** (SANDROCK, SVE, SMM with real contact info)
- **1 Site** (Gudibande with real location data)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/7003078589/Gravith_newone.git
cd Gravith_newone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the environment template and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `DB_HOST`: Database host
- `DB_PASSWORD`: Database password

### 4. Database Setup

Run the database schema:

```bash
# The schema is located in backend/database/final-complete-schema.sql
# Execute this in your Supabase SQL editor
```

### 5. Start Development Server

```bash
npm run dev
```

## 🔐 Security

- All sensitive data (passwords, API keys) are stored in environment variables
- Environment files (`.env*`) are gitignored and never committed
- Database credentials are protected and not exposed in the codebase

## 📁 Project Structure

```
gavith-build/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and hooks
│   └── types.ts            # TypeScript type definitions
├── backend/
│   ├── database/           # Database schema and scripts
│   ├── routes/             # API routes
│   └── scripts/            # Data import scripts
├── public/                 # Static assets
└── vercel.json            # Vercel deployment configuration
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 API Endpoints

- `/api/health` - Health check
- `/api/db/purchases` - Purchase data
- `/api/db/expenses` - Expense data
- `/api/db/vehicles` - Vehicle data
- `/api/db/vendors` - Vendor data
- `/api/db/sites` - Site data

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

## 📄 License

This project is proprietary software for Gavith Construction Pvt. Ltd.

## 👥 Team

- **Development**: AI Assistant
- **Client**: Gavith Construction Pvt. Ltd.
- **Repository**: [https://github.com/7003078589/Gravith_newone.git](https://github.com/7003078589/Gravith_newone.git)

## 🆘 Support

For technical support or questions, please contact the development team.

---

**⚠️ Important**: Never commit `.env` files or sensitive credentials to version control.
