import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../../shared/hooks/useToast';
import { usePermission } from '../../../../shared/components/PermissionProvider';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { Users, Plus } from 'lucide-react';
import CreateUserModal from '../../components/CreateUserModal';

// Import components
import SearchBar from './search';
import UsersList from './list';
import UserView from './view';

// Import API
import { listUsers, createUser, updateUser } from '../../../../shared/api/users';
import { getProfile } from '../../../../shared/api/auth';
import { listAllCenters } from '../../../../shared/api/centers';
import type { UserDto } from '../../../../shared/types/user';
import type { CenterDto } from '../../../../shared/types/centers';

// UI user type để giữ nguyên render hiện tại
type UIUser = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    center: string;
    major: string;
    exp: string;
    status: 'Hoạt động' | 'Không hoạt động';
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState<UIUser | null>(null);
    const [openEdit, setOpenEdit] = useState<UIUser | null>(null);
    const [query, setQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [centers, setCenters] = useState<CenterDto[]>([]);
    const pageSize = 5;
    const toast = useToast();
    const { can } = usePermission();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UIUser[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    // map BE -> UI (tạm chưa có role/center chi tiết)
    const adaptUser = (u: UserDto): UIUser => ({
        id: String(u.userId),
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        role: '—',
        center: '—',
        major: '—',
        exp: '—',
        status: u.active ? 'Hoạt động' : 'Không hoạt động',
    });

    // Load user profile on mount
    useEffect(() => {
        getProfile()
            .then((res) => {
                // Profile loaded successfully
            })
            .catch((err) => {
                console.error('Failed to load profile');
            });
    }, []);

    // Fetch users with fallback for permissions
    async function fetchUsers(centerId?: number) {
        setLoading(true);
        setError(null);
        try {
            const res = await listUsers(centerId);
            const data = Array.isArray(res.data) ? (res.data as UserDto[]) : [];
            setUsers(data.map(adaptUser));
        } catch (e: any) {
            console.error('Failed to fetch users');
            setError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }

    // Fetch centers for user creation
    async function fetchCenters() {
        try {
            console.log('Fetching centers...');
            const response = await listAllCenters();
            console.log('Centers response:', response);
            console.log('Centers data (direct):', response);
            
            // listAllCenters() đã trả về data trực tiếp, không cần .data
            setCenters(response);
        } catch (error) {
            console.error('Failed to fetch centers:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            // Fallback data để test
            const fallbackCenters = [
                { id: 1, name: 'Trung tâm Hà Nội 1', code: 'HN001' },
                { id: 2, name: 'Trung tâm TP.HCM 1', code: 'HCM001' },
                { id: 3, name: 'Trung tâm Đà Nẵng 1', code: 'DN001' }
            ];
            console.log('Using fallback centers:', fallbackCenters);
            setCenters(fallbackCenters);
        }
    }

    // Load users and centers on mount
    useEffect(() => {
        fetchUsers();
        fetchCenters();
    }, []);

    // Filter users based on query
    const filtered = useMemo(() => {
        if (!query.trim()) return users;
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(query.toLowerCase()) ||
                u.email.toLowerCase().includes(query.toLowerCase())
        );
    }, [users, query]);

    const handleCreateUser = async (userData: any) => {
        try {
            setLoading(true);
        console.log('Creating user with data:', userData);
        console.log('User data structure:', JSON.stringify(userData, null, 2));
        const res = await createUser(userData);
        console.log('User created successfully:', res.data);
            toast.success('Thành công', 'Đã tạo người dùng mới!');
            setOpenCreate(false);
            fetchUsers(); // Refresh the list
        } catch (e: any) {
            console.error('Failed to create user:', e);
            console.error('Error response:', e.response?.data);
            console.error('Error status:', e.response?.status);
            toast.error('Lỗi', 'Không thể tạo người dùng mới');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: number, userData: any) => {
        try {
            setLoading(true);
            const res = await updateUser(userId, userData);
            toast.success('Thành công', 'Đã cập nhật thông tin người dùng!');
            setOpenEdit(null);
            fetchUsers(); // Refresh the list
        } catch (e: any) {
            console.error('Failed to update user');
            toast.error('Lỗi', 'Không thể cập nhật thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (user: UIUser) => {
        setOpenView(user);
    };

    const handleEdit = (user: UIUser) => {
        setOpenEdit(user);
    };

    const handleToggleStatus = (user: UIUser) => {
        setConfirmDialog({
            open: true,
            title: user.status === 'Hoạt động' ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng',
            description: `Bạn có chắc chắn muốn ${user.status === 'Hoạt động' ? 'vô hiệu hóa' : 'kích hoạt'} người dùng "${user.name}" không?`,
            onConfirm: () => {
                // TODO: Implement toggle status API call
                toast.success('Thành công', `Đã ${user.status === 'Hoạt động' ? 'vô hiệu hóa' : 'kích hoạt'} người dùng!`);
                setConfirmDialog(prev => ({ ...prev, open: false }));
                fetchUsers(); // Refresh the list
            },
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery);
        setPage(1);
    };

    const handleMenuToggle = (id: string | null) => {
        setOpenMenuId(id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white">
                        <Users size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Người dùng</h1>
                        <p className="text-xs text-gray-500">Quản lý tài khoản và quyền truy cập người dùng</p>
                    </div>
                </div>
                {can('users.create') && (
                    <button
                        onClick={() => setOpenCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <Plus size={16} />
                        Thêm người dùng
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <SearchBar
                query={query}
                onQueryChange={handleQueryChange}
            />

            {/* Users List */}
            <UsersList
                users={filtered}
                loading={loading}
                error={error}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onView={handleView}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
                canEdit={can('users.edit')}
                canToggleStatus={can('users.toggle')}
            />

            {/* Create Modal */}
            <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
                <CreateUserModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreateUser}
                    centers={centers}
                />
            </Modal>

            {/* View Modal */}
            <Modal open={!!openView} onClose={() => setOpenView(null)}>
                {openView && (
                    <UserView
                        open={!!openView}
                        onClose={() => setOpenView(null)}
                        user={openView}
                        onEdit={() => {
                            setOpenView(null);
                            handleEdit(openView);
                        }}
                        canEdit={can('users.edit')}
                    />
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
                {openEdit && (
                    <CreateUserModal
                        open={!!openEdit}
                        onClose={() => setOpenEdit(null)}
                        editing={openEdit}
                        onSubmit={(userData) => handleUpdateUser(openEdit.id, userData)}
                        onCancel={() => setOpenEdit(null)}
                        isSubmitting={loading}
                        centers={centers}
                    />
                )}
            </Modal>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                variant="warning"
            />
        </div>
    );
}
