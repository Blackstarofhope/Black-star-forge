# 🚀 THE LOGISTICS DIVISION

**Multi-Platform Build & Deployment Automation**

The Logistics Division extends the Black Star Sweatshop with automated build pipelines for **Web (Vercel)** and **Android (Google Play)** platforms.

---

## Overview

The Logistics Division handles:
- **Web Deployment**: Automated Vercel deployment with visual verification
- **Android Build**: Local APK/AAB builds with emulator testing
- **Six Eyes Verification**: Extended to both platforms
- **Multi-Platform Approval**: Single email with both Web + Android screenshots

---

## Architecture

### Components

```
LogisticsExecutor
├── AndroidBuilder
│   ├── Build Release (Gradle)
│   ├── Install on Emulator (ADB)
│   ├── Launch App (Monkey)
│   ├── Screenshot (ADB)
│   ├── Vision Check (Gemini)
│   └── Deploy (Fastlane)
└── VercelDeployer
    ├── Deploy Preview (Vercel CLI)
    ├── Screenshot (Puppeteer)
    ├── Vision Check (Gemini)
    └── Deploy Production
```

---

## Setup Requirements

### 1. Android Development

#### Install Android SDK
```bash
# macOS (via Homebrew)
brew install --cask android-commandlinetools

# Linux
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip
unzip commandlinetools-linux-latest.zip
mv cmdline-tools ~/Android/sdk/
```

#### Set Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_SDK_ROOT=$HOME/Android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
```

#### Install SDK Packages
```bash
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

#### Create & Start Emulator
```bash
# Create AVD
avdmanager create avd -n test_device -k "system-images;android-33;google_apis;x86_64"

# Start emulator
emulator -avd test_device -no-snapshot-load &

# Verify emulator is running
adb devices
# Should show: emulator-5554   device
```

### 2. Google Play Service Account

#### Create Service Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to: **Setup → API Access → Service Account**
3. Click **Create new service account**
4. Follow prompts to create in Google Cloud Console
5. Grant permissions: **Release to production, Release to testing tracks**

#### Download JSON Key
1. In Google Cloud Console, go to **IAM & Admin → Service Accounts**
2. Find your service account
3. Click **Actions → Manage Keys**
4. **Add Key → Create new key → JSON**
5. Save the JSON file securely

#### Set Environment Variable
```bash
export GOOGLE_PLAY_JSON_KEY=/path/to/google-play-key.json
```

### 3. Vercel Setup

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Get Vercel Token
1. Go to [Vercel Settings](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name it "Black Star Sweatshop"
4. Copy the token

#### Set Environment Variable
```bash
export VERCEL_TOKEN=your_vercel_token_here
```

### 4. Fastlane (for Android Deployment)

#### Install Fastlane
```bash
# macOS
brew install fastlane

# Linux/Other
gem install fastlane
```

#### Verify Installation
```bash
fastlane --version
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# ===== LOGISTICS DIVISION =====

# Vercel
VERCEL_TOKEN=your_vercel_token_here

# Android
ANDROID_SDK_ROOT=/Users/you/Library/Android/sdk
GOOGLE_PLAY_JSON_KEY=/path/to/google-play-key.json
```

### Validate Configuration

```bash
# Start the agent
npm run dev

# The agent will validate environment on startup:
# ✅ Vercel CLI installed
# ✅ VERCEL_TOKEN set
# ✅ Android SDK found
# ✅ ADB available
# ✅ Emulator running
# ✅ Google Play credentials found
```

---

## Usage

### 1. Web-Only Project

```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My SaaS Landing Page",
    "requirements": "Create a modern web landing page with hero, features, pricing. Deploy to Vercel."
  }'
```

**Agent will:**
1. Generate code
2. Deploy to Vercel Preview
3. Screenshot and verify
4. Email you with web screenshot
5. Wait for approval
6. Deploy to Vercel Production

### 2. Android-Only Project

```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Todo App",
    "requirements": "Create an Android app with todo list functionality. Build and test on emulator."
  }'
```

**Agent will:**
1. Generate Android code
2. Build APK/AAB with Gradle
3. Install on emulator
4. Launch and screenshot
5. Verify with Gemini Vision
6. Email you with Android screenshot
7. Wait for approval
8. Deploy to Google Play Internal

### 3. Multi-Platform Project

```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "E-Commerce Platform",
    "requirements": "Create an e-commerce platform with web frontend (Vercel) and Android mobile app. Include product catalog and checkout."
  }'
```

**Agent will:**
1. Generate code for both platforms
2. **Web**: Deploy to Vercel Preview + screenshot
3. **Android**: Build AAB, test on emulator + screenshot
4. **Email**: Single email with BOTH screenshots
5. Wait for approval
6. **Deploy**:
   - Web → Vercel Production
   - Android → Google Play Internal

---

## Android Build Pipeline

### Flow

```
1. cd android && ./gradlew bundleRelease
   ↓
2. Find: app/build/outputs/bundle/release/app-release.aab
   ↓
3. Build APK: ./gradlew assembleRelease (for testing)
   ↓
4. adb install -r app-release.apk
   ↓
5. adb shell monkey -p com.example.app 1
   ↓
6. adb exec-out screencap -p > screenshot.png
   ↓
7. Gemini Vision: "Is this app running?"
   ↓
8. ✅ PASS → Ready for deployment
   ↓
9. fastlane supply --aab app-release.aab --track internal
```

### Six Eyes Verification (Android)

#### 1. Install Check
- Installs APK on emulator
- Verifies "Success" in output

#### 2. Launch Check
- Uses `monkey` to force-launch
- Verifies "Events injected: 1"

#### 3. Vision Check (Gemini)
- Captures screenshot from emulator
- Sends to Gemini Vision
- Checks for:
  - Crash dialogs
  - "App has stopped" messages
  - Blank/black screen
  - Actual app content

---

## Vercel Deployment Pipeline

### Flow

```
1. vercel deploy --token=$VERCEL_TOKEN
   ↓
2. Extract preview URL from output
   ↓
3. Wait for build (10 seconds)
   ↓
4. Puppeteer.goto(previewUrl)
   ↓
5. Listen for console errors
   ↓
6. Listen for HTTP 400/500 responses
   ↓
7. page.screenshot({ path: 'web-screenshot.png' })
   ↓
8. Gemini Vision: "Is this website working?"
   ↓
9. ✅ PASS → Ready for production
   ↓
10. vercel deploy --prod --token=$VERCEL_TOKEN
```

### Six Eyes Verification (Web)

#### 1. Deployment Check
- Vercel CLI exits with code 0
- Preview URL extracted

#### 2. Console Error Check
- Puppeteer listens for console errors
- Flags HTTP 400/500 responses
- Non-blocking (logs warnings)

#### 3. Vision Check (Gemini)
- Captures full-page screenshot
- Sends to Gemini Vision
- Checks for:
  - 404 Page Not Found
  - 500 Internal Server Error
  - Blank/white page
  - Actual website content

---

## Email Notifications

### Approval Request Email

**Subject:** `[READY] Project: {Name} (Web + Android)`

**Contains:**
- Project details
- Platform list (Web, Android, or both)
- Web preview URL (if applicable)
- Android package name (if applicable)
- **Attachment 1**: `website-screenshot.png`
- **Attachment 2**: `android-screenshot.png`
- Approval instructions: "Reply 'DEPLOY' to push to Production"

**Example:**

```
🎉 Project Ready for Deployment Approval

Project: E-Commerce Platform
Platforms: WEB, ANDROID

🌐 Web Platform
Preview URL: https://my-app-xyz123.vercel.app

🤖 Android Platform
Package: com.example.ecommerce
AAB built and tested on emulator

📸 Website Preview
[Screenshot embedded]

📱 Android App Preview
[Screenshot embedded]

🚀 To approve: POST /api/deploy-approval { "orderId": "abc123" }
Or reply "DEPLOY" to this email
```

---

## Troubleshooting

### Android Issues

#### Emulator Not Running
```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd <avd_name> &

# Verify
adb devices
```

#### Gradle Build Fails
```bash
# Check Android project structure
ls -la android/

# Make gradlew executable
chmod +x android/gradlew

# Try manual build
cd android && ./gradlew bundleRelease --stacktrace
```

#### ADB Not Found
```bash
# Check ANDROID_SDK_ROOT
echo $ANDROID_SDK_ROOT

# Check ADB path
which adb

# Add to PATH
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
```

#### Fastlane Deployment Fails
```bash
# Verify JSON key path
ls -la $GOOGLE_PLAY_JSON_KEY

# Check Fastlane version
fastlane --version

# Test Fastlane auth
fastlane supply init --json_key $GOOGLE_PLAY_JSON_KEY
```

### Vercel Issues

#### Vercel CLI Not Found
```bash
# Install globally
npm install -g vercel

# Verify
vercel --version
```

#### Token Invalid
```bash
# Test token
vercel whoami --token=$VERCEL_TOKEN

# Get new token from https://vercel.com/account/tokens
```

#### Deployment Hangs
```bash
# Check Vercel status
curl https://www.vercel-status.com/api/v2/status.json

# Try manual deployment
cd /path/to/project
vercel deploy --token=$VERCEL_TOKEN
```

---

## Performance

### Typical Build Times

**Web (Vercel):**
- Deployment: 30-60 seconds
- Screenshot: 5-10 seconds
- Vision check: 2-5 seconds
- **Total**: ~1-2 minutes

**Android:**
- Gradle build: 2-5 minutes (first build)
- Subsequent builds: 30-90 seconds
- Emulator install: 5-10 seconds
- Screenshot & vision: 5-10 seconds
- **Total**: ~3-7 minutes (first build), ~1-2 minutes (subsequent)

**Multi-Platform:**
- Runs in parallel where possible
- **Total**: ~5-10 minutes

---

## Advanced Configuration

### Custom Gradle Tasks

Edit `android/build.gradle` to customize build:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }
}
```

### Custom Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

### Custom Fastlane Tracks

Modify deployment track in agent:

```typescript
// In android-builder.ts
await fastlane(['supply', '--track', 'beta']); // alpha, internal, beta, production
```

---

## Security Considerations

### Service Account Permissions

**Recommended permissions:**
- ✅ Release to testing tracks (Internal, Alpha, Beta)
- ❌ Release to production (requires manual approval)
- ❌ Manage app pricing (not needed)

### Vercel Token Scope

**Recommended scope:**
- ✅ Deploy
- ❌ Admin access
- ❌ Billing access

### API Keys Storage

```bash
# Never commit these files
echo "*.json" >> .gitignore
echo ".env" >> .gitignore

# Set restrictive permissions
chmod 600 google-play-key.json
chmod 600 .env
```

---

## Integration with Existing Workflow

The Logistics Division integrates seamlessly:

1. **Planning Phase** (unchanged)
   - AI generates implementation plan

2. **Coding Phase** (unchanged)
   - AI generates code for each platform

3. **Validation Phase** (unchanged)
   - Six Eyes validation on generated code

4. **BUILD PHASE** ← **NEW**
   - Detects platforms from requirements
   - Builds Web (Vercel) and/or Android
   - Six Eyes verification per platform

5. **Approval Phase** (enhanced)
   - Single email with multi-platform screenshots
   - Wait for human approval

6. **Deployment Phase** (enhanced)
   - Deploys all platforms to production
   - Confirmation email

---

## API Endpoints

All existing endpoints work the same. The agent automatically detects platforms from project requirements.

### Platform Detection

The agent looks for keywords:

**Web Platform:**
- "web", "website", "landing page"
- "vercel"
- Default if no other platform detected

**Android Platform:**
- "android", "mobile app", "app"
- Excludes "web app"

**Both Platforms:**
- Include both "web" and "android" in requirements
- Example: "Create a web dashboard and Android mobile app"

---

## Monitoring

### Check Platform Build Status

```bash
GET /api/project-status/:orderId
```

**Response includes:**
```json
{
  "platforms": ["web", "android"],
  "webPreviewUrl": "https://...",
  "androidPackageName": "com.example.app",
  "webScreenshotPath": "/path/to/web-screenshot.png",
  "androidScreenshotPath": "/path/to/android-screenshot.png"
}
```

---

## Examples

### Example 1: SaaS Web App

```json
{
  "project_name": "ProjectHub SaaS",
  "requirements": "Create a SaaS project management web app with dashboard, kanban board, and team collaboration features. Deploy to Vercel."
}
```

**Result:**
- Web platform detected
- Vercel deployment
- Web screenshot in email

### Example 2: Android Fitness App

```json
{
  "project_name": "FitTracker",
  "requirements": "Build an Android fitness tracking app with workout logging, progress charts, and goal setting. Test on emulator and deploy to Google Play Internal."
}
```

**Result:**
- Android platform detected
- Gradle build + emulator testing
- Android screenshot in email
- Deploy to Google Play Internal

### Example 3: Multi-Platform E-Commerce

```json
{
  "project_name": "ShopNow",
  "requirements": "Create an e-commerce platform with web storefront (Vercel) and Android mobile app. Include product catalog, cart, and Stripe checkout."
}
```

**Result:**
- Both platforms detected
- Parallel builds (Web + Android)
- Email with BOTH screenshots
- Stripe integration
- Deploy to Vercel Production + Google Play Internal

---

## Roadmap

### Phase 1 (Current)
- [x] Web deployment (Vercel)
- [x] Android build & testing
- [x] Multi-platform verification
- [x] Enhanced email notifications

### Phase 2 (Future)
- [ ] iOS build pipeline (Xcode + TestFlight)
- [ ] Custom deployment targets (Netlify, AWS)
- [ ] Automated UI testing (Espresso, Detox)
- [ ] Performance benchmarking

### Phase 3 (Future)
- [ ] Multi-device testing (different screen sizes)
- [ ] Automated release notes generation
- [ ] Store listing optimization
- [ ] A/B testing automation

---

## Summary

The Logistics Division transforms the Black Star Sweatshop into a **full-stack autonomous development system** capable of:

✅ **Building** web and mobile apps
✅ **Testing** on real devices/emulators
✅ **Verifying** with AI vision
✅ **Deploying** to production platforms
✅ **Notifying** with comprehensive previews

**All autonomously, with human approval before going live.**

---

**Built with ⚡ by The Black Star Forge**
**"Multi-Platform Autonomous Development"**
