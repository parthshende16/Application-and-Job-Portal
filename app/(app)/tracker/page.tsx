'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Job, JobStatus, getJobs, addJob, updateJob, deleteJob } from '@/lib/store';

const COLUMNS: { id: JobStatus; label: string; icon: string; color: string }[] = [
  { id: 'applied',   label: 'Applied',   icon: '📝', color: '#7c3aed' },
  { id: 'interview', label: 'Interview', icon: '🎤', color: '#f59e0b' },
  { id: 'offer',     label: 'Offer',     icon: '🎉', color: '#10b981' },
  { id: 'rejected',  label: 'Rejected',  icon: '❌', color: '#ef4444' },
];

const EMPTY_FORM = {
  company: '', role: '', location: '', salary: '', notes: '',
  status: 'applied' as JobStatus,
};

export default function TrackerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('');

  // Always sync state FROM localStorage — single source of truth
  const reload = useCallback(() => setJobs(getJobs()), []);

  useEffect(() => { reload(); }, [reload]);

  /* ── Drag & Drop ──────────────────────────────────────────────── */
  const handleDragEnd = useCallback((result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    // Same column — no status change needed
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as JobStatus;

    // 1. Write to localStorage first
    updateJob(draggableId, { status: newStatus });

    // 2. Re-read from localStorage so React state is always in sync
    //    (confirms the write succeeded — if it failed, card reverts correctly)
    reload();
  }, [reload]);

  /* ── CRUD ─────────────────────────────────────────────────────── */
  const openAddModal = () => { setEditingJob(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setForm({ company: job.company, role: job.role, location: job.location, salary: job.salary, notes: job.notes, status: job.status });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) updateJob(editingJob.id, form);
    else addJob(form);
    setShowModal(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this job?')) return;
    deleteJob(id);
    reload();
  };

  /* ── Helpers ──────────────────────────────────────────────────── */
  const filteredJobs = filter
    ? jobs.filter(j =>
        j.company.toLowerCase().includes(filter.toLowerCase()) ||
        j.role.toLowerCase().includes(filter.toLowerCase()))
    : jobs;

  const getColumnJobs = (status: JobStatus) => filteredJobs.filter(j => j.status === status);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const getDiffColor = (status: JobStatus) => COLUMNS.find(c => c.id === status)?.color || '#7c3aed';

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>📊 Job Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {jobs.length} applications tracked · Drag cards between columns to update status
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            className="input"
            style={{ width: '200px' }}
            placeholder="🔍 Search jobs..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <button className="btn-primary" onClick={openAddModal} id="add-job-btn">+ Add Job</button>
        </div>
      </div>

      {/* Column summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px', flexShrink: 0 }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{
            padding: '10px 14px', background: 'var(--bg-card)',
            borderRadius: '10px', border: `1px solid ${col.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: col.color }}>{col.icon} {col.label}</span>
            <span style={{ background: `${col.color}20`, color: col.color, padding: '2px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
              {getColumnJobs(col.id).length}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px', flex: 1, overflow: 'hidden', minHeight: 0,
        }}>
          {COLUMNS.map(col => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver ? `${col.color}0e` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${snapshot.isDraggingOver ? col.color + '50' : 'var(--bg-border)'}`,
                    borderRadius: '12px',
                    padding: '10px',
                    overflowY: 'auto',
                    transition: 'background 0.15s, border-color 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {/* Empty state */}
                  {getColumnJobs(col.id).length === 0 && !snapshot.isDraggingOver && (
                    <div style={{ textAlign: 'center', paddingTop: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.3 }}>{col.icon}</div>
                      Drop cards here
                    </div>
                  )}

                  {getColumnJobs(col.id).map((job, index) => (
                    <Draggable draggableId={job.id} index={index} key={job.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={{
                            ...dragProvided.draggableProps.style,
                            background: dragSnapshot.isDragging ? '#1a1a2e' : 'var(--bg-card)',
                            border: `1px solid ${dragSnapshot.isDragging ? col.color + '70' : 'var(--bg-border)'}`,
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: dragSnapshot.isDragging ? 'grabbing' : 'grab',
                            boxShadow: dragSnapshot.isDragging
                              ? `0 16px 48px rgba(0,0,0,0.6), 0 0 24px ${col.color}25`
                              : 'none',
                            transition: dragSnapshot.isDragging ? 'none' : 'border-color 0.2s, box-shadow 0.2s',
                            userSelect: 'none',
                          }}
                        >
                          {/* Logo + actions */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: `${col.color}20`, border: `1px solid ${col.color}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', fontWeight: '800', color: col.color, flexShrink: 0,
                            }}>
                              {job.company.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); openEditModal(job); }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.45, padding: '2px 4px', borderRadius: '4px' }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
                              >✏️</button>
                              <button
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); handleDelete(job.id); }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.45, padding: '2px 4px', borderRadius: '4px' }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
                              >🗑️</button>
                            </div>
                          </div>

                          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {job.company}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {job.role}
                          </div>

                          {(job.location || job.salary) && (
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                              {job.location && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '4px' }}>
                                  📍 {job.location}
                                </span>
                              )}
                              {job.salary && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '4px' }}>
                                  💰 {job.salary}
                                </span>
                              )}
                            </div>
                          )}

                          {job.notes && (
                            <div style={{
                              fontSize: '11px', color: 'var(--text-muted)',
                              borderTop: '1px solid var(--bg-border)', paddingTop: '7px', marginTop: '2px',
                              overflow: 'hidden', display: '-webkit-box',
                              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {job.notes}
                            </div>
                          )}

                          <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                            {formatDate(job.date)}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              {editingJob ? '✏️ Edit Job' : '+ Add New Job'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Company *</label>
                  <input className="input" placeholder="Google" value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Role *</label>
                  <input className="input" placeholder="Software Engineer" value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Location</label>
                  <input className="input" placeholder="Bangalore, Remote" value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Salary / CTC</label>
                  <input className="input" placeholder="₹25 LPA" value={form.salary}
                    onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
                </div>
              </div>

              {/* Visual status picker */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {COLUMNS.map(c => (
                    <button key={c.id} type="button"
                      onClick={() => setForm(p => ({ ...p, status: c.id }))}
                      style={{
                        padding: '8px 4px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                        border: `1px solid ${form.status === c.id ? c.color : 'var(--bg-border)'}`,
                        background: form.status === c.id ? `${c.color}20` : 'transparent',
                        color: form.status === c.id ? c.color : 'var(--text-muted)',
                        fontSize: '11px', fontWeight: '600', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '2px' }}>{c.icon}</div>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Notes</label>
                <textarea className="input" placeholder="Referral from Priya, deadline May 15..."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editingJob ? 'Save Changes' : 'Add Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
