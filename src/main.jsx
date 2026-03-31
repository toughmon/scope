import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NewPrototype from './NewPrototype.jsx'

const path = window.location.pathname;
const isOld = path.includes('/old');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isOld ? <App /> : <NewPrototype />}
  </StrictMode>,
)
