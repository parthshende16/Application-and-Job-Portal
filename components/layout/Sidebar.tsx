'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/tracker', icon: '📊', label: 'Job Tracker' },
  { href: '/interview', icon: '🎤', label: 'AI Interview' },
  { href: '/video-interview', icon: '🎥', label: 'Video Interview' },
  { href: '/company', icon: '🏢', label: 'Company Prep' },
  { href: '/coding', icon: '💻', label: 'Coding IDE' },
  { href: '/mock', icon: '🤝', label: 'Peer Mock' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      background: '#0b0b16',
      borderRight: '1px solid var(--bg-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          }}>
            🚀
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.2 }}>AI Career Hub</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Prep. Apply. Win.</div>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: '0 16px 16px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
          Navigation
        </div>
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: isActive
                  ? 'rgba(124,58,237,0.15)'
                  : 'transparent',
                color: isActive ? '#a78bfa' : 'var(--text-secondary)',
                fontSize: '13.5px',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: '2px',
                textAlign: 'left',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px', height: '18px',
                  borderRadius: '0 2px 2px 0',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                }} />
              )}
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ padding: '12px 10px' }}>
        <div className="divider" style={{ marginBottom: '12px' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--bg-border)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: 'white',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '14px', padding: '4px', borderRadius: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Edit Profile"
          >
            ✏️
          </button>
        </div>
        <button
          className="btn-ghost"
          onClick={handleLogout}
          style={{ width: '100%', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
