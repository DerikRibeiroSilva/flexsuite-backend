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
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
let transporter;
// Inicialização do transporte de e-mail
const initializeTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Configuração para ambiente de desenvolvimento (utiliza Ethereal para teste)
        if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
            // Criar conta de teste no Ethereal
            const testAccount = yield nodemailer_1.default.createTestAccount();
            logger_1.logger.info('Criada conta de teste de e-mail no Ethereal:');
            logger_1.logger.info(`- Email: ${testAccount.user}`);
            logger_1.logger.info(`- Senha: ${testAccount.pass}`);
            // Criar transportador Ethereal
            transporter = nodemailer_1.default.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            logger_1.logger.info('Usando Ethereal Email para testes de e-mail em desenvolvimento');
        }
        else {
            // Configuração para ambiente de produção ou desenvolvimento configurado
            transporter = nodemailer_1.default.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: Number(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER || '',
                    pass: process.env.EMAIL_PASS || ''
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            logger_1.logger.info(`Configurado servidor SMTP: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
        }
        // Verificar conexão
        yield transporter.verify();
        logger_1.logger.info('Conexão SMTP estabelecida com sucesso');
    }
    catch (error) {
        logger_1.logger.error('Erro ao configurar servidor SMTP:', error);
        // Fallback para console em caso de erro
        logger_1.logger.info('Configurando fallback de email para desenvolvimento');
        // Criar transportador mock que apenas registra no console
        transporter = {
            sendMail: (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
                logger_1.logger.info('---- E-MAIL SIMULADO ----');
                logger_1.logger.info(`Para: ${mailOptions.to}`);
                logger_1.logger.info(`Assunto: ${mailOptions.subject}`);
                logger_1.logger.info(`Conteúdo: ${mailOptions.text || mailOptions.html}`);
                logger_1.logger.info('------------------------');
                return {
                    messageId: `mock_${Date.now()}`
                };
            })
        };
    }
});
// Inicializar o transportador quando o serviço for importado
if (process.env.NODE_ENV !== 'test') {
    initializeTransporter();
}
/**
 * Envia um e-mail usando as configurações definidas
 * @param options Opções do e-mail a ser enviado
 * @returns Informações do envio
 */
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, subject, html, text } = options;
        const from = options.from || `${process.env.EMAIL_FROM_NAME || 'FlexSuite'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
        logger_1.logger.info(`Enviando e-mail para ${to}`);
        // Certificar-se de que o transportador está inicializado
        if (!transporter) {
            yield initializeTransporter();
        }
        const info = yield transporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });
        // Se estiver usando Ethereal, mostrar URL de visualização
        if (info.messageId && info.messageId.includes('ethereal')) {
            logger_1.logger.info(`URL de visualização: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        }
        logger_1.logger.info(`E-mail enviado: ${info.messageId}`);
        return info;
    }
    catch (error) {
        logger_1.logger.error('Erro ao enviar e-mail:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
/**
 * Envia um e-mail de verificação com link de ativação
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param verificationToken Token de verificação
 */
const sendVerificationEmail = (to, name, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Bem-vindo ao FlexSuite! Para verificar sua conta, clique no botão abaixo:</p>
        <p style="text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar minha conta</a>
        </p>
        <p>Ou copie e cole o link a seguir no seu navegador:</p>
        <p>${verificationUrl}</p>
        <p>Este link expirará em 24 horas.</p>
        <p>Se você não solicitou esta verificação, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe FlexSuite</p>
    </div>
    `;
    yield (0, exports.sendEmail)({
        to,
        subject: 'Verifique sua conta FlexSuite',
        html,
        text: `Olá ${name}, para verificar sua conta, acesse o link: ${verificationUrl}`
    });
});
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Envia um e-mail de redefinição de senha
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param resetToken Token de redefinição de senha
 */
const sendPasswordResetEmail = (to, name, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir minha senha</a>
        </p>
        <p>Ou copie e cole o link a seguir no seu navegador:</p>
        <p>${resetUrl}</p>
        <p>Este link expirará em 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este e-mail ou entre em contato conosco.</p>
        <p>Atenciosamente,<br>Equipe FlexSuite</p>
    </div>
    `;
    yield (0, exports.sendEmail)({
        to,
        subject: 'Redefinição de Senha - FlexSuite',
        html,
        text: `Olá ${name}, para redefinir sua senha, acesse o link: ${resetUrl}`
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Envia um e-mail de boas-vindas após cadastro
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param companyName Nome da empresa
 */
const sendWelcomeEmail = (to, name, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo ao FlexSuite, ${name}!</h2>
        <p>Sua conta para <strong>${companyName}</strong> foi criada com sucesso!</p>
        <p>Estamos muito felizes em ter você como cliente. Nossa plataforma oferece uma gama de ferramentas para ajudar a gerenciar seus projetos, clientes e fornecedores.</p>
        <p style="text-align: center;">
            <a href="${baseUrl}/login" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar minha conta</a>
        </p>
        <p>Se tiver dúvidas ou precisar de ajuda, não hesite em contatar nosso suporte.</p>
        <p>Atenciosamente,<br>Equipe FlexSuite</p>
    </div>
    `;
    yield (0, exports.sendEmail)({
        to,
        subject: 'Bem-vindo ao FlexSuite!',
        html,
        text: `Bem-vindo ao FlexSuite, ${name}! Sua conta para ${companyName} foi criada com sucesso. Acesse: ${baseUrl}/login`
    });
});
exports.sendWelcomeEmail = sendWelcomeEmail;
