import { useState } from 'react';
import { generateCharacter } from './characterGenerator';
import type { Character } from './characterGenerator';
import { dmString } from '../../utils/dice';

function AttributeRow({ label, value }: { label: string; value: number }) {
  const dm = Math.floor((value - 7) / 3);
  return (
    <div className="attr-row">
      <span className="attr-name">{label}</span>
      <span className="attr-value">{value}</span>
      <span className={`attr-dm ${dm > 0 ? 'positive' : dm < 0 ? 'negative' : ''}`}>{dmString(dm)}</span>
    </div>
  );
}

function SkillList({ skills }: { skills: Record<string, number> }) {
  const entries = Object.entries(skills).sort(([a], [b]) => a.localeCompare(b));
  return (
    <ul className="skill-list">
      {entries.map(([skill, level]) => (
        <li key={skill}>
          <span className="skill-name">{skill}</span>
          <span className="skill-level">{level}</span>
        </li>
      ))}
    </ul>
  );
}

function CharacterSheet({ character }: { character: Character }) {
  return (
    <div className="card character-sheet">
      <div className="char-header">
        <div>
          <h2 className="char-name">{character.name}</h2>
          <p className="char-species">{character.species} · Age {character.age}</p>
        </div>
        <div className="upp-block">
          <span className="label">UPP</span>
          <span className="upp">{character.upp}</span>
        </div>
      </div>

      <p className="char-background">{character.background}</p>

      <div className="char-columns">
        <div className="char-col">
          <div className="card-section">
            <h3>Attributes</h3>
            <div className="attr-grid">
              {(['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const).map((attr) => (
                <AttributeRow key={attr} label={attr} value={character.attributes[attr]} />
              ))}
            </div>
          </div>

          <div className="card-section">
            <h3>Finances</h3>
            <p>
              <span className="label">Credits:</span> Cr{character.credits.toLocaleString()}
            </p>
          </div>

          {character.equipment.length > 0 && (
            <div className="card-section">
              <h3>Equipment</h3>
              <ul>
                {character.equipment.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="char-col">
          <div className="card-section">
            <h3>Skills</h3>
            <SkillList skills={character.skills} />
          </div>
        </div>

        <div className="char-col">
          <div className="card-section">
            <h3>Career History</h3>
            {character.career.map((c, i) => (
              <div key={i} className="career-entry">
                <strong>
                  {c.career} — {c.rank}
                </strong>{' '}
                ({c.terms} term{c.terms !== 1 ? 's' : ''})
                <ul className="career-events">
                  {c.events.map((e, j) => (
                    <li key={j}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {(character.contacts.length > 0 || character.allies.length > 0 || character.enemies.length > 0) && (
            <div className="card-section">
              <h3>Connections</h3>
              {character.allies.length > 0 && (
                <p>
                  <span className="label">Allies:</span>{' '}
                  {character.allies.map((a) => `${a.charAt(0).toUpperCase()}${a.slice(1)}`).join(', ')}
                </p>
              )}
              {character.contacts.length > 0 && (
                <p>
                  <span className="label">Contacts:</span>{' '}
                  {character.contacts.map((c) => `${c.charAt(0).toUpperCase()}${c.slice(1)}`).join(', ')}
                </p>
              )}
              {character.enemies.length > 0 && (
                <p>
                  <span className="label">Enemies:</span>{' '}
                  {character.enemies.map((e) => `${e.charAt(0).toUpperCase()}${e.slice(1)}`).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character | null>(null);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Character Generator</h1>
        <p className="app-description">
          Generate complete Traveller player characters with attributes, career history, skills, equipment, and
          connections. Characters are built using the Mongoose Traveller 2nd Edition life path system.
        </p>
      </div>

      <div className="generator-controls">
        <button className="btn-primary btn-large" onClick={() => setCharacter(generateCharacter())}>
          {character ? '↺ Generate New Character' : '✦ Generate Character'}
        </button>
      </div>

      {character && <CharacterSheet character={character} />}

      {!character && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>Click the button above to generate a new Traveller character.</p>
        </div>
      )}
    </div>
  );
}
