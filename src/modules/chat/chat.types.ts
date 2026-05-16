export interface CreateConversationDTO {
  participantIds: string[];
}

export interface CreateMessageDTO {
  conversationId: string;
  senderId: string;
  content: string;
  tempId?: string;
}

export interface GetMessagesDTO {
  conversationId: string;
  before?: string;
  limit?: number;
}

// export interface CreateConversationDTO {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   createdAt: Date;
// }
