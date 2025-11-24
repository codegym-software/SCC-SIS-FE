import React from 'react';
import { BookOpen, Clock, TrendingUp, Trophy, BarChart3, Layers } from 'lucide-react';

export default function StudentDashboard() {
    // Mock data - sẽ được thay thế bằng API thực
    // Đổi sang palette trung tính & icon chuyên nghiệp
    const courses = [
        {
            id: 1,
            name: 'AI ứng dụng trong lớp học',
            progress: 35,
            icon: <BarChart3 className="h-6 w-6" />,
            level: 'Đang học',
        },
        {
            id: 2,
            name: 'Phương pháp sư phạm số',
            progress: 65,
            icon: <Layers className="h-6 w-6" />,
            level: 'Đang học',
        },
        {
            id: 3,
            name: 'Tài liệu tham khảo chuẩn',
            progress: 0,
            icon: <BookOpen className="h-6 w-6" />,
            level: 'Chưa bắt đầu',
        },
    ];

    const learningStreak = 5;
    const totalPoints = 520;
    const completedCourses = 3;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="rounded-2xl bg-gray-800 p-8 text-white shadow-sm">
                <h1 className="mb-2 text-3xl font-semibold">Chào mừng trở lại</h1>
                <p className="text-sm text-gray-300">Tiếp tục hành trình học tập của bạn hôm nay với eduMange</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chuỗi học tập</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{learningStreak}</p>
                            <p className="mt-1 text-xs text-gray-500">ngày liên tiếp</p>
                        </div>
                        <div className="rounded-full bg-orange-100 p-3">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Điểm năng lượng</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{totalPoints}</p>
                            <p className="mt-1 text-xs text-gray-500">tổng điểm</p>
                        </div>
                        <div className="rounded-full bg-yellow-100 p-3">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Khóa học</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{completedCourses}</p>
                            <p className="mt-1 text-xs text-gray-500">đã hoàn thành</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                            <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Thời gian học</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">12h</p>
                            <p className="mt-1 text-xs text-gray-500">tuần này</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Section */}
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Các khóa học của tôi</h2>
                        <p className="mt-1 text-sm text-gray-600">Tiếp tục học tập từ nơi bạn đã dừng lại</p>
                    </div>
                    <button className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                        Quản lý khóa học
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-sm"
                        >
                            {/* Course Header */}
                            <div className="flex items-start justify-between border-b border-gray-100 p-5">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                                        {course.icon}
                                    </div>
                                    <h3 className="text-base font-medium text-gray-900 leading-tight">{course.name}</h3>
                                </div>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {course.level}
                                </span>
                            </div>

                            {/* Course Progress */}
                            <div className="p-6">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">Tiến độ</span>
                                    <span className="font-semibold text-gray-900">{course.progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>

                                <button className="mt-4 w-full rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                                    {course.progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Thành tích gần đây</h2>
                        <p className="mt-1 text-sm text-gray-600">Các cột mốc học tập đã đạt</p>
                    </div>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-800">Xem tất cả →</button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Chuỗi 5 ngày', desc: 'Học liên tục', icon: <TrendingUp className="h-5 w-5" /> },
                        { title: '500+ điểm', desc: 'Điểm tích luỹ', icon: <Trophy className="h-5 w-5" /> },
                        { title: '3 khóa hoàn thành', desc: 'Tiến độ tốt', icon: <BookOpen className="h-5 w-5" /> },
                        { title: '12 giờ / tuần', desc: 'Thời gian học', icon: <Clock className="h-5 w-5" /> },
                    ].map((a, i) => (
                        <div
                            key={i}
                            className="flex items-start space-x-3 rounded-md border border-gray-200 bg-white p-4"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                                {a.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-gray-900">{a.title}</h3>
                                <p className="text-xs text-gray-600">{a.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
