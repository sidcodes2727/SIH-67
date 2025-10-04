import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import PageTransition from './components/PageTransition.jsx';

export default function App() {
  const [route, setRoute] = useState('home');
  const [history, setHistory] = useState([]);

  const navigate = (next) => {
    setHistory((h) => (route ? [...h, route] : h));
    setRoute(next);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setRoute('home');
        return h;
      }
      const copy = [...h];
      const prev = copy.pop();
      setRoute(prev || 'home');
      return copy;
    });
  };

  const renderRoute = () => {
    switch (route) {
      case 'upload': return <Upload />;
      case 'dashboard': return <Dashboard />;
      case 'about': return <About />;
      default: return <Home onQuickNav={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={navigate} onBack={goBack} canGoBack={route !== 'home'} />
      <main className="flex-1 container py-8">
        <AnimatePresence mode="wait">
          <PageTransition key={route}>{renderRoute()}</PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
