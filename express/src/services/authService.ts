import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import * as tokenService from './tokenService';
import * as emailService from './emailService';

/**
 * Interface para criação de usuário
 */
interface CreateUserInput {
    name: string;
    email: string;
    password?: string;
    withPassword: boolean;
    phone: string;
    customerCompanyId: string;
    isAdmin?: boolean;
}

/**
 * Interface para criação de empresa cliente
 */
interface CreateCompanyInput {
    name: string;
    planId?: string;
}

/**
 * Interface para entrada de login
 */
interface LoginInput {
    email: string;
    password: string;
}

/**
 * Interface para resposta de autenticação
 */
interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        customerCompanyId: string;
        customerCompany?: {
            id: string;
            name: string;
        };
    };
    token: string;
    refreshToken: string;
}

/**
 * Função para registrar uma nova empresa e usuário admin
 */
export const registerCompany = async (
    companyData: CreateCompanyInput,
    userData: Omit<CreateUserInput, 'customerCompanyId' | 'withPassword'> & { password: string }
): Promise<AuthResponse> => {
    try {
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Definir variáveis com valores iniciais para garantir que não sejam undefined
        let companyResult;
        let userResult;
        let verificationTokenResult = '';

        try {
            // Abordagem sem transação explícita para simplificar
            // Criar empresa
            companyResult = await prisma.customerCompany.create({
                data: {
                    name: companyData.name,
                    planId: companyData.planId,
                    status: 'ATIVO',
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias de trial
                }
            });

            // Criar usuário admin
            userResult = await prisma.user.create({
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
            verificationTokenResult = await tokenService.generateAuthToken(userResult.id, 'email_verification');
        } catch (error) {
            // Em caso de erro, tenta fazer a limpeza manual (não é tão robusto quanto uma transação, mas funciona)
            if (companyResult && companyResult.id) {
                try {
                    await prisma.customerCompany.delete({
                        where: { id: companyResult.id }
                    });
                } catch (cleanupError) {
                    logger.error('Erro ao limpar empresa após falha:', cleanupError);
                }
            }
            throw error;
        }

        // Verificar se tudo foi criado corretamente
        if (!companyResult || !userResult) {
            throw new Error('Erro ao criar empresa ou usuário');
        }

        // Enviar e-mail de verificação
        await emailService.sendVerificationEmail(
            userResult.email,
            userResult.name,
            verificationTokenResult
        );

        // Enviar e-mail de boas-vindas
        await emailService.sendWelcomeEmail(
            userResult.email,
            userResult.name,
            companyResult.name
        );

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
    } catch (error) {
        logger.error('Erro ao registrar empresa:', error);
        throw error;
    }
};

/**
 * Função para registrar um novo usuário em uma empresa existente
 */
export const registerUser = async (userData: CreateUserInput): Promise<AuthResponse> => {
    try {
        // Verificar se a empresa existe
        const company = await prisma.customerCompany.findUnique({
            where: { id: userData.customerCompanyId }
        });

        if (!company) {
            throw new Error('Empresa não encontrada');
        }

        // Verificar se o email já está em uso
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email.toLowerCase() }
        });

        if (existingUser) {
            throw new Error('E-mail já está em uso');
        }

        let hashedPassword: string;

        // Gerar uma senha aleatória temporária se não for fornecida
        if (!userData.withPassword || !userData.password) {
            // Gerar uma senha aleatória que nunca será utilizada
            const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2);
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(tempPassword, salt);
            logger.info(`Criando usuário ${userData.email} SEM senha. Será enviado e-mail para definição de senha.`);
        } else {
            // Hash da senha fornecida
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(userData.password, salt);
            logger.info(`Criando usuário ${userData.email} COM senha. Será enviado e-mail de verificação.`);
        }

        // Criar usuário
        const user = await prisma.user.create({
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
            resetToken = await tokenService.generateAuthToken(user.id, 'password_reset');

            // Enviar e-mail com link para definição de senha
            await emailService.sendPasswordResetEmail(
                user.email,
                user.name,
                resetToken
            );
            logger.info(`E-mail de definição de senha enviado para ${user.email}`);
        } else {
            // Se criado com senha, enviar e-mail de verificação normal
            verificationToken = await tokenService.generateAuthToken(user.id, 'email_verification');

            // Enviar e-mail de verificação
            await emailService.sendVerificationEmail(
                user.email,
                user.name,
                verificationToken
            );
            logger.info(`E-mail de verificação enviado para ${user.email}`);
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
    } catch (error) {
        logger.error('Erro ao registrar usuário:', error);
        throw error;
    }
};

/**
 * Função para realizar login de usuário
 */
export const login = async (loginData: LoginInput): Promise<AuthResponse> => {
    try {
        // Buscar usuário pelo e-mail
        const user = await prisma.user.findUnique({
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
        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }

        // Atualizar último login
        await prisma.user.update({
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
    } catch (error) {
        logger.error('Erro ao realizar login:', error);
        throw error;
    }
};

/**
 * Função para verificar e-mail de usuário
 */
export const verifyEmail = async (token: string): Promise<boolean> => {
    try {
        // Verificar token
        const verification = await tokenService.verifyAuthToken(token, 'email_verification');

        if (!verification) {
            return false;
        }

        // Atualizar status de verificação do usuário
        await prisma.user.update({
            where: { id: verification.userId },
            data: { isVerified: true }
        });

        // Marcar token como usado
        await tokenService.markTokenAsUsed(token);

        return true;
    } catch (error) {
        logger.error('Erro ao verificar email:', error);
        return false;
    }
};

/**
 * Função para solicitar redefinição de senha
 */
export const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
        // Buscar usuário pelo e-mail
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Não informamos ao cliente que o usuário não existe por questões de segurança
            return true;
        }

        // Gerar token de redefinição
        const resetToken = await tokenService.generateAuthToken(user.id, 'password_reset');

        // Enviar e-mail com link para redefinição
        await emailService.sendPasswordResetEmail(
            user.email,
            user.name,
            resetToken
        );

        return true;
    } catch (error) {
        logger.error('Erro ao solicitar redefinição de senha:', error);
        throw error;
    }
};

/**
 * Função para redefinir senha
 */
export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
        // Verificar token
        const verification = await tokenService.verifyAuthToken(token, 'password_reset');

        if (!verification) {
            return false;
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualizar senha do usuário
        await prisma.user.update({
            where: { id: verification.userId },
            data: { password: hashedPassword }
        });

        // Marcar token como usado
        await tokenService.markTokenAsUsed(token);

        return true;
    } catch (error) {
        logger.error('Erro ao redefinir senha:', error);
        return false;
    }
};

/**
 * Atualizar a senha do usuário logado
 */
export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<boolean> => {
    try {
        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar senha atual
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new Error('Senha atual incorreta');
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualizar senha
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return true;
    } catch (error) {
        logger.error('Erro ao alterar senha:', error);
        throw error;
    }
}; 