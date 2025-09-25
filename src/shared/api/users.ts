// src/shared/api/users.ts
import api from "./http";

export type CreateUserDto = {
    fullName: string;
    email: string;
    phone: string;
    keycloakUserId?: string; // có thể bỏ, BE sẽ auto-create/find
    roles: { roleId: number; centerId: number | null }[];
    // có thể thêm các field khác nếu FE có form (dob, gender, ...)
};

export const createUser = (payload: CreateUserDto) =>
    api.post("/api/users", payload);

export const listUsers = (centerId?: number) =>
    api.get("/api/users", { params: { centerId } });
