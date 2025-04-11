export interface CustomerCompany {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateCustomerCompanyDTO {
    name: string;
}

export interface UpdateCustomerCompanyDTO {
    name: string;
}