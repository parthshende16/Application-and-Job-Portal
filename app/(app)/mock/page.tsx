'use client';

import { useState, useEffect } from 'react';
import { getMockRequests, addMockRequest, saveMockRequests, MockRequest } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

const ROLES = ['SDE', 'PM', 'Data Science', 'HR', 'DevOps'];
const LEVELS = ['Entry', 'Mid', 'Senior'];
const TOPICS = ['DSA', 'System Design', 'Behavioral', 'ML Fundamentals', 'Communication', 'Leadership'];

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#10b981', badge: 'badge-green' },
  accepted: { label: 'Accepted', color: '#7c3aed', badge: 'badge-violet' },
  completed: { label: 'Completed', color: '#9090a8', badge: 'badge-gray' },
};

export default function MockPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MockRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', role: 'SDE', level: 'Entry', topic: 'DSA' });
  const [filterRole, setFilterRole] = useState('All');
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    setRequests(getMockRequests());
    setForm(p => ({ ...p, name: user?.name || '' }));
  }, [user]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addMockRequest(form);
    setRequests(getMockRequests());
    setShowForm(false);
  };

  const handleAccept = (id: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r);
    saveMockRequests(updated);
    setRequests(updated);
    openChat(id);
  };

  const openChat = (id: string) => {
    const req = requests.find(r => r.id === id);
    setChatOpen(id);
    // Seed with a greeting
    setMessages([
      {
        from: 'System',
        text: `🎉 Mock interview session started with ${req?.name || 'partner'}! You're interviewing for: ${req?.topic}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        from: req?.name || 'Partner',
        text: `Hi! Ready to practice ${req?.topic}? I'll start as the interviewer. 🎤`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const req = requests.find(r => r.id === chatOpen);
    const newMsg = {
      from: user?.name || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate partner response
    const responses = [
      "That's a good approach! What's the time complexity?",
      "Interesting! Can you elaborate more on that?",
      "Good point. How would you handle edge cases?",
      "I see. What's the trade-off here?",
      "Nice! Let me ask a follow-up: how would you scale this?",
    ];
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: req?.name || 'Partner',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1200 + Math.random() * 1000);
  };

  const filtered = filterRole === 'All' ? requests : requests.filter(r => r.role === filterRole);

  // Chat overlay
  if (chatOpen) {
    const req = requests.find(r => r.id === chatOpen);
    return (
      <div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexShrink: 0 }}>
          <button className="btn-ghost" onClick={() => setChatOpen(null)}>← Back</button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700' }}>
              🤝 Mock Session with {req?.name}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {req?.role} · {req?.level} · {req?.topic}
            </p>
          </div>
          <span className={`badge ${STATUS_CONFIG.accepted.badge}`} style={{ marginLeft: 'auto' }}>Live Session</span>
        </div>

        <div style={{
          flex: 1,
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--bg-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => {
              const isMe = msg.from === (user?.name || 'You');
              const isSystem = msg.from === 'System';
              if (isSystem) {
                return (
                  <div key={i} style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    padding: '6px 12px',
                    background: 'rgba(124,58,237,0.1)',
                    borderRadius: '100px',
                    margin: '0 auto',
                    maxWidth: '90%',
                  }}>
                    {msg.text}
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '8px',
                  animation: 'fadeInUp 0.2s ease',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isMe ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', flexShrink: 0,
                  }}>
                    {msg.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {!isMe && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', paddingLeft: '2px' }}>{msg.from}</div>}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMe ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'rgba(255,255,255,0.06)',
                      fontSize: '14px', lineHeight: 1.5,
                      maxWidth: '480px',
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', textAlign: isMe ? 'right' : 'left', paddingLeft: '2px', paddingRight: '2px' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '10px' }}>
            <input
              className="input"
              placeholder="Type a message... (Enter to send)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={sendChat} style={{ padding: '10px 20px' }}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>🤝 Peer Mock Interviews</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Find practice partners. Match by role, level, and topic.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} id="post-mock-btn">
          + Post a Request
        </button>
      </div>

      {/* Filter */}
      <div className="tab-bar" style={{ marginBottom: '20px', animation: 'fadeInUp 0.4s ease 0.05s both' }}>
        {['All', ...ROLES].map(role => (
          <button
            key={role}
            className={`tab ${filterRole === role ? 'active' : ''}`}
            onClick={() => setFilterRole(role)}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
        {filtered.map((req, i) => (
          <div key={req.id} className="card" style={{
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: '16px',
            animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
          }}>
            {/* Avatar */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed40, #06b6d440)',
              border: '2px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '700', color: '#a78bfa',
              flexShrink: 0,
            }}>
              {req.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>{req.name}</span>
                <span className={`badge ${STATUS_CONFIG[req.status].badge}`}>{STATUS_CONFIG[req.status].label}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '4px', color: '#a78bfa' }}>
                  {req.role}
                </span>
                <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bg-border)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  {req.level} Level
                </span>
                <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '4px', color: '#67e8f9' }}>
                  📚 {req.topic}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {timeAgo(req.createdAt)}
                </span>
              </div>
            </div>

            {/* Action */}
            {req.status === 'open' && (
              <button
                className="btn-primary"
                style={{ flexShrink: 0, fontSize: '13px', padding: '8px 18px' }}
                onClick={() => handleAccept(req.id)}
              >
                Accept →
              </button>
            )}
            {req.status === 'accepted' && (
              <button
                className="btn-secondary"
                style={{ flexShrink: 0, fontSize: '13px', padding: '8px 18px' }}
                onClick={() => openChat(req.id)}
              >
                Open Chat →
              </button>
            )}
            {req.status === 'completed' && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completed</span>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            No requests found for {filterRole}. Be the first to post!
          </div>
        )}
      </div>

      {/* Post Request Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>📝 Post Mock Request</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Your Name</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Level</label>
                  <select className="input" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Topic</label>
                <select className="input" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}>
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Post Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
