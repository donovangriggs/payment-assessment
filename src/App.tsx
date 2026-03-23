import { ErrorBoundary } from './components/ErrorBoundary'
import { PaymentPage } from './components/PaymentPage'

function App() {
  return (
    <ErrorBoundary>
      <PaymentPage />
    </ErrorBoundary>
  )
}

export default App
