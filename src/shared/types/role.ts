export type RoleScope = 'GLOBAL' | 'CENTER';
export type RoleDto = {
    roleId: number;
    code: string;
    name: string;
    scope: RoleScope;
    active: boolean;
};
