// src/shared/types/student.ts

export type StudentDto = {
    studentId: number;
    fullName: string;
    email: string;
    phone: string;
    dob?: string | null; // ISO date string
    gender?: string | null;
    nationalIdNo?: string | null;
    addressLine?: string | null;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    note?: string | null;
    overallStatus?: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
};

export type CreateStudentDto = {
    fullName: string;
    email: string;
    phone: string;
    dob?: string | null; // ISO date string (YYYY-MM-DD)
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    nationalIdNo?: string | null;
    addressLine?: string | null;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    note?: string | null;
};

export type UpdateStudentDto = {
    fullName: string;
    email: string;
    phone: string;
    dob?: string | null;
    addressLine?: string | null;
};
