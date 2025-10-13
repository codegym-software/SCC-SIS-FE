// src/shared/api/classes.ts
import api from "./http";

// Types cho Classes API
export type ClassStatus = 'PLANNED' | 'ONGOING' | 'FINISHED' | 'CANCELLED';
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'SUSPENDED';

export type CreateClassRequest = {
  programId: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  room?: string;
  capacity?: number;
};

export type UpdateClassRequest = {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  room?: string;
  capacity?: number;
};

export type ClassResponse = {
  classId: number;
  centerId: number;
  centerName: string;
  programId: number;
  programName: string;
  programCode: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  room: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
};

export type ClassLiteResponse = {
  classId: number;
  name: string;
  programName: string;
  centerName: string;
  status: ClassStatus;
};

export type AssignLecturerRequest = {
  startDate: string;
  note?: string;
};

export type RemoveLecturerRequest = {
  endDate?: string;
  note?: string;
};

export type ClassLecturerResponse = {
  id: number;
  classId: number;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  effStartDate: string;
  effEndDate: string;
  createdAt: string;
  createdBy: string;
};

export type EnrollmentResponse = {
  enrollmentId: number;
  classId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: string;
  enrolledAt: string;
  leftAt: string;
  note: string;
};

export type EnrollmentRequest = {
  studentId: number;
  enrolledAt?: string;
  note?: string;
};

export type UpdateEnrollmentRequest = {
  status: EnrollmentStatus;
  leftAt?: string;
  note?: string;
};

// Classes API
export const createClass = (payload: CreateClassRequest) =>
  api.post("/api/classes", payload);

export const getClasses = (params?: { centerId?: number; status?: ClassStatus }) =>
  api.get("/api/classes", { params });

export const getClassById = (id: number) =>
  api.get(`/api/classes/${id}`);

export const getClassesLite = () =>
  api.get("/api/classes/lite");

export const updateClass = (id: number, payload: UpdateClassRequest) =>
  api.put(`/api/classes/${id}`, payload);

export const getPrograms = () =>
  api.get("/api/classes/programs");

// Lecturers API
export const assignLecturer = (classId: number, lecturerId: number, payload: AssignLecturerRequest) =>
  api.post(`/api/classes/${classId}/lecturers/${lecturerId}`, payload);

export const removeLecturer = (classId: number, lecturerId: number, payload?: RemoveLecturerRequest) =>
  api.delete(`/api/classes/${classId}/lecturers/${lecturerId}`, { data: payload });

export const getClassLecturers = (classId: number) =>
  api.get(`/api/classes/${classId}/lecturers`);

export const getClassLecturersHistory = (classId: number) =>
  api.get(`/api/classes/${classId}/lecturers/all`);

// Students API
export const getClassStudents = (classId: number, params?: {
  status?: EnrollmentStatus;
  page?: number;
  size?: number;
  sort?: string;
}) =>
  api.get(`/api/classes/${classId}/students`, { params });

export const enrollStudent = (classId: number, payload: EnrollmentRequest) =>
  api.post(`/api/classes/${classId}/students`, payload);

export const updateEnrollment = (classId: number, enrollmentId: number, payload: UpdateEnrollmentRequest) =>
  api.patch(`/api/classes/${classId}/students/${enrollmentId}`, payload);

export const removeStudent = (classId: number, enrollmentId: number, reason?: string) =>
  api.delete(`/api/classes/${classId}/students/${enrollmentId}`, { params: { reason } });