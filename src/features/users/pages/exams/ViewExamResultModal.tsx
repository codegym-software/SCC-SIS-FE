import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExamResultResponse } from '@/shared/api/exams';

interface ViewExamResultModalProps {
    examResult: ExamResultResponse;
    onClose: () => void;
}

const ViewExamResultModal: React.FC<ViewExamResultModalProps> = ({ examResult, onClose }) => {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết đợt nhập điểm</DialogTitle>
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
                        <div>
                            <p className="text-sm text-gray-500">Ngày thi</p>
                            <p className="font-medium">{new Date(examResult.examDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Người tạo</p>
                            <p className="font-medium">{examResult.creatorName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày tạo</p>
                            <p className="font-medium">{new Date(examResult.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                            <p className="font-medium">{new Date(examResult.updatedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    {/* Scores Table */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Điểm học viên</h3>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead>Mã HV</TableHead>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead className="text-center">Điểm LT</TableHead>
                                        <TableHead className="text-center">Điểm TH</TableHead>
                                        <TableHead className="text-center">Điểm TK</TableHead>
                                        <TableHead className="text-center">Kết quả</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {examResult.studentScores.map((score, index) => (
                                        <TableRow key={score.studentId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{score.studentCode}</TableCell>
                                            <TableCell>{score.fullName}</TableCell>
                                            <TableCell className="text-center">
                                                {score.theoryScore.toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {score.practicalScore.toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {score.finalScore.toFixed(2)}
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
                                            <TableCell className="text-sm text-gray-600">{score.note || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 text-center">
                            <p className="text-sm text-gray-500">Tổng số học viên</p>
                            <p className="text-2xl font-bold">{examResult.studentScores.length}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-sm text-gray-500">Đạt</p>
                            <p className="text-2xl font-bold text-green-600">
                                {examResult.studentScores.filter((s) => s.status === 'PASS').length}
                            </p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-sm text-gray-500">Không đạt</p>
                            <p className="text-2xl font-bold text-red-600">
                                {examResult.studentScores.filter((s) => s.status === 'FAIL').length}
                            </p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-sm text-gray-500">Tỷ lệ đạt</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {(
                                    (examResult.studentScores.filter((s) => s.status === 'PASS').length /
                                        examResult.studentScores.length) *
                                    100
                                ).toFixed(1)}
                                %
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewExamResultModal;
