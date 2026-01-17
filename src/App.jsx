import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LanguageSetupGuard from './components/LanguageSetupGuard/LanguageSetupGuard'
import BreakpointIndicator from './components/BreakpointIndicator'
import { TasksProvider } from './contexts/TasksContext'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import WordsLoader from './pages/WordsLoader/WordsLoader'
import ImportsHistory from './pages/ImportsHistory/ImportsHistory'
import VocabulariesList from './pages/VocabulariesList/VocabulariesList'
import VocabularyDetail from './pages/VocabularyDetail/VocabularyDetail'
import LearnWords from './pages/LearnWords/LearnWords'

export default function App() {
  return (
    <TasksProvider>
      <BreakpointIndicator />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <Dashboard />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
        <Route
          path="/import-words"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <WordsLoader />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
        <Route
          path="/vocabularies"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <VocabulariesList />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
        <Route
          path="/vocabularies/:id"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <VocabularyDetail />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <LearnWords />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
        <Route
          path="/imports"
          element={
            <ProtectedRoute>
              <LanguageSetupGuard>
                <ImportsHistory />
              </LanguageSetupGuard>
          </ProtectedRoute>
        }
        />
      </Routes>
    </TasksProvider>
  )
}