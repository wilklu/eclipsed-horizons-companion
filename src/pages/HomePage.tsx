import { Link } from 'react-router-dom';

interface AppCardProps {
  icon: string;
  title: string;
  description: string;
  to: string;
  status: 'available' | 'coming-soon';
}

function AppCard({ icon, title, description, to, status }: AppCardProps) {
  if (status === 'coming-soon') {
    return (
      <div className="app-card app-card--coming-soon">
        <div className="app-card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="badge badge-soon">Coming Soon</span>
      </div>
    );
  }

  return (
    <Link to={to} className="app-card app-card--available">
      <div className="app-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="badge badge-available">Launch →</span>
    </Link>
  );
}

interface RuleStatusBadgeProps {
  status: 'CANON' | 'APPROVED' | 'OPTIONAL' | 'EXPERIMENTAL';
}

function RuleStatusBadge({ status }: RuleStatusBadgeProps) {
  const classes: Record<string, string> = {
    CANON: 'badge-canon',
    APPROVED: 'badge-approved',
    OPTIONAL: 'badge-optional',
    EXPERIMENTAL: 'badge-experimental',
  };
  return <span className={`badge rule-badge ${classes[status]}`}>{status}</span>;
}

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🌌</span> Eclipsed Horizons Companion
          </h1>
          <p className="hero-subtitle">
            Integrated tools and house rules documentation for the <strong>Eclipsed Horizons</strong> Traveller
            campaign.
          </p>
        </div>
      </header>

      <section className="section">
        <h2>Tool Suite</h2>
        <p className="section-intro">
          Generate sophonts, star systems, and characters for your Traveller universe.
        </p>
        <div className="app-grid">
          <AppCard
            icon="🧬"
            title="Sophont Generator"
            description="Procedurally create unique alien sophont species with full physiology, social structure, cultural traits, and attribute modifiers."
            to="/sophont-generator"
            status="available"
          />
          <AppCard
            icon="🌍"
            title="World Builder"
            description="Generate complete star systems with detailed worlds using Mongoose Traveller UWP generation, including trade codes and civilisation data."
            to="/world-builder"
            status="available"
          />
          <AppCard
            icon="👤"
            title="Character Generator"
            description="Build complete Traveller characters using the life path system — attributes, career history, skills, equipment, and connections."
            to="/character-generator"
            status="available"
          />
          <AppCard
            icon="🚀"
            title="Ship Builder"
            description="Design and outfit spacecraft using standard hull configurations, drives, weapons, and fittings."
            to="/ship-builder"
            status="coming-soon"
          />
          <AppCard
            icon="🗺️"
            title="Subsector Mapper"
            description="Generate and visualise complete subsectors with trade routes, polities, and world data."
            to="/subsector-mapper"
            status="coming-soon"
          />
        </div>
      </section>

      <section className="section">
        <h2>House Rules Documentation</h2>
        <p className="section-intro">
          All custom rules are version-controlled and tracked by approval status. Each rule carries one of the
          following statuses:
        </p>
        <div className="rule-status-grid">
          <div className="rule-status-card">
            <RuleStatusBadge status="CANON" />
            <p>Official Mongoose Traveller rules included here for quick reference.</p>
          </div>
          <div className="rule-status-card">
            <RuleStatusBadge status="APPROVED" />
            <p>Agreed-upon house rules currently in active use at the table.</p>
          </div>
          <div className="rule-status-card">
            <RuleStatusBadge status="OPTIONAL" />
            <p>Rules players may choose to use on a per-character or per-session basis.</p>
          </div>
          <div className="rule-status-card">
            <RuleStatusBadge status="EXPERIMENTAL" />
            <p>Currently being playtested — subject to revision or removal after review.</p>
          </div>
        </div>

        <div className="rules-links">
          <h3>Rule Categories</h3>
          <ul className="rule-category-list">
            {[
              { label: 'Character Creation', file: 'character-creation.md' },
              { label: 'Combat', file: 'combat.md' },
              { label: 'Psionics', file: 'psionics.md' },
              { label: 'Trade & Commerce', file: 'trade-and-commerce.md' },
              { label: 'Space Travel', file: 'space-travel.md' },
              { label: 'World Building', file: 'world-building.md' },
            ].map(({ label, file }) => (
              <li key={file}>
                <a
                  href={`https://github.com/wilklu/eclipsed-horizons-companion/blob/main/docs/house-rules/${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label} ↗
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://github.com/wilklu/eclipsed-horizons-companion/blob/main/docs/house-rules/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View Full Changelog ↗
          </a>
        </div>
      </section>
    </div>
  );
}
