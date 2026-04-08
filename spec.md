# Chat Messenger App

## Current State
New project. Only scaffolding exists (empty Motoko actor, no frontend logic).

## Requested Changes (Diff)

### Add
- User registration with username + password (hashed)
- User sign-in returning a session token
- User profile: display name and auto-generated initials-based avatar
- List of all registered users (visible after login)
- One-on-one messaging between any two users
- Message storage with sender, recipient, timestamp, and content
- Backend API: get conversation between two users (paginated)
- Backend API: send message
- Backend API: get all conversations for current user (inbox with last message preview)
- Backend API: get all users
- Frontend: Login/Register screen
- Frontend: Inbox/home screen — recent conversations with last message preview, unread count
- Frontend: Users list screen — browse all registered users to start a new chat
- Frontend: Conversation screen — chat bubble view, sent right (green), received left (gray)
- Frontend: User profile screen — display name, initials avatar
- Frontend: Navigation rail (desktop) / bottom tabs (mobile)
- Polling-based real-time updates (every 2 seconds) for new messages
- WhatsApp-inspired green and white theme, mobile-friendly

### Modify
- Replace empty Motoko actor with full chat backend

### Remove
- Nothing

## Implementation Plan
1. Select `authorization` component for session/auth management
2. Generate Motoko backend with user management, messaging, and inbox APIs
3. Build frontend: auth screens, inbox, conversation view, users list, profile
4. Wire frontend to backend using generated bindings
5. Implement polling for real-time message updates
