import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Users as UsersIcon, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listClasses, getClassStudents, type ClassDto, type ClassStatus } from '@/shared/api/classes';
import { useCenterSelection } from '@/stores/centerSelection';

type UiStatus = {
  label: string;
  className: string;
};

const statusMap: Record<ClassStatus, UiStatus> = {
  PLANNED: { label: 'Sắp khai giảng', className: 'bg-blue-50 text-blue-700' },
  ONGOING: { label: 'Đang diễn ra', className: 'bg-green-50 text-green-700' },
  FINISHED: { label: 'Đã kết thúc', className: 'bg-gray-50 text-gray-600' },
  CANCELLED: { label: 'Tạm dừng', className: 'bg-amber-50 text-amber-700' },
};

export default function RecentClasses() {
  const navigate = useNavigate();
  const selectedCenterId = useCenterSelection((s) => s.selectedCenterId);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [studentCounts, setStudentCounts] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await listClasses(selectedCenterId ? { centerId: selectedCenterId } : undefined);
        const data = Array.isArray(res.data) ? res.data : [];
        
        // Sắp xếp: PLANNED (chuẩn bị) trước, sau đó ONGOING (đang học), cuối cùng là các trạng thái khác
        const sorted = data.sort((a, b) => {
          const prio = (s: ClassStatus) => (s === 'PLANNED' ? 0 : s === 'ONGOING' ? 1 : 2);
          const d = prio(a.status) - prio(b.status);
          if (d !== 0) return d;
          const getDate = (c: ClassDto) => new Date(c.startDate || c.createdAt).getTime();
          return getDate(a) - getDate(b);
        });
        
        const topClasses = sorted.slice(0, 3);
        setClasses(topClasses);
        
        // Lấy số học viên thực tế cho mỗi lớp
        const counts = new Map<number, number>();
        await Promise.all(
          topClasses.map(async (cls) => {
            try {
              const studentsRes = await getClassStudents(cls.classId, { status: 'ACTIVE' });
              // Handle different response structures
              let students: any[] = [];
              if (Array.isArray(studentsRes.data)) {
                students = studentsRes.data;
              } else if (studentsRes.data && typeof studentsRes.data === 'object') {
                // Check for common pagination structures
                if (Array.isArray((studentsRes.data as any).items)) {
                  students = (studentsRes.data as any).items;
                } else if (Array.isArray((studentsRes.data as any).content)) {
                  students = (studentsRes.data as any).content;
                }
              }
              counts.set(cls.classId, students.length);
              console.log(`[RecentClasses] Class ${cls.classId} (${cls.name}): ${students.length} active students`);
            } catch (e) {
              console.error(`[RecentClasses] Error fetching students for class ${cls.classId}:`, e);
              counts.set(cls.classId, 0);
            }
          })
        );
        setStudentCounts(counts);
      } catch (e) {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedCenterId]);

  const items = useMemo(() => classes, [classes]);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b">
        <div className="text-lg font-semibold text-gray-900">Lớp học gần đây</div>
        <button onClick={() => navigate('/classes')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Xem tất cả <Eye size={16} />
        </button>
      </div>
      {loading && (
        <div className="p-8 text-center text-gray-500">Đang tải danh sách lớp…</div>
      )}
      {!loading && items.length === 0 && (
        <div className="p-8 text-center text-gray-500">Chưa có lớp học</div>
      )}
      <div className="divide-y">
        {items.map((c) => {
          const s = statusMap[c.status];
          const start = c.startDate ? new Date(c.startDate) : null;
          const today = new Date();
          let daysText = '';
          if (start) {
            const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            daysText = diff > 0 ? `Còn ${diff} ngày` : diff === 0 ? 'Hôm nay' : '';
          }
          return (
            <div 
              key={c.classId} 
              className="px-6 py-5 flex flex-col gap-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate('/classes', { state: { selectedClassId: c.classId } })}
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <span className={`text-xs px-2 py-1 rounded ${s.className}`}>{s.label}</span>
              </div>
              <div className="text-xs text-gray-500">{c.programName}</div>
              <div className="flex items-center gap-6 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1"><Calendar size={14} />{c.startDate || 'Chưa đặt lịch'}</span>
                <span className="inline-flex items-center gap-1">
                  <UsersIcon size={14} />
                  {studentCounts.get(c.classId) ?? 0}/{c.capacity || 30} học viên
                </span>
                {daysText && (
                  <span className="inline-flex items-center gap-1"><Clock size={14} />{daysText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
