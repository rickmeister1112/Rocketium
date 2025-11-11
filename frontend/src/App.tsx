import { Route, Routes } from 'react-router-dom';

import './App.css';
import { Toast } from './components/feedback/Toast';
import { DesignEditorPage } from './pages/DesignEditorPage';
import { DesignListPage } from './pages/DesignListPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

const App = () => {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<DesignListPage />} />
        <Route path="/designs/:id" element={<DesignEditorPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
      <Toast />
    </div>
  );
};

export default App;
