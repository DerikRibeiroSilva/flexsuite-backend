import express, { Request, Response } from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rotas da API
app.use(routes);

// Rota de status da API
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API funcionando!' });
});

// Middleware para tratar rotas não encontradas
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

const startServer = async () => {
    try {
        app.listen(process.env.PORT, () => {
            logger.info(`Servidor rodando na porta ${process.env.PORT} em modo ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        logger.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => {
    logger.info('Servidor encerrado');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Servidor encerrado');
    process.exit(0);
});

// Iniciar o servidor
startServer();