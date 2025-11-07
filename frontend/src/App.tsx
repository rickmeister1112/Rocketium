import { Route, Routes } from 'react-router-dom';

import './App.css';
import { Toast } from './components/feedback/Toast';
import { DesignEditorPage } from './pages/DesignEditorPage';
import { DesignListPage } from './pages/DesignListPage';

const App = () => {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<DesignListPage />} />
        <Route path="/designs/:id" element={<DesignEditorPage />} />
      </Routes>
      <Toast />
    </div>
  );
};

export default App;
