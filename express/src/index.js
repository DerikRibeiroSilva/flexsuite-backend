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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Rotas da API
app.use(routes_1.default);
// Rota de status da API
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando!' });
});
// Middleware para tratar rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        app.listen(process.env.PORT, () => {
            logger_1.logger.info(`Servidor rodando na porta ${process.env.PORT} em modo ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
});
process.on('SIGINT', () => {
    logger_1.logger.info('Servidor encerrado');
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('Servidor encerrado');
    process.exit(0);
});
// Iniciar o servidor
startServer();
