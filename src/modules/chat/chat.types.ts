export interface CreateMessageDTO {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface GetMessagesDTO {
  conversationId: string;
  before?: string;
  limit?: number;
}
