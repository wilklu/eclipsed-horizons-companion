import { useState } from 'react';
import { generateSophont } from './sophontGenerator';
import type { SophontProfile } from './sophontGenerator';
import { dmString } from '../../utils/dice';

function AttributeModifierTable({ mods }: { mods: SophontProfile['attributeModifiers'] }) {
  const attrs = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const;
  return (
    <table className="attr-table">
      <thead>
        <tr>
          {attrs.map((a) => (
            <th key={a}>{a}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {attrs.map((a) => (
            <td key={a} className={mods[a] > 0 ? 'positive' : mods[a] < 0 ? 'negative' : ''}>
              {dmString(mods[a])}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function SophontCard({ sophont }: { sophont: SophontProfile }) {
  return (
    <div className="card sophont-card">
      <h2 className="sophont-name">{sophont.name}</h2>
      <p className="sophont-homeworld">
        <span className="label">Homeworld Type:</span> {sophont.homeworld}
      </p>

      <div className="card-section">
        <h3>Physiology</h3>
        <ul>
          <li>
            <span className="label">Symmetry:</span> {sophont.bodyPlan.symmetry}
          </li>
          <li>
            <span className="label">Limbs:</span> {sophont.bodyPlan.limbs}
          </li>
          <li>
            <span className="label">Covering:</span> {sophont.bodyPlan.covering}
          </li>
          <li>
            <span className="label">Reproduction:</span> {sophont.bodyPlan.reproduction}
          </li>
          <li>
            <span className="label">Locomotion:</span> {sophont.locomotion}
          </li>
          <li>
            <span className="label">Diet:</span> {sophont.diet}
          </li>
          <li>
            <span className="label">Average Size:</span> {sophont.averageSize}
          </li>
          <li>
            <span className="label">Lifespan:</span> {sophont.lifespan}
          </li>
        </ul>
      </div>

      <div className="card-section">
        <h3>Senses</h3>
        <ul>
          {sophont.senses.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="card-section">
        <h3>Society & Culture</h3>
        <ul>
          <li>
            <span className="label">Social Structure:</span> {sophont.socialStructure}
          </li>
          <li>
            <span className="label">Technological Aptitude:</span> {sophont.technologicalAptitude}
          </li>
          <li>
            <span className="label">Cultural Traits:</span>
            <ul>
              {sophont.culturalTraits.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      <div className="card-section">
        <h3>Attribute Modifiers</h3>
        <AttributeModifierTable mods={sophont.attributeModifiers} />
      </div>

      {sophont.notes.length > 0 && (
        <div className="card-section notes">
          <h3>Notes</h3>
          <ul>
            {sophont.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SophontGenerator() {
  const [sophont, setSophont] = useState<SophontProfile | null>(null);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Sophont Generator</h1>
        <p className="app-description">
          Procedurally generate custom alien sophont species for your Traveller universe. Each sophont includes full
          physiological details, social structure, cultural traits, and attribute modifiers for use in Character
          Generation.
        </p>
      </div>

      <div className="generator-controls">
        <button className="btn-primary btn-large" onClick={() => setSophont(generateSophont())}>
          {sophont ? '↺ Generate New Sophont' : '✦ Generate Sophont'}
        </button>
      </div>

      {sophont && <SophontCard sophont={sophont} />}

      {!sophont && (
        <div className="empty-state">
          <div className="empty-icon">🌌</div>
          <p>Click the button above to generate a new sophont species.</p>
        </div>
      )}
    </div>
  );
}
