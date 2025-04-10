import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

// Chaves e configurações
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-forte';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Interface para payload do token
interface TokenPayload {
    sub: string;
    email: string;
    name?: string;
    isAdmin?: boolean;
    customerCompanyId?: string;
    [key: string]: any;
}

// Interface para opções de JWT
interface JwtOptions {
    expiresIn: string | number;
}

/**
 * Gera um token JWT para o usuário
 * @param payload Dados para incluir no token
 * @returns Token JWT assinado
 */
export const generateToken = (payload: TokenPayload): string => {
    try {
        // Usar abordagem diferente para evitar problemas com TypeScript
        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );
        return token;
    } catch (error) {
        logger.error('Erro ao gerar token JWT:', error);
        throw error;
    }
};

/**
 * Verifica e decodifica um token JWT
 * @param token Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        logger.error('Erro ao verificar token JWT:', error);
        return null;
    }
};

/**
 * Gera um token de atualização (refresh token)
 * @param userId ID do usuário
 * @returns Token JWT com prazo de expiração maior
 */
export const generateRefreshToken = (userId: string): string => {
    try {
        const token = jwt.sign(
            { sub: userId, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
        );
        return token;
    } catch (error) {
        logger.error('Erro ao gerar refresh token:', error);
        throw error;
    }
};

/**
 * Gera um token aleatório para verificação de e-mail ou redefinição de senha
 * @param userId ID do usuário
 * @param type Tipo do token (password_reset, email_verification)
 * @param expiresInHours Horas até a expiração
 * @returns Token de verificação
 */
export const generateAuthToken = async (
    userId: string,
    type: 'password_reset' | 'email_verification',
    expiresInHours: number = type === 'password_reset' ? 1 : 24
): Promise<string> => {
    try {
        // Gerar token aleatório
        const token = crypto.randomBytes(32).toString('hex');

        // Calcular data de expiração
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        // Salvar token no banco de dados
        await prisma.authToken.create({
            data: {
                token,
                userId,
                type,
                expiresAt,
                used: false
            }
        });

        return token;
    } catch (error) {
        logger.error(`Erro ao gerar token de ${type}:`, error);
        throw error;
    }
};

/**
 * Verifica se um token de autenticação é válido
 * @param token Token a ser verificado
 * @param type Tipo do token
 * @returns Objeto com usuário associado se token válido, null se inválido
 */
export const verifyAuthToken = async (
    token: string,
    type: 'password_reset' | 'email_verification'
): Promise<{ userId: string; user: any } | null> => {
    try {
        // Buscar token no banco de dados
        const authToken = await prisma.authToken.findFirst({
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
    } catch (error) {
        logger.error(`Erro ao verificar token de ${type}:`, error);
        return null;
    }
};

/**
 * Marca um token como utilizado
 * @param token Token a ser marcado
 */
export const markTokenAsUsed = async (token: string): Promise<void> => {
    try {
        await prisma.authToken.update({
            where: { token },
            data: { used: true }
        });
    } catch (error) {
        logger.error('Erro ao marcar token como usado:', error);
        throw error;
    }
};