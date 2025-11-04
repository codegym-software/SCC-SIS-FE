import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateExamResult, type ExamResultResponse, type StudentScoreInput } from '@/shared/api/exams';
import { toast } from 'sonner';

interface EditExamResultModalProps {
    examResult: ExamResultResponse;
    onClose: () => void;
    onSuccess: () => void;
}

interface ScoreRow {
    studentId: number;
    studentCode: string;
    fullName: string;
    theoryScore: string;
    practicalScore: string;
    note: string;
}

const EditExamResultModal: React.FC<EditExamResultModalProps> = ({ examResult, onClose, onSuccess }) => {
    const [examDate, setExamDate] = useState<string>('');
    const [scoreRows, setScoreRows] = useState<ScoreRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Initialize form with existing data
        setExamDate(examResult.examDate);

        const rows: ScoreRow[] = examResult.studentScores.map((s) => ({
            studentId: s.studentId,
            studentCode: s.studentCode,
            fullName: s.fullName,
            theoryScore: s.theoryScore.toString(),
            practicalScore: s.practicalScore.toString(),
            note: s.note || '',
        }));
        setScoreRows(rows);
    }, [examResult]);

    const handleScoreChange = (studentId: number, field: 'theoryScore' | 'practicalScore' | 'note', value: string) => {
        setScoreRows((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, [field]: value } : row)));
    };

    const handleSubmit = async () => {
        // Validation
        if (!examDate) {
            toast.error('Vui lòng chọn ngày thi');
            return;
        }

        // Validate scores
        const studentScores: StudentScoreInput[] = [];
        for (const row of scoreRows) {
            const theory = parseFloat(row.theoryScore);
            const practical = parseFloat(row.practicalScore);

            if (isNaN(theory) || isNaN(practical)) {
                toast.error(`Vui lòng nhập đầy đủ điểm cho ${row.fullName}`);
                return;
            }

            if (theory < 0 || theory > 10 || practical < 0 || practical > 10) {
                toast.error(`Điểm phải từ 0 đến 10 cho ${row.fullName}`);
                return;
            }

            studentScores.push({
                studentId: row.studentId,
                theoryScore: theory,
                practicalScore: practical,
                note: row.note || undefined,
            });
        }

        try {
            setSubmitting(true);
            await updateExamResult(examResult.examResultId, {
                examDate,
                studentScores,
            });
            toast.success('Cập nhật điểm thành công');
            onSuccess();
        } catch (error: any) {
            console.error('Error updating exam result:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật điểm');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa đợt nhập điểm</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Info Section */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500">Lớp</p>
                            <p className="font-medium">{examResult.className}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Module</p>
                            <p className="font-medium">{examResult.moduleName}</p>
                        </div>
                    </div>

                    {/* Editable Date */}
                    <div>
                        <Label>Ngày thi</Label>
                        <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                    </div>

                    {/* Editable Scores Table */}
                    <div>
                        <Label className="mb-2 block">Điểm học viên</Label>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead>Mã HV</TableHead>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead className="w-[120px]">Điểm LT</TableHead>
                                        <TableHead className="w-[120px]">Điểm TH</TableHead>
                                        <TableHead className="w-[200px]">Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scoreRows.map((row, index) => (
                                        <TableRow key={row.studentId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.studentCode}</TableCell>
                                            <TableCell>{row.fullName}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={row.theoryScore}
                                                    onChange={(e) =>
                                                        handleScoreChange(row.studentId, 'theoryScore', e.target.value)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={row.practicalScore}
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            row.studentId,
                                                            'practicalScore',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.note}
                                                    onChange={(e) =>
                                                        handleScoreChange(row.studentId, 'note', e.target.value)
                                                    }
                                                    placeholder="Ghi chú..."
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang lưu...' : 'Cập nhật'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditExamResultModal;
