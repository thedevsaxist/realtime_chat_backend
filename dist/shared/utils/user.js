"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUser = void 0;
const formatUser = (user) => ({
    email: user.email,
    createdAt: user.createdAt.getTime(),
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
});
exports.formatUser = formatUser;
