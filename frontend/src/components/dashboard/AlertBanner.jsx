import { useEffect, useState } from 'react';

const WARNING_MINUTES = 5;

/**
 * Banner di atas dashboard, list sesi yang sisa waktunya <= 5 menit (atau
 * udah habis). Update tiap detik pake jam browser, gak nunggu polling
 * server. Ini pelengkap visual dari voice announcement — kalau speaker
 * Bluetooth-nya mati/gak kedengeran, kasir masih kelihatan dari sini.
 */
export default function AlertBanner({ sessions }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const urgent = (sessions || [])
    .map((session) => {
      const remainingMs = new Date(session.planned_end_time) - new Date();
      return { session, minutesRemaining: Math.ceil(remainingMs / 60000) };
    })
    .filter((s) => s.minutesRemaining <= WARNING_MINUTES)
    .sort((a, b) => a.minutesRemaining - b.minutesRemaining);

  if (urgent.length === 0) return null;

  return (
    <div className="alert-banner">
      <span className="alert-banner__icon" aria-hidden="true">⏰</span>
      <div className="alert-banner__list">
        {urgent.map(({ session, minutesRemaining }) => (
          <span key={session.id} className="alert-banner__item">
            <strong>{session.unit_name}</strong>{' '}
            {minutesRemaining <= 0 ? 'waktu habis' : `sisa ${minutesRemaining} menit`}
            {session.customer_name ? ` (${session.customer_name})` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
