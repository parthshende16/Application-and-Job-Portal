'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import companies, { aiGeneratedPool, CompanyQuestion } from '@/data/companies';

const DIFFICULTY_COLORS = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const CATEGORY_ICONS = {
  behavioral: '🤝',
  technical: '💻',
  'system-design': '🏗️',
  culture: '🌱',
};

export default function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const company = companies.find(c => c.id === slug);

  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [showAi, setShowAi] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!company) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
        <h2 style={{ marginBottom: '8px' }}>Company not found</h2>
        <button className="btn-secondary" onClick={() => router.push('/company')}>← Back</button>
      </div>
    );
  }

  const handleGenerateAI = () => {
    setLoadingAi(true);
    // Simulate AI generation with a curated pool
    setTimeout(() => {
      const pool = aiGeneratedPool[company.id] || aiGeneratedPool.startups;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setAiQuestions(shuffled.slice(0, 5));
      setShowAi(true);
      setLoadingAi(false);
    }, 1500);
  };

  const categories = ['all', ...Array.from(new Set(company.questions.map(q => q.category)))];
  const filteredQuestions = filter === 'all'
    ? company.questions
    : company.questions.filter(q => q.category === filter);

  return (
    <div style={{ padding: '32px', maxWidth: '860px', animation: 'fadeInUp 0.4s ease' }}>
      {/* Back button */}
      <button className="btn-ghost" onClick={() => router.push('/company')} style={{ marginBottom: '20px' }}>
        ← All Companies
      </button>

      {/* Company header */}
      <div className="card gradient-border" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '60px', height: '60px',
            borderRadius: '16px',
            background: `${company.color}20`,
            border: `2px solid ${company.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
          }}>
            {company.logo}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>{company.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{company.tagline}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>🌍 Culture</div>
            <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{company.culture}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>🎤 Interview Style</div>
            <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{company.interviewStyle}</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="tab-bar" style={{ marginBottom: '20px', flexWrap: 'wrap', height: 'auto' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat === 'all' ? '📋 All' : `${CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] || '📌'} ${cat}`}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
          {filteredQuestions.length} Curated Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredQuestions.map((q, i) => (
            <div
              key={q.id}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${expandedId === q.id ? company.color + '40' : 'var(--bg-border)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '14px 16px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>
                  {CATEGORY_ICONS[q.category as keyof typeof CATEGORY_ICONS]}
                </span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', lineHeight: 1.4 }}>
                  {q.text}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    padding: '2px 8px', borderRadius: '100px',
                    background: `${DIFFICULTY_COLORS[q.difficulty]}20`,
                    color: DIFFICULTY_COLORS[q.difficulty],
                    border: `1px solid ${DIFFICULTY_COLORS[q.difficulty]}40`,
                  }}>
                    {q.difficulty}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px', transition: 'transform 0.2s', transform: expandedId === q.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    ›
                  </span>
                </div>
              </button>

              {expandedId === q.id && q.tip && (
                <div style={{
                  padding: '0 16px 14px 46px',
                  borderTop: '1px solid var(--bg-border)',
                  paddingTop: '14px',
                  marginTop: '-1px',
                }}>
                  <div style={{
                    background: `${company.color}10`,
                    border: `1px solid ${company.color}25`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: company.color, fontWeight: '600' }}>💡 Tip: </span>
                    {q.tip}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Questions Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '14px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showAi && aiQuestions.length > 0 ? '16px' : '0' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '3px' }}>
              ✨ AI-Generated Questions
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Get 5 additional curated questions specific to {company.name}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerateAI}
            disabled={loadingAi}
            style={{ flexShrink: 0, opacity: loadingAi ? 0.7 : 1 }}
            id="generate-ai-questions-btn"
          >
            {loadingAi ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                Generating...
              </span>
            ) : showAi ? '🔄 Regenerate' : '✨ Generate Questions'}
          </button>
        </div>

        {showAi && aiQuestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeInUp 0.3s ease' }}>
            {aiQuestions.map((q, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                borderLeft: '2px solid rgba(124,58,237,0.5)',
                lineHeight: 1.5,
                animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', marginRight: '8px' }}>{i + 1}.</span>
                {q}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
