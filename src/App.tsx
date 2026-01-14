import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import RequireOnboarding from './components/RequireOnboarding';
import { AppProvider } from './context/AppContext';
import Onboarding from './pages/Onboarding.tsx';
import Profile from './pages/Profile';
import ToastContainer from './components/Toast';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />

          <Route element={<RequireOnboarding />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="create" element={<Create />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AppProvider>
  );
}
