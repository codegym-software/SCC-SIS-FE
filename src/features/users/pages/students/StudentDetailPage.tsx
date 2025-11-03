import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    BookOpen,
    Users,
    BarChart3,
    FileText,
    ArrowLeft,
    MapPin,
} from 'lucide-react';
import { getStudentWithEnrollmentsById } from '@/shared/api/students';
import type { StudentUI } from '@/shared/types/student-ui';
import type { StudentEnrollment, StudentWithEnrollmentsDto } from '@/shared/types/student';
import ClassLogTab from '@/features/users/pages/classes/components/journals/ClassLogTab';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
            {children}
        </div>
    );
}

export default function StudentDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<StudentUI | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'classes' | 'attendance' | 'scores' | 'logs'>('info');
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    // Map DTO -> UI
    const mapDto = (dto: StudentWithEnrollmentsDto): StudentUI => ({
        id: dto.studentId.toString(),
        studentId: `SV${String(dto.studentId).padStart(3, '0')}`,
        name: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        initial: dto.fullName
            .split(' ')
            .map((n) => n[0])
            .join(''),
        registrationDate: dto.createdAt.split('T')[0],
        status: (dto.overallStatus === 'PENDING'
            ? 'Đang chờ'
            : dto.overallStatus === 'ACTIVE'
              ? 'Đang học'
              : dto.overallStatus === 'DROPPED'
                ? 'Nghỉ học'
                : dto.overallStatus === 'GRADUATED'
                  ? 'Tốt nghiệp'
                  : 'Đang chờ') as StudentUI['status'],
        avatar: localStorage.getItem(`student_avatar_${dto.studentId}`) || '',
        dob: dto.dob || null,
        address: dto.addressLine || null,
        gender: dto.gender || null,
        nationalIdNo: dto.nationalIdNo || null,
        enrollments: dto.enrollments || [],
    });

    useEffect(() => {
        const run = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await getStudentWithEnrollmentsById(parseInt(id));
                const ui = mapDto(res.data);
                setStudent(ui);
                if (ui.enrollments?.length) {
                    const e = ui.enrollments[0];
                    setSelectedClass({
                        classId: e.classId,
                        name: e.className,
                        programName: e.programName,
                        centerName: '',
                        status: e.status,
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    const calculateOverallStatus = (enrollments: StudentEnrollment[]): 'Đang chờ' | 'Đang học' | 'Nghỉ học' => {
        if (!enrollments || enrollments.length === 0) return 'Đang chờ';
        const hasActive = enrollments.some((e) => e.status === 'ACTIVE');
        const hasSuspended = enrollments.some((e) => e.status === 'SUSPENDED');
        const hasDropped = enrollments.some((e) => e.status === 'DROPPED');
        if (hasActive) return 'Đang học';
        if (hasSuspended) return 'Đang chờ';
        if (hasDropped) return 'Nghỉ học';
        return 'Đang chờ';
    };

    const getEnrollmentStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-50 text-green-700';
            case 'SUSPENDED':
                return 'bg-yellow-50 text-yellow-700';
            case 'DROPPED':
                return 'bg-red-50 text-red-700';
            case 'GRADUATED':
                return 'bg-blue-50 text-blue-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const getEnrollmentStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang học';
            case 'SUSPENDED':
                return 'Bảo lưu';
            case 'DROPPED':
                return 'Đã nghỉ';
            case 'GRADUATED':
                return 'Tốt nghiệp';
            default:
                return status;
        }
    };

    if (loading) return <div className="bg-white rounded-lg border p-8 text-center">Đang tải dữ liệu...</div>;
    if (!student) return <div className="bg-white rounded-lg border p-8 text-center">Không tìm thấy học viên</div>;

    const tabs = [
        { id: 'info', label: 'Thông tin', icon: User },
        { id: 'classes', label: 'Lớp học', icon: BookOpen },
        { id: 'attendance', label: 'Điểm danh', icon: Users },
        { id: 'scores', label: 'Điểm thi', icon: BarChart3 },
        { id: 'logs', label: 'Nhật ký', icon: FileText },
    ] as const;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg border hover:bg-gray-50">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 grid place-items-center">
                        <User size={18} />
                    </div>
                    <div>
                        <div className="text-base font-semibold text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.studentId}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-2 border-b">
                    <div className="flex gap-1">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const isActive = activeTab === (t.id as typeof activeTab);
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <Icon size={14} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="px-4 py-4">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Section title="Thông tin cá nhân">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-gray-500" />
                                        <span className="text-sm">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="text-gray-500" />
                                        <span className="text-sm">{student.phone}</span>
                                    </div>
                                    {student.address && (
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-gray-500" />
                                            <span className="text-sm">{student.address}</span>
                                        </div>
                                    )}
                                    {student.dob && (
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-gray-500" />
                                            <span className="text-sm">Sinh: {student.dob}</span>
                                        </div>
                                    )}
                                </div>
                            </Section>
                            <Section title="Thông tin học tập">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="text-sm">Đăng ký: {student.registrationDate}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${calculateOverallStatus(student.enrollments) === 'Đang học' ? 'bg-green-50 text-green-700' : calculateOverallStatus(student.enrollments) === 'Đang chờ' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}
                                        >
                                            {calculateOverallStatus(student.enrollments)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={16} className="text-gray-500" />
                                        <span className="text-sm">{student.enrollments.length} lớp học</span>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="space-y-3">
                            {student.enrollments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Chưa đăng ký lớp học nào</div>
                            ) : (
                                student.enrollments.map((enrollment) => (
                                    <div
                                        key={enrollment.enrollmentId}
                                        className="border rounded-lg p-4 flex items-start justify-between"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{enrollment.className}</div>
                                            <div className="text-sm text-gray-500">{enrollment.programName}</div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Đăng ký: {enrollment.enrolledAt}</span>
                                                {enrollment.leftAt && <span>Kết thúc: {enrollment.leftAt}</span>}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.status)}`}
                                        >
                                            {getEnrollmentStatusText(enrollment.status)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">20</div>
                                    <div className="text-xs text-gray-500">Tổng buổi</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">18</div>
                                    <div className="text-xs text-gray-500">Có mặt</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">1</div>
                                    <div className="text-xs text-gray-500">Vắng</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">90%</div>
                                    <div className="text-xs text-gray-500">Tỷ lệ</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gray-600 h-2 rounded-full" style={{ width: '90%' }} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'scores' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Module</th>
                                        <th className="text-left py-2">Loại thi</th>
                                        <th className="text-left py-2">Lý thuyết</th>
                                        <th className="text-left py-2">Thực hành</th>
                                        <th className="text-left py-2">Tổng kết</th>
                                        <th className="text-left py-2">Ngày thi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">JAVA101 (Java Cơ bản)</td>
                                        <td className="py-2">Giữa kỳ</td>
                                        <td className="py-2">8.5</td>
                                        <td className="py-2">9.0</td>
                                        <td className="py-2 font-bold">8.8</td>
                                        <td className="py-2">2024-12-20</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-4">
                            {student.enrollments && student.enrollments.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        Lớp học đã đăng ký
                                    </label>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {student.enrollments.map((enrollment) => (
                                            <button
                                                key={enrollment.classId}
                                                onClick={() =>
                                                    setSelectedClass({
                                                        classId: enrollment.classId,
                                                        name: enrollment.className,
                                                        programName: enrollment.programName,
                                                        centerName: '',
                                                        status: 'ACTIVE',
                                                    })
                                                }
                                                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${selectedClass?.classId === enrollment.classId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                                            >
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {enrollment.className}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {enrollment.programName}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">Chưa có lớp học</div>
                            )}

                            {selectedClass && (
                                <div className="mt-4">
                                    <ClassLogTab selectedClass={selectedClass} readOnly={true} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
