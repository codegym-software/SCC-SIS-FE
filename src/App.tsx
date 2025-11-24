import { BrowserRouter } from 'react-router-dom';
import AppLayout from './app/layout/AppLayout';
import StudentLayout from './app/layout/StudentLayout';
import AppRoutes from './app/routes/AppRoutes';
import { ToastProvider } from './shared/components/ToastProvider';
import { PermissionProvider } from './shared/components/PermissionProvider';
import BackendErrorHandler from './shared/components/BackendErrorHandler';
import { useUserProfile } from './stores/userProfile';

function AppContent() {
    const { me, loading } = useUserProfile();

    // Kiểm tra nếu user là học sinh
    const isStudent = me?.roles?.some((role) => role.code === 'STUDENT') ?? false;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    // Sử dụng layout khác nhau dựa trên role
    const Layout = isStudent ? StudentLayout : AppLayout;

    return (
        <Layout>
            <AppRoutes />
        </Layout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <PermissionProvider>
                <ToastProvider>
                    <AppContent />
                    <BackendErrorHandler />
                </ToastProvider>
            </PermissionProvider>
        </BrowserRouter>
    );
}
