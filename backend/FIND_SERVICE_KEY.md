# 🔑 How to Find Your Supabase Service Role Key

## Step-by-Step Guide:

### 1. **Go to Supabase Dashboard**

- Open your browser and go to: https://supabase.com/dashboard
- Log in with your Supabase account

### 2. **Select Your Project**

- Look for your project: **wbrncnvgnoozshekeebc**
- Click on it to open the project dashboard

### 3. **Navigate to API Settings**

- In the left sidebar, click on **"Settings"** (gear icon)
- Then click on **"API"** from the settings menu

### 4. **Find the Service Role Key**

- You'll see two API keys:
  - **anon/public key** (this is what you already have)
  - **service_role key** (this is what you need)

### 5. **Copy the Service Role Key**

- Click the **"Copy"** button next to the service_role key
- ⚠️ **IMPORTANT:** This key has full database access - keep it secret!

### 6. **Add to Your .env File**

- Open your `.env` file in the backend folder
- Add this line:

```
SUPABASE_SERVICE_ROLE_KEY=your_copied_service_role_key_here
```

## 📋 Your Complete .env File Should Look Like:

```
# Database Configuration
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USER=postgres.wbrncnvgnoozshekeebc
DB_PASSWORD=Maha@secure@99

# Supabase API Keys
SUPABASE_URL=https://wbrncnvgnoozshekeebc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTY2MjUsImV4cCI6MjA3Njg3MjYyNX0.lQ8f7W3yVHQEih427TXQ7_MLndnvxcBkJqm9077c8jE
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=gavith-build-secret-key-2024
```

## 🔍 Visual Guide:

```
Supabase Dashboard
├── Projects
│   └── wbrncnvgnoozshekeebc ← Click this
│       ├── Table Editor
│       ├── SQL Editor
│       ├── Authentication
│       ├── Storage
│       └── Settings ← Click this
│           ├── General
│           ├── API ← Click this
│           ├── Database
│           └── Auth
```

## ⚠️ Security Notes:

- **Never share** the service role key publicly
- **Never commit** it to version control
- **Only use** it for server-side operations
- **Keep it secure** - it has full database access

## ✅ After Adding the Key:

1. Save the `.env` file
2. Run: `node scripts/import-csv-data.js`
3. Watch your data get imported!

---

**Need Help?** If you can't find the API section, make sure you're logged into the correct Supabase account and have access to the project.
