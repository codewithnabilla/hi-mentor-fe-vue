export interface UserRole {
    uuid: string;
    name: string;
    guard_name?: string;
    description?: string | null;
    permissions?: UserPermission[] | string[];
}

export interface UserPermission {
    uuid?: string;
    name: string;
    guard_name?: string;
}

export interface User {
    uuid: string;
    name: string;
    email: string;
    roles?: Array<UserRole | string>;
    permissions?: UserPermission[] | string[];
    permission_names?: string[];
    abilities?: string[];
    created_at?: string;
    updated_at?: string;
}