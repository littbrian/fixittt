import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Directory from './pages/Directory'
import Profile from './pages/Profile'
import Register from './pages/Register'
import PostJob from './pages/PostJob'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import HomeownerLogin from './pages/HomeownerLogin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tradesmen" element={<Directory />} />
      <Route path="/tradesmen/:id" element={<Profile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/homeowner-login" element={<HomeownerLogin />} />
    </Routes>
  )
}