import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthProvider'
import { NotificationProvider } from './lib/notifications/NotificationProvider'
import { ProtectedRoute } from './lib/auth/ProtectedRoute'
import { useAuth } from './lib/auth/useAuth'
import { isAdminEmail } from './lib/admin'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'
import Voorwaarden from './pages/Voorwaarden'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AppShell from './pages/app/AppShell'
import Feed from './pages/app/Feed'
import Kookboek from './pages/app/Kookboek'
import RecipeForm from './pages/app/RecipeForm'
import RecipeDetail from './pages/app/RecipeDetail'
import MomentForm from './pages/app/MomentForm'
import VideoForm from './pages/app/VideoForm'
import Chefs from './pages/app/Chefs'
import ChefProfile from './pages/app/ChefProfile'
import Profile from './pages/app/Profile'
import Admin from './pages/app/Admin'
import Leaderboard from './pages/app/Leaderboard'
import Invite from './pages/app/Invite'
import Activity from './pages/app/Activity'
import EditorialForm from './pages/app/EditorialForm'

function AppIndex() {
  const { user } = useAuth()
  return isAdminEmail(user?.email) ? <Navigate to="/app/admin" replace /> : <Feed />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/voorwaarden" element={<Voorwaarden />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registreren" element={<Signup />} />
          <Route path="/bevestigen" element={<Verify />} />
          <Route path="/wachtwoord-vergeten" element={<ForgotPassword />} />
          <Route path="/wachtwoord-resetten" element={<ResetPassword />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<AppIndex />} />
            <Route path="kookboek" element={<Kookboek />} />
            <Route path="kookboek/nieuw" element={<RecipeForm />} />
            <Route path="kookboek/:id/bewerken" element={<RecipeForm />} />
            <Route path="recept/:id" element={<RecipeDetail />} />
            <Route path="moment/nieuw" element={<MomentForm />} />
            <Route path="video/nieuw" element={<VideoForm />} />
            <Route path="redactie/nieuw" element={<EditorialForm />} />
            <Route path="chefs" element={<Chefs />} />
            <Route path="chefs/:username" element={<ChefProfile />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="delen" element={<Invite />} />
            <Route path="activiteit" element={<Activity />} />
            <Route path="profiel" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
