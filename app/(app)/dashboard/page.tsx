'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getJobs, getInterviewSessions, getMockRequests } from '@/lib/store';

const modules = [
  {
    href: '/tracker',
    icon: '📊',
    title: 'Job Tracker',
    description: 'Manage applications with a Kanban board. Track applied, interview, and offer stages.',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.05))',
    badge: 'Go to Tracker →',
  },
  {
    href: '/interview',
    icon: '🎤',
    title: 'AI Interview',
    description: 'Practice with role-specific questions. Get instant AI feedback on your answers.',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))',
    badge: 'Start Practice →',
  },
  {
    href: '/company',
    icon: '🏢',
    title: 'Company Prep',
    description: 'Prep for Google, Amazon, Meta, and more. Curated questions + tips.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
    badge: 'Pick a Company →',
  },
  {
    href: '/coding',
    icon: '💻',
    title: 'Coding IDE',
    description: 'Write and run code in the browser. JavaScript executes instantly without setup.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
    badge: 'Open Editor →',
  },
  {
    href: '/mock',
    icon: '🤝',
    title: 'Peer Mock',
    description: 'Connect with other candidates for mock interviews. Find partners by role & level.',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))',
    badge: 'Find Partners →',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ jobs: 0, interviews: 0, mocks: 0, offers: 0 });

  useEffect(() => {
    const jobs = getJobs();
    const interviews = getInterviewSessions();
    const mocks = getMockRequests();
    setStats({
      jobs: jobs.length,
      interviews: interviews.length,
      mocks: mocks.filter(m => m.status === 'accepted').length,
      offers: jobs.filter(j => j.status === 'offer').length,
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px', animation: 'fadeInUp 0.4s ease' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          {greeting}, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Ready to level up your career today? Let's get to work.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '36px',
        animation: 'fadeInUp 0.4s ease 0.05s both',
      }}>
        {[
          { label: 'Jobs Applied', value: stats.jobs, icon: '📝', color: '#7c3aed' },
          { label: 'Interviews Done', value: stats.interviews, icon: '🎤', color: '#06b6d4' },
          { label: 'Offers Received', value: stats.offers, icon: '🎉', color: '#10b981' },
          { label: 'Mock Sessions', value: stats.mocks, icon: '🤝', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={stat.label} className="card" style={{
            padding: '20px',
            animation: `fadeInUp 0.4s ease ${0.05 + i * 0.05}s both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: stat.color,
                boxShadow: `0 0 8px ${stat.color}80`,
              }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick tip banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'fadeInUp 0.4s ease 0.2s both',
      }}>
        <span style={{ fontSize: '22px' }}>💡</span>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '2px', fontSize: '14px' }}>Pro Tip</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Candidates who practice 3+ mock interviews are 2.5× more likely to pass behavioral rounds. Start with the AI Interview module!
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ flexShrink: 0, fontSize: '13px', padding: '8px 16px' }}
          onClick={() => router.push('/interview')}
        >
          Practice Now
        </button>
      </div>

      {/* Module grid */}
      <div style={{ marginBottom: '16px', animation: 'fadeInUp 0.4s ease 0.25s both' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Modules</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Everything you need to land your next role</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        animation: 'fadeInUp 0.4s ease 0.3s both',
      }}>
        {modules.map((mod, i) => (
          <button
            key={mod.href}
            onClick={() => router.push(mod.href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              animation: `fadeInUp 0.4s ease ${0.3 + i * 0.05}s both`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = `${mod.color}50`;
              el.style.background = 'var(--bg-card-hover)';
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${mod.color}25`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--bg-border)';
              el.style.background = 'var(--bg-card)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '44px', height: '44px',
              borderRadius: '12px',
              background: mod.gradient,
              border: `1px solid ${mod.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>
              {mod.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{mod.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>{mod.description}</div>
            </div>
            <div style={{
              fontSize: '12px', fontWeight: '600',
              color: mod.color,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {mod.badge}
            </div>
          </button>
        ))}
      </div>

      {/* Profile completion nudge (if skills empty) */}
      {(!user?.skills || user.skills.length === 0) && (
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          animation: 'fadeInUp 0.4s ease 0.5s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#fcd34d' }}>Complete your profile</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Add your skills to get personalized recommendations.</div>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ flexShrink: 0, fontSize: '13px', padding: '8px 16px' }}
            onClick={() => router.push('/profile')}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
