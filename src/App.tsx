import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SophontGenerator from './apps/sophont-generator/SophontGenerator';
import WorldBuilder from './apps/world-builder/WorldBuilder';
import CharacterGenerator from './apps/character-generator/CharacterGenerator';
import './App.css';

function NotFound() {
  return (
    <div className="app-container">
      <div className="empty-state">
        <div className="empty-icon">🔭</div>
        <h2>Page Not Found</h2>
        <p>This region of space has not yet been charted.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sophont-generator" element={<SophontGenerator />} />
            <Route path="/world-builder" element={<WorldBuilder />} />
            <Route path="/character-generator" element={<CharacterGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>
            Eclipsed Horizons Companion · Built for{' '}
            <a href="https://www.mongoosepublishing.com/collections/traveller" target="_blank" rel="noopener noreferrer">
              Mongoose Traveller 2e
            </a>{' '}
            · Not for commercial use ·{' '}
            <a
              href="https://github.com/wilklu/eclipsed-horizons-companion"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
