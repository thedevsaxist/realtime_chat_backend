"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessage = exports.formatConversation = void 0;
const formatConversation = (convo) => ({
    id: convo.id,
    createdAt: convo.createdAt.getTime(),
    messages: convo.messages.map(exports.formatMessage),
});
exports.formatConversation = formatConversation;
const formatMessage = (message) => ({
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    conversationId: message.conversationId,
    createdAt: message.createdAt.getTime(),
});
exports.formatMessage = formatMessage;
