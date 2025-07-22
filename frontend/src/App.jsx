

import './App.css'
import { UserProvider } from './context/userContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  

  return (
    <UserProvider>
  <AppRoutes/>
  </UserProvider>
  )
}

export default App
