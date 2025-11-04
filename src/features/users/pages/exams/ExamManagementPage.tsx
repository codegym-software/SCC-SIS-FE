import React, { useState, useEffect } from 'react';
import { Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    getExamResultsByClass,
    getExamResultsByClassAndModule,
    deleteExamResult,
    type ExamResultResponse,
} from '@/shared/api/exams';
import { getMyLecturerClasses } from '@/shared/api/classes';
import { toast } from 'sonner';
import CreateExamResultModal from './CreateExamResultModal';
import ViewExamResultModal from './ViewExamResultModal';
import EditExamResultModal from './EditExamResultModal';

interface ClassOption {
    classId: number;
    className: string;
    programName: string;
}

interface ModuleOption {
    moduleId: number;
    moduleName: string;
    semesterId: number;
}

const ExamManagementPage: React.FC = () => {
    const [examResults, setExamResults] = useState<ExamResultResponse[]>([]);
    const [filteredResults, setFilteredResults] = useState<ExamResultResponse[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);

    // Filter state
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExamResult, setSelectedExamResult] = useState<ExamResultResponse | null>(null);

    const [loading, setLoading] = useState(false);

    // Load classes khi mount
    useEffect(() => {
        loadClasses();
    }, []);

    // Load exam results khi chọn lớp hoặc module
    useEffect(() => {
        if (selectedClass) {
            if (selectedModule) {
                loadExamResultsByClassAndModule(selectedClass, selectedModule);
            } else {
                loadExamResultsByClass(selectedClass);
            }
        }
    }, [selectedClass, selectedModule]);

    // Filter results khi thay đổi filter
    useEffect(() => {
        applyFilters();
    }, [examResults, selectedDate]);

    const loadClasses = async () => {
        try {
            const response = await getMyLecturerClasses();
            const classOptions: ClassOption[] = response.data.map((c: any) => ({
                classId: c.classId,
                className: c.name,
                programName: c.program?.name || 'N/A',
            }));
            setClasses(classOptions);
        } catch (error) {
            console.error('Error loading classes:', error);
            toast.error('Không thể tải danh sách lớp');
        }
    };

    const loadExamResultsByClass = async (classId: number) => {
        try {
            setLoading(true);
            const results = await getExamResultsByClass(classId);
            setExamResults(results);

            // Extract unique modules from results
            const uniqueModules = Array.from(
                new Map(
                    results.map((r) => [r.moduleId, { moduleId: r.moduleId, moduleName: r.moduleName, semesterId: 0 }]),
                ).values(),
            );
            setModules(uniqueModules);
        } catch (error) {
            console.error('Error loading exam results:', error);
            toast.error('Không thể tải danh sách đợt nhập điểm');
        } finally {
            setLoading(false);
        }
    };

    const loadExamResultsByClassAndModule = async (classId: number, moduleId: number) => {
        try {
            setLoading(true);
            const results = await getExamResultsByClassAndModule(classId, moduleId);
            setExamResults(results);
        } catch (error) {
            console.error('Error loading exam results:', error);
            toast.error('Không thể tải danh sách đợt nhập điểm');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...examResults];

        // Filter by exam date
        if (selectedDate) {
            filtered = filtered.filter((r) => r.examDate === selectedDate);
        }

        setFilteredResults(filtered);
    };

    const handleDelete = async (examResultId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đợt nhập điểm này?')) {
            return;
        }

        try {
            await deleteExamResult(examResultId);
            toast.success('Xóa đợt nhập điểm thành công');

            // Reload data
            if (selectedClass) {
                if (selectedModule) {
                    loadExamResultsByClassAndModule(selectedClass, selectedModule);
                } else {
                    loadExamResultsByClass(selectedClass);
                }
            }
        } catch (error) {
            console.error('Error deleting exam result:', error);
            toast.error('Không thể xóa đợt nhập điểm');
        }
    };

    const handleView = (examResult: ExamResultResponse) => {
        setSelectedExamResult(examResult);
        setShowViewModal(true);
    };

    const handleEdit = (examResult: ExamResultResponse) => {
        setSelectedExamResult(examResult);
        setShowEditModal(true);
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // Reload data
        if (selectedClass) {
            if (selectedModule) {
                loadExamResultsByClassAndModule(selectedClass, selectedModule);
            } else {
                loadExamResultsByClass(selectedClass);
            }
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        // Reload data
        if (selectedClass) {
            if (selectedModule) {
                loadExamResultsByClassAndModule(selectedClass, selectedModule);
            } else {
                loadExamResultsByClass(selectedClass);
            }
        }
    };

    // Get unique exam dates for filter
    const uniqueDates = Array.from(new Set(examResults.map((r) => r.examDate))).sort();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Điểm thi</h1>
                    <p className="text-sm text-gray-500">Tạo và quản lý các đợt nhập điểm cho học viên</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} disabled={!selectedClass}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nhập điểm
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <div className="grid grid-cols-4 gap-4 flex-1">
                        <Select
                            value={selectedClass?.toString() || ''}
                            onValueChange={(val) => {
                                const classId = parseInt(val);
                                setSelectedClass(classId);
                                setSelectedModule(null);
                                setSelectedDate('');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn lớp" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (
                                    <SelectItem key={c.classId} value={c.classId.toString()}>
                                        {c.className} ({c.programName})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedModule?.toString() || 'all'}
                            onValueChange={(val) => {
                                setSelectedModule(val === 'all' ? null : parseInt(val));
                                setSelectedDate('');
                            }}
                            disabled={!selectedClass}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn module" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả module</SelectItem>
                                {modules.map((m) => (
                                    <SelectItem key={m.moduleId} value={m.moduleId.toString()}>
                                        {m.moduleName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedDate || 'all'}
                            onValueChange={(val) => setSelectedDate(val === 'all' ? '' : val)}
                            disabled={!selectedClass}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn ngày thi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả ngày</SelectItem>
                                {uniqueDates.map((date) => (
                                    <SelectItem key={date} value={date}>
                                        {new Date(date).toLocaleDateString('vi-VN')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Results Table */}
            {!selectedClass ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Vui lòng chọn lớp để xem danh sách đợt nhập điểm</p>
                </Card>
            ) : loading ? (
                <Card className="p-8 text-center">
                    <p>Đang tải...</p>
                </Card>
            ) : filteredResults.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Chưa có đợt nhập điểm nào</p>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead>Ngày thi</TableHead>
                                <TableHead>Số học viên</TableHead>
                                <TableHead>Đạt</TableHead>
                                <TableHead>Không đạt</TableHead>
                                <TableHead>Người tạo</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.map((result) => {
                                const passCount = result.studentScores.filter((s) => s.status === 'PASS').length;
                                const failCount = result.studentScores.filter((s) => s.status === 'FAIL').length;

                                return (
                                    <TableRow key={result.examResultId}>
                                        <TableCell className="font-medium">{result.moduleName}</TableCell>
                                        <TableCell>{new Date(result.examDate).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>{result.studentScores.length}</TableCell>
                                        <TableCell>
                                            <Badge variant="success" className="bg-green-100 text-green-800">
                                                {passCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                                                {failCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{result.creatorName}</TableCell>
                                        <TableCell>{new Date(result.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleView(result)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(result)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(result.examResultId)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Modals */}
            {showCreateModal && selectedClass && (
                <CreateExamResultModal
                    classId={selectedClass}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showViewModal && selectedExamResult && (
                <ViewExamResultModal examResult={selectedExamResult} onClose={() => setShowViewModal(false)} />
            )}

            {showEditModal && selectedExamResult && (
                <EditExamResultModal
                    examResult={selectedExamResult}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default ExamManagementPage;
