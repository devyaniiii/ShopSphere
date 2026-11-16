import ProductDetail from "./pages/ProductDetail";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import { useAuth } from './context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-4 text-3xl font-bold">ShopSphere Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p className="mt-2">Role: {user?.role}</p>

      <button
        onClick={logout}
        className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white"
      >
        Logout
      </button>
    </div>
  )
}

const AdminDashboard = () => (
  <div className="min-h-screen p-8">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <p>Welcome to the ShopSphere admin area.</p>
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
