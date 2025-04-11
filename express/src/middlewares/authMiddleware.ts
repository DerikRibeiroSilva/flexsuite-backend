import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/tokenService';
import { logger } from '../utils/logger';

// Extender interface do Express Request para incluir o usuário
declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email: string;
                name?: string;
                isAdmin?: boolean;
                customerCompanyId?: string;
                [key: string]: any;
            };
        }
    }
}

/**
 * Middleware para verificar autenticação
 * Verifica se o token JWT é válido e adiciona as informações do usuário à requisição
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        const payload = verifyToken(token);

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
    } catch (error) {
        logger.error('Erro no middleware de autenticação:', error);
        res.status(401).json({
            success: false,
            message: 'Erro de autenticação'
        });
    }
};

/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser usado após o middleware de autenticação
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

