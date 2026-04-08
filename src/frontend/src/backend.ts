/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;

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
  sendMessageById(token: string, recipientId: Principal, content: string): Promise<SendResult>;
  getConversation(token: string, otherUserId: Principal): Promise<Message[]>;
  markConversationRead(token: string, otherUserId: Principal): Promise<void>;
  getInbox(token: string): Promise<ConversationPreview[]>;
}

export class ExternalBlob {
  _blob?: Uint8Array<ArrayBuffer> | null;
  directURL: string;
  onProgress?: (percentage: number) => void = undefined;
  private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
    if (blob) { this._blob = blob; }
    this.directURL = directURL;
  }
  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(url, null);
  }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
    return new ExternalBlob(url, blob);
  }
  public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._blob) { return this._blob; }
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  public getDirectURL(): string { return this.directURL; }
  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export class Backend implements backendInterface {
  constructor(
    private actor: ActorSubclass<_SERVICE>,
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    private processError?: (error: unknown) => never
  ) {}

  async _initializeAccessControlWithSecret(_adminToken: string): Promise<void> {
    // No-op: this app uses token-based auth, not role-based access control
  }

  async register(username: string, password: string, displayName: string): Promise<RegisterResult> {
    return this.actor.register(username, password, displayName);
  }

  async loginGetToken(username: string, password: string): Promise<LoginTokenResult> {
    return this.actor.loginGetToken(username, password);
  }

  async validateToken(token: string): Promise<[] | [UserProfile]> {
    return this.actor.validateToken(token);
  }

  async logout(token: string): Promise<void> {
    return this.actor.logout(token);
  }

  async getAllUsers(token: string): Promise<UserProfile[]> {
    return this.actor.getAllUsers(token);
  }

  async getMyProfile(token: string): Promise<[] | [UserProfile]> {
    return this.actor.getMyProfile(token);
  }

  async updateDisplayName(token: string, newName: string): Promise<UpdateResult> {
    return this.actor.updateDisplayName(token, newName);
  }

  async sendMessageById(token: string, recipientId: Principal, content: string): Promise<SendResult> {
    return this.actor.sendMessageById(token, recipientId, content);
  }

  async getConversation(token: string, otherUserId: Principal): Promise<Message[]> {
    return this.actor.getConversation(token, otherUserId);
  }

  async markConversationRead(token: string, otherUserId: Principal): Promise<void> {
    return this.actor.markConversationRead(token, otherUserId);
  }

  async getInbox(token: string): Promise<ConversationPreview[]> {
    return this.actor.getInbox(token);
  }
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

export function createActor(
  canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {}
): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
