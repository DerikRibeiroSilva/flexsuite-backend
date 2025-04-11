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
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.login = exports.registerUser = exports.registerCompany = void 0;
const zod_1 = require("zod");
const authService = __importStar(require("../services/authService"));
const logger_1 = require("../utils/logger");
// Validação para criação de empresa e usuário admin
const registerCompanySchema = zod_1.z.object({
    company: zod_1.z.object({
        name: zod_1.z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres').max(100),
        planId: zod_1.z.string().uuid().optional()
    }),
    user: zod_1.z.object({
        name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
        email: zod_1.z.string().email('E-mail inválido'),
        password: zod_1.z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
        phone: zod_1.z.string().min(10, 'Telefone inválido')
    })
});
// Validação para criação de usuário
const registerUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(8, 'A senha deve ter no mínimo 8 caracteres').optional(),
    withPassword: zod_1.z.boolean().default(false),
    phone: zod_1.z.string().min(10, 'Telefone inválido'),
    customerCompanyId: zod_1.z.string().uuid('ID da empresa inválido'),
    isAdmin: zod_1.z.boolean().optional()
}).refine(data => {
    // Se withPassword=true, a senha deve estar presente
    return !data.withPassword || (data.withPassword && !!data.password);
}, {
    message: "A senha é obrigatória quando withPassword=true",
    path: ["password"]
});
// Validação para login
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória')
});
// Validação para redefinição de senha
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token é obrigatório'),
    password: zod_1.z.string().min(8, 'A senha deve ter no mínimo 8 caracteres')
});
// Validação para alteração de senha
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: zod_1.z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres')
});
/**
 * Registro de nova empresa com usuário admin
 */
const registerCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = registerCompanySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validationResult.error.errors
            });
            return;
        }
        const { company, user } = validationResult.data;
        const result = yield authService.registerCompany(company, user);
        res.status(201).json({
            success: true,
            message: 'Empresa e usuário admin registrados com sucesso',
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao registrar empresa:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao registrar empresa'
        });
    }
});
exports.registerCompany = registerCompany;
/**
 * Registro de novo usuário
 */
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = registerUserSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validationResult.error.errors
            });
            return;
        }
        const userData = validationResult.data;
        logger_1.logger.info(`Requisição para registro de usuário recebida: withPassword=${userData.withPassword}, email=${userData.email}`);
        const result = yield authService.registerUser(userData);
        res.status(201).json({
            success: true,
            message: userData.withPassword
                ? 'Usuário registrado com sucesso. Será enviado um e-mail de verificação.'
                : 'Usuário registrado com sucesso. Será enviado um e-mail para definição de senha.',
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao registrar usuário:', error);
        const statusCode = error.message.includes('Empresa não encontrada') ||
            error.message.includes('E-mail já está em uso')
            ? 400
            : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Erro ao registrar usuário'
        });
    }
});
exports.registerUser = registerUser;
/**
 * Login de usuário
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validationResult.error.errors
            });
            return;
        }
        const loginData = validationResult.data;
        const result = yield authService.login(loginData);
        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao realizar login:', error);
        res.status(401).json({
            success: false,
            message: 'Credenciais inválidas'
        });
    }
});
exports.login = login;
/**
 * Verificação de e-mail
 */
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Token não fornecido'
            });
            return;
        }
        const success = yield authService.verifyEmail(token);
        if (success) {
            res.status(200).json({
                success: true,
                message: 'E-mail verificado com sucesso'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Erro ao verificar e-mail:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao verificar e-mail'
        });
    }
});
exports.verifyEmail = verifyEmail;
/**
 * Solicitação de redefinição de senha
 */
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'E-mail não fornecido'
            });
            return;
        }
        yield authService.requestPasswordReset(email);
        // Sempre retornamos sucesso para não revelar se o e-mail existe ou não
        res.status(200).json({
            success: true,
            message: 'Se o e-mail estiver registrado, você receberá um link para redefinir sua senha'
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao solicitar redefinição de senha:', error);
        // Não revelamos o erro real para o cliente por segurança
        res.status(200).json({
            success: true,
            message: 'Se o e-mail estiver registrado, você receberá um link para redefinir sua senha'
        });
    }
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * Redefinição de senha
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = resetPasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validationResult.error.errors
            });
            return;
        }
        const { token, password } = validationResult.data;
        const success = yield authService.resetPassword(token, password);
        if (success) {
            res.status(200).json({
                success: true,
                message: 'Senha redefinida com sucesso'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Erro ao redefinir senha:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao redefinir senha'
        });
    }
});
exports.resetPassword = resetPassword;
/**
 * Alteração de senha do usuário logado
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validationResult = changePasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validationResult.error.errors
            });
            return;
        }
        // O middleware de autenticação deve ter adicionado o usuário à requisição
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
            return;
        }
        const { currentPassword, newPassword } = validationResult.data;
        const success = yield authService.changePassword(userId, currentPassword, newPassword);
        if (success) {
            res.status(200).json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Erro ao alterar senha'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Erro ao alterar senha:', error);
        const statusCode = error.message === 'Senha atual incorreta' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Erro ao alterar senha'
        });
    }
});
exports.changePassword = changePassword;
