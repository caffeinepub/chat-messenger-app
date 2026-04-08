import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";

actor {

  // ─── Types ───────────────────────────────────────────────────────────────

  type UserId = Principal;

  type UserProfile = {
    id : UserId;
    username : Text;
    displayName : Text;
    createdAt : Int;
  };

  type Message = {
    id : Nat;
    senderId : UserId;
    recipientId : UserId;
    content : Text;
    timestamp : Int;
    read : Bool;
  };

  type ConversationPreview = {
    otherUser : UserProfile;
    lastMessage : Text;
    lastMessageTimestamp : Int;
    unreadCount : Nat;
    lastMessageSenderId : UserId;
  };

  type RegisterResult = { #ok : UserProfile; #err : Text };
  type LoginTokenResult = { #ok : { profile : UserProfile; token : Text }; #err : Text };
  type SendResult = { #ok : Message; #err : Text };
  type UpdateResult = { #ok; #err : Text };

  // ─── State ────────────────────────────────────────────────────────────────

  let usernameIndex = Map.empty<Text, UserId>();
  let users = Map.empty<UserId, UserProfile>();
  let passwords = Map.empty<UserId, Text>();
  let sessions = Map.empty<Text, UserId>();
  var nextMsgId : Nat = 0;
  let allMessages = List.empty<Message>();

  // ─── Helpers ─────────────────────────────────────────────────────────────

  func hashPassword(pw : Text) : Text {
    var h : Nat32 = 5381;
    for (c in pw.chars()) {
      let n = c.toNat32();
      h := h *% 31 +% (n % 256);
    };
    h.toText();
  };

  func makeToken(principal : UserId, ts : Int) : Text {
    principal.toText() # "|" # ts.toText();
  };

  func getCallerFromToken(token : Text) : ?UserId {
    sessions.get(token);
  };

  func getConvMsgs(a : UserId, b : UserId) : [Message] {
    allMessages.filter(func(m : Message) : Bool {
      (m.senderId == a and m.recipientId == b) or
      (m.senderId == b and m.recipientId == a);
    }).toArray();
  };

  func sortedMsgs(msgs : [Message]) : [Message] {
    msgs.sort(func(a : Message, b : Message) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    });
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────

  public shared ({ caller }) func register(
    username : Text,
    password : Text,
    displayName : Text,
  ) : async RegisterResult {
    if (caller.isAnonymous()) return #err("Anonymous callers cannot register");
    if (username == "") return #err("Username cannot be empty");
    if (password == "") return #err("Password cannot be empty");
    if (displayName == "") return #err("Display name cannot be empty");

    switch (usernameIndex.get(username)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };

    switch (users.get(caller)) {
      case (?_) { return #err("Principal already registered") };
      case (null) {};
    };

    let now = Time.now();
    let profile : UserProfile = {
      id = caller;
      username = username;
      displayName = displayName;
      createdAt = now;
    };

    usernameIndex.add(username, caller);
    users.add(caller, profile);
    passwords.add(caller, hashPassword(password));
    #ok(profile);
  };

  public func loginGetToken(username : Text, password : Text) : async LoginTokenResult {
    switch (usernameIndex.get(username)) {
      case (null) { return #err("User not found") };
      case (?uid) {
        switch (passwords.get(uid)) {
          case (null) { return #err("User not found") };
          case (?storedHash) {
            if (storedHash != hashPassword(password)) {
              return #err("Invalid password");
            };
            switch (users.get(uid)) {
              case (null) { return #err("User not found") };
              case (?profile) {
                let now = Time.now();
                let token = makeToken(uid, now);
                sessions.add(token, uid);
                #ok({ profile; token });
              };
            };
          };
        };
      };
    };
  };

  public func validateToken(token : Text) : async ?UserProfile {
    switch (sessions.get(token)) {
      case (null) { null };
      case (?uid) { users.get(uid) };
    };
  };

  public func logout(token : Text) : async () {
    sessions.remove(token);
  };

  // ─── Users ────────────────────────────────────────────────────────────────

  public func getAllUsers(token : Text) : async [UserProfile] {
    switch (getCallerFromToken(token)) {
      case (null) { return [] };
      case (?me) {
        users.toArray()
          .filter(func(pair : (UserId, UserProfile)) : Bool { pair.0 != me })
          .map(func(pair : (UserId, UserProfile)) : UserProfile { pair.1 });
      };
    };
  };

  public func getMyProfile(token : Text) : async ?UserProfile {
    switch (getCallerFromToken(token)) {
      case (null) { null };
      case (?me) { users.get(me) };
    };
  };

  public func updateDisplayName(token : Text, newName : Text) : async UpdateResult {
    switch (getCallerFromToken(token)) {
      case (null) { return #err("Not authenticated") };
      case (?me) {
        switch (users.get(me)) {
          case (null) { return #err("User not found") };
          case (?profile) {
            users.add(me, { profile with displayName = newName });
            #ok;
          };
        };
      };
    };
  };

  // ─── Messaging ────────────────────────────────────────────────────────────

  public func sendMessageById(
    token : Text,
    recipientId : UserId,
    content : Text,
  ) : async SendResult {
    switch (getCallerFromToken(token)) {
      case (null) { return #err("Not authenticated") };
      case (?me) {
        if (recipientId == me) return #err("Cannot message yourself");
        switch (users.get(recipientId)) {
          case (null) { return #err("Recipient not found") };
          case (?_) {
            let msg : Message = {
              id = nextMsgId;
              senderId = me;
              recipientId = recipientId;
              content = content;
              timestamp = Time.now();
              read = false;
            };
            nextMsgId += 1;
            allMessages.add(msg);
            #ok(msg);
          };
        };
      };
    };
  };

  public func getConversation(
    token : Text,
    otherUserId : UserId,
  ) : async [Message] {
    switch (getCallerFromToken(token)) {
      case (null) { return [] };
      case (?me) {
        sortedMsgs(getConvMsgs(me, otherUserId));
      };
    };
  };

  public func markConversationRead(
    token : Text,
    otherUserId : UserId,
  ) : async () {
    switch (getCallerFromToken(token)) {
      case (null) { return };
      case (?me) {
        allMessages.mapInPlace(func(m : Message) : Message {
          if (m.recipientId == me and m.senderId == otherUserId and not m.read) {
            { m with read = true };
          } else {
            m;
          };
        });
      };
    };
  };

  public func getInbox(token : Text) : async [ConversationPreview] {
    switch (getCallerFromToken(token)) {
      case (null) { return [] };
      case (?me) {
        let partnerMap = Map.empty<UserId, Bool>();

        for (msg in allMessages.toArray().vals()) {
          if (msg.senderId == me) {
            partnerMap.add(msg.recipientId, true);
          } else if (msg.recipientId == me) {
            partnerMap.add(msg.senderId, true);
          };
        };

        let previews = List.empty<ConversationPreview>();

        for (pair in partnerMap.toArray().vals()) {
          let partnerId = pair.0;
          switch (users.get(partnerId)) {
            case (null) {};
            case (?partnerProfile) {
              let convArr = sortedMsgs(getConvMsgs(me, partnerId));
              if (convArr.size() > 0) {
                let lastMsg = convArr[convArr.size() - 1];
                var unread : Nat = 0;
                for (m in convArr.vals()) {
                  if (m.recipientId == me and not m.read) {
                    unread += 1;
                  };
                };
                previews.add({
                  otherUser = partnerProfile;
                  lastMessage = lastMsg.content;
                  lastMessageTimestamp = lastMsg.timestamp;
                  unreadCount = unread;
                  lastMessageSenderId = lastMsg.senderId;
                });
              };
            };
          };
        };

        previews.toArray().sort(func(a : ConversationPreview, b : ConversationPreview) : Order.Order {
          Int.compare(b.lastMessageTimestamp, a.lastMessageTimestamp);
        });
      };
    };
  };

};
