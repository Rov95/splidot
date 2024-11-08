import { StrictMode } from 'react'
import ReactDom from 'react-dom';
import { ClerkProvider } from '@clerk/clerk-react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const clerk_key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if(!clerk_key) {
  throw new Error("No key was found")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerk_key}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
