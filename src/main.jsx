import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ExerciseProvider } from './context/ExerciseContext'
import { SessionProvider } from './context/SessionContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ExerciseProvider>
          <SessionProvider>
            <App />
          </SessionProvider>
        </ExerciseProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
