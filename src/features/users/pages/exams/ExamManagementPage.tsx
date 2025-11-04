import React, { useState, useEffect } from 'react';
import { Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    getExamResultsByClass,
    getExamResultsByClassAndModule,
    deleteExamResult,
    updateExamResult,
    type ExamResultResponse,
} from '@/shared/api/exams';
import {
    deleteGradeEntry,
    updateGradeRecords,
    getStudentGrades,
    getGradeEntries,
    type UpdateGradeRecordsRequest,
    type StudentGradesResponse,
    type GradeRecordResponse,
} from '@/shared/api/grade-entries';
import { getMyLecturerClasses } from '@/shared/api/classes';
import { getModulesByProgram } from '@/shared/api/modules';
import type { ModuleResponse } from '@/shared/api/modules';
import { getClassStudents } from '@/shared/api/classes';
import { toast } from 'sonner';
import CreateExamResultModal from './CreateExamResultModal';

interface ClassOption {
    classId: number;
    className: string;
    programId: number;
    programName: string;
}

interface SemesterOption {
    semester: number;
}

interface ModuleOption {
    moduleId: number;
    moduleName: string;
    semester: number;
}

const ExamManagementPage: React.FC = () => {
    const [examResults, setExamResults] = useState<ExamResultResponse[]>([]);
    const [filteredResults, setFilteredResults] = useState<ExamResultResponse[]>([]);
    const [allClasses, setAllClasses] = useState<ClassOption[]>([]);
    const [allModules, setAllModules] = useState<ModuleResponse[]>([]);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);

    // Filter state
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
    const [selectedProgramName, setSelectedProgramName] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Edit state - track which row is being edited
    const [editingRow, setEditingRow] = useState<{
        examResultId: number;
        studentId: number;
    } | null>(null);
    const [editingScores, setEditingScores] = useState<{
        theoryScore: string;
        practicalScore: string;
        note: string;
    } | null>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [studentsMap, setStudentsMap] = useState<Map<number, { studentCode: string; fullName: string }>>(new Map());

    // Load classes khi mount
    useEffect(() => {
        loadClasses();
    }, []);

    // Khi chọn lớp, load chương trình và modules
    useEffect(() => {
        if (selectedClass && allClasses.length > 0) {
            const selectedClassData = allClasses.find((c) => c.classId === selectedClass);
            if (selectedClassData) {
                setSelectedProgram(selectedClassData.programId);
                setSelectedProgramName(selectedClassData.programName || 'N/A');
                if (selectedClassData.programId && selectedClassData.programId > 0) {
                    loadModulesForProgram(selectedClassData.programId);
                } else {
                    setAllModules([]);
                    setSemesters([]);
                }
            }
        } else {
            setSelectedProgram(null);
            setSelectedProgramName('');
            setAllModules([]);
            setSemesters([]);
            setModules([]);
            setSelectedSemester(null);
            setSelectedModule(null);
            setSelectedDate('');
        }
    }, [selectedClass, allClasses]);

    // Khi có modules, extract unique semesters
    useEffect(() => {
        if (allModules.length > 0) {
            const uniqueSemesters = Array.from(
                new Set(allModules.map((m) => m.semester).filter((s) => s != null && s > 0)),
            )
                .sort((a, b) => a - b)
                .map((semester) => ({ semester }));
            setSemesters(uniqueSemesters);
        } else {
            setSemesters([]);
        }
    }, [allModules]);

    // Khi chọn semester, load modules từ API (không filter từ allModules)
    // Modules sẽ được load từ API getStudentGrades khi có selectedClass và selectedSemester
    useEffect(() => {
        // Reset module và date khi semester thay đổi
        setSelectedModule(null);
        setSelectedDate('');
        // Modules sẽ được set từ API response trong loadStudentGrades
        if (!selectedClass || !selectedSemester) {
            setModules([]);
        }
    }, [selectedSemester, selectedClass]);

    // Load exam results khi chọn lớp, semester và module
    useEffect(() => {
        if (selectedClass && selectedSemester) {
            if (selectedModule) {
                loadStudentGrades(selectedClass, selectedSemester, selectedModule);
            } else {
                // Khi chưa chọn module, API sẽ trả về danh sách modules
                loadStudentGrades(selectedClass, selectedSemester);
            }
        } else {
            setExamResults([]);
            setFilteredResults([]);
        }
    }, [selectedClass, selectedSemester, selectedModule]);

    // Filter results khi thay đổi filter
    useEffect(() => {
        applyFilters();
    }, [examResults, selectedDate, selectedModule]);

    const loadClasses = async () => {
        try {
            const response = await getMyLecturerClasses();
            const classOptions: ClassOption[] = response.data.map((c: any) => ({
                classId: c.classId,
                className: c.name,
                programId: c.programId || 0,
                programName: c.programName || 'N/A',
            }));
            setAllClasses(classOptions);
        } catch (error) {
            console.error('Error loading classes:', error);
            toast.error('Không thể tải danh sách lớp');
        }
    };

    const loadModulesForProgram = async (programId: number) => {
        try {
            if (!programId || programId === 0) {
                setAllModules([]);
                return;
            }
            const response = await getModulesByProgram({ programId });
            setAllModules(response.data);
        } catch (error) {
            console.error('Error loading modules:', error);
            toast.error('Không thể tải danh sách module');
            setAllModules([]);
        }
    };

    /**
     * Load students để lấy studentCode
     * Chỉ lấy học viên ACTIVE để đảm bảo consistency
     */
    const loadStudentsForClass = async (classId: number) => {
        try {
            const response = await getClassStudents(classId, {
                status: 'ACTIVE',
                page: 0,
                size: 1000,
            });
            const students = response.data?.content || response.data || [];
            // Filter to only ACTIVE enrollments if status filter didn't work
            const activeStudents = Array.isArray(students) 
                ? students.filter((s: any) => s.status === 'ACTIVE')
                : [];
            
            const map = new Map<number, { studentCode: string; fullName: string }>();
            activeStudents.forEach((s: any) => {
                const studentId = s.studentId;
                if (!studentId) return; // Skip invalid entries
                const studentCode = s.studentCode || `SV${String(studentId).padStart(3, '0')}`;
                const fullName = s.studentName || s.fullName || s.name || `Student ${studentId}`;
                map.set(studentId, { studentCode, fullName });
            });
            setStudentsMap(map);
        } catch (error) {
            console.error('Error loading students:', error);
            // Không show error vì không critical
        }
    };

    /**
     * Load student grades từ API mới
     * - Nếu chưa có moduleId: API trả về danh sách modules
     * - Nếu có moduleId: API trả về danh sách điểm của học viên
     */
    const loadStudentGrades = async (classId: number, semester: number, moduleId?: number) => {
        try {
            setLoading(true);
            
            // Load students để lấy studentCode
            await loadStudentsForClass(classId);
            
            const response = await getStudentGrades(classId, semester, moduleId);
            
            // Nếu chưa có moduleId, API trả về danh sách modules
            if (!moduleId) {
                if (response.modules && response.modules.length > 0) {
                    // Cập nhật danh sách modules từ API
                    // Backend trả về ModuleResponse với field 'name', không phải 'moduleName'
                    const moduleOptions: ModuleOption[] = response.modules.map((m: any) => ({
                        moduleId: m.moduleId,
                        moduleName: m.moduleName || m.name, // Hỗ trợ cả 2 format
                        semester: m.semester || semester,
                    }));
                    setModules(moduleOptions);
                } else {
                    // Không có modules, set rỗng
                    setModules([]);
                }
                setExamResults([]);
                setFilteredResults([]);
                return;
            }
            
            // Nếu có moduleId, API trả về gradeRecords
            if (moduleId && response.gradeRecords) {
                // Lọc bỏ các records không có entryDate hợp lệ
                const validRecords = response.gradeRecords.filter(
                    (record: GradeRecordResponse) => 
                        record.entryDate && 
                        record.entryDate.trim() !== '' &&
                        record.entryDate !== null &&
                        record.entryDate !== undefined
                );

                // Group gradeRecords theo entryDate (chỉ các records có entryDate hợp lệ)
                const recordsByDate = new Map<string, GradeRecordResponse[]>();
                validRecords.forEach((record: GradeRecordResponse) => {
                    const entryDate = record.entryDate!; // Đã được filter ở trên nên không null
                    if (!recordsByDate.has(entryDate)) {
                        recordsByDate.set(entryDate, []);
                    }
                    recordsByDate.get(entryDate)!.push(record);
                });

                // Map mỗi entryDate thành một ExamResultResponse
                const mappedResults: ExamResultResponse[] = Array.from(recordsByDate.entries()).map(([entryDate, records]) => {
                    return {
                        examResultId: 0, // API không trả về examResultId, dùng 0 tạm thời
                        classId: response.classId,
                        className: response.className,
                        moduleId: response.moduleId || moduleId,
                        moduleName: '', // Sẽ lấy từ allModules
                        examDate: entryDate, // Lấy từ entryDate của gradeRecord
                        createdBy: 0,
                        creatorName: '',
                        createdAt: '',
                        updatedAt: '',
                        studentScores: records.map((record: GradeRecordResponse) => {
                            const studentInfo = studentsMap.get(record.studentId);
                            // Backend và frontend đều làm việc với thang điểm 0-10
                            // Không cần chuyển đổi
                            const theoryScore = record.theoryScore != null ? record.theoryScore : 0;
                            const practiceScore = record.practiceScore != null ? record.practiceScore : 0;
                            const finalScore = record.finalScore != null ? record.finalScore : 0;
                            // Pass status được tính từ backend dựa trên thang 0-10 (>= 5 là PASS)
                            const passStatus = record.passStatus as 'PASS' | 'FAIL';
                            return {
                                studentId: record.studentId,
                                studentCode: studentInfo?.studentCode || record.studentEmail?.split('@')[0] || `SV${String(record.studentId).padStart(3, '0')}`,
                                fullName: record.studentName,
                                theoryScore: theoryScore,
                                practicalScore: practiceScore,
                                finalScore: finalScore,
                                status: passStatus,
                                note: undefined,
                            };
                        }),
                    };
                });
                
                // Lấy moduleName từ allModules và set cho tất cả results
                const moduleData = allModules.find((m) => m.moduleId === moduleId);
                if (moduleData) {
                    mappedResults.forEach((result) => {
                        (result as any).moduleName = moduleData.name;
                    });
                }
                
                setExamResults(mappedResults);
            } else {
                setExamResults([]);
            }
        } catch (error: any) {
            console.error('Error loading student grades:', error);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách điểm');
            setExamResults([]);
            setFilteredResults([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...examResults];

        // Filter by module (should already be filtered by API, but double check)
        if (selectedModule) {
            filtered = filtered.filter((r) => r.moduleId === selectedModule);
        }

        // Filter by exam date
        if (selectedDate) {
            filtered = filtered.filter((r) => r.examDate === selectedDate);
        }

        setFilteredResults(filtered);
    };

    const handleDelete = async (examResult: ExamResultResponse) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đợt nhập điểm này?')) {
            return;
        }

        try {
            // Get entryDate từ grade entry mới nhất
            let entryDate = examResult.examDate;
            if (!entryDate) {
                try {
                    const gradeEntries = await getGradeEntries(examResult.classId, examResult.moduleId);
                    if (gradeEntries.length > 0) {
                        entryDate = gradeEntries[0].entryDate;
                    } else {
                        toast.error('Không tìm thấy đợt nhập điểm để xóa');
                        return;
                    }
                } catch (error) {
                    console.error('Error getting grade entries:', error);
                    toast.error('Không thể lấy thông tin đợt nhập điểm');
                    return;
                }
            }

            await deleteGradeEntry(examResult.classId, examResult.moduleId, entryDate);
            toast.success('Xóa đợt nhập điểm thành công');

            // Reload data using new API
            if (selectedClass && selectedSemester) {
                if (selectedModule) {
                    loadStudentGrades(selectedClass, selectedSemester, selectedModule);
                } else {
                    loadStudentGrades(selectedClass, selectedSemester);
                }
            }
        } catch (error: any) {
            console.error('Error deleting exam result:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa đợt nhập điểm');
        }
    };

    const handleDeleteAll = async () => {
        if (filteredResults.length === 0) return;

        // Get unique entries by classId, moduleId, entryDate
        const uniqueEntries = new Map<string, { classId: number; moduleId: number; entryDate: string }>();
        
        filteredResults.forEach((result) => {
            const key = `${result.classId}-${result.moduleId}-${result.examDate}`;
            if (!uniqueEntries.has(key)) {
                uniqueEntries.set(key, {
                    classId: result.classId,
                    moduleId: result.moduleId,
                    entryDate: result.examDate,
                });
            }
        });

        try {
            setDeleting(true);
            
            // Delete all entries in parallel using new API
            await Promise.all(
                Array.from(uniqueEntries.values()).map((entry) =>
                    deleteGradeEntry(entry.classId, entry.moduleId, entry.entryDate)
                )
            );
            
            toast.success(`Đã xóa ${uniqueEntries.size} đợt nhập điểm thành công`);
            setShowDeleteDialog(false);

            // Reload data using new API
            if (selectedClass && selectedSemester) {
                if (selectedModule) {
                    loadStudentGrades(selectedClass, selectedSemester, selectedModule);
                } else {
                    loadStudentGrades(selectedClass, selectedSemester);
                }
            }
        } catch (error) {
            console.error('Error deleting exam results:', error);
            toast.error('Không thể xóa đợt nhập điểm');
        } finally {
            setDeleting(false);
        }
    };

    const handleStartEdit = (examResult: ExamResultResponse, studentId: number) => {
        const score = examResult.studentScores.find((s) => s.studentId === studentId);
        if (score) {
            setEditingRow({ examResultId: examResult.examResultId, studentId });
            setEditingScores({
                theoryScore: score.theoryScore.toString(),
                practicalScore: score.practicalScore.toString(),
                note: score.note || '',
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingRow(null);
        setEditingScores(null);
    };

    const handleSaveEdit = async () => {
        if (!editingRow || !editingScores) return;

        const theory = parseFloat(editingScores.theoryScore);
        const practical = parseFloat(editingScores.practicalScore);

        if (isNaN(theory) || isNaN(practical)) {
            toast.error('Vui lòng nhập đầy đủ điểm');
            return;
        }

        if (theory < 0 || theory > 10 || practical < 0 || practical > 10) {
            toast.error('Điểm phải từ 0 đến 10');
            return;
        }

        try {
            setSaving(true);
            const examResult = filteredResults.find((r) => r.examResultId === editingRow.examResultId);
            if (!examResult) return;

            // Prepare grade records for new API - update only the edited one
            // Backend và frontend đều làm việc với thang điểm 0-10
            // Không cần chuyển đổi
            const gradeRecords = examResult.studentScores.map((score) => {
                if (score.studentId === editingRow.studentId) {
                    return {
                        studentId: score.studentId,
                        theoryScore: theory,
                        practiceScore: practical,
                    };
                }
                // Các điểm khác giữ nguyên
                return {
                    studentId: score.studentId,
                    theoryScore: score.theoryScore,
                    practiceScore: score.practicalScore,
                };
            });

            // Get semester from selected module or find from allModules
            let semester = selectedSemester;
            if (!semester) {
                const moduleData = allModules.find((m) => m.moduleId === examResult.moduleId);
                semester = moduleData?.semester || 1; // Fallback to 1 if not available
            }

            // Get entryDate from grade entry mới nhất (vì API getStudentGrades không trả về entryDate)
            let entryDate = examResult.examDate;
            if (!entryDate) {
                try {
                    const gradeEntries = await getGradeEntries(examResult.classId, examResult.moduleId);
                    if (gradeEntries.length > 0) {
                        // Lấy entryDate từ entry mới nhất
                        entryDate = gradeEntries[0].entryDate;
                    } else {
                        // Fallback to today if no entries
                        entryDate = new Date().toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.error('Error getting grade entries:', error);
                    // Fallback to today if error
                    entryDate = new Date().toISOString().split('T')[0];
                }
            }

            // Use new API to update grade records
            const updateRequest: UpdateGradeRecordsRequest = {
                classId: examResult.classId,
                moduleId: examResult.moduleId,
                semester: semester,
                entryDate: entryDate,
                gradeRecords: gradeRecords,
            };

            await updateGradeRecords(updateRequest);

            toast.success('Cập nhật điểm thành công');
            setEditingRow(null);
            setEditingScores(null);

            // Reload data using new API
            if (selectedClass && selectedSemester) {
                if (selectedModule) {
                    loadStudentGrades(selectedClass, selectedSemester, selectedModule);
                } else {
                    loadStudentGrades(selectedClass, selectedSemester);
                }
            }
        } catch (error: any) {
            console.error('Error updating exam result:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật điểm');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // Reload data using new API
        if (selectedClass && selectedSemester) {
            if (selectedModule) {
                loadStudentGrades(selectedClass, selectedSemester, selectedModule);
            } else {
                loadStudentGrades(selectedClass, selectedSemester);
            }
        }
    };


    // Get unique exam dates for filter (từ examDate = entryDate)
    // Lọc bỏ các giá trị rỗng và đảm bảo format đúng (ISO date: YYYY-MM-DD)
    const uniqueDates = Array.from(
        new Set(
            examResults
                .map((r) => r.examDate)
                .filter((date): date is string => {
                    // Chỉ lấy các date hợp lệ (không rỗng, không null/undefined)
                    if (!date || typeof date !== 'string' || date.trim() === '') {
                        return false;
                    }
                    // Kiểm tra format ISO date (YYYY-MM-DD)
                    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    return isoDateRegex.test(date.trim());
                })
        )
    ).sort(); // Sắp xếp theo thứ tự tăng dần

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Điểm thi</h1>
                    <p className="text-sm text-gray-500">Tạo và quản lý các đợt nhập điểm cho học viên</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nhập điểm
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <div className="grid grid-cols-5 gap-4 flex-1">
                        <Select
                            value={selectedClass?.toString() || ''}
                            onValueChange={(val) => {
                                const classId = parseInt(val);
                                setSelectedClass(classId);
                                setSelectedSemester(null);
                                setSelectedModule(null);
                                setSelectedDate('');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn lớp">
                                    {selectedClass
                                        ? allClasses.find((c) => c.classId === selectedClass)?.className || 'Chọn lớp'
                                        : 'Chọn lớp'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {allClasses.map((c) => (
                                    <SelectItem key={c.classId} value={c.classId.toString()}>
                                        {c.className}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedClass && selectedProgramName && (
                            <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
                                <span className="text-sm text-gray-700">
                                    <span className="font-medium">Chương trình:</span> {selectedProgramName}
                                </span>
                            </div>
                        )}
                        {selectedClass && !selectedProgramName && (
                            <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
                                <span className="text-sm text-gray-500 italic">Đang tải...</span>
                            </div>
                        )}

                        {selectedClass && semesters.length > 0 && (
                            <Select
                                value={selectedSemester?.toString() || ''}
                                onValueChange={(val) => {
                                    const semester = parseInt(val);
                                    setSelectedSemester(semester);
                                    setSelectedModule(null);
                                    setSelectedDate('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn kì" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem key={s.semester} value={s.semester.toString()}>
                                            Kì {s.semester}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {selectedClass && semesters.length === 0 && allModules.length === 0 && (
                            <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
                                <span className="text-sm text-gray-500 italic">Đang tải...</span>
                            </div>
                        )}
                        {selectedClass && semesters.length === 0 && allModules.length > 0 && (
                            <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
                                <span className="text-sm text-gray-500 italic">Không có kì học</span>
                            </div>
                        )}

                        {selectedSemester && (
                            <Select
                                value={selectedModule?.toString() || ''}
                                onValueChange={(val) => {
                                    setSelectedModule(val ? parseInt(val) : null);
                                    setSelectedDate('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn module">
                                        {selectedModule
                                            ? (modules.find((m) => m.moduleId === selectedModule)?.moduleName || 'Chọn module')
                                            : 'Chọn module'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {modules.map((m) => (
                                        <SelectItem key={m.moduleId} value={m.moduleId.toString()}>
                                            {m.moduleName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {selectedModule && (
                            <Select
                                value={selectedDate || ''}
                                onValueChange={(val) => setSelectedDate(val || '')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn ngày thi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueDates.length > 0 ? (
                                        uniqueDates.map((date) => {
                                            try {
                                                // Parse ISO date string (YYYY-MM-DD) và format theo locale Việt Nam
                                                const dateObj = new Date(date + 'T00:00:00'); // Thêm time để tránh timezone issues
                                                const formattedDate = dateObj.toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                });
                                                return (
                                                    <SelectItem key={date} value={date}>
                                                        {formattedDate}
                                                    </SelectItem>
                                                );
                                            } catch (error) {
                                                // Fallback: hiển thị date string gốc nếu parse lỗi
                                                return (
                                                    <SelectItem key={date} value={date}>
                                                        {date}
                                                    </SelectItem>
                                                );
                                            }
                                        })
                                    ) : (
                                        <SelectItem value="" disabled>
                                            Không có ngày thi
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </Card>

            {/* Exam Results Table */}
            {!selectedClass ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Vui lòng chọn lớp để xem danh sách điểm thi</p>
                </Card>
            ) : !selectedSemester ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Vui lòng chọn kì để xem danh sách điểm thi</p>
                </Card>
            ) : !selectedModule ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Vui lòng chọn module để xem danh sách điểm thi</p>
                </Card>
            ) : loading ? (
                <Card className="p-8 text-center">
                    <p>Đang tải...</p>
                </Card>
            ) : filteredResults.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>Chưa có điểm thi nào</p>
                </Card>
            ) : (
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Danh sách điểm thi ({filteredResults.reduce((sum, r) => sum + r.studentScores.length, 0)} học viên)
                            </h3>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa đợt nhập điểm
                            </Button>
                        </div>
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead>Mã HV</TableHead>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead className="text-center">Điểm LT</TableHead>
                                        <TableHead className="text-center">Điểm TH</TableHead>
                                        <TableHead className="text-center">Điểm tổng</TableHead>
                                        <TableHead className="text-center">Kết quả</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResults.flatMap((result, resultIndex) =>
                                        result.studentScores.map((score, scoreIndex) => {
                                            const globalIndex = filteredResults
                                                .slice(0, resultIndex)
                                                .reduce((sum, r) => sum + r.studentScores.length, 0) + scoreIndex + 1;
                                            
                                            const isEditing = editingRow?.examResultId === result.examResultId && editingRow?.studentId === score.studentId;
                                            
                                            return (
                                                <TableRow key={`${result.examResultId}-${score.studentId}`}>
                                                    <TableCell>{globalIndex}</TableCell>
                                                    <TableCell>{score.studentCode}</TableCell>
                                                    <TableCell>{score.fullName}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditing && editingScores ? (
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={editingScores.theoryScore}
                                                                onChange={(e) =>
                                                                    setEditingScores({
                                                                        ...editingScores,
                                                                        theoryScore: e.target.value,
                                                                    })
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleSaveEdit();
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                                className="w-20 text-center"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            score.theoryScore
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditing && editingScores ? (
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={editingScores.practicalScore}
                                                                onChange={(e) =>
                                                                    setEditingScores({
                                                                        ...editingScores,
                                                                        practicalScore: e.target.value,
                                                                    })
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleSaveEdit();
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                                className="w-20 text-center"
                                                            />
                                                        ) : (
                                                            score.practicalScore
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {score.finalScore}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={score.status === 'PASS' ? 'success' : 'destructive'}
                                                            className={
                                                                score.status === 'PASS'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }
                                                        >
                                                            {score.status === 'PASS' ? 'Đạt' : 'Không đạt'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {isEditing && editingScores ? (
                                                            <Input
                                                                type="text"
                                                                value={editingScores.note}
                                                                onChange={(e) =>
                                                                    setEditingScores({
                                                                        ...editingScores,
                                                                        note: e.target.value,
                                                                    })
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveEdit();
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                                onBlur={handleSaveEdit}
                                                                className="w-full"
                                                                placeholder="Ghi chú"
                                                            />
                                                        ) : (
                                                            score.note || '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={handleSaveEdit}
                                                                        disabled={saving}
                                                                        title="Lưu"
                                                                    >
                                                                        {saving ? 'Đang lưu...' : 'Lưu'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={handleCancelEdit}
                                                                        disabled={saving}
                                                                        title="Hủy"
                                                                    >
                                                                        Hủy
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleStartEdit(result, score.studentId)}
                                                                    title="Chỉnh sửa điểm"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateExamResultModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa đợt nhập điểm</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa tất cả các đợt nhập điểm đang hiển thị không? 
                            Hành động này sẽ xóa toàn bộ điểm đã nhập và không thể hoàn tác.
                            {filteredResults.length > 0 && (
                                <span className="block mt-2 font-medium">
                                    Số lượng đợt nhập điểm sẽ bị xóa: {Array.from(new Set(filteredResults.map((r) => r.examResultId))).length}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAll} disabled={deleting}>
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExamManagementPage;
