import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'

export const Route = createFileRoute('/_public')({
  loader: async () => {
    const { currentUser } = await authMiddleware()

    // Redirect authenticated users to dashboard
    if (currentUser) {
      throw redirect({ to: '/dashboard' })
    }

    return {
      currentUser,
    }
  },
  component: PublicLayout,
})

function PublicLayout() {
  return <Outlet />
}
