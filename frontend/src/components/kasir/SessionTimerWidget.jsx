import { useSessionTimer } from '../../hooks/useSessionTimer';

export default function SessionTimerWidget({ session, compact = false }) {
  const { timeLeft, progress, isOver } = useSessionTimer(session.start_time, session.planned_end_time);

  if (compact) {
    return (
      <div style={{ marginTop: '4px', fontSize: '11px', color: isOver ? 'var(--critical)' : 'var(--accent)', fontWeight: 600 }}>
        {timeLeft}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sisa Waktu:</span>
        <strong style={{ fontSize: '14px', color: isOver ? 'var(--critical)' : 'var(--accent)' }}>
          {timeLeft}
        </strong>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: isOver ? 'var(--critical)' : 'var(--accent)',
            transition: 'width 1s linear'
          }} 
        />
      </div>
    </div>
  );
}
