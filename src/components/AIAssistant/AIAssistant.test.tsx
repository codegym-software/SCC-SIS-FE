import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAssistant from '../AIAssistant';
import * as aiChatApi from '@/shared/api/ai-chat';
import { useUserProfile } from '@/stores/userProfile';

// Mock dependencies
vi.mock('@/shared/api/ai-chat');
vi.mock('@/stores/userProfile');
vi.mock('@/shared/hooks/useToast', () => ({
    useToast: () => ({
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    }),
}));

describe('AIAssistant', () => {
    const mockProfile = {
        userId: 123,
        fullName: 'Nguyễn Văn A',
        email: 'test@example.com',
        keycloak: { username: 'nguyenvana' },
        roles: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useUserProfile as any).mockReturnValue({ me: mockProfile });
    });

    it('should render floating button when closed', () => {
        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        expect(button).toBeInTheDocument();
    });

    it('should open chat window when button is clicked', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Trợ lý AI')).toBeInTheDocument();
        });
    });

    it('should load chat history when opened', async () => {
        const mockHistory = [
            { role: 'user', content: 'Xin chào', timestamp: new Date().toISOString() },
            { role: 'assistant', content: 'Chào bạn!', timestamp: new Date().toISOString() },
        ];
        (aiChatApi.getChatHistory as any).mockResolvedValue(mockHistory);

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');

        fireEvent.click(button);

        await waitFor(() => {
            expect(aiChatApi.getChatHistory).toHaveBeenCalledWith(123);
            expect(screen.getByText('Xin chào')).toBeInTheDocument();
            expect(screen.getByText('Chào bạn!')).toBeInTheDocument();
        });
    });

    it('should send message and display response', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);
        (aiChatApi.sendAIMessage as any).mockResolvedValue({
            message: 'Tôi có thể giúp gì cho bạn?',
            responseType: 'rule-based',
            success: true,
        });

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Nhập câu hỏi của bạn...')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Nhập câu hỏi của bạn...');
        const sendButton = screen.getByLabelText('Gửi tin nhắn');

        fireEvent.change(input, { target: { value: 'Xin chào' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(aiChatApi.sendAIMessage).toHaveBeenCalledWith({
                message: 'Xin chào',
                userId: 123,
                userName: 'Nguyễn Văn A',
                useOpenAI: false,
            });
        });

        await waitFor(() => {
            expect(screen.getByText('Tôi có thể giúp gì cho bạn?')).toBeInTheDocument();
        });
    });

    it('should clear chat history when trash button is clicked', async () => {
        const mockHistory = [{ role: 'user', content: 'Test', timestamp: new Date().toISOString() }];
        (aiChatApi.getChatHistory as any).mockResolvedValue(mockHistory);
        (aiChatApi.clearChatHistory as any).mockResolvedValue(undefined);

        // Mock window.confirm
        window.confirm = vi.fn(() => true);

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const trashButton = screen.getByTitle('Xóa lịch sử chat');
        fireEvent.click(trashButton);

        await waitFor(() => {
            expect(aiChatApi.clearChatHistory).toHaveBeenCalledWith(123);
        });
    });

    it('should close chat window when X button is clicked', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);

        render(<AIAssistant />);
        const openButton = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByLabelText('Đóng')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('Đóng');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('Trợ lý AI')).not.toBeInTheDocument();
        });
    });

    it('should handle API errors gracefully', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);
        (aiChatApi.sendAIMessage as any).mockRejectedValue(new Error('Network error'));

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Nhập câu hỏi của bạn...')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Nhập câu hỏi của bạn...');
        const sendButton = screen.getByLabelText('Gửi tin nhắn');

        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText(/Xin lỗi, tôi đang gặp sự cố/)).toBeInTheDocument();
        });
    });

    it('should send message on Enter key press', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);
        (aiChatApi.sendAIMessage as any).mockResolvedValue({
            message: 'Response',
            responseType: 'rule-based',
            success: true,
        });

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Nhập câu hỏi của bạn...')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Nhập câu hỏi của bạn...');

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        await waitFor(() => {
            expect(aiChatApi.sendAIMessage).toHaveBeenCalled();
        });
    });

    it('should not send empty messages', async () => {
        (aiChatApi.getChatHistory as any).mockResolvedValue([]);

        render(<AIAssistant />);
        const button = screen.getByLabelText('Mở trợ lý AI');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Nhập câu hỏi của bạn...')).toBeInTheDocument();
        });

        const sendButton = screen.getByLabelText('Gửi tin nhắn');

        // Button should be disabled when input is empty
        expect(sendButton).toBeDisabled();

        fireEvent.click(sendButton);

        expect(aiChatApi.sendAIMessage).not.toHaveBeenCalled();
    });
});
