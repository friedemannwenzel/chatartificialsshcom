# ArtificialSSH Chat 🤖💬

A modern, full-stack AI chat application built with Next.js 16, featuring multiple AI providers, beautiful UI, and comprehensive rate limiting.

![ArtificialSSH Chat](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🤖 **Multiple AI Providers**: OpenAI (GPT-4o mini), Google Gemini (Gemini 2.0 flash)
- 🔐 **Authentication**: Secure user management with Clerk
- 📊 **Real-time Database**: Powered by Convex for instant data synchronization
- 📎 **File Attachments**: Upload and share images, documents, and media (via uploadthing)
- 🌐 **Web Search**: Integrated web search for Gemini models
- 🎨 **Beautiful Themes**: Multiple theme presets with light/dark mode
- ⚡ **Rate Limiting**: 15 messages per week with usage tracking
- 🗂️ **Chat Organization**: Organized chat history with search functionality
- 🔄 **Real-time Streaming**: Live AI responses as they generate

## 🚀 Quick Start

### Prerequisites

- Bun 1.3+
- Node.js 20.9+ for Next.js tooling compatibility
- Accounts for required services (see Environment Variables)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd artificialssh-chat
bun install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Convex Database
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Provider API Keys
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...

# File Upload (UploadThing)
UPLOADTHING_TOKEN=eyJhbGc...
UPLOADTHING_SECRET=sk_live_...
```

### 3. Set Up Required Services

#### Convex Database
1. Visit [convex.dev](https://convex.dev) and create an account
2. Create a new project
3. Run `bunx convex dev` to set up your database
4. Copy the deployment URL and add to your `.env.local`

#### Clerk Authentication
1. Visit [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Configure OAuth providers (optional)
4. Copy the API keys to your `.env.local`

#### OpenAI API
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add billing information for usage

#### Google AI (Gemini)
1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Create an API key for Gemini models
3. Add to your `.env.local`

#### UploadThing (File Uploads)
1. Visit [uploadthing.com](https://uploadthing.com)
2. Create an account and app
3. Copy the token and secret

### 4. Deploy Database Schema

```bash
bunx convex dev
```

This will:
- Deploy your Convex functions
- Set up the database schema
- Generate TypeScript types

### 5. Run the Development Server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion endpoint
│   │   ├── rate-limit/    # Rate limiting API
│   │   └── uploadthing/   # File upload handling
│   ├── c/[id]/           # Individual chat pages
│   └── settings/         # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ChatInterface.tsx # Main chat interface
│   ├── MessageInputBar.tsx # Message input with attachments
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── MessageUsageBar.tsx # Usage tracking component
├── convex/               # Backend functions
│   ├── chats.ts         # Chat operations
│   ├── rateLimiting.ts  # Rate limiting logic
│   └── schema.ts        # Database schema
└── lib/                 # Utilities and helpers
```

## 🔧 Configuration

### Rate Limiting

By default, users can send 15 messages per week. To modify this:

1. Edit `convex/rateLimiting.ts`
2. Change the `WEEKLY_MESSAGE_LIMIT` constant
3. Redeploy: `npx convex dev`

### AI Models

Add or remove AI models by editing `src/lib/models.ts`. 

### Themes

Customize themes in `src/components/ThemeSelector.tsx`. The app includes:

- Multiple color schemes
- Light/dark mode variants
- Custom CSS variables for easy theming

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [ArtificialSSH](https://chat.artificialssh.com) 
