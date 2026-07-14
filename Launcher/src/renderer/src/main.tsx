/** AETHER UI — V1 | Stellar Studio Launcher (proprietary interface layer). */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { LogConsoleApp } from './LogConsoleApp'
import { DebugApp } from './DebugApp'
import { AlreadyRunningApp } from './AlreadyRunningApp'
import { CrashReporterApp } from './CrashReporterApp'
import { I18nProvider } from './i18n/I18nContext'
import { ToastProvider } from './ui/ToastContext'
import './typography.css'
import './styles.css'
import './theme.css'

const stellarMode = new URLSearchParams(window.location.search).get('stellar')
const rootEl = document.getElementById('root')!

if (stellarMode === 'log') {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <I18nProvider>
        <LogConsoleApp />
      </I18nProvider>
    </React.StrictMode>
  )
} else if (stellarMode === 'debug') {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <I18nProvider>
        <ToastProvider>
          <DebugApp />
        </ToastProvider>
      </I18nProvider>
    </React.StrictMode>
  )
} else if (stellarMode === 'already-running') {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <I18nProvider>
        <AlreadyRunningApp />
      </I18nProvider>
    </React.StrictMode>
  )
} else if (stellarMode === 'crash') {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <I18nProvider>
        <CrashReporterApp />
      </I18nProvider>
    </React.StrictMode>
  )
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <I18nProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </I18nProvider>
    </React.StrictMode>
  )
}
