import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../types/chat";
import { InitialsAvatar } from "./InitialsAvatar";

interface ContactsListProps {
  users: UserProfile[];
  isLoading: boolean;
  currentUser: UserProfile;
  selectedUserId: string | null;
  onStartChat: (user: UserProfile) => void;
}

export function ContactsList({
  users,
  isLoading,
  currentUser,
  selectedUserId,
  onStartChat,
}: ContactsListProps) {
  const [search, setSearch] = useState("");

  const others = users.filter(
    (u) => u.id.toString() !== currentUser.id.toString(),
  );
  const filtered = others.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">Contacts</h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length} people
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted border-0 rounded-full h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            data-ocid="contacts.search_input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-2 space-y-1" data-ocid="contacts.loading_state">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full py-16 px-6 text-center"
            data-ocid="contacts.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {search ? "No contacts found" : "No other users yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Once other users register, they will appear here"}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((user, i) => {
              const isSelected = selectedUserId === user.id.toString();
              return (
                <motion.button
                  key={user.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => onStartChat(user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/70"
                  }`}
                  data-ocid={`contacts.item.${i + 1}`}
                >
                  <InitialsAvatar
                    username={user.username}
                    displayName={user.displayName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-chat-green transition-colors">
                      <MessageSquare className="w-4 h-4" />
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
