"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const tokenService_1 = require("../services/tokenService");
const logger_1 = require("../utils/logger");
/**
 * Middleware para verificar autenticação
 * Verifica se o token JWT é válido e adiciona as informações do usuário à requisição
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obter token do cabeçalho Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Token de autenticação não fornecido'
            });
            return;
        }
        // Formato esperado: Bearer <token>
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
            return;
        }
        // Verificar token
        const payload = (0, tokenService_1.verifyToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
            return;
        }
        // Adicionar informações do usuário à requisição
        req.user = payload;
        // Continuar para o próximo middleware ou controlador
        next();
    }
    catch (error) {
        logger_1.logger.error('Erro no middleware de autenticação:', error);
        res.status(401).json({
            success: false,
            message: 'Erro de autenticação'
        });
    }
});
exports.authenticate = authenticate;
/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser usado após o middleware de autenticação
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
        });
        return;
    }
    if (!req.user.isAdmin) {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Permissão de administrador necessária.'
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
