// src/features/users/pages/ai-chat-analytics/AIChatAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Users,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAIChatAnalytics, type AIChatAnalytics } from '@/shared/api/ai-chat';

export default function AIChatAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AIChatAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await getAIChatAnalytics(days);
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [days]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!analytics) {
        return <div className="p-6 text-center text-gray-500">Không thể tải dữ liệu thống kê</div>;
    }

    const chartData = analytics.dailyChats.map((d) => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: d.count,
    }));

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CHAT AI ANALYTICS DASHBOARD</h1>
                    <p className="text-sm text-gray-500 mt-1">Thống kê và phân tích hiệu suất AI Assistant</p>
                </div>

                {/* Days selector */}
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value={7}>7 ngày qua</option>
                    <option value={14}>14 ngày qua</option>
                    <option value={30}>30 ngày qua</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Câu hỏi */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Câu hỏi</span>
                        </div>
                        <div
                            className={`flex items-center gap-1 text-sm ${
                                analytics.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {analytics.percentChange >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{Math.abs(analytics.percentChange)}%</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.totalQuestions.toLocaleString()}</div>
                </div>

                {/* Users */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Users</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</div>
                    <div className="text-sm text-gray-500 mt-1">+8%</div>
                </div>

                {/* Avg time */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Avg time</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.avgResponseTime.toFixed(1)}s</div>
                    <div className="text-sm text-red-600 mt-1">-15%</div>
                </div>

                {/* Chi phí */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">Chi phí</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${analytics.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-green-600 mt-1">+5%</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Charts</h2>
                </div>

                <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Số lượng chat theo ngày</h3>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#888" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`rgba(59, 130, 246, ${0.3 + (index / chartData.length) * 0.7})`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top 10 Questions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Top 10 câu hỏi phổ biến</h2>
                </div>

                <div className="space-y-3">
                    {analytics.topQuestions.map((q, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{q.count} lần</span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-green-600">●</span>
                                        {Math.round(q.satisfactionRate * 100)}% hài lòng
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Unanswered Questions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Câu hỏi chưa trả lời tốt (cần bổ sung KB)</h2>
                </div>

                <div className="space-y-2">
                    {analytics.unansweredQuestions.map((q, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-semibold text-xs">
                                    {index + 1}
                                </div>
                                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                            </div>
                            <span className="text-sm text-orange-600 font-medium">{q.attempts} lần</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
