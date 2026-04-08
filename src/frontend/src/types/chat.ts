import type { Principal } from "@icp-sdk/core/principal";

export type UserId = Principal;

export interface UserProfile {
  id: UserId;
  username: string;
  displayName: string;
  createdAt: bigint;
}

export interface Message {
  id: bigint;
  senderId: UserId;
  recipientId: UserId;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface ConversationPreview {
  otherUser: UserProfile;
  lastMessage: string;
  lastMessageTimestamp: bigint;
  unreadCount: bigint;
  lastMessageSenderId: UserId;
}

export type NavTab = "chats" | "contacts" | "profile";
