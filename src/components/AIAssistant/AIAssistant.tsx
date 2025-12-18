import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, Loader2, Bot, User, Maximize2, MessageSquare, Paperclip, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendAIMessage, getChatHistory, clearChatHistory, getAIChatAnalytics, type AIChatMessage, type AIChatAnalytics } from '@/shared/api/ai-chat';
import { useUserProfile } from '@/stores/userProfile';
import { useToast } from '@/shared/hooks/useToast';

interface AIAssistantProps {
    className?: string;
}

export default function AIAssistant({ className = '' }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState<AIChatAnalytics | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { me: profile } = useUserProfile();
    const toast = useToast();
    const navigate = useNavigate();

    const isAdmin = profile?.roles?.some((role) => 
        ['SUPER_ADMIN', 'ACADEMIC_STAFF'].includes(role.code)
    ) ?? false;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && profile?.userId && messages.length === 0) {
            loadChatHistory();
        }
    }, [isOpen, profile?.userId]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Listen for custom event from admin header button
    useEffect(() => {
        const handleOpenAIAssistant = () => {
            if (isOpen) {
                // If already open, close it with animation
                handleClose();
            } else {
                // If closed, open it
                setIsOpen(true);
                setIsExiting(false);
            }
        };

        window.addEventListener('openAIAssistant', handleOpenAIAssistant);

        return () => {
            window.removeEventListener('openAIAssistant', handleOpenAIAssistant);
        };
    }, [isOpen]);

    const loadChatHistory = async () => {
        if (!profile?.userId) return;

        setIsLoadingHistory(true);
        try {
            const history = await getChatHistory(profile.userId);
            setMessages(history);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || !profile?.userId) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        const newUserMessage: AIChatMessage = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newUserMessage]);

        setIsLoading(true);

        try {
            const response = await sendAIMessage({
                message: userMessage,
                userId: profile.userId,
                userName: profile.fullName || profile.keycloak?.username || 'bạn',
                useOpenAI: false,
            });

            const assistantMessage: AIChatMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Lỗi', 'Không thể gửi tin nhắn');

            const errorMessage: AIChatMessage = {
                role: 'assistant',
                content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!profile?.userId) return;

        try {
            await clearChatHistory(profile.userId);
            setMessages([]);
            setShowClearConfirm(false);
            toast.success('Thành công', 'Đã xóa lịch sử chat');
        } catch (error) {
            console.error('Failed to clear history:', error);
            toast.error('Lỗi', 'Không thể xóa lịch sử chat');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) => {
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                toast.error('Lỗi', `File ${file.name} không hợp lệ. Chỉ hỗ trợ PDF, DOC, DOCX`);
                return false;
            }

            if (file.size > maxSize) {
                toast.error('Lỗi', `File ${file.name} quá lớn. Tối đa 10MB`);
                return false;
            }

            return true;
        });

        setUploadedFiles((prev) => [...prev, ...validFiles]);
        if (e.target) {
            e.target.value = ''; // Reset input
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsExiting(false);
        }, 300); // Match animation duration
    };

    const handleExpandToFullscreen = () => {
        navigate('/student/ai-chat');
    };

    const handleToggleAnalytics = async () => {
        if (!showAnalytics && !analytics) {
            // Load analytics data first time
            try {
                const data = await getAIChatAnalytics(7);
                setAnalytics(data);
            } catch (error) {
                console.error('Error loading analytics:', error);
                toast.error('Lỗi', 'Không thể tải dữ liệu thống kê');
                return;
            }
        }
        setShowAnalytics(!showAnalytics);
    };

    const handleViewFullAnalytics = () => {
        navigate('/ai-chat-analytics');
        handleClose();
    };

    return (
        <div className={`fixed z-50 ${className}`}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Mở trợ lý AI"
                >
                    <Bot className="h-6 w-6" />
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                        <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
                            <span className="underline">Trợ lý AI</span>
                            <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-gray-900"></div>
                        </div>
                    </div>
                </button>
            )}

            {isOpen && (
                <div
                    className={`flex h-[600px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl border-2 border-gray-300 ${
                        isExiting
                            ? 'animate-out slide-out-to-right duration-300'
                            : 'animate-in slide-in-from-right duration-300'
                    }`}
                >
                    <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 text-white">
                        <button
                            onClick={handleExpandToFullscreen}
                            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                            aria-label="Mở rộng toàn màn hình"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-lg group-hover:underline">Trợ lý AI</h3>
                                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <button
                                    onClick={handleToggleAnalytics}
                                    className={`rounded-lg p-2 transition-colors hover:bg-white/20 ${
                                        showAnalytics ? 'bg-white/20' : ''
                                    }`}
                                    title="Thống kê"
                                    aria-label="Xem thống kê AI Chat"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={handleExpandToFullscreen}
                                className="rounded-lg p-2 transition-colors hover:bg-white/20"
                                title="Mở rộng toàn màn hình"
                                aria-label="Mở rộng toàn màn hình"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="rounded-lg p-2 transition-colors hover:bg-white/20 disabled:opacity-50"
                                disabled={messages.length === 0}
                                title="Xóa lịch sử chat"
                                aria-label="Xóa lịch sử chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="rounded-lg p-2 transition-colors hover:bg-white/20"
                                aria-label="Đóng"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mini Analytics Preview Panel */}
                    {showAnalytics && analytics && (
                        <div className="border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    Quick Stats (7 ngày)
                                </h4>
                                <button
                                    onClick={handleViewFullAnalytics}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                    Xem chi tiết →
                                </button>
                            </div>
                            
                            {/* KPI Mini Cards */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-white rounded-lg p-2.5 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-0.5">Câu hỏi</p>
                                    <p className="text-lg font-bold text-gray-900">{analytics.totalQuestions.toLocaleString()}</p>
                                    <p className={`text-xs ${analytics.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {analytics.percentChange >= 0 ? '↑' : '↓'} {Math.abs(analytics.percentChange)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-0.5">Users</p>
                                    <p className="text-lg font-bold text-gray-900">{analytics.totalUsers}</p>
                                    <p className="text-xs text-green-600">↑ 8%</p>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-0.5">Avg time</p>
                                    <p className="text-lg font-bold text-gray-900">{analytics.avgResponseTime.toFixed(1)}s</p>
                                    <p className="text-xs text-red-600">↓ 15%</p>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-0.5">Chi phí</p>
                                    <p className="text-lg font-bold text-gray-900">${analytics.totalCost.toFixed(2)}</p>
                                    <p className="text-xs text-green-600">↑ 5%</p>
                                </div>
                            </div>

                            {/* Top 3 Questions */}
                            <div className="bg-white rounded-lg p-2.5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Top 3 câu hỏi</p>
                                <div className="space-y-1.5">
                                    {analytics.topQuestions.slice(0, 3).map((q, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <p className="text-xs text-gray-700 truncate flex-1">{q.question}</p>
                                            <span className="text-xs text-gray-500">{q.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <Bot className="h-16 w-16 text-blue-600 mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Xin chào!</h4>
                                <p className="text-sm text-gray-600">Tôi có thể giúp gì cho bạn?</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <Bot className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                                message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            <p
                                                className={`mt-1 text-xs ${
                                                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                }`}
                                            >
                                                {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-white">
                                                <User className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-200">
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                style={{ animationDelay: '0ms' }}
                                            ></div>
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                style={{ animationDelay: '150ms' }}
                                            ></div>
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                style={{ animationDelay: '300ms' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                        {/* Uploaded Files Display */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-200"
                                    >
                                        <Paperclip className="h-3.5 w-3.5" />
                                        <span className="max-w-[150px] truncate">{file.name}</span>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="hover:text-blue-900 transition-colors"
                                            aria-label="Xóa file"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx"
                                multiple
                                className="hidden"
                                aria-label="Upload file"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                title="Đính kèm file (PDF, DOC, DOCX)"
                                aria-label="Đính kèm file"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <textarea
                                ref={inputRef as any}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi..."
                                disabled={isLoading}
                                rows={1}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none max-h-32 overflow-y-auto"
                                style={{
                                    minHeight: '40px',
                                    height: 'auto',
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                                }}
                                aria-label="Nhập tin nhắn"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                aria-label="Gửi tin nhắn"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {showClearConfirm && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                            <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Bạn có chắc chắn muốn xóa không?
                                </h4>
                                <p className="text-sm text-gray-600 mb-1">
                                    Toàn bộ lịch sử trò chuyện sẽ bị xóa vĩnh viễn.
                                </p>
                                <p className="text-xs text-red-600 font-medium mb-4">
                                    Hành động này không thể hoàn tác.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowClearConfirm(false)}
                                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                    >
                                        Không
                                    </button>
                                    <button
                                        onClick={handleClearHistory}
                                        className="flex-1 rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
