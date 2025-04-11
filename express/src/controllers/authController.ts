import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { logger } from '../utils/logger';

// Validação para criação de empresa e usuário admin
const registerCompanySchema = z.object({
    company: z.object({
        name: z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres').max(100),
        planId: z.string().uuid().optional()
    }),
    user: z.object({
        name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
        email: z.string().email('E-mail inválido'),
        password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
        phone: z.string().min(10, 'Telefone inválido')
    })
});

// Validação para criação de usuário
const registerUserSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres').optional(),
    withPassword: z.boolean().default(false),
    phone: z.string().min(10, 'Telefone inválido'),
    customerCompanyId: z.string().uuid('ID da empresa inválido'),
    isAdmin: z.boolean().optional()
}).refine(data => {
    // Se withPassword=true, a senha deve estar presente
    return !data.withPassword || (data.withPassword && !!data.password);
}, {
    message: "A senha é obrigatória quando withPassword=true",
    path: ["password"]
});

// Validação para login
const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
});

// Validação para redefinição de senha
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres')
});

// Validação para alteração de senha
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres')
});

/**
 * Registro de nova empresa com usuário admin
 */
export const registerCompany = async (req: Request, res: Response): Promise<void> => {
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

        const result = await authService.registerCompany(company, user);

        res.status(201).json({
            success: true,
            message: 'Empresa e usuário admin registrados com sucesso',
            data: result
        });
    } catch (error: any) {
        logger.error('Erro ao registrar empresa:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao registrar empresa'
        });
    }
};

/**
 * Registro de novo usuário
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
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
        logger.info(`Requisição para registro de usuário recebida: withPassword=${userData.withPassword}, email=${userData.email}`);

        const result = await authService.registerUser(userData);

        res.status(201).json({
            success: true,
            message: userData.withPassword
                ? 'Usuário registrado com sucesso. Será enviado um e-mail de verificação.'
                : 'Usuário registrado com sucesso. Será enviado um e-mail para definição de senha.',
            data: result
        });
    } catch (error: any) {
        logger.error('Erro ao registrar usuário:', error);

        const statusCode = error.message.includes('Empresa não encontrada') ||
            error.message.includes('E-mail já está em uso')
            ? 400
            : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Erro ao registrar usuário'
        });
    }
};

/**
 * Login de usuário
 */
export const login = async (req: Request, res: Response): Promise<void> => {
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

        const result = await authService.login(loginData);

        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            data: result
        });
    } catch (error: any) {
        logger.error('Erro ao realizar login:', error);

        res.status(401).json({
            success: false,
            message: 'Credenciais inválidas'
        });
    }
};

/**
 * Verificação de e-mail
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Token não fornecido'
            });
            return;
        }

        const success = await authService.verifyEmail(token);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'E-mail verificado com sucesso'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    } catch (error: any) {
        logger.error('Erro ao verificar e-mail:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao verificar e-mail'
        });
    }
};

/**
 * Solicitação de redefinição de senha
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                message: 'E-mail não fornecido'
            });
            return;
        }

        await authService.requestPasswordReset(email);

        // Sempre retornamos sucesso para não revelar se o e-mail existe ou não
        res.status(200).json({
            success: true,
            message: 'Se o e-mail estiver registrado, você receberá um link para redefinir sua senha'
        });
    } catch (error: any) {
        logger.error('Erro ao solicitar redefinição de senha:', error);

        // Não revelamos o erro real para o cliente por segurança
        res.status(200).json({
            success: true,
            message: 'Se o e-mail estiver registrado, você receberá um link para redefinir sua senha'
        });
    }
};

/**
 * Redefinição de senha
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
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

        const success = await authService.resetPassword(token, password);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Senha redefinida com sucesso'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    } catch (error: any) {
        logger.error('Erro ao redefinir senha:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao redefinir senha'
        });
    }
};

/**
 * Alteração de senha do usuário logado
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
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
        const userId = req.user?.sub;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
            return;
        }

        const { currentPassword, newPassword } = validationResult.data;

        const success = await authService.changePassword(userId, currentPassword, newPassword);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erro ao alterar senha'
            });
        }
    } catch (error: any) {
        logger.error('Erro ao alterar senha:', error);

        const statusCode = error.message === 'Senha atual incorreta' ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Erro ao alterar senha'
        });
    }
}; 