# 🚀 Logistics Division - Quick Start

Get multi-platform deployment (Web + Android) running in 10 minutes.

---

## Prerequisites

The basic Black Star agent should already be running. If not, see [QUICK_START.md](QUICK_START.md).

---

## Option 1: Web-Only (Vercel) - 2 Minutes

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy it

### 3. Add to .env
```bash
echo "VERCEL_TOKEN=your_token_here" >> .env
```

### 4. Test It
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Web App",
    "requirements": "Create a simple landing page. Deploy to Vercel."
  }'
```

**Done!** The agent will deploy to Vercel and email you with a screenshot.

---

## Option 2: Android-Only - 10 Minutes

### 1. Install Android SDK

**macOS:**
```bash
brew install --cask android-commandlinetools
```

**Linux:**
```bash
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip
unzip commandlinetools-linux-latest.zip
mkdir -p ~/Android/sdk
mv cmdline-tools ~/Android/sdk/
```

### 2. Setup Environment
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_SDK_ROOT=$HOME/Android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator

# Reload
source ~/.bashrc  # or source ~/.zshrc
```

### 3. Install SDK Packages
```bash
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
sdkmanager "system-images;android-33;google_apis;x86_64"
```

### 4. Create Emulator
```bash
avdmanager create avd -n test_device -k "system-images;android-33;google_apis;x86_64"
```

### 5. Start Emulator
```bash
emulator -avd test_device &
```

Wait ~30 seconds for emulator to fully boot, then verify:
```bash
adb devices
# Should show: emulator-5554   device
```

### 6. Install Fastlane
```bash
# macOS
brew install fastlane

# Linux/Other
gem install fastlane
```

### 7. Get Google Play Credentials

1. Go to [Google Play Console](https://play.google.com/console)
2. **Setup → API Access → Service Account**
3. Create service account in Google Cloud Console
4. Grant: "Release to testing tracks"
5. Download JSON key file

### 8. Add to .env
```bash
# Add these lines to .env
ANDROID_SDK_ROOT=/Users/you/Library/Android/sdk  # Your actual path
GOOGLE_PLAY_JSON_KEY=/path/to/google-play-key.json
```

### 9. Test It
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Android App",
    "requirements": "Create a simple Android todo app. Build and test on emulator."
  }'
```

**Done!** The agent will build, test on emulator, and email you with a screenshot.

---

## Option 3: Both Platforms - Combine Above

Just complete both Option 1 and Option 2, then:

```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Full Stack App",
    "requirements": "Create a task management web app (Vercel) and Android mobile app."
  }'
```

**Result:** Single email with BOTH web and Android screenshots!

---

## Verify Setup

### Check Vercel
```bash
vercel --version
echo $VERCEL_TOKEN
```

### Check Android
```bash
echo $ANDROID_SDK_ROOT
adb devices  # Should show emulator
which fastlane
ls -la $GOOGLE_PLAY_JSON_KEY
```

---

## Troubleshooting

### Emulator Won't Start
```bash
# List available AVDs
emulator -list-avds

# Start with more RAM
emulator -avd test_device -memory 2048 &
```

### ADB Not Found
```bash
# Check path
echo $PATH | grep Android

# Manually add
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
```

### Fastlane Not Found
```bash
# Install via gem
gem install fastlane

# Or via Homebrew (macOS)
brew install fastlane
```

---

## What Happens Next?

### Web Project
1. Agent generates code
2. Deploys to Vercel Preview
3. Screenshots the live site
4. Gemini Vision verifies it's working
5. Emails you with web screenshot
6. **You approve** → Deploys to Production

### Android Project
1. Agent generates Android code
2. Builds APK/AAB with Gradle
3. Installs on emulator
4. Launches app and screenshots
5. Gemini Vision verifies no crashes
6. Emails you with Android screenshot
7. **You approve** → Deploys to Google Play Internal

### Both Platforms
All of the above, with **one email** containing **both screenshots**!

---

## Full Documentation

For complete details, see [LOGISTICS_DIVISION.md](LOGISTICS_DIVISION.md).

---

**Built with ⚡ by The Black Star Forge**
