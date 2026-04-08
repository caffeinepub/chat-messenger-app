import { Toaster } from "@/components/ui/sonner";
import type { Principal } from "@icp-sdk/core/principal";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthScreen } from "./components/AuthScreen";
import { ChatList } from "./components/ChatList";
import { ContactsList } from "./components/ContactsList";
import { ConversationView } from "./components/ConversationView";
import { EmptyConversation } from "./components/EmptyConversation";
import { MobileBottomNav, NavRail } from "./components/NavRail";
import { ProfilePanel } from "./components/ProfilePanel";
import { useActor } from "./hooks/useActor";
import { useChatAuth } from "./hooks/useChatAuth";
import type {
  ConversationPreview,
  Message,
  NavTab,
  UserProfile,
} from "./types/chat";

export default function App() {
  const { actor, isFetching: actorLoading } = useActor();
  const {
    status,
    currentUser,
    token,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateDisplayName,
  } = useChatAuth();

  // App state
  const [activeTab, setActiveTab] = useState<NavTab>("chats");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showConversationMobile, setShowConversationMobile] = useState(false);

  // Data state
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Polling intervals
  const inboxPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const convPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getApi = useCallback(() => actor as any, [actor]);

  // Fetch inbox
  const fetchInbox = useCallback(async () => {
    if (!actor || !token) return;
    try {
      const inbox = (await getApi().getInbox(token)) as ConversationPreview[];
      setConversations(inbox);
    } catch {
      // silent
    }
  }, [actor, token, getApi]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!actor || !token) return;
    try {
      const users = (await getApi().getAllUsers(token)) as UserProfile[];
      setAllUsers(users);
    } catch {
      // silent
    }
  }, [actor, token, getApi]);

  // Fetch conversation messages
  const fetchMessages = useCallback(
    async (recipientId: Principal) => {
      if (!actor || !token) return;
      try {
        const msgs = (await getApi().getConversation(
          token,
          recipientId,
        )) as Message[];
        setMessages(msgs);
      } catch {
        // silent
      }
    },
    [actor, token, getApi],
  );

  // Mark conversation read
  const markRead = useCallback(
    async (recipientId: Principal) => {
      if (!actor || !token) return;
      try {
        await getApi().markConversationRead(token, recipientId);
      } catch {
        // silent
      }
    },
    [actor, token, getApi],
  );

  // Initial data load when authenticated
  useEffect(() => {
    if (status !== "authenticated" || !actor || !token) return;

    setInboxLoading(true);
    setUsersLoading(true);

    Promise.all([fetchInbox(), fetchUsers()]).finally(() => {
      setInboxLoading(false);
      setUsersLoading(false);
    });
  }, [status, actor, token, fetchInbox, fetchUsers]);

  // Inbox polling every 3s
  useEffect(() => {
    if (status !== "authenticated") return;

    inboxPollRef.current = setInterval(() => {
      void fetchInbox();
    }, 3000);

    return () => {
      if (inboxPollRef.current) clearInterval(inboxPollRef.current);
    };
  }, [status, fetchInbox]);

  // Conversation polling every 2s
  useEffect(() => {
    if (!selectedUser || status !== "authenticated") return;

    const recipientId = selectedUser.id;
    setMessagesLoading(true);
    fetchMessages(recipientId).finally(() => setMessagesLoading(false));
    void markRead(recipientId);

    convPollRef.current = setInterval(() => {
      void fetchMessages(recipientId);
      void fetchInbox();
    }, 2000);

    return () => {
      if (convPollRef.current) clearInterval(convPollRef.current);
    };
  }, [selectedUser, status, fetchMessages, markRead, fetchInbox]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setMessages([]);
    setShowConversationMobile(true);
    setActiveTab("chats");
  }, []);

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!actor || !token || !selectedUser) return;
      try {
        const result = await getApi().sendMessageById(
          token,
          selectedUser.id,
          content,
        );
        if ("err" in result) {
          toast.error(result.err as string);
          return;
        }
        const newMsg = result.ok as Message;
        setMessages((prev) => [...prev, newMsg]);
        void fetchInbox();
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to send message",
        );
      }
    },
    [actor, token, selectedUser, getApi, fetchInbox],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    await logout();
    setSelectedUser(null);
    setConversations([]);
    setAllUsers([]);
    setMessages([]);
    setShowConversationMobile(false);
  }, [logout]);

  // Handle tab change
  const handleTabChange = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    if (tab !== "chats") {
      setShowConversationMobile(false);
    }
  }, []);

  // Handle back from conversation (mobile)
  const handleBackFromConversation = useCallback(() => {
    setShowConversationMobile(false);
  }, []);

  // Loading state
  if (actorLoading || status === "loading") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-chat-green flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading"
              role="img"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (status === "unauthenticated") {
    return (
      <>
        <AuthScreen
          onLogin={login}
          onRegister={register}
          error={authError}
          clearError={() => setAuthError(null)}
        />
        <Toaster richColors />
      </>
    );
  }

  if (!currentUser) return null;

  const selectedUserId = selectedUser?.id.toString() ?? null;

  // Left panel content
  const leftPanelContent = (() => {
    switch (activeTab) {
      case "chats":
        return (
          <ChatList
            conversations={conversations}
            isLoading={inboxLoading}
            currentUser={currentUser}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            onNewChat={() => handleTabChange("contacts")}
          />
        );
      case "contacts":
        return (
          <ContactsList
            users={allUsers}
            isLoading={usersLoading}
            currentUser={currentUser}
            selectedUserId={selectedUserId}
            onStartChat={(user) => {
              handleSelectConversation(user);
              handleTabChange("chats");
            }}
          />
        );
      case "profile":
        return (
          <ProfilePanel
            currentUser={currentUser}
            onUpdateDisplayName={updateDisplayName}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <>
      <div className="flex h-full bg-background overflow-hidden">
        {/* Desktop nav rail */}
        <NavRail
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />

        {/* Main content area */}
        <div className="flex flex-1 min-w-0 overflow-hidden">
          {/* Left panel */}
          <div
            className={`flex flex-col w-full lg:w-[360px] xl:w-[400px] border-r border-border shrink-0 ${
              showConversationMobile ? "hidden lg:flex" : "flex"
            }`}
          >
            {leftPanelContent}
          </div>

          {/* Right panel (conversation) */}
          <div
            className={`flex-1 min-w-0 flex-col mb-14 lg:mb-0 ${
              !showConversationMobile ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedUser ? (
              <ConversationView
                recipient={selectedUser}
                messages={messages}
                isLoading={messagesLoading}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onBack={handleBackFromConversation}
                showBackButton={showConversationMobile}
              />
            ) : (
              <EmptyConversation />
            )}
          </div>
        </div>

        {/* Mobile bottom nav */}
        {!showConversationMobile && (
          <MobileBottomNav
            currentUser={currentUser}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
          />
        )}
      </div>
      <Toaster richColors />
    </>
  );
}
