import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../../features/users/pages/dashboard/DashboardPage';
import UsersPage from '../../features/users/pages/UsersPage';
import RolesPage from '../../features/roles/pages/RolesPage';
import CentersPage from '../../features/centers/pages/CentersPage';
import ProgramsPage from '../../features/users/pages/programs/ProgramsPage';
import ClassesPage from '../../features/users/pages/classes/ClassesPage.tsx';
import StudentProfilePage from '../../features/users/pages/students/StudentProfilePage';
import StudentDetailPage from '../../features/users/pages/students/StudentDetailPage';
import SettingsPage from '../../features/users/pages/settings/SettingsPage';
import ActivityLogPage from '../../features/users/pages/activity/ActivityLogPage';
import MyClassesPage from '../../features/students/pages/my-classes/MyClassesPage';
import ProtectedRoute from './ProtectedRoute';
import AttendancePage from '../../features/users/pages/attendance/AttendancePage';
import TakeAttendancePage from '../../features/users/pages/attendance/TakeAttendancePage';
import ExamManagementPage from '../../features/users/pages/exams/ExamManagementPage';
import AttendanceStatisticsPage from '../../features/users/pages/statistics/AttendanceStatisticsPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/students" element={<StudentProfilePage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute allowedRoles={['LECTURER']}>
                        <AttendancePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/attendance/take"
                element={
                    <ProtectedRoute allowedRoles={['LECTURER']}>
                        <TakeAttendancePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/exams"
                element={
                    <ProtectedRoute allowedRoles={['LECTURER']}>
                        <ExamManagementPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/statistics"
                element={
                    <ProtectedRoute allowedRoles={['LECTURER']}>
                        <AttendanceStatisticsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-classes"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <MyClassesPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
            {/* Chỉ redirect khi thực sự không tìm thấy route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
