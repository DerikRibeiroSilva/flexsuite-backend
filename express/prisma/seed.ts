import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed do banco de dados...');

    // Verificar se já existe uma empresa com o nome 'FlexSuite'
    const existingCompany = await prisma.customerCompany.findFirst({
        where: {
            name: 'FlexSuite'
        }
    });

    let company;
    if (!existingCompany) {
        // Criar a empresa padrão FlexSuite
        company = await prisma.customerCompany.create({
            data: {
                name: 'FlexSuite',
                status: 'ATIVO'
            }
        });
        console.log(`Empresa padrão criada: ${company.name} (${company.id})`);
    } else {
        company = existingCompany;
        console.log(`Empresa padrão já existe: ${company.name} (${company.id})`);
    }

    // Verificar se já existe um usuário admin com o e-mail especificado
    const existingUser = await prisma.user.findUnique({
        where: {
            email: 'suporte@flexsuite.com.br'
        }
    });

    if (!existingUser) {
        // Criar o usuário administrativo
        const hashedPassword = await bcrypt.hash('FlexSuite@2025', 10);

        const user = await prisma.user.create({
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
        let adminRole = await prisma.role.findFirst({
            where: {
                name: 'admin'
            }
        });

        // Se não existir, criar a role admin
        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'admin',
                    description: 'Administrador do sistema com acesso total'
                }
            });
            console.log(`Role admin criada: ${adminRole.id}`);
        }

        // Atribuir a role admin ao usuário
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: adminRole.id
            }
        });
        console.log(`Role admin atribuída ao usuário ${user.email}`);
    } else {
        console.log(`Usuário administrativo já existe: ${existingUser.email} (${existingUser.id})`);
    }

    console.log('Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('Erro durante o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 