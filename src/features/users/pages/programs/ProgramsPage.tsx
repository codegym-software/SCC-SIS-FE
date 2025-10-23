import React, { useState, useEffect } from 'react';
import { BookOpen, FolderOpen, Search, Plus } from 'lucide-react';

// Import components
import ProgramsList from './programs-list';
import ModulesList from './modules-list';
import ProgramForm from './form';
import ProgramView from './view';

// Import API and types
import { 
    getPrograms, 
    createProgram, 
    updateProgram, 
    deleteProgram,
    type Program as ProgramDto,
    type CreateProgramDto,
    type UpdateProgramDto
} from '../../../../shared/api/programs';

type Program = ProgramDto;

type Module = {
    id: string;
    name: string;
    moduleId: string;
    field: string;
    credits: number;
    duration: string;
    prerequisite: string;
    syllabus: 'Có' | 'Chưa có';
    status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};

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
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'programs' | 'modules'>('programs');
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState<Program | null>(null);
    const [openView, setOpenView] = useState<Program | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const [programs, setPrograms] = useState<Program[]>([]);

    // Fetch programs from API
    const fetchPrograms = async () => {
        try {
            setIsLoading(true);
            const response = await getPrograms();
            setPrograms(response.data);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoaded(true);
        fetchPrograms();
    }, []);

    // Reset pagination when switching tabs or changing filters
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, query, categoryFilter, statusFilter]);

    const [modules, setModules] = useState<Module[]>([
        {
            id: '1',
            name: 'Lập trình Cơ bản',
            moduleId: 'IT001',
            field: 'Kỹ thuật',
            credits: 3,
            duration: '4 tháng',
            prerequisite: 'Không',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '2',
            name: 'Cơ sở Dữ liệu',
            moduleId: 'IT002',
            field: 'Kỹ thuật',
            credits: 4,
            duration: '5 tháng',
            prerequisite: 'Lập trình Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '3',
            name: 'Java Core',
            moduleId: 'JAVA001',
            field: 'Lập trình',
            credits: 4,
            duration: '6 tháng',
            prerequisite: 'Lập trình Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '4',
            name: 'Thiết kế UI/UX',
            moduleId: 'DES001',
            field: 'Thiết kế',
            credits: 3,
            duration: '4 tháng',
            prerequisite: 'Không',
            syllabus: 'Chưa có',
            status: 'Hoạt động',
        },
        {
            id: '5',
            name: 'React Development',
            moduleId: 'WEB001',
            field: 'Lập trình',
            credits: 4,
            duration: '5 tháng',
            prerequisite: 'Lập trình Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '6',
            name: 'Node.js Backend',
            moduleId: 'WEB002',
            field: 'Lập trình',
            credits: 4,
            duration: '6 tháng',
            prerequisite: 'JavaScript Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '7',
            name: 'Python Data Analysis',
            moduleId: 'DATA001',
            field: 'Kỹ thuật',
            credits: 5,
            duration: '7 tháng',
            prerequisite: 'Python Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '8',
            name: 'Machine Learning',
            moduleId: 'AI001',
            field: 'Kỹ thuật',
            credits: 6,
            duration: '8 tháng',
            prerequisite: 'Python Data Analysis',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '9',
            name: 'Digital Marketing Strategy',
            moduleId: 'MKT001',
            field: 'Kinh doanh',
            credits: 3,
            duration: '4 tháng',
            prerequisite: 'Không',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '10',
            name: 'SEO & Content Marketing',
            moduleId: 'MKT002',
            field: 'Kinh doanh',
            credits: 3,
            duration: '3 tháng',
            prerequisite: 'Digital Marketing Strategy',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '11',
            name: 'Adobe Photoshop',
            moduleId: 'DES002',
            field: 'Thiết kế',
            credits: 2,
            duration: '3 tháng',
            prerequisite: 'Không',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '12',
            name: 'Adobe Illustrator',
            moduleId: 'DES003',
            field: 'Thiết kế',
            credits: 2,
            duration: '3 tháng',
            prerequisite: 'Adobe Photoshop',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '13',
            name: 'Figma Design',
            moduleId: 'DES004',
            field: 'Thiết kế',
            credits: 3,
            duration: '4 tháng',
            prerequisite: 'Thiết kế UI/UX',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '14',
            name: 'Cybersecurity Fundamentals',
            moduleId: 'SEC001',
            field: 'Kỹ thuật',
            credits: 4,
            duration: '5 tháng',
            prerequisite: 'Lập trình Cơ bản',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
        {
            id: '15',
            name: 'Business Intelligence',
            moduleId: 'BI001',
            field: 'Kinh doanh',
            credits: 4,
            duration: '6 tháng',
            prerequisite: 'Python Data Analysis',
            syllabus: 'Có',
            status: 'Hoạt động',
        },
    ]);

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
                    isActive: formData.isActive ?? true
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
                    isActive: formData.isActive ?? true
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

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Tìm kiếm..."
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 rounded-md border px-3 text-sm"
                >
                    <option>Danh mục</option>
                    <option>Kỹ thuật</option>
                    <option>Lập trình</option>
                    <option>Thiết kế</option>
                    <option>Kinh doanh</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border px-3 text-sm"
                >
                    <option>Trạng thái</option>
                    <option>Đang hoạt động</option>
                    <option>Tạm dừng</option>
                    <option>Hoàn thành</option>
                </select>
            </div>

            {/* Tab content */}
            {activeTab === 'programs' && (
                <ProgramsList
                    programs={programs}
                    query={query}
                    categoryFilter={categoryFilter}
                    statusFilter={statusFilter}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {activeTab === 'modules' && (
                <ModulesList
                    modules={modules}
                    query={query}
                    statusFilter={statusFilter}
                    onView={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onCreate={() => {}}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
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
        </div>
    );
}

