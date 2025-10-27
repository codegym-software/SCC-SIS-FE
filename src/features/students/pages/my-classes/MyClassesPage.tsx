import React, { useState, useEffect } from 'react';
import { Search, Eye, ArrowLeft } from 'lucide-react';

// Types
type ClassStatus = 'Đang học' | 'Hoàn thành' | 'Sắp học';

type Class = {
    id: string;
    name: string;
    classCode: string;
    programName: string;
    instructor: string;
    schedule: string;
    room: string;
    nextSession: string;
    progress: number;
    attended: number;
    total: number;
    attendanceRate: number;
    status: ClassStatus;
};

type Module = {
    id: string;
    name: string;
    moduleCode: string;
    credits: number;
    duration: string;
    description: string;
    status: 'Hoàn thành' | 'Đang học' | 'Chưa học';
    canCollapse?: boolean;
};

type ModuleDetail = {
    id: string;
    name: string;
    moduleCode: string;
    instructor: string;
    schedule: string;
    room: string;
    credits: number;
    duration: string;
    nextSession: string;
    status: 'Đang học' | 'Hoàn thành' | 'Chưa học';
    lessons: Lesson[];
};

type Lesson = {
    id: string;
    title: string;
    code: string;
    description: string;
    credits: number;
    duration: string;
    status: 'Hoàn thành' | 'Đang học' | 'Chưa học';
    canCollapse: boolean;
    hasPrerequisite?: boolean;
};

export default function MyClassesPage() {
    const [view, setView] = useState<'list' | 'detail' | 'module'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);

    // Mock data - Classes
    const [classes] = useState<Class[]>([
        {
            id: '1',
            name: 'Lập trình Web Frontend',
            classCode: 'WEB101',
            programName: 'Lập trình Full Stack',
            instructor: 'Nguyễn Thị Mai',
            schedule: 'Thứ 2, 4, 6 - 19:00-21:00',
            room: 'Phòng A101',
            nextSession: '19:00:00\n23/12/2024',
            progress: 65,
            attended: 13,
            total: 20,
            attendanceRate: 65,
            status: 'Đang học',
        },
        {
            id: '2',
            name: 'Cơ sở dữ liệu MySQL',
            classCode: 'DB201',
            programName: 'Lập trình Full Stack',
            instructor: 'Trần Văn Hùng',
            schedule: 'Thứ 3, 5, 7 - 18:30-20:30',
            room: 'Phòng B203',
            nextSession: '18:30:00\n24/12/2024',
            progress: 80,
            attended: 12,
            total: 15,
            attendanceRate: 80,
            status: 'Đang học',
        },
        {
            id: '3',
            name: 'Thiết kế UX/UI',
            classCode: 'UI301',
            programName: 'Thiết kế Đồ họa',
            instructor: 'Lê Thị Hoa',
            schedule: 'Thứ 2, 4 - 19:30-21:30',
            room: 'Phòng C105',
            nextSession: '',
            progress: 100,
            attended: 11,
            total: 12,
            attendanceRate: 92,
            status: 'Hoàn thành',
        },
    ]);

    // Mock data - Modules for selected class
    const [classModules] = useState<Module[]>([
        {
            id: '1',
            name: 'HTML & CSS Cơ bản',
            moduleCode: 'HTML-CSS',
            credits: 2,
            duration: '4 tuần',
            description: 'Học các khái niệm cơ bản về HTML và CSS để xây dựng giao diện web',
            status: 'Hoàn thành',
            canCollapse: true,
        },
        {
            id: '2',
            name: 'JavaScript Cơ bản',
            moduleCode: 'JS-BASIC',
            credits: 3,
            duration: '6 tuần',
            description: 'Làm quen với JavaScript và lập trình web động',
            status: 'Hoàn thành',
            canCollapse: false,
        },
        {
            id: '3',
            name: 'React Fundamentals',
            moduleCode: 'REACT-FUND',
            credits: 3,
            duration: '6 tuần',
            description: 'Tìm hiểu về React và xây dựng ứng dụng web hiện đại',
            status: 'Đang học',
            canCollapse: false,
        },
        {
            id: '4',
            name: 'React Nâng cao',
            moduleCode: 'REACT-ADV',
            credits: 4,
            duration: '8 tuần',
            description: 'Các kỹ thuật nâng cao trong React: Hooks, Context, Performance',
            status: 'Chưa học',
        },
    ]);

    // Mock data - Module detail with lessons
    const mockModuleDetail: ModuleDetail = {
        id: '1',
        name: 'Lập trình Web Frontend',
        moduleCode: 'FS2024',
        instructor: 'Nguyễn Thị Mai',
        schedule: 'Thứ 2, 4, 6 - 19:00-21:00',
        room: 'Phòng A101',
        credits: 13,
        duration: '13 tín chỉ',
        nextSession: '19:00:00\n23/12/2024',
        status: 'Đang học',
        lessons: [
            {
                id: '1',
                title: 'HTML & CSS Cơ bản',
                code: 'HTML-CSS',
                description: 'Học các khái niệm cơ bản về HTML và CSS để xây dựng giao diện web',
                credits: 2,
                duration: '4 tuần',
                status: 'Hoàn thành',
                canCollapse: true,
            },
            {
                id: '2',
                title: 'JavaScript Cơ bản',
                code: 'JS-BASIC',
                description: 'Làm quen với JavaScript và lập trình web động',
                credits: 3,
                duration: '6 tuần',
                status: 'Hoàn thành',
                canCollapse: false,
                hasPrerequisite: true,
            },
            {
                id: '3',
                title: 'React Fundamentals',
                code: 'REACT-FUND',
                description: 'Tìm hiểu về React và xây dựng ứng dụng web hiện đại',
                credits: 3,
                duration: '6 tuần',
                status: 'Đang học',
                canCollapse: false,
                hasPrerequisite: true,
            },
            {
                id: '4',
                title: 'React Nâng cao',
                code: 'REACT-ADV',
                description: 'Các kỹ thuật nâng cao trong React',
                credits: 4,
                duration: '8 tuần',
                status: 'Chưa học',
                canCollapse: false,
            },
        ],
    };

    // Filter classes
    const filteredClasses = classes.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.classCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'Tất cả' || cls.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewClassDetail = (cls: Class) => {
        setSelectedClass(cls);
        setView('detail');
    };

    const handleViewModule = () => {
        setSelectedModule(mockModuleDetail);
        setView('module');
    };

    const handleBackToList = () => {
        setSelectedClass(null);
        setSelectedModule(null);
        setView('list');
    };

    const handleBackToDetail = () => {
        setSelectedModule(null);
        setView('detail');
    };

    // Render Class List
    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-lg font-semibold">Lớp học của tôi</h1>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo tên lớp, mã lớp hoặc giảng viên..."
                            className="w-full h-10 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>
                    <button className="h-10 px-4 rounded-md bg-gray-900 text-white text-sm font-medium">Tất cả</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Đang học</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Hoàn thành</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Sắp học</button>
                </div>

                {/* Class Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClasses.map((cls) => (
                        <div key={cls.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm mb-1">{cls.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">{cls.classCode}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                cls.status === 'Đang học'
                                                    ? 'bg-black text-white'
                                                    : cls.status === 'Hoàn thành'
                                                      ? 'bg-green-100 text-green-700'
                                                      : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {cls.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleViewClassDetail(cls)}
                                    className="p-1.5 hover:bg-gray-100 rounded"
                                >
                                    <Eye size={16} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">👤</span>
                                    <span>GV: {cls.instructor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📅</span>
                                    <span>{cls.schedule}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📍</span>
                                    <span>{cls.room}</span>
                                </div>
                                {cls.nextSession && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <span className="text-blue-400">🕐</span>
                                        <span>Buổi tiếp theo: {cls.nextSession.replace('\n', ' ')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Progress */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-medium">Tiến độ</span>
                                    <span className="font-semibold">{cls.progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${cls.progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                    <span>
                                        Đã học: {cls.attended}/{cls.total} buổi
                                    </span>
                                    <span>Tỷ lệ tham gia: {cls.attendanceRate}%</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleViewClassDetail(cls)}
                                    className="flex-1 h-9 rounded-md bg-gray-900 text-white text-sm font-medium"
                                >
                                    Xem chi tiết
                                </button>
                                <button className="flex-1 h-9 rounded-md border text-sm">Vào lớp</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Render Class Detail with Modules
    if (view === 'detail' && selectedClass) {
        return (
            <div className="space-y-6">
                {/* Back button */}
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách lớp</span>
                </button>

                {/* Class Header */}
                <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-semibold mb-2">{selectedClass.name}</h1>
                            <p className="text-sm text-gray-500">
                                Giảng viên: {selectedClass.instructor} | Mã lớp: {selectedClass.classCode}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedClass.status === 'Đang học'
                                    ? 'bg-black text-white'
                                    : 'bg-green-100 text-green-700'
                            }`}
                        >
                            {selectedClass.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Lịch học:</span>
                            <div className="font-medium mt-1">{selectedClass.schedule}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Phòng học:</span>
                            <div className="font-medium mt-1">{selectedClass.room}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Trạng thái:</span>
                            <div className="font-medium mt-1">{selectedClass.status}</div>
                        </div>
                    </div>
                </div>

                {/* Program Modules */}
                <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-blue-500">🎓</span>
                                {selectedClass.programName}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Các chương trình đào tạo trong lớp học này (2 chương trình)
                            </p>
                        </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-3">
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold">{selectedClass.programName}</h3>
                                        <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">
                                            Đang học
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Học xây dựng giao diện web hiện đại với React
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>📚 4 modules</span>
                                        <span>⏱️ 13 tín chỉ</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleViewModule}
                                    className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
                                >
                                    Xem chi tiết
                                </button>
                            </div>

                            {/* Modules preview */}
                            <div className="mt-4 space-y-2">
                                <div className="text-xs font-medium text-gray-700 mb-2">Các module:</div>
                                {classModules.slice(0, 3).map((module, idx) => (
                                    <div
                                        key={module.id}
                                        className="flex items-center gap-3 text-sm p-2 rounded bg-gray-50"
                                    >
                                        <span className="text-gray-400">{idx + 1}.</span>
                                        <span className="flex-1">{module.name}</span>
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs ${
                                                module.status === 'Hoàn thành'
                                                    ? 'bg-green-100 text-green-700'
                                                    : module.status === 'Đang học'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {module.status}
                                        </span>
                                    </div>
                                ))}
                                {classModules.length > 3 && (
                                    <div className="text-xs text-gray-500 text-center py-1">
                                        +{classModules.length - 3} modules khác
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Second program - Quản lý Database */}
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold">Quản lý Database</h3>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                            Sắp học
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Thiết kế và quản lý cơ sở dữ liệu với MySQL
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>📚 3 modules</span>
                                        <span>⏱️ 7 tín chỉ</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Module Detail
    if (view === 'module' && selectedModule) {
        return (
            <div className="space-y-6">
                {/* Back button */}
                <button
                    onClick={handleBackToDetail}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách lớp</span>
                </button>

                {/* Module Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-semibold mb-2">{selectedModule.name}</h1>
                        <p className="text-sm text-gray-500">
                            Giảng viên: {selectedModule.instructor} | Mã lớp: {selectedModule.moduleCode}
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-black text-white">
                        {selectedModule.status}
                    </span>
                </div>

                {/* Module Info Card */}
                <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="text-blue-500">🎓</span>
                            {selectedModule.name}
                        </h2>
                        <button className="px-4 py-2 rounded-md bg-black text-white text-sm flex items-center gap-2">
                            <Eye size={16} />
                            Vào lớp học
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">Học xây dựng giao diện web hiện đại với React</p>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Lịch học:</span>
                            <div className="font-medium mt-1">{selectedModule.schedule}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Phòng học:</span>
                            <div className="font-medium mt-1">{selectedModule.room}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Trạng thái:</span>
                            <div className="font-medium mt-1">{selectedModule.status}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Buổi tiếp theo:</span>
                            <div className="font-medium mt-1 text-blue-600">
                                {selectedModule.nextSession.replace('\n', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lessons List */}
                <div className="bg-white border rounded-xl p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold mb-1">📚 Danh sách Chương trình</h3>
                        <p className="text-sm text-gray-500">
                            Các chương trình đào tạo trong lớp học này (2 chương trình)
                        </p>
                    </div>

                    <div className="space-y-3">
                        {selectedModule.lessons.map((lesson, idx) => (
                            <div
                                key={lesson.id}
                                className={`border rounded-lg p-4 ${
                                    lesson.status === 'Chưa học' ? 'bg-gray-50' : 'bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Drag handle */}
                                    <div className="text-gray-400 mt-1">
                                        <span className="text-sm">::</span>
                                    </div>

                                    {/* Status icon */}
                                    <div className="mt-1">
                                        {lesson.status === 'Hoàn thành' ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                                ✓
                                            </div>
                                        ) : lesson.status === 'Đang học' ? (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                ⏵
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-gray-300" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-sm">{lesson.title}</h4>
                                                {lesson.hasPrerequisite && (
                                                    <div className="text-xs text-orange-600 mt-1">
                                                        ⚠️ Có điều kiện tiên quyết
                                                    </div>
                                                )}
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${
                                                    lesson.status === 'Hoàn thành'
                                                        ? 'bg-green-100 text-green-700'
                                                        : lesson.status === 'Đang học'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {lesson.status}
                                            </span>
                                        </div>

                                        {lesson.canCollapse && (
                                            <div className="text-xs text-blue-600 mb-2">⚡ Có thể sáp xếp</div>
                                        )}

                                        <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>📘 Mã: {lesson.code}</span>
                                            <span>⏱️ {lesson.credits} tín chỉ</span>
                                            <span>📅 {lesson.duration}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3">
                                            <button className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50 flex items-center gap-1">
                                                <Eye size={12} />
                                                Ôn tập
                                            </button>
                                            <button className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50">
                                                Xem tài liệu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
