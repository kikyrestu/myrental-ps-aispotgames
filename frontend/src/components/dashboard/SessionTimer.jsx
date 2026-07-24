import { useEffect, useState } from 'react';

/**
 * Hitung sisa waktu dari planned_end_time. Update tiap detik di browser
 * (murni display, gak nge-hit API) — sumber kebenaran tetap dari polling
 * dashboard tiap beberapa detik. Voice announcement (Fase 2) belum di sini,
 * lihat hooks/useTimerAnnouncement.js waktu itu dibuat.
 */
export default function SessionTimer({ plannedEndTime }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(plannedEndTime) - new Date());

  useEffect(() => {
    const tick = () => setRemainingMs(new Date(plannedEndTime) - new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [plannedEndTime]);

  const isOver = remainingMs <= 0;
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  let urgency = 'normal';
  if (isOver) urgency = 'over';
  else if (minutes < 5) urgency = 'critical';
  else if (minutes < 15) urgency = 'warning';

  return (
    <span className={`session-timer session-timer--${urgency}`}>
      {isOver ? 'Waktu habis' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
    </span>
  );
}
