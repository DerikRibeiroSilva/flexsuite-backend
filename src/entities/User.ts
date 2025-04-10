export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerCompanyId: string;
    isAdmin: boolean;
    isVerified: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDTO {
    name: string;
    email: string;
    phone: string;
    password: string;
    customerCompanyId: string;
    isAdmin?: boolean;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    phone?: string;
    customerCompanyId?: string;
    isAdmin?: boolean;
    isActive?: boolean;
}

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerCompanyId: string;
    isAdmin: boolean;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
} 