import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PersonalMotion } from './features/personal/context';
import { App } from './app/App';
import './styles/global.css';
import { AuthProvider } from './features/accounts/Auth';
import { ArchiveScope } from './features/accounts/ArchiveScope';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArchiveScope>
          <PersonalMotion>
            <App />
          </PersonalMotion>
        </ArchiveScope>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
