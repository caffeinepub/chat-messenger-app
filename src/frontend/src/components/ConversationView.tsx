import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, UserProfile } from "../types/chat";
import { formatDateSeparator, formatMessageTime } from "../utils/avatarColor";
import { InitialsAvatar } from "./InitialsAvatar";

interface ConversationViewProps {
  recipient: UserProfile;
  messages: Message[];
  isLoading: boolean;
  currentUser: UserProfile;
  onSendMessage: (content: string) => Promise<void>;
  onBack: () => void;
  showBackButton?: boolean;
}

function groupMessagesByDate(messages: Message[]) {
  const groups: {
    dateLabel: string;
    datestamp: bigint;
    messages: Message[];
  }[] = [];

  for (const msg of messages) {
    const label = formatDateSeparator(msg.timestamp);
    const last = groups[groups.length - 1];
    if (!last || last.dateLabel !== label) {
      groups.push({
        dateLabel: label,
        datestamp: msg.timestamp,
        messages: [msg],
      });
    } else {
      last.messages.push(msg);
    }
  }

  return groups;
}

export function ConversationView({
  recipient,
  messages,
  isLoading,
  currentUser,
  onSendMessage,
  onBack,
  showBackButton = false,
}: ConversationViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLen = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length !== prevMessagesLen.current) {
      prevMessagesLen.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Initial scroll when recipient changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on recipient change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [recipient.id]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || sending) return;
    setInputValue("");
    setSending(true);
    try {
      await onSendMessage(content);
    } finally {
      setSending(false);
    }
  }, [inputValue, sending, onSendMessage]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const groups = groupMessagesByDate(messages);

  return (
    <div
      className="flex flex-col h-full bg-card"
      data-ocid="conversation.panel"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors mr-1"
            aria-label="Back"
            data-ocid="conversation.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <InitialsAvatar
          username={recipient.username}
          displayName={recipient.displayName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-foreground truncate">
            {recipient.displayName}
          </h2>
          <p className="text-xs text-chat-green">Online</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Voice call"
            data-ocid="conversation.call.button"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Video call"
            data-ocid="conversation.video.button"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            aria-label="More options"
            data-ocid="conversation.more.button"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="space-y-3" data-ocid="conversation.loading_state">
            {(["a", "b", "c", "d"] as const).map((id, i) => (
              <div
                key={id}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full py-16 text-center"
            data-ocid="conversation.empty_state"
          >
            <InitialsAvatar
              username={recipient.username}
              displayName={recipient.displayName}
              size="xl"
              className="mb-4"
            />
            <p className="text-sm font-semibold text-foreground mb-1">
              {recipient.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              @{recipient.username}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Say hello! This is the beginning of your conversation.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {groups.map((group) => (
              <div key={group.dateLabel}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-3">
                  <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                    {group.dateLabel}
                  </span>
                </div>

                {/* Messages in group */}
                {group.messages.map((msg, i) => {
                  const isOwn =
                    msg.senderId.toString() === currentUser.id.toString();
                  const nextMsg = group.messages[i + 1];
                  const sameNextSender =
                    nextMsg?.senderId.toString() === msg.senderId.toString();

                  return (
                    <motion.div
                      key={msg.id.toString()}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                        sameNextSender ? "mb-0.5" : "mb-2"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-3.5 py-2 text-sm leading-relaxed ${
                          isOwn
                            ? "bg-bubble-out text-white rounded-2xl rounded-br-sm"
                            : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                        }`}
                        data-ocid={
                          isOwn
                            ? `conversation.sent.item.${i + 1}`
                            : `conversation.received.item.${i + 1}`
                        }
                      >
                        <p className="break-words">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isOwn ? "text-white/60" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-[10px]">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {isOwn && (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 16 11"
                              aria-hidden="true"
                            >
                              {msg.read ? (
                                <>
                                  <path d="M11.071.653a.75.75 0 0 1 .276 1.023l-5.5 9.5a.75.75 0 0 1-1.212.1l-3-3.5a.75.75 0 0 1 1.13-.97l2.392 2.79 4.891-8.46a.75.75 0 0 1 1.023-.483z" />
                                  <path
                                    d="M15.071.653a.75.75 0 0 1 .276 1.023l-5.5 9.5a.75.75 0 0 1-1.212.1l-.5-.583a.75.75 0 0 1 1.13-.97l.007.008 4.776-8.255a.75.75 0 0 1 1.023-.483z"
                                    opacity="0.5"
                                  />
                                </>
                              ) : (
                                <path d="M11.071.653a.75.75 0 0 1 .276 1.023l-5.5 9.5a.75.75 0 0 1-1.212.1l-3-3.5a.75.75 0 0 1 1.13-.97l2.392 2.79 4.891-8.46a.75.75 0 0 1 1.023-.483z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="px-3 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Emoji"
            data-ocid="conversation.emoji.button"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Attach file"
            data-ocid="conversation.attach.button"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm h-10 px-4"
            disabled={sending}
            data-ocid="conversation.message.input"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!inputValue.trim() || sending}
            className="w-10 h-10 rounded-full bg-chat-green text-white flex items-center justify-center shrink-0 hover:bg-chat-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
            data-ocid="conversation.send.button"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
