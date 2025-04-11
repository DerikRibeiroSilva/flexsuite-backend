-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserRole_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('RESIDENCIAL', 'COMERCIAL', 'ENTREGA', 'PROJECT') NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('RESIDENCIAL', 'COMERCIAL', 'PERSONAL') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerCompany` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `trialEndsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankDetails` (
    `id` VARCHAR(191) NOT NULL,
    `bank` VARCHAR(191) NOT NULL,
    `agency` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `accountType` ENUM('CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_JURIDICA') NOT NULL,
    `pixKey` VARCHAR(191) NOT NULL,
    `paymentCondition` ENUM('A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO') NOT NULL,
    `creditLimit` DOUBLE NULL,
    `allowCreditOveruse` BOOLEAN NOT NULL,
    `suframaRegistration` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NULL,

    UNIQUE INDEX `BankDetails_employeeId_key`(`employeeId`),
    UNIQUE INDEX `BankDetails_supplierId_key`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompensationBenefits` (
    `id` VARCHAR(191) NOT NULL,
    `baseSalary` DOUBLE NOT NULL,
    `dailyCost` DOUBLE NOT NULL,
    `paymentType` ENUM('MENSAL', 'QUINZENAL', 'SEMANAL', 'DIARIO') NOT NULL,
    `transportationVoucher` DOUBLE NOT NULL,
    `mealVoucher` DOUBLE NOT NULL,
    `healthPlan` DOUBLE NOT NULL,
    `employeeId` VARCHAR(191) NULL,

    UNIQUE INDEX `CompensationBenefits_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `gender` ENUM('HOMEM', 'MULHER') NOT NULL,
    `maritalStatus` ENUM('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO') NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `department` ENUM('ADMINISTRATIVO', 'OPERACIONAL', 'COMERCIAL', 'OUTRO', 'OPERACAO', 'VENDAS', 'ORCAMENTO', 'SUPERVISION', 'LOGISTICA', 'QUALIDADE', 'ATENDIMENTO_AO_CLIENTE', 'RECURSOS_HUMANOS', 'FINANCEIRO', 'MARKETING', 'PROJETOS', 'SEGURANCA_DO_TRABALHO', 'TI', 'COMPRAS', 'MANUTENCAO') NOT NULL,
    `paymentRegime` ENUM('CLT', 'CLTD', 'TERCEIRO') NOT NULL,
    `weeklyWorkload` VARCHAR(191) NOT NULL,
    `workShift` ENUM('TEMPO_INTEGRAL', 'PARCIAL', 'REMOTO', 'HIBRIDO') NOT NULL,
    `admissionDate` DATETIME(3) NOT NULL,
    `terminationDate` DATETIME(3) NULL,
    `terminationReason` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PESSOA_FISICA', 'PESSOA_JURIDICA', 'ESTRANGEIRO') NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `representative` VARCHAR(191) NULL,
    `creditLimit` DOUBLE NULL,
    `allowCreditOveruse` BOOLEAN NULL,
    `notes` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `fantasyName` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `corporateName` VARCHAR(191) NULL,
    `stateRegistration` VARCHAR(191) NULL,
    `taxpayerType` ENUM('CONTRIBUINTE_ICMS', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE') NULL,
    `municipalRegistration` VARCHAR(191) NULL,
    `suframaRegistration` VARCHAR(191) NULL,
    `responsibleId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO') NOT NULL,
    `expectedStartDate` DATETIME(3) NOT NULL,
    `expectedEndDate` DATETIME(3) NOT NULL,
    `actualStartDate` DATETIME(3) NULL,
    `actualEndDate` DATETIME(3) NULL,
    `responsibleId` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Budget` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `totalValue` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL,
    `validity` DATETIME(3) NOT NULL,
    `costCenter` VARCHAR(191) NOT NULL,
    `publicObservations` VARCHAR(191) NOT NULL,
    `internalObservations` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `status` ENUM('EM_ABERTO', 'CONCLUIDO', 'CANCELADO') NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `responsibleId` VARCHAR(191) NOT NULL,
    `salesChannel` ENUM('EMAIL', 'WHATSAPP', 'TELEFONE') NOT NULL,
    `paymentCondition` ENUM('A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BudgetEmployee` (
    `id` VARCHAR(191) NOT NULL,
    `hours` DOUBLE NOT NULL,
    `valueHour` DOUBLE NOT NULL,
    `valueTotal` DOUBLE NOT NULL,
    `observations` VARCHAR(191) NOT NULL,
    `budgetId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BudgetProduct` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalValue` DOUBLE NOT NULL,
    `observations` VARCHAR(191) NOT NULL,
    `discount` DOUBLE NOT NULL,
    `totalValueWithDiscount` DOUBLE NOT NULL,
    `budgetId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BudgetService` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalValue` DOUBLE NOT NULL,
    `observations` VARCHAR(191) NOT NULL,
    `discount` DOUBLE NOT NULL,
    `totalValueWithDiscount` DOUBLE NOT NULL,
    `budgetId` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL,
    `ean` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `basePrice` DOUBLE NULL,
    `category` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `manufacturerPartNumber` VARCHAR(191) NOT NULL,
    `unitOfMeasureId` VARCHAR(191) NOT NULL,
    `ncm` VARCHAR(191) NULL,
    `cest` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `unitOfMeasureId` VARCHAR(191) NOT NULL,
    `operationCost` DOUBLE NOT NULL,
    `serviceTableCode` VARCHAR(191) NOT NULL,
    `nbs` VARCHAR(191) NOT NULL,
    `additionalDescription` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `issAliquote` DOUBLE NOT NULL,
    `taxRetention` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnitOfMeasure` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `customerCompanyId` VARCHAR(191) NOT NULL,
    `type` ENUM('PESSOA_FISICA', 'PESSOA_JURIDICA', 'ESTRANGEIRO') NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `corporateName` VARCHAR(191) NULL,
    `fantasyName` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `stateRegistration` VARCHAR(191) NULL,
    `municipalRegistration` VARCHAR(191) NULL,
    `taxpayerType` ENUM('CONTRIBUINTE_ICMS', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE') NULL,
    `responsibleId` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `customerCompanyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `frequency` ENUM('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL') NOT NULL,
    `status` ENUM('ATIVO', 'INATIVO', 'PROMOCIONAL') NOT NULL DEFAULT 'ATIVO',
    `features` TEXT NOT NULL,
    `maxUsers` INTEGER NOT NULL,
    `maxProjects` INTEGER NOT NULL,
    `maxCustomers` INTEGER NOT NULL,
    `maxSuppliers` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `customerCompanyId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVA', 'PENDENTE', 'CANCELADA', 'TRIAL', 'EXPIRADA') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `canceledAt` DATETIME(3) NULL,
    `price` DOUBLE NOT NULL,
    `lastPaymentDate` DATETIME(3) NULL,
    `nextPaymentDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `used` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `AuthToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerAddress` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CustomerAddress_AB_unique`(`A`, `B`),
    INDEX `_CustomerAddress_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EmployeeAddress` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EmployeeAddress_AB_unique`(`A`, `B`),
    INDEX `_EmployeeAddress_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectAddress` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProjectAddress_AB_unique`(`A`, `B`),
    INDEX `_ProjectAddress_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SupplierAddress` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SupplierAddress_AB_unique`(`A`, `B`),
    INDEX `_SupplierAddress_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerContact` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CustomerContact_AB_unique`(`A`, `B`),
    INDEX `_CustomerContact_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EmployeeContact` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EmployeeContact_AB_unique`(`A`, `B`),
    INDEX `_EmployeeContact_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SupplierContact` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SupplierContact_AB_unique`(`A`, `B`),
    INDEX `_SupplierContact_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerCompany` ADD CONSTRAINT `CustomerCompany_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankDetails` ADD CONSTRAINT `BankDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankDetails` ADD CONSTRAINT `BankDetails_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompensationBenefits` ADD CONSTRAINT `CompensationBenefits_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetEmployee` ADD CONSTRAINT `BudgetEmployee_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetEmployee` ADD CONSTRAINT `BudgetEmployee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetProduct` ADD CONSTRAINT `BudgetProduct_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetProduct` ADD CONSTRAINT `BudgetProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetService` ADD CONSTRAINT `BudgetService_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetService` ADD CONSTRAINT `BudgetService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_unitOfMeasureId_fkey` FOREIGN KEY (`unitOfMeasureId`) REFERENCES `UnitOfMeasure`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_unitOfMeasureId_fkey` FOREIGN KEY (`unitOfMeasureId`) REFERENCES `UnitOfMeasure`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_customerCompanyId_fkey` FOREIGN KEY (`customerCompanyId`) REFERENCES `CustomerCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_customerCompanyId_fkey` FOREIGN KEY (`customerCompanyId`) REFERENCES `CustomerCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_customerCompanyId_fkey` FOREIGN KEY (`customerCompanyId`) REFERENCES `CustomerCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthToken` ADD CONSTRAINT `AuthToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerAddress` ADD CONSTRAINT `_CustomerAddress_A_fkey` FOREIGN KEY (`A`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerAddress` ADD CONSTRAINT `_CustomerAddress_B_fkey` FOREIGN KEY (`B`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmployeeAddress` ADD CONSTRAINT `_EmployeeAddress_A_fkey` FOREIGN KEY (`A`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmployeeAddress` ADD CONSTRAINT `_EmployeeAddress_B_fkey` FOREIGN KEY (`B`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectAddress` ADD CONSTRAINT `_ProjectAddress_A_fkey` FOREIGN KEY (`A`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectAddress` ADD CONSTRAINT `_ProjectAddress_B_fkey` FOREIGN KEY (`B`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SupplierAddress` ADD CONSTRAINT `_SupplierAddress_A_fkey` FOREIGN KEY (`A`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SupplierAddress` ADD CONSTRAINT `_SupplierAddress_B_fkey` FOREIGN KEY (`B`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerContact` ADD CONSTRAINT `_CustomerContact_A_fkey` FOREIGN KEY (`A`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerContact` ADD CONSTRAINT `_CustomerContact_B_fkey` FOREIGN KEY (`B`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmployeeContact` ADD CONSTRAINT `_EmployeeContact_A_fkey` FOREIGN KEY (`A`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmployeeContact` ADD CONSTRAINT `_EmployeeContact_B_fkey` FOREIGN KEY (`B`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SupplierContact` ADD CONSTRAINT `_SupplierContact_A_fkey` FOREIGN KEY (`A`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SupplierContact` ADD CONSTRAINT `_SupplierContact_B_fkey` FOREIGN KEY (`B`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
