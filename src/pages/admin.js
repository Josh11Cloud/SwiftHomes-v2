import AdminDashboard from './sections/Admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <PrivateRoute>
      <AdminDashboard />
    </PrivateRoute>
  );}