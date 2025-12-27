# Firebase Authentication Setup Guide

## ⚠️ Common Error: `auth/operation-not-allowed`

If you're seeing this error when trying to sign up or sign in, it means the authentication provider is not enabled in your Firebase Console.

## 🔧 How to Fix

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **htma-genius**

### Step 2: Enable Email/Password Authentication

1. In the left sidebar, click **Authentication**
2. Click the **Sign-in method** tab
3. Find **Email/Password** in the providers list
4. Click on it to expand
5. Toggle **Enable** to ON
6. Click **Save**

### Step 3: Enable Google Sign-In (Optional)

1. In the same **Sign-in method** tab
2. Find **Google** in the providers list
3. Click on it to expand
4. Toggle **Enable** to ON
5. Enter a project support email (your email)
6. Click **Save**

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ Verification

After enabling the providers, you should be able to:

- Create new accounts with email/password
- Sign in with existing accounts
- Sign in with Google (if enabled)

## 🔒 Security Best Practices

### Authentication Providers Status:

- **Email/Password**: Enable for standard auth ✅
- **Google**: Enable for social sign-in ✅ (optional)
- **Anonymous**: Leave disabled unless needed ❌
- **Phone**: Leave disabled unless needed ❌

### Firestore Security Rules

Make sure your Firestore has proper security rules. Add these to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /analyses/{analysisId} {
      allow read: if request.auth != null &&
                     request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules

If using Firebase Storage, add these rules in Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Only authenticated users can upload
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Production Checklist

Before deploying to production:

- [ ] Enable Email/Password provider in Firebase Console
- [ ] Enable Google Sign-In provider (if using)
- [ ] Set up proper Firestore security rules
- [ ] Set up proper Storage security rules
- [ ] Configure authorized domains in Firebase Console
- [ ] Test authentication flow end-to-end
- [ ] Set up password reset functionality (if needed)
- [ ] Configure email templates in Firebase Console

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🆘 Still Having Issues?

Common troubleshooting steps:

1. **Clear browser cache** and try again
2. **Check Firebase Console** for any error messages
3. **Verify environment variables** in `.env.local`
4. **Check browser console** for detailed error messages
5. **Ensure you're using the correct Firebase project**

---

**Note**: The `auth/operation-not-allowed` error is a Firebase security feature, not a bug. It ensures developers explicitly enable authentication methods before users can use them.
