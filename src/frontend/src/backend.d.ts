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

export type RegisterResult =
  | { ok: UserProfile }
  | { err: string };

export type LoginTokenResult =
  | { ok: { profile: UserProfile; token: string } }
  | { err: string };

export type SendResult =
  | { ok: Message }
  | { err: string };

export type UpdateResult =
  | { ok: null }
  | { err: string };

export interface backendInterface {
  // Required by useActor.ts scaffold (no-op for this app)
  _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  // Auth
  register(username: string, password: string, displayName: string): Promise<RegisterResult>;
  loginGetToken(username: string, password: string): Promise<LoginTokenResult>;
  validateToken(token: string): Promise<[] | [UserProfile]>;
  logout(token: string): Promise<void>;
  // Users
  getAllUsers(token: string): Promise<UserProfile[]>;
  getMyProfile(token: string): Promise<[] | [UserProfile]>;
  updateDisplayName(token: string, newName: string): Promise<UpdateResult>;
  // Messaging
  sendMessageById(token: string, recipientId: UserId, content: string): Promise<SendResult>;
  getConversation(token: string, otherUserId: UserId): Promise<Message[]>;
  markConversationRead(token: string, otherUserId: UserId): Promise<void>;
  getInbox(token: string): Promise<ConversationPreview[]>;
}
