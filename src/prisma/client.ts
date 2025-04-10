import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Interfaces para tipagem dos eventos de log
interface QueryEvent {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
}

interface LogEvent {
    timestamp: Date;
    message: string;
    target: string;
}

// Criação do cliente Prisma
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            {
                emit: 'event',
                level: 'error',
            },
            {
                emit: 'event',
                level: 'info',
            },
            {
                emit: 'event',
                level: 'warn',
            },
        ],
    });
};

// Verificação para ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
    // Event listener para Queries
    prismaClientSingleton().$on('query', (e: QueryEvent) => {
        logger.debug('Query', {
            query: e.query,
            duration: e.duration,
        });
    });

    // Event listener para Erros
    prismaClientSingleton().$on('error', (e: LogEvent) => {
        logger.error('Prisma Error', e);
    });

    // Event listener para Informações
    prismaClientSingleton().$on('info', (e: LogEvent) => {
        logger.info('Prisma Info', e);
    });

    // Event listener para Avisos
    prismaClientSingleton().$on('warn', (e: LogEvent) => {
        logger.warn('Prisma Warning', e);
    });
}

// Configuração para Next.js (se necessário)
const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

// Exportação do cliente Prisma (singleton)
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;