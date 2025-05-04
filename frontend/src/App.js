import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OCRPage from './pages/OCRPage';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ocr" element={token ? <OCRPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? '/ocr' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;