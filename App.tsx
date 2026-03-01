import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentEngine from './pages/DocumentEngine';
import SupplierHub from './pages/SupplierHub';
import Analytics from './pages/Analytics';
import Campaigns from './pages/Campaigns';
import { WorkspaceProvider } from './context/WorkspaceContext';
import SettingsPage from './pages/Settings';
import GuidePage from './pages/Guide';
import Receptions from './pages/Receptions';
import WelcomeModal from './components/WelcomeModal';

function App() {
  const [isWelcomeOpen, setIsWelcomeOpen] = React.useState(false);

  React.useEffect(() => {
    const isHidden = localStorage.getItem('visitrack_welcome_hidden');
    if (!isHidden) {
      setTimeout(() => setIsWelcomeOpen(true), 1500);
    }
  }, []);

  return (
    <Router>
      <WorkspaceProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/suppliers" element={<SupplierHub />} />
            <Route path="/compliance" element={<DocumentEngine />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/receptions" element={<Receptions />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
        <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} />
      </WorkspaceProvider>
    </Router>
  );
}

export default App;