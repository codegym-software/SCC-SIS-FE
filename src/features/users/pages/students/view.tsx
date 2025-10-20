import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, GraduationCap, Clock, CheckCircle, BookOpen, MapPin, Users, BarChart3, FileText } from 'lucide-react';
import { listClasses } from '@/shared/api/classes';
import { getClassStudents } from '@/shared/api/classes';
import type { EnrollmentResponse } from '@/shared/types/classes';

type Student = {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    initial: string;
    class: string;
    program: string;
    registrationDate: string;
    status: 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp' | 'Tạm dừng';
    dob?: string | null;
    address?: string | null;
    gender?: string | null;
    nationalIdNo?: string | null;
};

interface StudentViewProps {
    student: Student;
    onClose?: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

    // Load student's enrollments when viewing classes tab
    useEffect(() => {
        loadEnrollments(); // Load ngay khi mount để có activeEnrollment
    }, [student.id]);


    const loadEnrollments = async () => {
        try {
            setIsLoadingEnrollments(true);
            // Get all classes
            const classesResponse = await listClasses();
            const classes = classesResponse.data;
            
            // For each class, get enrollments and find this student
            const studentEnrollments: any[] = [];
            
            for (const classItem of classes) {
                try {
                    const response = await getClassStudents(classItem.classId, {
                        page: 0,
                        size: 1000
                    });
                    const enrollmentsData: EnrollmentResponse[] = response.data.content || response.data;
                    
                    // Find this student's enrollment in this class
                    const studentEnrollment = enrollmentsData.find(e => e.studentId === parseInt(student.id));
                    if (studentEnrollment) {
                        const enrollment = {
                            ...studentEnrollment,
                            className: classItem.name,
                            classId: classItem.classId,
                            programName: classItem.programName
                        };
                        studentEnrollments.push(enrollment);
                    }
                } catch (error) {
                    // Skip if can't access this class
                    console.log(`Cannot access class ${classItem.classId}`);
                }
            }
            
            setEnrollments(studentEnrollments);
        } catch (error: any) {
            console.error('Error loading enrollments:', error);
            toast.error(error?.response?.data?.message || 'Không thể tải danh sách lớp học');
        } finally {
            setIsLoadingEnrollments(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Đang học':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'Bảo lưu':
                return <Clock size={16} className="text-orange-600" />;
            case 'Tốt nghiệp':
                return <GraduationCap size={16} className="text-blue-600" />;
            case 'Tạm dừng':
                return <Clock size={16} className="text-gray-600" />;
            default:
                return <Clock size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đang học':
                return 'bg-green-50 text-green-700';
            case 'Bảo lưu':
                return 'bg-orange-50 text-orange-700';
            case 'Tốt nghiệp':
                return 'bg-blue-50 text-blue-700';
            case 'Tạm dừng':
                return 'bg-gray-50 text-gray-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const tabs = [
        { id: 'info', label: 'Thông tin', icon: User },
        { id: 'classes', label: 'Lớp học', icon: BookOpen },
        { id: 'attendance', label: 'Điểm danh', icon: Users },
        { id: 'scores', label: 'Điểm thi', icon: BarChart3 },
        { id: 'logs', label: 'Nhật ký', icon: FileText },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
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
                                {student.gender && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-gray-500" />
                                        <span className="text-sm">
                                            Giới tính: {
                                                student.gender === 'MALE' ? 'Nam' :
                                                student.gender === 'FEMALE' ? 'Nữ' :
                                                student.gender === 'OTHER' ? 'Khác' : student.gender
                                            }
                                        </span>
                                    </div>
                                )}
                                {student.nationalIdNo && (
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="text-sm">CMND/CCCD: {student.nationalIdNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin học tập</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <BookOpen size={16} className="text-gray-500" />
                                    <span className="text-sm">{student.program}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-sm">{student.class}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span className="text-sm">Đăng ký: {student.registrationDate}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                        {student.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                );

            case 'classes':
                return (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Danh sách lớp học đã đăng ký</h4>
                        
                        {isLoadingEnrollments ? (
                            <div className="text-center py-8 text-gray-500">Đang tải...</div>
                        ) : enrollments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Chưa đăng ký lớp học nào</div>
                        ) : (
                            <div className="space-y-3">
                                {enrollments.map((enrollment) => (
                                    <div key={enrollment.enrollmentId} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{enrollment.className}</h5>
                                                <p className="text-sm text-gray-500">{enrollment.programName}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Đăng ký: {enrollment.enrolledAt}</span>
                                                    {enrollment.leftAt && <span>Kết thúc: {enrollment.leftAt}</span>}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                enrollment.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                                                enrollment.status === 'SUSPENDED' ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                                {enrollment.status === 'ACTIVE' ? 'Đang học' :
                                                 enrollment.status === 'SUSPENDED' ? 'Tạm dừng' : 'Đã rớt'}
                                            </span>
                                        </div>

                                        {enrollment.note && (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                Ghi chú: {enrollment.note}
                                            </p>
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'attendance':
                return (
                    <div className="space-y-6">
                        {/* Attendance Statistics */}
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

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                    </div>
                );

            case 'scores':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-900">Bảng điểm</h4>
                            <span className="text-sm text-gray-600">Điểm trung bình: 8.75</span>
                        </div>
                        
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
                                    <tr className="border-b">
                                        <td className="py-2">JAVA101 (Java Cơ bản)</td>
                                        <td className="py-2">Bài tập lớn</td>
                                        <td className="py-2">8.0</td>
                                        <td className="py-2">9.5</td>
                                        <td className="py-2 font-bold">8.8</td>
                                        <td className="py-2">2024-12-15</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'logs':
                return (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Nhật ký Lớp học liên quan</h4>
                        
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-sm font-medium">Bài học về OOP trong Java</h5>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Tiến độ học tập</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Hôm nay chúng ta đã học về khái niệm lập trình hướng đối tượng...
                                </p>
                                <div className="text-xs text-gray-500">2024-12-19</div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-sm font-medium">Thông báo bài tập về nhà</h5>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Bài tập</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Các em làm bài tập chương 3, nộp trước thứ 6 tuần tới...
                                </p>
                                <div className="text-xs text-gray-500">2024-12-18</div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg w-full">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                        <User size={16} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Hồ sơ Học viên - {student.name}</h2>
                        <p className="text-sm text-gray-500">{student.studentId} • {student.class}</p>
                    </div>
                </div>
                <button 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="px-4 py-2 border-b">
                <div className="flex space-x-1">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4">
                {renderTabContent()}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default StudentView;
