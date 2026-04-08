'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewRole } from '@/lib/ai-mock';
import { saveInterviewSession } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'lobby' | 'setup' | 'interview' | 'results';

interface QA {
  question: string;
  answer: string;
  duration: number;
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES: { id: InterviewRole; icon: string; label: string; color: string }[] = [
  { id: 'SDE', icon: '💻', label: 'Software Engineer', color: '#06b6d4' },
  { id: 'PM', icon: '📋', label: 'Product Manager', color: '#f59e0b' },
  { id: 'Data Science', icon: '📊', label: 'Data Science / ML', color: '#10b981' },
  { id: 'HR', icon: '🤝', label: 'HR / Behavioral', color: '#ec4899' },
  { id: 'DevOps', icon: '⚙️', label: 'DevOps / SRE', color: '#a78bfa' },
];

const QUESTIONS: Record<InterviewRole, string[]> = {
  SDE: [
    'Tell me about yourself and your software engineering background.',
    'Walk me through how you would design a URL shortener like bit.ly.',
    'Explain the difference between a stack and a queue, and give a real-world use case for each.',
    'Describe a challenging bug you debugged. How did you identify and fix it?',
    'How do you ensure code quality in a fast-moving team? What practices do you follow?',
  ],
  PM: [
    'Tell me about yourself and what draws you to product management.',
    'How would you prioritize features when you have limited engineering resources?',
    'Walk me through how you would launch a new feature for a 10 million user app.',
    'Describe a product you love and one thing you would improve about it.',
    'How do you handle disagreement between engineering and design teams?',
  ],
  'Data Science': [
    'Tell me about yourself and your experience in data science or machine learning.',
    'Explain overfitting and how you would prevent it in a production model.',
    'How would you approach building a recommendation system from scratch?',
    'Describe a time when your data analysis changed a business decision.',
    'What is the difference between precision and recall? When would you optimize for each?',
  ],
  HR: [
    'Tell me about yourself and your professional journey.',
    'Describe a situation where you had to resolve a conflict within your team.',
    'Tell me about a time you failed. What did you learn from it?',
    'How do you prioritize when you have multiple deadlines at the same time?',
    'Where do you see yourself in five years, and how does this role fit that path?',
  ],
  DevOps: [
    'Tell me about yourself and your DevOps or SRE experience.',
    'Walk me through how you would set up a CI/CD pipeline for a microservices application.',
    'How would you handle a production outage with no immediate root cause?',
    'Explain the concept of infrastructure as code and its benefits.',
    'How do you balance reliability targets with rapid feature deployment?',
  ],
};

const ANSWER_TIME = 90;

// ─── Helpers ──────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.92;
  utter.pitch = 1.05;
  utter.volume = 1;
  // Wait for voices to load (Chrome lazy-loads them)
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
    if (preferred) utter.voice = preferred;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = trySpeak;
  } else {
    trySpeak();
  }
}

function scoreAnswer(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words < 5) return Math.floor(Math.random() * 30) + 20;
  if (words < 20) return Math.floor(Math.random() * 20) + 45;
  if (words < 60) return Math.floor(Math.random() * 20) + 60;
  return Math.floor(Math.random() * 15) + 75;
}

// ─── Waveform ─────────────────────────────────────────────────────────────────

function Waveform({ active }: { active: boolean }) {
  return (
    <div className={`waveform ${active ? 'waveform-active' : ''}`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.09}s` }} />
      ))}
    </div>
  );
}

// ─── Timer Ring ───────────────────────────────────────────────────────────────

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const color = seconds > total * 0.5 ? '#10b981' : seconds > total * 0.2 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
        <circle
          cx={36} cy={36} r={r}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', fontWeight: '700', color,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {seconds}
      </div>
    </div>
  );
}

// ─── End Interview Confirmation Modal ─────────────────────────────────────────

function EndConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(8,8,16,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '18px', padding: '32px',
        maxWidth: '420px', width: '90%',
        animation: 'fadeInUp 0.25s ease',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '44px', marginBottom: '16px' }}>🛑</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>End Interview Early?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          You have answered <strong>some questions</strong> so far. Ending now will generate a partial results report with your answers so far.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'transparent', border: '1px solid var(--bg-border)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            }}
          >
            ← Continue Interview
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
            }}
          >
            End & See Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VideoInterviewPage() {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [role, setRole] = useState<InterviewRole>('SDE');
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME);
  const [transcript, setTranscript] = useState('');
  const [liveText, setLiveText] = useState('');
  const [qaHistory, setQaHistory] = useState<QA[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [camError, setCamError] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [setupPreviewReady, setSetupPreviewReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  // Separate ref for the setup preview video
  const setupVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const transcriptRef = useRef('');
  // KEY FIX: track whether recognition should keep running
  const shouldListenRef = useRef(false);
  const currentQIndexRef = useRef(0);

  const questions = QUESTIONS[role];

  // ─── FIX 1: Attach stream to video element after phase transition ─────────────
  useEffect(() => {
    if (phase === 'interview' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // ─── Camera Setup ─────────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      // Show live preview on setup screen too
      if (setupVideoRef.current) {
        setupVideoRef.current.srcObject = stream;
        setupVideoRef.current.play().catch(() => {});
      }
      setSetupPreviewReady(true);
    } catch {
      setCamError('Camera or microphone access denied. Please allow permissions in your browser and try again.');
    }
  }, []);

  const proceedToInterview = useCallback(() => {
    setPhase('interview');
  }, []);

  const stopStream = useCallback(() => {
    shouldListenRef.current = false;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ─── FIX 2: Robust Speech Recognition with auto-restart ──────────────────────

  const startRecognition = useCallback(() => {
    const SR = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SR) return;

    shouldListenRef.current = true;

    const createRec = () => {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3; // Consider more alternatives for better accuracy
      rec.lang = 'en-US';

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let interim = '';
        let final = transcriptRef.current;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          // Use best alternative
          const best = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += (final ? ' ' : '') + best.trim();
          } else {
            interim += best;
          }
        }
        transcriptRef.current = final;
        setTranscript(final);
        setLiveText(interim);
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        // 'no-speech' and 'aborted' are benign — just restart
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        if (e.error === 'not-allowed') {
          shouldListenRef.current = false;
          setIsListening(false);
        }
      };

      // AUTO-RESTART: whenever recognition ends (Chrome stops after silence/timeout),
      // immediately restart it so we never miss speech
      rec.onend = () => {
        setIsListening(false);
        if (shouldListenRef.current) {
          // Small delay to avoid rapid restart loop
          setTimeout(() => {
            if (shouldListenRef.current) {
              try {
                const newRec = createRec();
                recognitionRef.current = newRec;
                newRec.start();
                setIsListening(true);
              } catch { /* ignore */ }
            }
          }, 150);
        }
      };

      return rec;
    };

    try {
      recognitionRef.current?.abort();
    } catch { /* ignore */ }

    const rec = createRec();
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch { /* ignore */ }
  }, []);

  const stopRecognition = useCallback(() => {
    shouldListenRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch { /* ignore */ }
    recognitionRef.current = null;
    setIsListening(false);
    setLiveText('');
  }, []);

  // ─── Question Flow ────────────────────────────────────────────────────────────

  const submitAnswer = useCallback((idx: number, partial = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopRecognition();

    const answer = transcriptRef.current.trim() || '(No spoken answer recorded)';
    const duration = elapsedRef.current;

    setQaHistory(prev => {
      const updated = [...prev, { question: questions[idx], answer, duration }];
      const nextIdx = idx + 1;

      if (!partial && nextIdx < questions.length) {
        setTimeout(() => askQuestion(nextIdx), 1200); // eslint-disable-line
      } else {
        // Done (either finished all questions or ended early)
        setTimeout(() => {
          window.speechSynthesis.cancel();
          stopStream();
          const msgs = updated.flatMap(qa => [
            { role: 'ai' as const, content: qa.question },
            { role: 'user' as const, content: qa.answer },
          ]);
          saveInterviewSession({
            id: `video-${Date.now()}`,
            role,
            date: new Date().toISOString(),
            messages: msgs,
          });
          setPhase('results');
        }, 600);
      }
      return updated;
    });
  }, [questions, stopRecognition, stopStream, role]); // eslint-disable-line

  const askQuestion = useCallback((idx: number) => {
    currentQIndexRef.current = idx;
    setQIndex(idx);
    setTimeLeft(ANSWER_TIME);
    setTranscript('');
    setLiveText('');
    transcriptRef.current = '';
    elapsedRef.current = 0;
    setIsSpeaking(true);
    stopRecognition();

    speak(questions[idx], () => {
      setIsSpeaking(false);
      startRecognition();
      if (timerRef.current) clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - startTime) / 1000);
        elapsedRef.current = sec;
        const remaining = ANSWER_TIME - sec;
        setTimeLeft(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          submitAnswer(currentQIndexRef.current);
        }
      }, 500);
    });
  }, [questions, startRecognition, stopRecognition, submitAnswer]);

  // End interview early — save partial results
  const endEarly = useCallback(() => {
    setShowEndModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    stopRecognition();

    // Save what we have so far, then go to results
    const answer = transcriptRef.current.trim() || '(No answer recorded)';
    const duration = elapsedRef.current;
    setQaHistory(prev => {
      const updated = [...prev, { question: questions[currentQIndexRef.current], answer, duration }];
      setTimeout(() => {
        stopStream();
        const msgs = updated.flatMap(qa => [
          { role: 'ai' as const, content: qa.question },
          { role: 'user' as const, content: qa.answer },
        ]);
        saveInterviewSession({
          id: `video-${Date.now()}`,
          role,
          date: new Date().toISOString(),
          messages: msgs,
        });
        setPhase('results');
      }, 300);
      return updated;
    });
  }, [questions, stopRecognition, stopStream, role]);

  const toggleMic = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(m => !m);
  };

  const toggleCam = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(t => { t.enabled = !camOn; });
    setCamOn(c => !c);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      shouldListenRef.current = false;
      stopRecognition();
      stopStream();
      window.speechSynthesis?.cancel();
    };
  }, [stopRecognition, stopStream]);

  // Start interview after phase becomes 'interview'
  useEffect(() => {
    if (phase === 'interview') {
      setTimeout(() => {
        speak(
          `Welcome to your ${ROLES.find(r => r.id === role)?.label} interview. I will ask you ${questions.length} questions. Please speak your answers clearly after you hear each question. Let's begin.`,
          () => askQuestion(0)
        );
      }, 800);
    }
  }, [phase]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  // LOBBY
  if (phase === 'lobby') {
    const roleData = ROLES.find(r => r.id === role)!;
    return (
      <div style={{ padding: '32px', maxWidth: '860px' }}>
        <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}>🎥</div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Video Interview</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
                Real-time AI interviewer · Camera · Live transcription
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px', animation: 'fadeInUp 0.4s ease 0.05s both' }}>
          {[
            { icon: '🎥', text: 'Live Camera Feed' },
            { icon: '🔊', text: 'AI Voice Questions' },
            { icon: '🎙️', text: 'Speech Transcription' },
            { icon: '⏱️', text: '90s Per Question' },
            { icon: '📊', text: 'Performance Score' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '100px',
              fontSize: '13px', color: 'var(--text-secondary)',
            }}>
              <span>{f.icon}</span> {f.text}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Select your interview role
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  padding: '16px 18px',
                  background: role === r.id ? `${r.color}1a` : 'var(--bg-card)',
                  border: `1px solid ${role === r.id ? r.color + '60' : 'var(--bg-border)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '24px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: role === r.id ? r.color : 'var(--text-primary)' }}>
                    {r.id}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.label}</div>
                </div>
                {role === r.id && <span style={{ marginLeft: 'auto', fontSize: '16px' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: '28px', animation: 'fadeInUp 0.4s ease 0.15s both' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>
            {roleData.icon} {roleData.label} — What to expect
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '20px' }}>{i + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            ⏱ {questions.length} questions · {Math.round(ANSWER_TIME * questions.length / 60)} min max · AI reads each question aloud
          </div>
        </div>

        <div style={{ animation: 'fadeInUp 0.4s ease 0.2s both' }}>
          <button
            className="btn-primary"
            onClick={() => setPhase('setup')}
            style={{ fontSize: '15px', padding: '14px 36px' }}
            id="start-video-interview-btn"
          >
            🎥 Start Video Interview →
          </button>
          <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Camera and microphone access will be requested on the next screen.
          </p>
        </div>
      </div>
    );
  }

  // ─── SETUP — with live camera preview ──────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px',
      }}>
        <div style={{ maxWidth: '640px', width: '100%', animation: 'fadeInUp 0.4s ease' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', textAlign: 'center' }}>
              🎥 Camera & Microphone Check
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center' }}>
              Allow access so your face appears live during the interview.
            </p>

            {/* Live preview box */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              background: '#050509',
              borderRadius: '14px',
              overflow: 'hidden',
              border: setupPreviewReady
                ? '2px solid rgba(16,185,129,0.5)'
                : '2px solid var(--bg-border)',
              marginBottom: '20px',
              transition: 'border-color 0.3s',
            }}>
              <video
                ref={setupVideoRef}
                autoPlay playsInline muted
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: 'scaleX(-1)',
                  opacity: setupPreviewReady ? 1 : 0,
                  transition: 'opacity 0.4s',
                }}
              />

              {/* Placeholder when no preview yet */}
              {!setupPreviewReady && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '14px', color: 'var(--text-muted)',
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(124,58,237,0.12)', border: '2px dashed rgba(124,58,237,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                  }}>📷</div>
                  <span style={{ fontSize: '13px' }}>Your camera preview will appear here</span>
                </div>
              )}

              {/* Ready badge */}
              {setupPreviewReady && (
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 10px', borderRadius: '100px',
                  background: 'rgba(16,185,129,0.85)', backdropFilter: 'blur(4px)',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', animation: 'pulse-dot 1s ease infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>CAMERA READY</span>
                </div>
              )}
            </div>

            {camError && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', color: '#fca5a5', fontSize: '13px',
                marginBottom: '16px',
              }}>
                ⚠️ {camError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!setupPreviewReady ? (
                <button className="btn-primary" onClick={startCamera} style={{ fontSize: '15px', padding: '14px' }}>
                  Allow Camera & Microphone →
                </button>
              ) : (
                <button className="btn-primary" onClick={proceedToInterview} style={{ fontSize: '15px', padding: '14px' }}>
                  ✅ Looking Good — Start Interview →
                </button>
              )}
              <button className="btn-ghost" onClick={() => {
                stopStream();
                setSetupPreviewReady(false);
                setPhase('lobby');
              }}>← Go Back</button>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                '🔒 Camera is only active during the interview session',
                '🎙 Microphone used for live speech transcription only',
                '📵 Nothing is recorded or sent to any server',
              ].map(t => (
                <div key={t} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === 'results') {
    const scores = qaHistory.map(qa => scoreAnswer(qa.answer));
    const overall = qaHistory.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const totalTime = qaHistory.reduce((a, b) => a + b.duration, 0);

    const getGrade = (s: number) => {
      if (s >= 85) return { label: 'Excellent', color: '#10b981' };
      if (s >= 70) return { label: 'Good', color: '#06b6d4' };
      if (s >= 55) return { label: 'Average', color: '#f59e0b' };
      return { label: 'Needs Work', color: '#ef4444' };
    };
    const grade = getGrade(overall);

    const downloadTranscript = () => {
      const lines = [`Video Interview Transcript — ${role} Role`, `Date: ${new Date().toLocaleString()}`, ''];
      qaHistory.forEach((qa, i) => {
        lines.push(`Q${i + 1}: ${qa.question}`);
        lines.push(`Answer: ${qa.answer}`);
        lines.push(`(Duration: ${qa.duration}s, Score: ${scores[i]}/100)`);
        lines.push('');
      });
      lines.push(`Overall Score: ${overall}/100 — ${grade.label}`);
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `interview-${role}-${Date.now()}.txt`; a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div style={{ padding: '32px', maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${grade.color}30, ${grade.color}15)`,
            border: `3px solid ${grade.color}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 20px',
          }}>🏆</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
            {qaHistory.length === questions.length ? 'Interview Complete!' : 'Interview Ended Early'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {role} Role · {qaHistory.length}/{questions.length} Questions · {Math.floor(totalTime / 60)}m {totalTime % 60}s
          </p>
        </div>

        <div className="card" style={{
          padding: '28px', marginBottom: '24px',
          background: `linear-gradient(135deg, ${grade.color}08, transparent)`,
          border: `1px solid ${grade.color}30`,
          animation: 'fadeInUp 0.4s ease 0.05s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Score</div>
              <div style={{ fontSize: '56px', fontWeight: '800', color: grade.color, lineHeight: 1 }}>{overall}</div>
              <div style={{ fontSize: '14px', color: grade.color, fontWeight: '600', marginTop: '4px' }}>{grade.label}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              {scores.map((s, i) => {
                const g = getGrade(s);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Q{i + 1}</span>
                    <div style={{ width: '100px', height: '6px', background: 'var(--bg-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s}%`, height: '100%', background: g.color, borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: g.color, fontWeight: '600', minWidth: '32px' }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>📝 Answer Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {qaHistory.map((qa, i) => {
              const s = scores[i];
              const g = getGrade(s);
              const wordCount = qa.answer.split(/\s+/).filter(Boolean).length;
              return (
                <div key={i} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', flex: 1 }}>
                      Q{i + 1}: {qa.question}
                    </div>
                    <div style={{
                      padding: '3px 10px', borderRadius: '100px',
                      background: `${g.color}18`, color: g.color,
                      border: `1px solid ${g.color}40`,
                      fontSize: '12px', fontWeight: '700', flexShrink: 0,
                    }}>{s}/100</div>
                  </div>
                  <div style={{
                    fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7,
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    border: '1px solid var(--bg-border)',
                    minHeight: '48px',
                  }}>
                    {qa.answer && qa.answer !== '(No spoken answer recorded)' && qa.answer !== '(No answer recorded)'
                      ? qa.answer
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No answer transcribed — microphone may not have been active</span>
                    }
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>⏱ {qa.duration}s / {ANSWER_TIME}s</span>
                    <span>💬 ~{wordCount} words spoken</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', animation: 'fadeInUp 0.4s ease 0.15s both' }}>
          <button className="btn-primary" onClick={downloadTranscript} style={{ flex: 1 }}>
            ⬇️ Download Full Transcript
          </button>
          <button className="btn-secondary" onClick={() => {
            setPhase('lobby');
            setQaHistory([]);
            setQIndex(0);
          }}>
            🔄 New Interview
          </button>
        </div>
      </div>
    );
  }

  // ─── INTERVIEW ROOM ────────────────────────────────────────────────────────────

  const progress = (qIndex / questions.length) * 100;
  const roleData = ROLES.find(r => r.id === role)!;
  const wordCount = (transcript + ' ' + liveText).trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-base)', overflow: 'hidden',
    }}>
      {/* End interview confirmation modal */}
      {showEndModal && (
        <EndConfirmModal
          onConfirm={endEarly}
          onCancel={() => setShowEndModal(false)}
        />
      )}

      {/* Top bar */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--bg-border)',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center', gap: '16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>
            {roleData.icon} {roleData.id} Interview
          </span>
          <div style={{ flex: 1, maxWidth: '200px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Q{Math.min(qIndex + 1, questions.length)}/{questions.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSpeaking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', animation: 'pulse-dot 1s ease infinite' }} />
              <span style={{ fontSize: '12px', color: '#a78bfa' }}>AI Speaking</span>
            </div>
          )}
          {isListening && !isSpeaking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 1s ease infinite' }} />
              <span style={{ fontSize: '12px', color: '#6ee7b7' }}>Listening</span>
            </div>
          )}
        </div>

        {/* End Interview button — now clearly visible */}
        <button
          onClick={() => setShowEndModal(true)}
          style={{
            padding: '7px 16px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#fca5a5',
            fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.22)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
          }}
        >
          🛑 End Interview
        </button>
      </div>

      {/* Main panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Camera feed */}
        <div style={{
          width: '42%', borderRight: '1px solid var(--bg-border)',
          display: 'flex', flexDirection: 'column',
          background: '#050509', position: 'relative',
        }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transform: 'scaleX(-1)',
                opacity: camOn ? 1 : 0,
              }}
            />
            {!camOn && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', gap: '12px',
              }}>
                <div style={{ fontSize: '48px' }}>📷</div>
                <span style={{ fontSize: '14px' }}>Camera Off</span>
              </div>
            )}

            {/* LIVE indicator */}
            {isListening && (
              <div style={{
                position: 'absolute', top: '14px', left: '14px',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '100px',
                background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(4px)',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', animation: 'pulse-dot 1s ease infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>LIVE</span>
              </div>
            )}

            {/* Name tag */}
            <div style={{
              position: 'absolute', bottom: '14px', left: '14px',
              padding: '4px 12px', borderRadius: '6px',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              fontSize: '12px', fontWeight: '600', color: 'white',
            }}>Your Camera</div>
          </div>

          {/* Controls */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--bg-border)',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <button onClick={toggleMic} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
              background: micOn ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: micOn ? '#6ee7b7' : '#fca5a5',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
            }}>
              {micOn ? '🎙️ Mic On' : '🔇 Mic Off'}
            </button>
            <button onClick={toggleCam} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
              background: camOn ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)',
              color: camOn ? '#67e8f9' : '#fca5a5',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
            }}>
              {camOn ? '🎥 Cam On' : '📷 Cam Off'}
            </button>
          </div>
        </div>

        {/* Right: AI + Transcript */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* AI Question panel */}
          <div style={{
            padding: '22px 24px', borderBottom: '1px solid var(--bg-border)',
            background: 'var(--bg-card)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* AI Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: isSpeaking
                    ? '0 0 0 3px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.4)'
                    : '0 4px 16px rgba(124,58,237,0.3)',
                  transition: 'box-shadow 0.3s',
                  animation: isSpeaking ? 'ai-avatar-pulse 1s ease infinite' : 'none',
                }}>🤖</div>
                {isSpeaking && (
                  <div style={{
                    position: 'absolute', inset: '-4px', borderRadius: '50%',
                    border: '2px solid rgba(124,58,237,0.6)',
                    animation: 'ring-expand 1.2s ease infinite',
                  }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AI Interviewer · Q{qIndex + 1} of {questions.length}
                  </div>
                  {!isSpeaking && <TimerRing seconds={timeLeft} total={ANSWER_TIME} />}
                </div>

                <div style={{
                  fontSize: '15px', fontWeight: '600', lineHeight: 1.65,
                  color: 'var(--text-primary)',
                  padding: '14px 16px',
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '12px', borderLeft: '3px solid #7c3aed',
                }}>
                  {isSpeaking
                    ? <span style={{ color: 'var(--text-secondary)' }}>🔊 AI is reading the question aloud...</span>
                    : questions[qIndex]
                  }
                </div>

                {!isSpeaking && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: isListening ? '#6ee7b7' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {isListening ? (
                        <><Waveform active={true} /> Listening — speak now</>
                      ) : (
                        '💬 Answer transcription ready'
                      )}
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '7px 16px' }}
                      onClick={() => submitAnswer(currentQIndexRef.current)}
                    >
                      {qIndex < questions.length - 1 ? 'Next Question →' : 'Finish Interview ✓'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isSpeaking && (
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
                <Waveform active={true} />
              </div>
            )}
          </div>

          {/* Live Transcript panel */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📝 Live Transcript
                {isListening && <Waveform active={true} />}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ~{wordCount} word{wordCount !== 1 ? 's' : ''} spoken
              </span>
            </div>

            {/* Transcript box — bigger and more prominent */}
            <div style={{
              flex: 1,
              minHeight: '140px',
              padding: '16px 18px',
              background: 'var(--bg-card)',
              border: isListening
                ? '1px solid rgba(16,185,129,0.4)'
                : '1px solid var(--bg-border)',
              borderRadius: '14px',
              fontSize: '15px',
              lineHeight: 1.8,
              transition: 'border-color 0.3s',
              position: 'relative',
            }}>
              {/* Green glow when actively capturing */}
              {isListening && (
                <div style={{
                  position: 'absolute', top: '12px', right: '14px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 1s ease infinite' }} />
                  <span style={{ fontSize: '10px', color: '#6ee7b7', fontWeight: '600' }}>CAPTURING</span>
                </div>
              )}

              {transcript && (
                <span style={{ color: 'var(--text-primary)' }}>{transcript}</span>
              )}
              {liveText && (
                <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>
                  {transcript ? ' ' : ''}{liveText}
                  <span style={{ display: 'inline-block', width: '2px', height: '16px', background: '#a78bfa', marginLeft: '2px', verticalAlign: 'middle', animation: 'typing 1.2s ease infinite' }} />
                </span>
              )}
              {!transcript && !liveText && !isSpeaking && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                  {isListening
                    ? 'Start speaking — your words will appear here in real time...'
                    : 'Waiting for the AI to finish asking the question...'
                  }
                </span>
              )}
              {!transcript && !liveText && isSpeaking && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                  Listen to the question, then speak your answer when you see the green "Listening" indicator.
                </span>
              )}
            </div>

            {/* Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[
                { icon: '💡', text: 'Use the STAR method: Situation → Task → Action → Result' },
                { icon: '🎯', text: 'Aim for 45–90 seconds per answer — more detail = higher score' },
                { icon: '⏩', text: 'Click "Next Question" or "Finish" early if you\'re done answering' },
              ].map(tip => (
                <div key={tip.text} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{tip.icon}</span><span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
