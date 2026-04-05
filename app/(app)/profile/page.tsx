'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const SKILLS_SUGGESTIONS = ['React', 'Node.js', 'Python', 'TypeScript', 'System Design', 'DSA', 'Machine Learning', 'AWS', 'SQL', 'Java', 'Docker', 'Kubernetes', 'GraphQL', 'Next.js'];
const EXPERIENCE_OPTIONS = ['Student / Fresher', 'Entry Level (0-2 yrs)', 'Mid Level (2-5 yrs)', 'Senior (5+ yrs)'];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    experience: user?.experience || 'Entry Level (0-2 yrs)',
    skills: user?.skills || [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div style={{ padding: '32px', maxWidth: '680px', animation: 'fadeInUp 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button className="btn-ghost" onClick={() => router.push('/dashboard')}>← Dashboard</button>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>👤 Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Avatar section */}
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800', color: 'white',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{form.name || 'Your Name'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{user?.email}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'today'}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>Experience Level</label>
              <select
                className="input"
                value={form.experience}
                onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
              >
                {EXPERIENCE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>Bio / About</label>
              <textarea
                className="input"
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="I'm a software engineer with a passion for distributed systems..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Technical Skills</h2>

          {/* Current skills */}
          {form.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {form.skills.map(skill => (
                <div key={skill} className="tag">
                  {skill}
                  <button
                    type="button"
                    className="remove"
                    onClick={() => removeSkill(skill)}
                    style={{ marginLeft: '2px', fontSize: '12px', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add skill */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Add a skill (e.g. React, Python...)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); }
              }}
            />
            <button type="button" className="btn-secondary" onClick={() => addSkill(skillInput)}>Add</button>
          </div>

          {/* Suggestions */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Quick add:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SKILLS_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--bg-border)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget.style.background = 'rgba(124,58,237,0.12)');
                    (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)');
                    (e.currentTarget.style.color = '#a78bfa');
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.04)');
                    (e.currentTarget.style.borderColor = 'var(--bg-border)');
                    (e.currentTarget.style.color = 'var(--text-secondary)');
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="submit" className="btn-primary" style={{ flex: 2 }}>
            {saved ? '✓ Saved!' : 'Save Profile'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={() => { logout(); router.push('/login'); }}
          >
            🚪 Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}
