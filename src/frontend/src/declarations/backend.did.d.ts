/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface UserProfile {
  id: Principal;
  username: string;
  displayName: string;
  createdAt: bigint;
}

export interface Message {
  id: bigint;
  senderId: Principal;
  recipientId: Principal;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface ConversationPreview {
  otherUser: UserProfile;
  lastMessage: string;
  lastMessageTimestamp: bigint;
  unreadCount: bigint;
  lastMessageSenderId: Principal;
}

export type RegisterResult = { ok: UserProfile } | { err: string };
export type LoginTokenResult = { ok: { profile: UserProfile; token: string } } | { err: string };
export type SendResult = { ok: Message } | { err: string };
export type UpdateResult = { ok: null } | { err: string };

export interface _SERVICE {
  register: ActorMethod<[string, string, string], RegisterResult>;
  loginGetToken: ActorMethod<[string, string], LoginTokenResult>;
  validateToken: ActorMethod<[string], [] | [UserProfile]>;
  logout: ActorMethod<[string], void>;
  getAllUsers: ActorMethod<[string], UserProfile[]>;
  getMyProfile: ActorMethod<[string], [] | [UserProfile]>;
  updateDisplayName: ActorMethod<[string, string], UpdateResult>;
  sendMessageById: ActorMethod<[string, Principal, string], SendResult>;
  getConversation: ActorMethod<[string, Principal], Message[]>;
  markConversationRead: ActorMethod<[string, Principal], void>;
  getInbox: ActorMethod<[string], ConversationPreview[]>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
