import { useState } from 'react';
import { generateStarSystem, ATMOSPHERE_TABLE, GOVERNMENT_TABLE } from './worldBuilder';
import type { StarSystem } from './worldBuilder';

function StarCard({ star }: { star: StarSystem['star'] }) {
  const starColor: Record<string, string> = {
    O: '#9bb0ff',
    B: '#aabfff',
    A: '#cad7ff',
    F: '#f8f7ff',
    G: '#fff4e8',
    K: '#ffd2a1',
    M: '#ffcc6f',
  };

  return (
    <div className="star-card" style={{ borderColor: starColor[star.type] ?? '#fff' }}>
      <div className="star-symbol" style={{ color: starColor[star.type] ?? '#fff' }}>
        ★
      </div>
      <div className="star-details">
        <h3>
          {star.type} {star.size} Star
        </h3>
        <ul>
          <li>
            <span className="label">Luminosity:</span> {star.luminosity}
          </li>
          <li>
            <span className="label">Habitable Zone:</span> {star.habZone}
          </li>
        </ul>
      </div>
    </div>
  );
}

function WorldRow({ world, isMain, onClick, selected }: { world: StarSystem['worlds'][0]; isMain: boolean; onClick: () => void; selected: boolean }) {
  return (
    <tr className={`world-row ${selected ? 'selected' : ''} ${isMain ? 'main-world' : ''}`} onClick={onClick}>
      <td>{world.name}</td>
      <td>{world.type}</td>
      <td className="uwp">{world.uwp}</td>
      <td>{world.tradeCodes.join(', ') || '—'}</td>
      <td>{isMain ? '★ Main World' : ''}</td>
    </tr>
  );
}

function WorldDetail({ world }: { world: StarSystem['worlds'][0] }) {
  const atmDesc = ATMOSPHERE_TABLE[world.atmosphere] ?? 'Unknown';
  const govDesc = GOVERNMENT_TABLE[world.government] ?? 'Unknown';

  return (
    <div className="card world-detail">
      <h2>{world.name}</h2>
      <p className="uwp-display">{world.uwp}</p>
      {world.tradeCodes.length > 0 && (
        <p className="trade-codes">Trade Codes: {world.tradeCodes.join(' ')}</p>
      )}

      <div className="card-section">
        <h3>Physical Characteristics</h3>
        <ul>
          <li>
            <span className="label">Size:</span> {world.size} ({world.size * 1600}km diameter)
          </li>
          <li>
            <span className="label">Atmosphere:</span> {world.atmosphere} — {atmDesc}
          </li>
          <li>
            <span className="label">Hydrosphere:</span> {world.hydrosphere * 10}% surface liquid
          </li>
        </ul>
      </div>

      {world.isMainWorld && (
        <div className="card-section">
          <h3>Civilisation</h3>
          <ul>
            <li>
              <span className="label">Population:</span> 10<sup>{world.population}</sup> inhabitants
            </li>
            <li>
              <span className="label">Government:</span> {world.government} — {govDesc}
            </li>
            <li>
              <span className="label">Law Level:</span> {world.lawLevel}
            </li>
            <li>
              <span className="label">Tech Level:</span> {world.techLevel}
            </li>
          </ul>
        </div>
      )}

      {world.remarks && (
        <div className="card-section notes">
          <h3>Referee Notes</h3>
          <p>{world.remarks}</p>
        </div>
      )}
    </div>
  );
}

export default function WorldBuilder() {
  const [system, setSystem] = useState<StarSystem | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<StarSystem['worlds'][0] | null>(null);

  function handleGenerate() {
    const newSystem = generateStarSystem();
    setSystem(newSystem);
    setSelectedWorld(newSystem.mainWorld);
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>World Builder</h1>
        <p className="app-description">
          Generate complete star systems with detailed worlds using Mongoose Traveller 2nd Edition UWP generation rules.
          Click any world in the system list to see its full details.
        </p>
      </div>

      <div className="generator-controls">
        <button className="btn-primary btn-large" onClick={handleGenerate}>
          {system ? '↺ Generate New System' : '✦ Generate Star System'}
        </button>
      </div>

      {system && (
        <>
          <div className="system-header">
            <h2 className="system-name">{system.name}</h2>
            <StarCard star={system.star} />
          </div>

          <div className="world-layout">
            <div className="world-list">
              <h3>System Bodies</h3>
              <table className="world-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>UWP</th>
                    <th>Trade Codes</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {system.worlds.map((w) => (
                    <WorldRow
                      key={w.name + w.orbit}
                      world={w}
                      isMain={w.isMainWorld}
                      onClick={() => setSelectedWorld(w)}
                      selected={selectedWorld?.name === w.name}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {selectedWorld && (
              <div className="world-detail-panel">
                <WorldDetail world={selectedWorld} />
              </div>
            )}
          </div>
        </>
      )}

      {!system && (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <p>Click the button above to generate a new star system.</p>
        </div>
      )}
    </div>
  );
}
