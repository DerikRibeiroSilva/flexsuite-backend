import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter;

// Inicialização do transporte de e-mail
const initializeTransporter = async (): Promise<void> => {
    try {
        // Configuração para ambiente de desenvolvimento (utiliza Ethereal para teste)
        if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
            // Criar conta de teste no Ethereal
            const testAccount = await nodemailer.createTestAccount();

            logger.info('Criada conta de teste de e-mail no Ethereal:');
            logger.info(`- Email: ${testAccount.user}`);
            logger.info(`- Senha: ${testAccount.pass}`);

            // Criar transportador Ethereal
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            logger.info('Usando Ethereal Email para testes de e-mail em desenvolvimento');
        } else {
            // Configuração para ambiente de produção ou desenvolvimento configurado
            transporter = nodemailer.createTransport({
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

            logger.info(`Configurado servidor SMTP: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
        }

        // Verificar conexão
        await transporter.verify();
        logger.info('Conexão SMTP estabelecida com sucesso');
    } catch (error) {
        logger.error('Erro ao configurar servidor SMTP:', error);

        // Fallback para console em caso de erro
        logger.info('Configurando fallback de email para desenvolvimento');

        // Criar transportador mock que apenas registra no console
        transporter = {
            sendMail: async (mailOptions: nodemailer.SendMailOptions) => {
                logger.info('---- E-MAIL SIMULADO ----');
                logger.info(`Para: ${mailOptions.to}`);
                logger.info(`Assunto: ${mailOptions.subject}`);
                logger.info(`Conteúdo: ${mailOptions.text || mailOptions.html}`);
                logger.info('------------------------');

                return {
                    messageId: `mock_${Date.now()}`
                };
            }
        } as unknown as nodemailer.Transporter;
    }
};

// Inicializar o transportador quando o serviço for importado
if (process.env.NODE_ENV !== 'test') {
    initializeTransporter();
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
    text?: string;
}

/**
 * Envia um e-mail usando as configurações definidas
 * @param options Opções do e-mail a ser enviado
 * @returns Informações do envio
 */
export const sendEmail = async (options: EmailOptions): Promise<nodemailer.SentMessageInfo> => {
    try {
        const { to, subject, html, text } = options;
        const from = options.from || `${process.env.EMAIL_FROM_NAME || 'FlexSuite'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

        logger.info(`Enviando e-mail para ${to}`);

        // Certificar-se de que o transportador está inicializado
        if (!transporter) {
            await initializeTransporter();
        }

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });

        // Se estiver usando Ethereal, mostrar URL de visualização
        if (info.messageId && info.messageId.includes('ethereal')) {
            logger.info(`URL de visualização: ${nodemailer.getTestMessageUrl(info)}`);
        }

        logger.info(`E-mail enviado: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Erro ao enviar e-mail:', error);
        throw error;
    }
};

/**
 * Envia um e-mail de verificação com link de ativação
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param verificationToken Token de verificação
 */
export const sendVerificationEmail = async (to: string, name: string, verificationToken: string): Promise<void> => {
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

    await sendEmail({
        to,
        subject: 'Verifique sua conta FlexSuite',
        html,
        text: `Olá ${name}, para verificar sua conta, acesse o link: ${verificationUrl}`
    });
};

/**
 * Envia um e-mail de redefinição de senha
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param resetToken Token de redefinição de senha
 */
export const sendPasswordResetEmail = async (to: string, name: string, resetToken: string): Promise<void> => {
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

    await sendEmail({
        to,
        subject: 'Redefinição de Senha - FlexSuite',
        html,
        text: `Olá ${name}, para redefinir sua senha, acesse o link: ${resetUrl}`
    });
};

/**
 * Envia um e-mail de boas-vindas após cadastro
 * @param to E-mail do destinatário
 * @param name Nome do destinatário
 * @param companyName Nome da empresa
 */
export const sendWelcomeEmail = async (to: string, name: string, companyName: string): Promise<void> => {
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

    await sendEmail({
        to,
        subject: 'Bem-vindo ao FlexSuite!',
        html,
        text: `Bem-vindo ao FlexSuite, ${name}! Sua conta para ${companyName} foi criada com sucesso. Acesse: ${baseUrl}/login`
    });
};