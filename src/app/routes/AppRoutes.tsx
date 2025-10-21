import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../../features/users/pages/dashboard/DashboardPage';
import UsersPage from '../../features/users/pages/UsersPage'
import RolesPage from '../../features/roles/pages/RolesPage'
import CentersPage from '../../features/centers/pages/CentersPage'
import ProgramsPage from '../../features/users/pages/programs/ProgramsPage';
import ClassesPage from '../../features/users/pages/classes/ClassesPage.tsx';
import TeachingInteractionPage from '../../features/users/pages/teaching-interaction/TeachingInteractionPage';
import StudentProfilePage from '../../features/users/pages/students/StudentProfilePage';
import SettingsPage from '../../features/users/pages/settings/SettingsPage';




export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/teaching-interaction" element={<TeachingInteractionPage />} />
            <Route path="/students" element={<StudentProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Chỉ redirect khi thực sự không tìm thấy route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
