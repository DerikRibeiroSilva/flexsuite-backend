"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
// Criação do cliente Prisma
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
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
    prismaClientSingleton().$on('query', (e) => {
        logger_1.logger.debug('Query', {
            query: e.query,
            duration: e.duration,
        });
    });
    // Event listener para Erros
    prismaClientSingleton().$on('error', (e) => {
        logger_1.logger.error('Prisma Error', e);
    });
    // Event listener para Informações
    prismaClientSingleton().$on('info', (e) => {
        logger_1.logger.info('Prisma Info', e);
    });
    // Event listener para Avisos
    prismaClientSingleton().$on('warn', (e) => {
        logger_1.logger.warn('Prisma Warning', e);
    });
}
// Configuração para Next.js (se necessário)
const globalForPrisma = globalThis;
// Exportação do cliente Prisma (singleton)
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
