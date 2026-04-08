/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const UserProfile = IDL.Record({
  id: IDL.Principal,
  username: IDL.Text,
  displayName: IDL.Text,
  createdAt: IDL.Int,
});

const Message = IDL.Record({
  id: IDL.Nat,
  senderId: IDL.Principal,
  recipientId: IDL.Principal,
  content: IDL.Text,
  timestamp: IDL.Int,
  read: IDL.Bool,
});

const ConversationPreview = IDL.Record({
  otherUser: UserProfile,
  lastMessage: IDL.Text,
  lastMessageTimestamp: IDL.Int,
  unreadCount: IDL.Nat,
  lastMessageSenderId: IDL.Principal,
});

const RegisterResult = IDL.Variant({
  ok: UserProfile,
  err: IDL.Text,
});

const LoginTokenResult = IDL.Variant({
  ok: IDL.Record({ profile: UserProfile, token: IDL.Text }),
  err: IDL.Text,
});

const SendResult = IDL.Variant({
  ok: Message,
  err: IDL.Text,
});

const UpdateResult = IDL.Variant({
  ok: IDL.Null,
  err: IDL.Text,
});

export const idlService = IDL.Service({
  register: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [RegisterResult], []),
  loginGetToken: IDL.Func([IDL.Text, IDL.Text], [LoginTokenResult], []),
  validateToken: IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], []),
  logout: IDL.Func([IDL.Text], [], []),
  getAllUsers: IDL.Func([IDL.Text], [IDL.Vec(UserProfile)], []),
  getMyProfile: IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], []),
  updateDisplayName: IDL.Func([IDL.Text, IDL.Text], [UpdateResult], []),
  sendMessageById: IDL.Func([IDL.Text, IDL.Principal, IDL.Text], [SendResult], []),
  getConversation: IDL.Func([IDL.Text, IDL.Principal], [IDL.Vec(Message)], []),
  markConversationRead: IDL.Func([IDL.Text, IDL.Principal], [], []),
  getInbox: IDL.Func([IDL.Text], [IDL.Vec(ConversationPreview)], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Record({
    id: IDL.Principal,
    username: IDL.Text,
    displayName: IDL.Text,
    createdAt: IDL.Int,
  });
  const Message = IDL.Record({
    id: IDL.Nat,
    senderId: IDL.Principal,
    recipientId: IDL.Principal,
    content: IDL.Text,
    timestamp: IDL.Int,
    read: IDL.Bool,
  });
  const ConversationPreview = IDL.Record({
    otherUser: UserProfile,
    lastMessage: IDL.Text,
    lastMessageTimestamp: IDL.Int,
    unreadCount: IDL.Nat,
    lastMessageSenderId: IDL.Principal,
  });
  const RegisterResult = IDL.Variant({ ok: UserProfile, err: IDL.Text });
  const LoginTokenResult = IDL.Variant({
    ok: IDL.Record({ profile: UserProfile, token: IDL.Text }),
    err: IDL.Text,
  });
  const SendResult = IDL.Variant({ ok: Message, err: IDL.Text });
  const UpdateResult = IDL.Variant({ ok: IDL.Null, err: IDL.Text });

  return IDL.Service({
    register: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [RegisterResult], []),
    loginGetToken: IDL.Func([IDL.Text, IDL.Text], [LoginTokenResult], []),
    validateToken: IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], []),
    logout: IDL.Func([IDL.Text], [], []),
    getAllUsers: IDL.Func([IDL.Text], [IDL.Vec(UserProfile)], []),
    getMyProfile: IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], []),
    updateDisplayName: IDL.Func([IDL.Text, IDL.Text], [UpdateResult], []),
    sendMessageById: IDL.Func([IDL.Text, IDL.Principal, IDL.Text], [SendResult], []),
    getConversation: IDL.Func([IDL.Text, IDL.Principal], [IDL.Vec(Message)], []),
    markConversationRead: IDL.Func([IDL.Text, IDL.Principal], [], []),
    getInbox: IDL.Func([IDL.Text], [IDL.Vec(ConversationPreview)], []),
  });
};

export const init = ({ IDL }) => { return []; };
