# The Black Star Forge

## Overview
The Black Star Forge is an autonomous, browser-based AI Development Environment (IDE) that runs entirely client-side using WebContainers. It features a cyberpunk aesthetic with deep blacks, teal, and purple accents.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Code Editor**: Monaco Editor (VS Code implementation)
- **Core Engine**: WebContainer API (by StackBlitz) for browser-native Node.js
- **State Management**: Zustand
- **Dependency Graph**: React Flow
- **Multiplayer**: Yjs with WebRTC
- **File Export**: JSZip

## Project Architecture

```
client/src/
├── components/
│   ├── ide/
│   │   ├── FileExplorer.tsx    # File tree navigation
│   │   ├── CodeEditor.tsx      # Monaco editor with Black Star theme
│   │   ├── LivePreview.tsx     # iframe preview with URL bar
│   │   ├── GodView.tsx         # React Flow dependency graph
│   │   ├── NazaharyChat.tsx    # AI assistant chat interface
│   │   ├── KnowledgeBase.tsx   # URL scraper & Hive sync
│   │   ├── DeploymentModal.tsx # Vercel/Netlify failover deploy
│   │   ├── MultiplayerSession.tsx # Ghost Protocol collaboration
│   │   ├── BackendWizard.tsx   # Firebase/Supabase config generator
│   │   ├── DownloadProject.tsx # Eject/export functionality
│   │   ├── Terminal.tsx        # Terminal output display
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── IDELayout.tsx       # Main layout with resizable panels
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── ide-store.ts           # Zustand state management
│   ├── theme-provider.tsx     # Dark mode context
│   └── queryClient.ts         # React Query setup
├── pages/
│   ├── ide.tsx                # Main IDE page
│   └── not-found.tsx          # 404 page
└── App.tsx                    # Root component with routing
```

## Key Features

### I. Interface (Cyberpunk Aesthetic)
- Left Sidebar: File Explorer, God View, Knowledge Base tabs
- Center: Monaco Editor with custom "Black Star" dark theme
- Right: Live Preview with URL bar and refresh

### II. Engine
- Browser-native execution via WebContainers
- Nazahary AI assistant with model selector (GPT-4, Claude 3, Gemini Pro)
- BYOK (Bring Your Own Key) for AI APIs
- Voice input via Web Speech API

### III. Deployment ("Never-Down" Pipeline)
- Primary: Vercel deployment
- Failover: Automatic switch to Netlify on quota/payment errors
- Uses JSZip to package file tree

### IV. Knowledge Base (The Hive Mind)
- URL scraper using Jina AI for clean Markdown
- Hive Sync toggle to contribute to community knowledge

### V. Additional Features
- Ghost Protocol: Yjs-based real-time multiplayer
- Skeleton Key: Backend wizard for Firebase/Supabase
- Local-First: IndexedDB persistence
- Eject Button: Download project as ZIP

## Design System
- Primary color: Teal (HSL 175)
- Accent color: Purple (HSL 280)
- Background: Deep blacks (HSL 220 20% 4%)
- Font (code): JetBrains Mono
- Font (UI): Inter

## Development Notes
- The app is designed to run entirely client-side
- No Replit database used - uses IndexedDB for local storage
- WebContainer handles npm install and npm run dev in-browser
