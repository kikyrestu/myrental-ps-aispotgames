import { useState, useEffect } from 'react';

export function useSessionTimer(startTimeStr, plannedEndTimeStr) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!startTimeStr || !plannedEndTimeStr) return;

    // Pastikan zona waktu konsisten (backend ngirim UTC+7)
    const startStr = startTimeStr.includes('+') ? startTimeStr : startTimeStr + '+07:00';
    const endStr = plannedEndTimeStr.includes('+') ? plannedEndTimeStr : plannedEndTimeStr + '+07:00';

    const startTime = new Date(startStr.replace(' ', 'T')).getTime();
    const endTime = new Date(endStr.replace(' ', 'T')).getTime();
    const totalDuration = endTime - startTime;

    const calculate = () => {
      const now = new Date().getTime();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        setIsOver(true);
        setTimeLeft('WAKTU HABIS');
        setProgress(100);
      } else {
        setIsOver(false);
        const elapsed = now - startTime;
        let p = (elapsed / totalDuration) * 100;
        if (p < 0) p = 0;
        if (p > 100) p = 100;
        setProgress(p);

        // Format waktu: HH:MM:SS
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }
    };

    calculate(); // first run
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [startTimeStr, plannedEndTimeStr]);

  return { timeLeft, progress, isOver };
}
