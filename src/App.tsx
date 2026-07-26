import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthProvider'
import { ProtectedRoute } from './lib/auth/ProtectedRoute'
import Landing from './pages/Landing'
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
import Chefs from './pages/app/Chefs'
import Profile from './pages/app/Profile'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
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
            <Route path="chefs" element={<Chefs />} />
            <Route path="profiel" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
