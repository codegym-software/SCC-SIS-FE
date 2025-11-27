import React, { useState, useEffect } from 'react';
import { X, Video, FileText, ClipboardList, PenTool } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import type { Lesson, LessonType, ContentType } from '@/shared/types/lesson';

interface LessonFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  lesson?: Lesson;
  moduleId: number;
  moduleName: string;
  existingLessons: Lesson[];
}

export interface LessonFormData {
  moduleId: number;
  lessonTitle: string;
  lessonType: LessonType;
  lessonOrder: number;
  contentUrl?: string;
  contentType?: ContentType;
  description?: string;
  isMandatory: boolean;
  passingScore?: number;
}

const LESSON_TYPE_OPTIONS: Array<{ value: LessonType; label: string; icon: React.ReactNode }> = [
  { value: 'VIDEO', label: 'Video', icon: <Video size={16} /> },
  { value: 'DOCUMENT', label: 'Tài liệu', icon: <FileText size={16} /> },
  { value: 'QUIZ', label: 'Bài kiểm tra', icon: <ClipboardList size={16} /> },
  { value: 'ASSIGNMENT', label: 'Bài tập', icon: <PenTool size={16} /> },
];

const CONTENT_TYPE_OPTIONS: Array<{ value: ContentType; label: string }> = [
  { value: 'VIMEO', label: 'Vimeo' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'GOOGLE_DRIVE', label: 'Google Drive' },
  { value: 'FILE_UPLOAD', label: 'File tải lên' },
];

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  lesson,
  moduleId,
  moduleName,
  existingLessons,
}) => {
  const { error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<LessonFormData>({
    moduleId,
    lessonTitle: '',
    lessonType: 'VIDEO',
    lessonOrder: existingLessons.length + 1,
    contentUrl: '',
    contentType: 'VIMEO',
    description: '',
    isMandatory: true,
    passingScore: 70,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        moduleId: lesson.moduleId,
        lessonTitle: lesson.lessonTitle,
        lessonType: lesson.lessonType,
        lessonOrder: lesson.lessonOrder,
        contentUrl: lesson.contentUrl || '',
        contentType: lesson.contentType || 'VIMEO',
        description: lesson.description || '',
        isMandatory: lesson.isMandatory,
        passingScore: lesson.passingScore || 70,
      });
    } else {
      setFormData({
        moduleId,
        lessonTitle: '',
        lessonType: 'VIDEO',
        lessonOrder: existingLessons.length + 1,
        contentUrl: '',
        contentType: 'VIMEO',
        description: '',
        isMandatory: true,
        passingScore: 70,
      });
    }
  }, [lesson, moduleId, existingLessons]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.lessonTitle.trim()) {
      showError('Lỗi nhập liệu', 'Vui lòng nhập tiêu đề bài học');
      return;
    }

    if (formData.lessonOrder < 1) {
      showError('Lỗi nhập liệu', 'Thứ tự bài học phải lớn hơn 0');
      return;
    }

    // Validate URL nếu có
    if (formData.contentUrl && formData.contentUrl.trim()) {
      try {
        new URL(formData.contentUrl);
      } catch {
        showError('Lỗi định dạng URL', 'URL không hợp lệ. Vui lòng nhập URL đầy đủ');
        return;
      }
    }

    // Validate passing score cho QUIZ
    if (formData.lessonType === 'QUIZ' && (formData.passingScore || 0) < 0) {
      showError('Lỗi nhập liệu', 'Điểm đạt phải lớn hơn hoặc bằng 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error đã được xử lý ở parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const showContentUrlField = ['VIDEO', 'DOCUMENT'].includes(formData.lessonType);
  const showPassingScoreField = ['QUIZ', 'ASSIGNMENT'].includes(formData.lessonType);

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl border">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Module: {moduleName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Tiêu đề bài học */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lessonTitle}
                onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                placeholder="Ví dụ: Introduction to Spring Boot"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Loại bài học */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bài học <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {LESSON_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, lessonType: option.value })}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                      formData.lessonType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.icon}
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Thứ tự */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lessonOrder}
                  onChange={(e) => setFormData({ ...formData, lessonOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bắt buộc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu
                </label>
                <select
                  value={formData.isMandatory ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Bắt buộc</option>
                  <option value="false">Không bắt buộc</option>
                </select>
              </div>
            </div>

            {/* Content URL (cho VIDEO và DOCUMENT) */}
            {showContentUrlField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nội dung
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, contentType: option.value })}
                      className={`px-3 py-2 text-sm border-2 rounded-lg transition-all ${
                        formData.contentType === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  placeholder={`URL ${formData.contentType === 'VIMEO' ? 'Vimeo' : formData.contentType === 'YOUTUBE' ? 'YouTube' : formData.contentType === 'GOOGLE_DRIVE' ? 'Google Drive' : 'file'}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.contentType === 'VIMEO' && 'Ví dụ: https://vimeo.com/1139910461'}
                  {formData.contentType === 'YOUTUBE' && 'Ví dụ: https://www.youtube.com/watch?v=xxxxx'}
                  {formData.contentType === 'GOOGLE_DRIVE' && 'Ví dụ: https://drive.google.com/file/d/xxxxx/view'}
                  {formData.contentType === 'FILE_UPLOAD' && 'URL file đã tải lên server'}
                </p>
              </div>
            )}

            {/* Passing Score (cho QUIZ và ASSIGNMENT) */}
            {showPassingScoreField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm đạt (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore || 0}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Điểm tối thiểu để hoàn thành bài học này
                </p>
              </div>
            )}

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về bài học..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : lesson ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;
