import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ConversationPreview, UserProfile } from "../types/chat";
import { formatTimestamp } from "../utils/avatarColor";
import { InitialsAvatar } from "./InitialsAvatar";

interface ChatListProps {
  conversations: ConversationPreview[];
  isLoading: boolean;
  currentUser: UserProfile;
  selectedUserId: string | null;
  onSelectConversation: (user: UserProfile) => void;
  onNewChat: () => void;
}

export function ChatList({
  conversations,
  isLoading,
  currentUser,
  selectedUserId,
  onSelectConversation,
  onNewChat,
}: ChatListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(
    (c) =>
      c.otherUser.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.otherUser.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">Chats</h1>
          <button
            type="button"
            onClick={onNewChat}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="New chat"
            data-ocid="chats.new_chat.button"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted border-0 rounded-full h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            data-ocid="chats.search_input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-2 space-y-1" data-ocid="chats.loading_state">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full py-16 px-6 text-center"
            data-ocid="chats.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {search ? "No results found" : "No conversations yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Start a chat with someone from Contacts"}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((convo, i) => {
              const isSelected =
                selectedUserId === convo.otherUser.id.toString();
              const unread = Number(convo.unreadCount);
              const isMine =
                convo.lastMessageSenderId.toString() ===
                currentUser.id.toString();

              return (
                <motion.button
                  key={convo.otherUser.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => onSelectConversation(convo.otherUser)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/70"
                  }`}
                  data-ocid={`chats.item.${i + 1}`}
                >
                  <InitialsAvatar
                    username={convo.otherUser.username}
                    displayName={convo.otherUser.displayName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {convo.otherUser.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(convo.lastMessageTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {isMine ? (
                          <span className="text-chat-green-dark">You: </span>
                        ) : null}
                        {convo.lastMessage}
                      </p>
                      {unread > 0 && (
                        <span
                          className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-badge-green text-white text-[10px] font-bold flex items-center justify-center"
                          data-ocid={`chats.badge.${i + 1}`}
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
