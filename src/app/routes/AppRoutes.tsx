import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '../../features/users/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import RolesPage from '../../features/users/pages/RolesPage'
import CentersPage from '../../features/users/pages/CentersPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/centers" element={<CentersPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


