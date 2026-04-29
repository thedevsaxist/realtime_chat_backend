"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
exports.authRoutes = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
exports.authRoutes.post('/login', authController.login.bind(authController));
