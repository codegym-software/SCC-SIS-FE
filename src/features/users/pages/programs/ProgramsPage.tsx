import React, { useState, useEffect } from 'react';

// Import components
import ProgramsList from './programs-list';
import ModulesList from './modules-list';
import ProgramForm from './form';
import ProgramView from './view';
import ModuleDetailModal from './components/ModuleDetailModal';
import ModuleForm from './components/ModuleForm';
import ProgramModulesManager from './components/ProgramModulesManager';

// Import API and types
import {
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    type Program as ProgramDto,
    type CreateProgramDto,
    type UpdateProgramDto,
} from '../../../../shared/api/programs';

import {
    getModulesByProgram,
    createModule,
    updateModule,
    type CreateModuleRequest,
    type UpdateModuleRequest,
} from '../../../../shared/api/modules';

import type { ModuleResponse } from '../../../../shared/types/module';

type Program = ProgramDto;
type Module = ModuleResponse;

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function ProgramsPage() {
    const [activeTab, setActiveTab] = useState<'programs' | 'modules'>('programs');
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState<Program | null>(null);
    const [openView, setOpenView] = useState<Program | null>(null);
    const [openModuleDetail, setOpenModuleDetail] = useState<Module | null>(null);
    const [openModuleCreate, setOpenModuleCreate] = useState(false);
    const [openModuleEdit, setOpenModuleEdit] = useState<Module | null>(null);
    const [openModulesManager, setOpenModulesManager] = useState<Program | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [programs, setPrograms] = useState<Program[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedProgramIdForModules, setSelectedProgramIdForModules] = useState<number | null>(null);

    // Fetch programs from API
    const fetchPrograms = async () => {
        try {
            const response = await getPrograms();
            setPrograms(response.data);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        }
    };

    // Fetch modules for selected program or all programs
    const fetchModules = async (programId?: number) => {
        try {
            console.log('[ProgramsPage] fetchModules called with programId:', programId);
            
            if (programId) {
                // Fetch modules for specific program
                console.log('[ProgramsPage] Fetching modules for program:', programId);
                const response = await getModulesByProgram({ programId });
                console.log('[ProgramsPage] Fetched modules:', response.data.length);
                setModules(response.data);
                setSelectedProgramIdForModules(programId);
            } else {
                // Fetch modules for ALL programs
                if (programs.length === 0) {
                    setModules([]);
                    return;
                }

                console.log('[ProgramsPage] Fetching modules for all programs:', programs.length);
                // Call API for each program and merge results
                const allModulesPromises = programs.map(program => 
                    getModulesByProgram({ programId: program.programId })
                );
                
                const allModulesResponses = await Promise.all(allModulesPromises);
                const allModules = allModulesResponses.flatMap(response => response.data);
                
                console.log('[ProgramsPage] Total modules fetched:', allModules.length);
                setModules(allModules);
                setSelectedProgramIdForModules(null); // null = showing all programs
            }
        } catch (error) {
            console.error('Failed to fetch modules:', error);
            setModules([]);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    // Fetch modules when switching to modules tab or when programs are loaded
    useEffect(() => {
        if (activeTab === 'modules' && programs.length > 0) {
            fetchModules();
        }
    }, [activeTab, programs]);

    // Reset pagination when switching tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const handleSubmit = async (formData: any) => {
        try {
            setIsSubmitting(true);

            if (openEdit) {
                // Update existing program
                const updateData: UpdateProgramDto = {
                    name: formData.name,
                    description: formData.description,
                    durationHours: formData.durationHours,
                    deliveryMode: formData.deliveryMode,
                    categoryCode: formData.categoryCode,
                    level: formData.level,
                    isActive: formData.isActive ?? true,
                };
                await updateProgram(openEdit.programId, updateData);
            } else {
                // Create new program
                const createData: CreateProgramDto = {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                    durationHours: formData.durationHours,
                    deliveryMode: formData.deliveryMode,
                    categoryCode: formData.categoryCode,
                    level: formData.level,
                    isActive: formData.isActive ?? true,
                };
                await createProgram(createData);
            }

            // Refresh programs list
            await fetchPrograms();
            setOpenCreate(false);
            setOpenEdit(null);
        } catch (error) {
            console.error('Error saving program:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (program: Program) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa chương trình "${program.name}" không?`)) {
            try {
                await deleteProgram(program.programId);
                // Refresh programs list
                await fetchPrograms();
            } catch (error) {
                console.error('Error deleting program:', error);
            }
        }
    };

    const handleView = (program: Program) => {
        setOpenView(program);
    };

    const handleEdit = (program: Program) => {
        setOpenEdit(program);
        setOpenCreate(true);
    };

    const handleCreate = () => {
        setOpenEdit(null);
        setOpenCreate(true);
    };

    const handleCancel = () => {
        setOpenCreate(false);
        setOpenEdit(null);
        setOpenView(null);
    };

    // Program modules manager
    const handleManageModules = async (program: Program) => {
        // Load modules cho program này trước khi mở manager
        await fetchModules(program.programId);
        setOpenModulesManager(program);
    };

    const handleSaveModulesOrder = async (moduleIds: string[]) => {
        // Không cần gọi API ở đây vì đã reorder bằng API trong ProgramModulesManager
        // Chỉ cần reload lại modules
        console.log('Module order saved:', moduleIds);
        if (openModulesManager) {
            await fetchModules(openModulesManager.programId);
        }
    };

    // Module handlers
    const handleModuleCreate = () => {
        setOpenModuleEdit(null);
        setOpenModuleCreate(true);
    };

    const handleModuleEdit = (module: Module) => {
        setOpenModuleEdit(module);
        setOpenModuleCreate(true);
    };

    const handleModuleDelete = async (module: Module) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa module "${module.name}" không?`)) {
            try {
                // Soft delete by setting isActive to false
                await updateModule(module.moduleId, { isActive: false });
                // Refresh modules list
                await fetchModules();
            } catch (error) {
                console.error('Error deleting module:', error);
                alert('Có lỗi xảy ra khi xóa module. Vui lòng thử lại.');
            }
        }
    };

    const handleModuleSubmit = async (formData: any) => {
        try {
            setIsSubmitting(true);

            if (openModuleEdit) {
                // Update existing module
                const updateData: UpdateModuleRequest = {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                    credits: formData.credits,
                    durationHours: formData.durationHours,
                    level: formData.level,
                    isMandatory: formData.isMandatory ?? true,
                    syllabusUrl: formData.syllabusUrl,
                    hasSyllabus: formData.hasSyllabus,
                    notes: formData.notes,
                    isActive: formData.isActive ?? true,
                };
                await updateModule(openModuleEdit.moduleId, updateData);
            } else {
                // Create new module
                const createData: CreateModuleRequest = {
                    programId: formData.programId,
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                    sequenceOrder: formData.sequenceOrder,
                    credits: formData.credits,
                    durationHours: formData.durationHours,
                    level: formData.level,
                    isMandatory: formData.isMandatory ?? true,
                    syllabusUrl: formData.syllabusUrl,
                    hasSyllabus: formData.hasSyllabus,
                    notes: formData.notes,
                };
                await createModule(createData);
            }

            // Refresh modules list
            await fetchModules();
            setOpenModuleCreate(false);
            setOpenModuleEdit(null);
        } catch (error) {
            console.error('Error saving module:', error);
            alert('Có lỗi xảy ra khi lưu module. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModuleCancel = () => {
        setOpenModuleCreate(false);
        setOpenModuleEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Chương trình & Module</h1>
                        <p className="text-xs text-gray-500">Quản lý chương trình đào tạo và module học</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('programs')}
                    className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${
                        activeTab === 'programs' ? 'bg-gray-900 text-white' : 'bg-white border'
                    }`}
                >
                    Chương trình
                </button>
                <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${
                        activeTab === 'modules' ? 'bg-gray-900 text-white' : 'bg-white border'
                    }`}
                >
                    Module
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'programs' && (
                <ProgramsList
                    programs={programs}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    onManageModules={handleManageModules}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {activeTab === 'modules' && (
                <ModulesList
                    modules={modules}
                    programs={programs}
                    onView={(module) => setOpenModuleDetail(module)}
                    onEdit={handleModuleEdit}
                    onDelete={handleModuleDelete}
                    onCreate={handleModuleCreate}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onProgramFilterChange={(programId) => {
                        fetchModules(programId ?? undefined);
                    }}
                />
            )}

            {/* Modals */}
            <Modal open={openCreate} onClose={handleCancel}>
                <ProgramForm
                    open={openCreate}
                    onClose={handleCancel}
                    editing={openEdit}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            <Modal open={!!openView} onClose={() => setOpenView(null)}>
                {openView && (
                    <ProgramView
                        open={!!openView}
                        onClose={() => setOpenView(null)}
                        program={openView}
                        modules={modules}
                        onEdit={() => {
                            setOpenView(null);
                            handleEdit(openView);
                        }}
                    />
                )}
            </Modal>

            {/* Module Detail Modal */}
            {openModuleDetail && (
                <ModuleDetailModal
                    open={!!openModuleDetail}
                    onClose={() => setOpenModuleDetail(null)}
                    module={openModuleDetail}
                />
            )}

            {/* Module Form Modal */}
            <Modal open={openModuleCreate} onClose={handleModuleCancel}>
                <ModuleForm
                    open={openModuleCreate}
                    onClose={handleModuleCancel}
                    editing={openModuleEdit}
                    onSubmit={handleModuleSubmit}
                    onCancel={handleModuleCancel}
                    isSubmitting={isSubmitting}
                    programs={programs}
                />
            </Modal>

            {/* Program Modules Manager Modal */}
            {openModulesManager && (
                <ProgramModulesManager
                    open={!!openModulesManager}
                    onClose={() => setOpenModulesManager(null)}
                    program={openModulesManager}
                    allModules={modules}
                    programModules={modules.filter((m) => m.programId === openModulesManager.programId)}
                    onSave={handleSaveModulesOrder}
                />
            )}
        </div>
    );
}
