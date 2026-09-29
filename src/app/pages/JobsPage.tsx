import AdminJobsBoard from '../components/admin/AdminJobsBoard'
import JobList from '../components/candidate/JobList'
import { useApp } from '../context/AppContext'

export default function JobsPage() {
  const { currentUser } = useApp()

  if (currentUser?.role === 'admin') {
    return <AdminJobsBoard />
  }

  return <JobList />
}
