// src/features/students/pages/AIChat/AIChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Trash2,
    Loader2,
    Bot,
    User,
    SquarePen,
    MessageSquare,
    Paperclip,
    X,
    Upload,
    FileText,
} from 'lucide-react';
import { sendAIMessage, getChatHistory, clearChatHistory, type AIChatMessage } from '@/shared/api/ai-chat';
import { useUserProfile } from '@/stores/userProfile';
import { useToast } from '@/shared/hooks/useToast';

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: string;
}

export default function AIChatPage() {
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>('default');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [savedFiles, setSavedFiles] = useState<UploadedFile[]>([]);
    const [showFilesSection, setShowFilesSection] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { me: profile } = useUserProfile();
    const toast = useToast();

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history when component mounts
    useEffect(() => {
        if (profile?.userId && messages.length === 0) {
            loadChatHistory();
        }
    }, [profile?.userId]);

    // Focus input when component mounts
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const loadChatHistory = async () => {
        if (!profile?.userId) return;

        setIsLoadingHistory(true);
        try {
            const history = await getChatHistory(profile.userId);
            setMessages(history);

            // Create a session from history if exists
            if (history.length > 0) {
                const firstUserMessage = history.find((m) => m.role === 'user');
                setChatSessions([
                    {
                        id: 'default',
                        title: firstUserMessage?.content.slice(0, 30) + '...' || 'Cuộc trò chuyện mới',
                        lastMessage: history[history.length - 1].content.slice(0, 50) + '...',
                        timestamp: history[history.length - 1].timestamp,
                    },
                ]);
            }
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

        // Add user message immediately
        const newUserMessage: AIChatMessage = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newUserMessage]);

        // Update session if this is the first message
        if (messages.length === 0) {
            setChatSessions([
                {
                    id: currentSessionId,
                    title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
                    lastMessage: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
                    timestamp: new Date().toISOString(),
                },
            ]);
        }

        setIsLoading(true);

        try {
            const response = await sendAIMessage({
                message: userMessage,
                userId: profile.userId,
                userName: profile.fullName || profile.keycloak?.username || 'bạn',
                useOpenAI: false,
            });

            // Add assistant response
            const assistantMessage: AIChatMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Update session last message
            setChatSessions((prev) =>
                prev.map((s) =>
                    s.id === currentSessionId
                        ? {
                              ...s,
                              lastMessage: response.message.slice(0, 50) + '...',
                              timestamp: new Date().toISOString(),
                          }
                        : s,
                ),
            );
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');

            const errorMessage: AIChatMessage = {
                role: 'assistant',
                content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
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
            setChatSessions([]);
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
            e.target.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveFiles = () => {
        if (uploadedFiles.length === 0) return;

        const newSavedFiles: UploadedFile[] = uploadedFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
        }));

        setSavedFiles((prev) => [...prev, ...newSavedFiles]);
        setUploadedFiles([]);
        toast.success('Thành công', `Đã lưu ${newSavedFiles.length} file`);
    };

    const handleDeleteSavedFile = (fileId: string) => {
        setSavedFiles((prev) => prev.filter((f) => f.id !== fileId));
        toast.success('Thành công', 'Đã xóa file');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleNewChat = () => {
        setCurrentSessionId('new-' + Date.now());
        setMessages([]);
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Top Header - Trợ lý AI (Full Width) */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Trợ lý AI</h2>
                        <p className="text-xs text-blue-50">Luôn sẵn sàng hỗ trợ</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Chat History */}
                <div className="w-80 border-r border-gray-200 bg-gradient-to-b from-slate-50 to-white flex flex-col shadow-lg">
                    {/* New Chat Button */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-200">
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                        >
                            <SquarePen className="h-4 w-4" />
                            Cuộc trò chuyện mới
                        </button>
                    </div>

                    {/* Divider with text */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lịch sử trò chuyện</p>
                    </div>

                    {/* Chat Sessions List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {chatSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện nào</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {chatSessions.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => setCurrentSessionId(session.id)}
                                        className={`w-full text-left rounded-lg p-3 transition-colors ${
                                            currentSessionId === session.id
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                                            {session.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{session.lastMessage}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(session.timestamp).toLocaleDateString('vi-VN')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Files Management Section - Admin Only */}
                    {profile &&
                        ['SUPER_ADMIN', 'ACADEMIC_STAFF', 'LECTURER'].some((r) =>
                            profile.roles?.includes(r as any),
                        ) && (
                            <>
                                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setShowFilesSection(!showFilesSection)}
                                        className="w-full flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                    >
                                        <span>Quản lý File ({savedFiles.length})</span>
                                        <Upload className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {showFilesSection && (
                                    <div className="px-2 py-2 border-t border-gray-200 max-h-48 overflow-y-auto">
                                        {savedFiles.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-4">Chưa có file nào</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {savedFiles.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 group"
                                                    >
                                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-700 truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSavedFile(file.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                                                        >
                                                            <X className="h-3 w-3 text-red-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            disabled={messages.length === 0}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            Xóa lịch sử chat
                        </button>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white">
                        <div className="max-w-4xl mx-auto space-y-6 h-full">
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div
                                    className="flex flex-col items-center justify-center h-full text-center px-6"
                                    style={{ paddingTop: '10vh' }}
                                >
                                    <Bot className="h-32 w-32 text-blue-600 mb-8" />
                                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                        Xin chào! Tôi là trợ lý AI của bạn.
                                    </h2>
                                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                                        Tôi có thể giúp bạn với thông tin về lớp học, lịch học, điểm số, bài tập và
                                        nhiều hơn nữa. Hãy bắt đầu bằng cách đặt một câu hỏi!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex gap-4 ${
                                                message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                                    <Bot className="h-6 w-6" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                                                    message.role === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                    {message.content}
                                                </p>
                                                <p
                                                    className={`mt-2 text-xs ${
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
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-white">
                                                    <User className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex gap-4 justify-start">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <Bot className="h-6 w-6" />
                                            </div>
                                            <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-4 shadow-sm border border-gray-200">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
                        <div className="max-w-5xl mx-auto">
                            {/* Uploaded Files Display */}
                            {uploadedFiles.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-200"
                                        >
                                            <Paperclip className="h-3.5 w-3.5" />
                                            <span className="max-w-[200px] truncate">{file.name}</span>
                                            <span className="text-xs text-blue-500">({formatFileSize(file.size)})</span>
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="hover:text-blue-900 transition-colors"
                                                aria-label="Xóa file"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Save Files Button - Admin Only */}
                                    {profile &&
                                        ['SUPER_ADMIN', 'ACADEMIC_STAFF', 'LECTURER'].some((r) =>
                                            profile.roles?.includes(r as any),
                                        ) && (
                                            <button
                                                onClick={handleSaveFiles}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                Lưu file
                                            </button>
                                        )}
                                </div>
                            )}

                            <div className="flex gap-3 items-end">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    className="hidden"
                                    aria-label="Upload file"
                                />
                                {/* File Upload Button - Admin Only */}
                                {profile &&
                                    ['SUPER_ADMIN', 'ACADEMIC_STAFF', 'LECTURER'].some((r) =>
                                        profile.roles?.includes(r as any),
                                    ) && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading}
                                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                                            title="Đính kèm file (PDF, DOC, DOCX)"
                                            aria-label="Đính kèm file"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                    )}
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    disabled={isLoading}
                                    rows={1}
                                    className="flex-1 resize-none rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
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
                    </div>
                </div>

                {/* Clear History Confirmation Modal */}
                {showClearConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Bạn có chắc chắn muốn xóa không?
                                </h4>
                                <p className="mt-2 text-sm text-gray-600">
                                    Toàn bộ lịch sử trò chuyện sẽ bị xóa vĩnh viễn.
                                </p>
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                    Hành động này không thể hoàn tác.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Không
                                </button>
                                <button
                                    onClick={handleClearHistory}
                                    className="flex-1 rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
