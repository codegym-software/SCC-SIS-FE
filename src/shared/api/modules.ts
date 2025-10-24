// src/shared/api/modules.ts
import api from './http';
import type {
    ModuleResponse,
    CreateModuleRequest,
    UpdateModuleRequest,
    ReorderModuleRequest,
    ModuleQueryParams,
} from '../types/module';

/**
 * Tạo module mới
 * POST /api/modules
 */
export const createModule = (payload: CreateModuleRequest) =>
    api.post<ModuleResponse>('/api/modules', payload);

/**
 * Lấy danh sách modules của một program
 * GET /api/modules?programId={programId}&level={level}&mandatoryOnly={mandatoryOnly}&q={q}
 */
export const getModulesByProgram = (params: ModuleQueryParams) =>
    api.get<ModuleResponse[]>('/api/modules', { params });

/**
 * Lấy chi tiết một module
 * GET /api/modules/{moduleId}
 */
export const getModuleById = (moduleId: number) =>
    api.get<ModuleResponse>(`/api/modules/${moduleId}`);

/**
 * Cập nhật module
 * PUT /api/modules/{moduleId}
 */
export const updateModule = (moduleId: number, payload: UpdateModuleRequest) =>
    api.put<ModuleResponse>(`/api/modules/${moduleId}`, payload);

/**
 * Sắp xếp lại thứ tự module trong program
 * PATCH /api/modules/reorder?programId={programId}&sequenceOrder={sequenceOrder}
 */
export const reorderModule = (
    programId: number,
    sequenceOrder: number,
    payload: ReorderModuleRequest,
) =>
    api.patch<ModuleResponse[]>('/api/modules/reorder', payload, {
        params: { programId, sequenceOrder },
    });

