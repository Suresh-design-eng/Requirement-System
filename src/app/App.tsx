import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import { useApp } from './context/AppContext'
import AppliedJobsPage from './pages/AppliedJobsPage'
import AdminLogin from './pages/AdminLogin'
import CandidateLogin from './pages/CandidateLogin'
import CreateRequirementPage from './pages/CreateRequirementPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import JobDetailPage from './pages/JobDetailPage'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import RejectedJobsPage from './pages/RejectedJobsPage'
import RequirementDetailPage from './pages/RequirementDetailPage'
import RequirementsPage from './pages/RequirementsPage'
import ResumePage from './pages/ResumePage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

function RequireAuth() {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return <Outlet />
}

function GuestOnly() {
  const { currentUser } = useApp()

  if (currentUser) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

function RequireAdmin() {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}`, loginType: 'admin' }}
      />
    )
  }

  if (currentUser.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

function RequireCandidate() {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return (
      <Navigate
        replace
        to="/login"
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          loginType: 'candidate',
        }}
      />
    )
  }

  if (currentUser.role !== 'user') {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />

            <Route element={<GuestOnly />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="admin-login" element={<AdminLogin />} />
              <Route path="candidate-login" element={<CandidateLogin />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route element={<RequireCandidate />}>
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="applications" element={<AppliedJobsPage />} />
              <Route path="applications/rejected" element={<RejectedJobsPage />} />
              <Route path="resume" element={<ResumePage />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="requirements" element={<RequirementsPage />} />
              <Route path="requirements/:id" element={<RequirementDetailPage />} />
              <Route path="create-requirement" element={<CreateRequirementPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="map" element={<MapPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
