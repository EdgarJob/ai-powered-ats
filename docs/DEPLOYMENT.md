# 🚀 Deployment Guide

This guide explains how to deploy your AI-Powered ATS to Firebase Hosting using GitHub Actions.

## Prerequisites

1. **Firebase Project**: You should have a Firebase project set up
2. **Firebase CLI**: Install Firebase CLI locally
3. **GitHub Repository**: Your code should be in a GitHub repository

## Setting Up Firebase Deployment

### Step 1: Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

### Step 2: Configure GitHub Secrets

Go to your GitHub repository settings and add these secrets:

#### Firebase Configuration Secrets
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain (e.g., `your-project.firebaseapp.com`)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID

#### Service Account Secret
- `FIREBASE_SERVICE_ACCOUNT`: The entire contents of the service account JSON file

#### Optional Secrets
- `OPENAI_API_KEY`: Your OpenAI API key (for AI features)

### Step 3: Enable Firebase Hosting

1. In Firebase Console, go to **Hosting**
2. Click **Get Started**
3. Follow the setup instructions

### Step 4: Deploy

Once secrets are configured, deployment happens automatically:
- **Automatic**: Every push to `main` branch triggers deployment
- **Manual**: You can also trigger deployment from GitHub Actions tab

## Deployment Process

The CI/CD pipeline will:
1. ✅ Run tests and linting
2. ✅ Build the application
3. ✅ Deploy to Firebase Hosting
4. 🌐 Your app will be live at `https://your-project.web.app`

## Troubleshooting

### Common Issues

1. **Secrets Not Configured**: The deployment will skip with a helpful message
2. **Build Failures**: Check the build logs in GitHub Actions
3. **Firebase Permissions**: Ensure service account has proper permissions

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Verify all secrets are properly configured
- Ensure Firebase project is properly set up

## Local Development

For local development, create a `.env` file in the `frontend` directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_OPENAI_API_KEY=your-openai-key
```

## Security Notes

- Never commit secrets to your repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate your API keys
- Monitor your Firebase usage and billing 