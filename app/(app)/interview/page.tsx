'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  InterviewRole, InterviewState, Message,
  createInterview, processUserAnswer, getFirstQuestion
} from '@/lib/ai-mock';
import { saveInterviewSession, getInterviewSessions, InterviewSession } from '@/lib/store';

const ROLES: { id: InterviewRole; icon: string; desc: string }[] = [
  { id: 'SDE', icon: '💻', desc: 'Software Development Engineer' },
  { id: 'PM', icon: '📋', desc: 'Product Manager' },
  { id: 'Data Science', icon: '📊', desc: 'Data Scientist / ML Engineer' },
  { id: 'HR', icon: '🤝', desc: 'HR / Behavioral Round' },
  { id: 'DevOps', icon: '⚙️', desc: 'DevOps / SRE' },
];

// Simple markdown renderer without external dep
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i} style={{ display: 'block', marginBottom: '4px' }}>{line.slice(2, -2)}</strong>;
        }
        if (line.startsWith('---')) {
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--bg-border)', margin: '12px 0' }} />;
        }
        // Inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i} style={{ display: 'block', marginBottom: line === '' ? '8px' : '0' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function InterviewPage() {
  const [view, setView] = useState<'select' | 'chat' | 'history'>('select');
  const [selectedRole, setSelectedRole] = useState<InterviewRole>('SDE');
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessions(getInterviewSessions());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewState?.messages]);

  const startInterview = () => {
    const state = createInterview(selectedRole);
    // Immediately add the first question
    const firstQ = getFirstQuestion(state);
    const stateWithQ: InterviewState = {
      ...state,
      messages: [
        ...state.messages,
        { role: 'ai', content: firstQ, timestamp: new Date() },
      ],
    };
    setInterviewState(stateWithQ);
    setView('chat');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !interviewState || interviewState.isComplete) return;
    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay (0.8–1.5s)
    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      const { updatedState } = processUserAnswer(interviewState, userText);
      setInterviewState(updatedState);
      setIsTyping(false);

      // Auto-save session
      const sessionData: InterviewSession = {
        id: updatedState.messages[0]?.content.slice(0, 10) + Date.now(),
        role: updatedState.role,
        date: new Date().toISOString(),
        messages: updatedState.messages.map(m => ({ role: m.role, content: m.content })),
      };
      saveInterviewSession(sessionData);
      setSessions(getInterviewSessions());
    }, delay);
  }, [input, interviewState]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === 'history') {
    return (
      <div style={{ padding: '32px', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button className="btn-ghost" onClick={() => setView('select')}>← Back</button>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>🎤 Interview History</h1>
        </div>
        {sessions.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            No sessions yet. Start your first interview!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(s => (
              <div key={s.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {ROLES.find(r => r.id === s.role)?.icon} {s.role} Interview
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {s.messages.length} messages
                  </div>
                </div>
                <span className="badge badge-violet">{Math.floor(s.messages.length / 2)} Q&A</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'chat' && interviewState) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
        {/* Chat header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setView('select')}>← Exit</button>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>
                {ROLES.find(r => r.id === interviewState.role)?.icon} {interviewState.role} Interview
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Question {Math.min(interviewState.currentQuestionIndex + 1, interviewState.questions.length)} of {interviewState.questions.length}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px' }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${(interviewState.currentQuestionIndex / interviewState.questions.length) * 100}%`
                }} />
              </div>
            </div>
            {interviewState.isComplete && (
              <span className="badge badge-green">✓ Complete</span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {interviewState.messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fadeInUp 0.3s ease',
              }}>
                {msg.role === 'ai' && (
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', marginRight: '10px', flexShrink: 0, alignSelf: 'flex-start',
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                    : 'var(--bg-card)',
                  border: msg.role === 'ai' ? '1px solid var(--bg-border)' : 'none',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                }}>
                  <SimpleMarkdown text={msg.content} />
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', marginLeft: '10px', flexShrink: 0, alignSelf: 'flex-start',
                  }}>👤</div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>🤖</div>
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        {!interviewState.isComplete && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--bg-border)',
            background: 'var(--bg-card)',
            flexShrink: 0,
          }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                className="input"
                style={{ resize: 'none', minHeight: '48px', maxHeight: '160px', flex: 1, paddingTop: '13px' }}
                placeholder="Type your answer... (Shift+Enter for new line, Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
              />
              <button
                className="btn-primary"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                style={{ flexShrink: 0, opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
              >
                Send
              </button>
            </div>
            <div style={{ maxWidth: '720px', margin: '6px auto 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              Tip: Write detailed answers for better feedback. Aim for 3+ sentences per response.
            </div>
          </div>
        )}

        {interviewState.isComplete && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--bg-border)',
            background: 'var(--bg-card)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            <button className="btn-secondary" onClick={() => setView('select')}>← New Interview</button>
            <button className="btn-primary" onClick={() => setView('history')}>View History</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>🎤 AI Interview Practice</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Role-specific questions with real-time AI feedback. No API key needed.
        </p>
      </div>

      {/* Role selector */}
      <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.4s ease 0.05s both' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-secondary)' }}>
          1. Choose your interview role
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              style={{
                padding: '14px 16px',
                background: selectedRole === r.id ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                border: `1px solid ${selectedRole === r.id ? 'rgba(124,58,237,0.5)' : 'var(--bg-border)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '22px' }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: selectedRole === r.id ? '#a78bfa' : 'var(--text-primary)' }}>{r.id}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.desc}</div>
              </div>
              {selectedRole === r.id && (
                <span style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: '16px' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* What to expect */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>What to expect in this session</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: '❓', text: '5–6 carefully curated questions' },
            { icon: '⚡', text: 'Instant AI feedback on each answer' },
            { icon: '🎯', text: 'Role-specific: technical + behavioral' },
            { icon: '💾', text: 'Sessions saved to your history' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', animation: 'fadeInUp 0.4s ease 0.15s both' }}>
        <button className="btn-primary" style={{ flex: 2 }} onClick={startInterview} id="start-interview-btn">
          🚀 Start {selectedRole} Interview
        </button>
        <button className="btn-secondary" onClick={() => setView('history')}>
          📋 History ({sessions.length})
        </button>
      </div>
    </div>
  );
}
