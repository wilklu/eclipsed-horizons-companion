import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">
          <span className="brand-icon">🌌</span>
          <span className="brand-name">Eclipsed Horizons</span>
        </NavLink>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/sophont-generator" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Sophont Generator
          </NavLink>
        </li>
        <li>
          <NavLink to="/world-builder" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            World Builder
          </NavLink>
        </li>
        <li>
          <NavLink to="/character-generator" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Character Generator
          </NavLink>
        </li>
        <li>
          <a
            href="https://github.com/wilklu/eclipsed-horizons-companion/tree/main/docs/house-rules"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            House Rules ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}
