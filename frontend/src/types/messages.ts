export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageWithSender extends Message {
  senderName: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface ConversationListItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastActivityAt: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
}

export interface ConversationMessagesResponse {
  conversation: {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar: string;
  };
  messages: MessageWithSender[];
}

export interface ConversationsListResponse {
  conversations: ConversationListItem[];
}

export interface UnreadMessageCountResponse {
  unreadCount: number;
}
