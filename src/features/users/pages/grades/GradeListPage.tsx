import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    getClassGradeEntries,
    mockModules,
    mockStudents,
    createGradeEntry,
    deleteGradeEntry,
} from '@/shared/api/grades.mock';
import type { GradeEntry } from '@/shared/types/grades';
import { toast } from 'sonner';

export function GradeListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
    const [modules] = useState(mockModules);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState<GradeEntry | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Mock classId - trong thực tế sẽ lấy từ user context hoặc params
    const classId = 1;

    useEffect(() => {
        loadGradeEntries();
    }, []);

    const loadGradeEntries = async () => {
        try {
            setLoading(true);
            const data = await getClassGradeEntries(classId);
            setGradeEntries(data);
        } catch (err) {
            console.error('Error loading grade entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const getProgressBadge = (gradedStudents: number, totalStudents: number) => {
        const percentage = totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0;

        if (percentage === 0) {
            return (
                <Badge variant="outline" className="text-gray-500">
                    Chưa bắt đầu
                </Badge>
            );
        } else if (percentage === 100) {
            return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
        } else {
            return <Badge className="bg-yellow-100 text-yellow-800">Đang chấm</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    const handleGradeClick = async (moduleId: number) => {
        // Find existing entry by module
        const entry = gradeEntries.find((e) => e.moduleId === moduleId);
        if (entry) {
            navigate(`/grades/${entry.gradeEntryId}`);
            return;
        }

        // Create a new entry for this module to ensure only modules attached to program are graded
        try {
            const newId = await createGradeEntry(classId, moduleId);
            // Refresh entries and navigate
            await loadGradeEntries();
            navigate(`/grades/${newId}`);
        } catch (e) {
            console.error('Cannot create grade entry:', e);
        }
    };

    const handleDeleteClick = (entry: GradeEntry) => {
        setDeletingEntry(entry);
        setShowDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!deletingEntry) return;

        try {
            setDeleting(true);
            await deleteGradeEntry(deletingEntry.classId, deletingEntry.moduleId, deletingEntry.entryDate);
            toast.success('Đã xóa đợt nhập điểm thành công');
            await loadGradeEntries();
        } catch (err) {
            toast.error('Không thể xóa đợt nhập điểm. Vui lòng thử lại.');
            console.error('Error deleting grade entry:', err);
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
            setDeletingEntry(null);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý điểm số</h1>
                    <p className="text-gray-500">Chỉ chấm các module đã gắn vào Chương trình</p>
                </div>
                {/* Tạo bảng điểm mới được ẩn vì chỉ cho phép tạo theo module của chương trình (tự tạo khi bấm Chấm điểm) */}
            </div>

            {/* Grade Entries Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Bảng điểm lớp FULLSTACK-JS-K01</CardTitle>
                            <CardDescription>Danh sách các bảng điểm theo module</CardDescription>
                        </div>
                        {gradeEntries.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Xóa đợt nhập điểm
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {gradeEntries.map((entry) => (
                                        <DropdownMenuItem
                                            key={entry.gradeEntryId}
                                            onClick={() => handleDeleteClick(entry)}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Xóa: {entry.moduleName}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Ngày chấm</TableHead>
                                <TableHead>Người chấm</TableHead>
                                <TableHead>Tiến độ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.map((mod, index) => {
                                const entry = gradeEntries.find((e) => e.moduleId === mod.moduleId);
                                const graded = entry?.gradedStudents ?? 0;
                                const total = entry?.totalStudents ?? mockStudents.length;
                                return (
                                    <TableRow key={mod.moduleId}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{mod.name}</p>
                                                <p className="text-sm text-gray-500">Mã: {mod.code}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {entry ? new Date(entry.entryDate).toLocaleDateString('vi-VN') : '—'}
                                        </TableCell>
                                        <TableCell>{entry ? entry.createdByName : '—'}</TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {graded} / {total} học sinh
                                            </span>
                                        </TableCell>
                                        <TableCell>{getProgressBadge(graded, total)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleGradeClick(mod.moduleId)}
                                                    className="gap-1"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Chấm điểm
                                                </Button>
                                                {entry && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/grades/${entry.gradeEntryId}/view`)}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Xem
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa đợt nhập điểm</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa đợt nhập điểm{' '}
                            <strong>{deletingEntry?.moduleName}</strong> không? Hành động này sẽ xóa toàn bộ điểm đã
                            nhập và không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
