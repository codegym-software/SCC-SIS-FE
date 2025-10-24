import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../../features/users/pages/dashboard/DashboardPage';
import UsersPage from '../../features/users/pages/UsersPage';
import RolesPage from '../../features/roles/pages/RolesPage';
import CentersPage from '../../features/centers/pages/CentersPage';
import ProgramsPage from '../../features/users/pages/programs/ProgramsPage';
import ClassesPage from '../../features/users/pages/classes/ClassesPage.tsx';
import TeachingInteractionPage from '../../features/users/pages/teaching-interaction/TeachingInteractionPage';
import StudentProfilePage from '../../features/users/pages/students/StudentProfilePage';
import SettingsPage from '../../features/users/pages/settings/SettingsPage';
import MyClassesPage from '../../features/students/pages/my-classes/MyClassesPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route
                path="/teaching-interaction"
                element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'LECTURER']}>
                        <TeachingInteractionPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/students" element={<StudentProfilePage />} />
            <Route
                path="/my-classes"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <MyClassesPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Chỉ redirect khi thực sự không tìm thấy route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
