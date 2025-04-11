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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTokenAsUsed = exports.verifyAuthToken = exports.generateAuthToken = exports.generateRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("../prisma/client");
const logger_1 = require("../utils/logger");
// Chaves e configurações
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-forte';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
/**
 * Gera um token JWT para o usuário
 * @param payload Dados para incluir no token
 * @returns Token JWT assinado
 */
const generateToken = (payload) => {
    try {
        // Usar abordagem diferente para evitar problemas com TypeScript
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return token;
    }
    catch (error) {
        logger_1.logger.error('Erro ao gerar token JWT:', error);
        throw error;
    }
};
exports.generateToken = generateToken;
/**
 * Verifica e decodifica um token JWT
 * @param token Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        logger_1.logger.error('Erro ao verificar token JWT:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Gera um token de atualização (refresh token)
 * @param userId ID do usuário
 * @returns Token JWT com prazo de expiração maior
 */
const generateRefreshToken = (userId) => {
    try {
        const token = jsonwebtoken_1.default.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
        return token;
    }
    catch (error) {
        logger_1.logger.error('Erro ao gerar refresh token:', error);
        throw error;
    }
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Gera um token aleatório para verificação de e-mail ou redefinição de senha
 * @param userId ID do usuário
 * @param type Tipo do token (password_reset, email_verification)
 * @param expiresInHours Horas até a expiração
 * @returns Token de verificação
 */
const generateAuthToken = (userId_1, type_1, ...args_1) => __awaiter(void 0, [userId_1, type_1, ...args_1], void 0, function* (userId, type, expiresInHours = type === 'password_reset' ? 1 : 24) {
    try {
        // Gerar token aleatório
        const token = crypto_1.default.randomBytes(32).toString('hex');
        // Calcular data de expiração
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);
        // Salvar token no banco de dados
        yield client_1.prisma.authToken.create({
            data: {
                token,
                userId,
                type,
                expiresAt,
                used: false
            }
        });
        return token;
    }
    catch (error) {
        logger_1.logger.error(`Erro ao gerar token de ${type}:`, error);
        throw error;
    }
});
exports.generateAuthToken = generateAuthToken;
/**
 * Verifica se um token de autenticação é válido
 * @param token Token a ser verificado
 * @param type Tipo do token
 * @returns Objeto com usuário associado se token válido, null se inválido
 */
const verifyAuthToken = (token, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar token no banco de dados
        const authToken = yield client_1.prisma.authToken.findFirst({
            where: {
                token,
                type,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        });
        if (!authToken) {
            return null;
        }
        return {
            userId: authToken.userId,
            user: authToken.user
        };
    }
    catch (error) {
        logger_1.logger.error(`Erro ao verificar token de ${type}:`, error);
        return null;
    }
});
exports.verifyAuthToken = verifyAuthToken;
/**
 * Marca um token como utilizado
 * @param token Token a ser marcado
 */
const markTokenAsUsed = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client_1.prisma.authToken.update({
            where: { token },
            data: { used: true }
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao marcar token como usado:', error);
        throw error;
    }
});
exports.markTokenAsUsed = markTokenAsUsed;
