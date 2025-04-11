"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.login = exports.registerUser = exports.registerCompany = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("../prisma/client");
const logger_1 = require("../utils/logger");
const tokenService = __importStar(require("./tokenService"));
const emailService = __importStar(require("./emailService"));
/**
 * Função para registrar uma nova empresa e usuário admin
 */
const registerCompany = (companyData, userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Hash da senha
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
        // Definir variáveis com valores iniciais para garantir que não sejam undefined
        let companyResult;
        let userResult;
        let verificationTokenResult = '';
        try {
            // Abordagem sem transação explícita para simplificar
            // Criar empresa
            companyResult = yield client_1.prisma.customerCompany.create({
                data: {
                    name: companyData.name,
                    planId: companyData.planId,
                    status: 'ATIVO',
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias de trial
                }
            });
            // Criar usuário admin
            userResult = yield client_1.prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email.toLowerCase(),
                    password: hashedPassword,
                    phone: userData.phone,
                    customerCompanyId: companyResult.id,
                    isAdmin: true,
                    isVerified: false,
                    isActive: true
                }
            });
            // Gerar token de verificação
            verificationTokenResult = yield tokenService.generateAuthToken(userResult.id, 'email_verification');
        }
        catch (error) {
            // Em caso de erro, tenta fazer a limpeza manual (não é tão robusto quanto uma transação, mas funciona)
            if (companyResult && companyResult.id) {
                try {
                    yield client_1.prisma.customerCompany.delete({
                        where: { id: companyResult.id }
                    });
                }
                catch (cleanupError) {
                    logger_1.logger.error('Erro ao limpar empresa após falha:', cleanupError);
                }
            }
            throw error;
        }
        // Verificar se tudo foi criado corretamente
        if (!companyResult || !userResult) {
            throw new Error('Erro ao criar empresa ou usuário');
        }
        // Enviar e-mail de verificação
        yield emailService.sendVerificationEmail(userResult.email, userResult.name, verificationTokenResult);
        // Enviar e-mail de boas-vindas
        yield emailService.sendWelcomeEmail(userResult.email, userResult.name, companyResult.name);
        // Gerar tokens de autenticação
        const token = tokenService.generateToken({
            sub: userResult.id,
            email: userResult.email,
            name: userResult.name,
            isAdmin: userResult.isAdmin,
            customerCompanyId: companyResult.id
        });
        const refreshToken = tokenService.generateRefreshToken(userResult.id);
        return {
            user: {
                id: userResult.id,
                name: userResult.name,
                email: userResult.email,
                isAdmin: userResult.isAdmin || false,
                customerCompanyId: companyResult.id,
                customerCompany: {
                    id: companyResult.id,
                    name: companyResult.name
                }
            },
            token,
            refreshToken
        };
    }
    catch (error) {
        logger_1.logger.error('Erro ao registrar empresa:', error);
        throw error;
    }
});
exports.registerCompany = registerCompany;
/**
 * Função para registrar um novo usuário em uma empresa existente
 */
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verificar se a empresa existe
        const company = yield client_1.prisma.customerCompany.findUnique({
            where: { id: userData.customerCompanyId }
        });
        if (!company) {
            throw new Error('Empresa não encontrada');
        }
        // Verificar se o email já está em uso
        const existingUser = yield client_1.prisma.user.findUnique({
            where: { email: userData.email.toLowerCase() }
        });
        if (existingUser) {
            throw new Error('E-mail já está em uso');
        }
        let hashedPassword;
        // Gerar uma senha aleatória temporária se não for fornecida
        if (!userData.withPassword || !userData.password) {
            // Gerar uma senha aleatória que nunca será utilizada
            const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2);
            const salt = yield bcrypt_1.default.genSalt(10);
            hashedPassword = yield bcrypt_1.default.hash(tempPassword, salt);
            logger_1.logger.info(`Criando usuário ${userData.email} SEM senha. Será enviado e-mail para definição de senha.`);
        }
        else {
            // Hash da senha fornecida
            const salt = yield bcrypt_1.default.genSalt(10);
            hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
            logger_1.logger.info(`Criando usuário ${userData.email} COM senha. Será enviado e-mail de verificação.`);
        }
        // Criar usuário
        const user = yield client_1.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                phone: userData.phone,
                customerCompanyId: userData.customerCompanyId,
                isAdmin: userData.isAdmin || false,
                isVerified: userData.withPassword, // Se criado com senha, já é considerado verificado
                isActive: true
            }
        });
        let verificationToken = "";
        let resetToken = "";
        // Se o usuário for criado sem senha, enviar e-mail para definição de senha
        if (!userData.withPassword) {
            // Gerar token de redefinição de senha
            resetToken = yield tokenService.generateAuthToken(user.id, 'password_reset');
            // Enviar e-mail com link para definição de senha
            yield emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
            logger_1.logger.info(`E-mail de definição de senha enviado para ${user.email}`);
        }
        else {
            // Se criado com senha, enviar e-mail de verificação normal
            verificationToken = yield tokenService.generateAuthToken(user.id, 'email_verification');
            // Enviar e-mail de verificação
            yield emailService.sendVerificationEmail(user.email, user.name, verificationToken);
            logger_1.logger.info(`E-mail de verificação enviado para ${user.email}`);
        }
        // Gerar tokens de autenticação
        const token = tokenService.generateToken({
            sub: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            customerCompanyId: user.customerCompanyId
        });
        const refreshToken = tokenService.generateRefreshToken(user.id);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                customerCompanyId: user.customerCompanyId,
                customerCompany: {
                    id: company.id,
                    name: company.name
                }
            },
            token,
            refreshToken
        };
    }
    catch (error) {
        logger_1.logger.error('Erro ao registrar usuário:', error);
        throw error;
    }
});
exports.registerUser = registerUser;
/**
 * Função para realizar login de usuário
 */
const login = (loginData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar usuário pelo e-mail
        const user = yield client_1.prisma.user.findUnique({
            where: { email: loginData.email.toLowerCase() },
            include: {
                customerCompany: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        trialEndsAt: true
                    }
                }
            }
        });
        if (!user) {
            throw new Error('Credenciais inválidas');
        }
        // Verificar se o usuário está ativo
        if (!user.isActive) {
            throw new Error('Conta desativada. Entre em contato com o suporte.');
        }
        // Verificar se a empresa está ativa
        if (user.customerCompany.status === 'INATIVO') {
            throw new Error('Empresa desativada. Entre em contato com o suporte.');
        }
        // Verificar senha
        const isPasswordValid = yield bcrypt_1.default.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }
        // Atualizar último login
        yield client_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // Gerar tokens de autenticação
        const token = tokenService.generateToken({
            sub: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            customerCompanyId: user.customerCompanyId
        });
        const refreshToken = tokenService.generateRefreshToken(user.id);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                customerCompanyId: user.customerCompanyId,
                customerCompany: {
                    id: user.customerCompany.id,
                    name: user.customerCompany.name
                }
            },
            token,
            refreshToken
        };
    }
    catch (error) {
        logger_1.logger.error('Erro ao realizar login:', error);
        throw error;
    }
});
exports.login = login;
/**
 * Função para verificar e-mail de usuário
 */
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verificar token
        const verification = yield tokenService.verifyAuthToken(token, 'email_verification');
        if (!verification) {
            return false;
        }
        // Atualizar status de verificação do usuário
        yield client_1.prisma.user.update({
            where: { id: verification.userId },
            data: { isVerified: true }
        });
        // Marcar token como usado
        yield tokenService.markTokenAsUsed(token);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Erro ao verificar email:', error);
        return false;
    }
});
exports.verifyEmail = verifyEmail;
/**
 * Função para solicitar redefinição de senha
 */
const requestPasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar usuário pelo e-mail
        const user = yield client_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!user) {
            // Não informamos ao cliente que o usuário não existe por questões de segurança
            return true;
        }
        // Gerar token de redefinição
        const resetToken = yield tokenService.generateAuthToken(user.id, 'password_reset');
        // Enviar e-mail com link para redefinição
        yield emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Erro ao solicitar redefinição de senha:', error);
        throw error;
    }
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * Função para redefinir senha
 */
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verificar token
        const verification = yield tokenService.verifyAuthToken(token, 'password_reset');
        if (!verification) {
            return false;
        }
        // Hash da nova senha
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        // Atualizar senha do usuário
        yield client_1.prisma.user.update({
            where: { id: verification.userId },
            data: { password: hashedPassword }
        });
        // Marcar token como usado
        yield tokenService.markTokenAsUsed(token);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Erro ao redefinir senha:', error);
        return false;
    }
});
exports.resetPassword = resetPassword;
/**
 * Atualizar a senha do usuário logado
 */
const changePassword = (userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar usuário
        const user = yield client_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        // Verificar senha atual
        const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Senha atual incorreta');
        }
        // Hash da nova senha
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        // Atualizar senha
        yield client_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return true;
    }
    catch (error) {
        logger_1.logger.error('Erro ao alterar senha:', error);
        throw error;
    }
});
exports.changePassword = changePassword;
