# HTMA Genius App

AI-Powered Hair Tissue Mineral Analysis SaaS Platform

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## ⚠️ Firebase Authentication Setup Required

**Before you can use authentication features**, you must enable Firebase Auth providers:

👉 **See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions**

### Quick Fix for `auth/operation-not-allowed` Error:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **htma-genius**
3. Navigate to **Authentication → Sign-in method**
4. Enable **Email/Password** provider
5. (Optional) Enable **Google** provider
6. Restart your dev server

## 📁 Project Structure

```
htma-genius-app/
├── src/
│   ├── components/       # React components
│   │   ├── HTMAInputForm.tsx
│   │   ├── MineralChart.tsx
│   │   ├── AIInsights.tsx
│   │   ├── AuthModal.tsx
│   │   └── SavedAnalyses.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   ├── firebase.ts         # Client-side Firebase
│   │   └── firebaseAdmin.ts    # Server-side Firebase
│   ├── pages/            # Next.js pages & API routes
│   │   ├── api/
│   │   │   ├── analyze.ts      # AI analysis endpoint
│   │   │   ├── save-analysis.ts
│   │   │   └── get-analyses.ts
│   │   └── index.tsx     # Main dashboard
│   └── styles/
└── .env.local            # Environment variables (not in git)
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API
AI_BACKEND_URL=https://htma-genius-api-240444522493.us-central1.run.app

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## ✨ Features

- 🧬 **HTMA Data Input** - Enter mineral test results
- 📊 **Visual Charts** - See mineral levels vs optimal ranges
- 🤖 **AI Analysis** - Gemini AI-powered health insights
- 🔐 **User Authentication** - Email/password & Google sign-in
- 💾 **Saved Analyses** - View and reload previous tests
- 🌙 **Dark Mode** - Automatic theme support

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓
API Routes (/api/*)
    ↓
Cloud Run Backend (FastAPI)
    ↓
Gemini AI
```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
Trigger Firebase deployment
Trigger Firebase deployment again
Trigger Firebase deployment again
