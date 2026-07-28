import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthProvider'
import { ProtectedRoute } from './lib/auth/ProtectedRoute'
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route index element={<Feed />} />
            <Route path="kookboek" element={<Kookboek />} />
            <Route path="kookboek/nieuw" element={<RecipeForm />} />
            <Route path="kookboek/:id/bewerken" element={<RecipeForm />} />
            <Route path="recept/:id" element={<RecipeDetail />} />
            <Route path="moment/nieuw" element={<MomentForm />} />
            <Route path="video/nieuw" element={<VideoForm />} />
            <Route path="chefs" element={<Chefs />} />
            <Route path="chefs/:username" element={<ChefProfile />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profiel" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
