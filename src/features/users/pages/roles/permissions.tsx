import { Shield } from 'lucide-react';

interface PermissionsProps {
    permissions: Record<string, string[]>;
}

const Permissions: React.FC<PermissionsProps> = ({ permissions }) => {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
                    <Shield size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium">Danh sách Quyền hạn</div>
                    <div className="text-xs text-gray-500">
                        Tất cả các quyền có thể được cấp trong hệ thống (
                        {Object.values(permissions).reduce((s, a) => s + a.length, 0)} quyền)
                    </div>
                </div>
            </div>

            {/* Permission groups */}
            <div className="p-3 space-y-6">
                {Object.entries(permissions).map(([group, items]) => (
                    <div key={group}>
                        <div className="text-sm font-medium mb-2">{group}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((key) => (
                                <div key={key} className="rounded-xl border border-gray-200">
                                    <div className="px-3 py-3 flex items-start gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center flex-shrink-0">
                                            <Shield size={14} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{key}</div>
                                            <div className="text-xs text-gray-500">
                                                {key.includes('Xem')
                                                    ? 'Quyền xem thông tin'
                                                    : key.includes('Tạo')
                                                      ? 'Quyền tạo mới'
                                                      : key.includes('Chỉnh sửa')
                                                        ? 'Quyền chỉnh sửa thông tin'
                                                        : key.includes('Xóa')
                                                          ? 'Quyền xóa dữ liệu'
                                                          : key.includes('Quản lý')
                                                            ? 'Quyền quản lý toàn diện'
                                                            : key.includes('Gán')
                                                              ? 'Quyền gán vai trò'
                                                              : 'Quyền hệ thống'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Permissions;
