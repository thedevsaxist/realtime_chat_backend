import * as z from 'zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
});

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  createdAt: Date;
  messages: Message[];
}

interface AuthResponse {
  user: User;
  token: string;
  conversations: Conversation[];
}

export { User, Message, Conversation, AuthResponse, RegisterSchema, LoginSchema };
