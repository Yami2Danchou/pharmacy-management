import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }) {
  const session = await getSession()
  if (!session) redirect('/')

  return <DashboardShell session={session}>{children}</DashboardShell>
}
