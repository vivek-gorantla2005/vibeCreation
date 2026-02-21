# VibeCreation 🚀

VibeCreation is a premium, AI-powered collaborative coding platform that enables users to build, preview, and iterate on full-stack web applications through natural language conversation. It combines the power of modern LLMs with a real-time, sandboxed execution environment to turn ideas into working code instantly.

## ✨ Features

- **💬 Agentic AI Chat**: A sophisticated coding assistant powered by **Gemini 2.0 Flash** that understands complex requirements and multi-step tasks.
- **🏗️ Real-time Generation**: Watch your project come to life as the AI creates files, installs dependencies, and runs terminal commands in real-time.
- **🌐 Live Preview**: Instant, hot-reloading preview of your application hosted in an isolated **E2B sandbox**.
- **📂 Full File Explorer**: A modern IDE-like experience with a **Monaco Editor**, supporting multi-file navigation and persistent edits.
- **⚡ Inngest Orchestration**: Powered by **Inngest** for robust background job handling and real-time status streaming to the UI.
- **📦 Code Fragments**: Review specific changes in detail through interactive dialogs that track exactly which files were created in each AI response.
- **🎨 Premium Design**: A sleek, glassmorphic interface built with **Tailwind CSS v4** and **shadcn/ui**, featuring high-fidelity animations and a refined dark mode.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **AI Engine**: [Inngest Agent Kit](https://www.inngest.com/docs/agent-kit) + [Google Gemini 2.0](https://ai.google.dev/)
- **Runtime**: [E2B Code Interpreter](https://e2b.dev/) (Dedicated cloud sandboxes)
- **Workflow & Real-time**: [Inngest](https://www.inngest.com/)
- **Database**: [Prisma](https://www.prisma.io/) + PostgreSQL
- **API**: [ElysiaJS](https://elysiajs.com/) (High-performance Type-Safe API)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Motion](https://motion.dev/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL instance
- [Inngest Cloud](https://www.inngest.com/) or Local Dev Server
- API Keys for:
  - Google Gemini (AI)
  - E2B (Sandboxing)
  - Unsplash (Assets)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/vibecreation.git
   cd vibecreation/my-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root and add your secrets:
   ```env
   DATABASE_URL="postgresql://..."
   GEMINI_API_KEY="..."
   E2B_API_KEY="..."
   INNGEST_EVENT_KEY="..."
   INNGEST_SIGNING_KEY="..."
   UNSPLASH_API_KEY="..."
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Servers**:
   In two separate terminals:
   ```bash
   # Terminal 1: Next.js app
   npm run dev

   # Terminal 2: Inngest Dev Server
   npx inngest-cli@latest dev
   ```

## 🧠 Project Structure

- `app/` - Next.js App Router (Dashboard, Projects, API)
- `components/` - Core UI components including `ChatSection`, `FileExplorer`, and `ProjectView`.
- `inngest/` - Agent logic, tool definitions, and background functions.
- `lib/` - Shared utilities, API clients, and database configuration.
- `prisma/` - Database schema and generated client.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Built with ❤️ by the VibeCreation Team.
