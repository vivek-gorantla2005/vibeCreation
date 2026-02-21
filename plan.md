# Plan: AI-Powered Figma Generator (VibeDesign) 🎨

This document outlines the roadmap for building a Figma design generator integrated into the VibeCreation ecosystem.

## 📝 Overview
VibeDesign will allow users to describe a UI component or screen in natural language and have it generated directly into a Figma file. It uses LLMs to plan the layout and mapping logic to convert those plans into Figma-compatible nodes.

---

## 🏗️ Architecture

1.  **Design Agent (Inngest)**: A specialized agent (`designAgentFunction`) using Gemini 2.0 to translate prompts into a structured design specification (JSON).
2.  **Figma Connector**: A toolset to interact with the Figma REST API.
3.  **Intermediate Design Format (IDF)**: A simplified JSON representation of the design (Layers, Frames, Styles) that can be easily mapped to Figma's `Document` structure.
4.  **VibeCreation Integration**: A new "Design" tab in the project view to toggle between Code and Design modes.

---

## 🛠️ Technology Stack

-   **Frontend**: Next.js, Shadcn UI, Lucide Icons.
-   **AI**: Inngest Agent Kit + Gemini 2.0 Flash (for fast reasoning).
-   **Figma Integration**: [Figma REST API](https://www.figma.com/developers/api) + [Figma Plugin API](https://www.figma.com/plugin-docs/intro/) (if needed for real-time sync).
-   **Orchestration**: Inngest (Real-time design status and background job handling).
-   **Database**: Prisma (to store Figma tokens, file IDs, and design versions).

---

## 🚀 Implementation Steps

### Phase 1: Infrastructure & API (Week 1)
1.  **Figma App Setup**: Register a Figma application to obtain OAuth2 credentials.
2.  **Authentication Flow**: Implement an OAuth flow in `app/api/auth/figma` to allow users to link their Figma accounts.
3.  **Database Expansion**: Update `schema.prisma` to store `FigmaToken` and `FigmaFile` metadata.
4.  **Figma Client**: Create a `lib/figma-client.ts` utility to handle API requests (Creating files, adding nodes, fetching styles).

### Phase 2: Design Intelligence (Week 2)
1.  **Design System Tokenization**: Define a set of "Design Tokens" (colors, spacing, typography) that the AI understands.
2.  **Specialized Agent Prompt**: Develop a robust system prompt for the "Design Agent" to output IDF JSON.
3.  **idf-to-figma Mapper**: Build a service that translates IDF JSON into Figma REST API `POST` bodies.
4.  **Inngest Function**: Implement `design-agent/design.run` event handler.

### Phase 3: UI & Interaction (Week 3)
1.  **Design Preview Component**: Create a low-fidelity design renderer in the web app (Canvas or SVG-based) to show a preview before pushing to Figma.
2.  **Export UI**: Add an "Export to Figma" dialog in `ProjectView`.
3.  **Real-time Streaming**: Update `ChatSection` to show design generation statuses (e.g., "Drafting Layout...", "Applying Color Tokens...").

### Phase 4: Polish & Advanced Features (Week 4)
1.  **Component Library Sync**: Allow the AI to use an existing Figma component library from the user's account.
2.  **Iteration Flow**: Support "Fixing" designs via chat (e.g., "Make the header darker").
3.  **Design-to-Code**: Implement a bridge where a generated Figma design can be turned into React code within VibeCreation.

---

## 🚩 Milestone Checklist
- [ ] Figma OAuth Integration Successful.
- [ ] Agent can generate a basic "Button" frame JSON.
- [ ] Button appears in a real Figma file via API.
- [ ] Full screen generation with Auto-layout support.
- [ ] Real-time UI feedback loop completed.
