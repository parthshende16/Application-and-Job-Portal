'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import companies from '@/data/companies';

export default function CompanyPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>🏢 Company Prep</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Curated interview questions, culture insights, and prep tips for top companies.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          className="input"
          style={{ maxWidth: '320px' }}
          placeholder="🔍 Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        animation: 'fadeInUp 0.4s ease 0.1s both',
      }}>
        {filtered.map((company, i) => (
          <button
            key={company.id}
            id={`company-${company.id}`}
            onClick={() => router.push(`/company/${company.id}`)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              animation: `fadeInUp 0.4s ease ${0.05 + i * 0.05}s both`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = company.color + '50';
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--bg-border)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = 'none';
            }}
          >
            {/* Company header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', width: '100%' }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: `${company.color}20`,
                border: `1px solid ${company.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                {company.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{company.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{company.tagline}</div>
              </div>
            </div>

            {/* Interview style */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px',
              width: '100%',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Interview Style</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{company.interviewStyle}</div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '100px',
                background: `${company.color}18`,
                color: company.color,
                border: `1px solid ${company.color}30`,
                fontWeight: '600',
              }}>
                {company.questions.length} Questions
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>View prep →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
