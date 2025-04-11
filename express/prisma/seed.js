"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Iniciando seed do banco de dados...');
        // Verificar se já existe uma empresa com o nome 'FlexSuite'
        const existingCompany = yield prisma.customerCompany.findFirst({
            where: {
                name: 'FlexSuite'
            }
        });
        let company;
        if (!existingCompany) {
            // Criar a empresa padrão FlexSuite
            company = yield prisma.customerCompany.create({
                data: {
                    name: 'FlexSuite',
                    status: 'ATIVO'
                }
            });
            console.log(`Empresa padrão criada: ${company.name} (${company.id})`);
        }
        else {
            company = existingCompany;
            console.log(`Empresa padrão já existe: ${company.name} (${company.id})`);
        }
        // Verificar se já existe um usuário admin com o e-mail especificado
        const existingUser = yield prisma.user.findUnique({
            where: {
                email: 'suporte@flexsuite.com.br'
            }
        });
        if (!existingUser) {
            // Criar o usuário administrativo
            const hashedPassword = yield bcrypt.hash('FlexSuite@2025', 10);
            const user = yield prisma.user.create({
                data: {
                    customerCompanyId: company.id,
                    name: 'Administrador FlexSuite',
                    email: 'suporte@flexsuite.com.br',
                    phone: '(00) 00000-0000', // Placeholder para telefone
                    password: hashedPassword,
                    isAdmin: true,
                    isVerified: true,
                    isActive: true
                }
            });
            console.log(`Usuário administrativo criado: ${user.email} (${user.id})`);
            // Verificar se existe Role 'admin'
            let adminRole = yield prisma.role.findFirst({
                where: {
                    name: 'admin'
                }
            });
            // Se não existir, criar a role admin
            if (!adminRole) {
                adminRole = yield prisma.role.create({
                    data: {
                        name: 'admin',
                        description: 'Administrador do sistema com acesso total'
                    }
                });
                console.log(`Role admin criada: ${adminRole.id}`);
            }
            // Atribuir a role admin ao usuário
            yield prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: adminRole.id
                }
            });
            console.log(`Role admin atribuída ao usuário ${user.email}`);
        }
        else {
            console.log(`Usuário administrativo já existe: ${existingUser.email} (${existingUser.id})`);
        }
        console.log('Seed concluído com sucesso!');
    });
}
main()
    .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
