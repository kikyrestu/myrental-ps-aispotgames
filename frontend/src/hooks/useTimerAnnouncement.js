import { useEffect, useRef } from 'react';

const THRESHOLDS = [15, 10, 5, 1];

/**
 * Voice announcement buat sisa waktu tiap sesi ongoing, lewat Web Speech API
 * (browser bawaan, gak butuh library tambahan — suara keluar dari speaker
 * default OS, jadi kalau mau ke speaker Bluetooth tinggal pastiin itu yang
 * jadi default output audio di device kasir).
 *
 * Threshold: 15/10/5/1 menit sesuai alur kerja di plan. Announcement per
 * threshold cuma sekali per sesi (di-track pake ref, bukan localStorage,
 * biar reset otomatis tiap sesi baru).
 *
 * "First sighting" sebuah sesi (baru muncul di data / baru mount) gak
 * langsung nge-speak buat threshold yang udah kelewat — cuma nge-track diam-diam.
 * Ini nyegah kasir denger 3-4 pengumuman numpuk pas halaman baru dibuka
 * di tengah sesi yang udah jalan lama.
 */
export function useTimerAnnouncement(sessions, enabled = true) {
  const stateRef = useRef({}); // { [sessionId]: Set<threshold|'over'> }

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const activeIds = new Set((sessions || []).map((s) => s.id));
    Object.keys(stateRef.current).forEach((id) => {
      if (!activeIds.has(Number(id))) delete stateRef.current[id];
    });

    const tick = () => {
      (sessions || []).forEach((session) => {
        const remainingMs = new Date(session.planned_end_time) - new Date();
        const minutesRemaining = Math.ceil(remainingMs / 60000);

        const secondsRemaining = Math.ceil(remainingMs / 1000);

        const firstSighting = !stateRef.current[session.id];
        if (firstSighting) {
          const alreadyPassed = THRESHOLDS.filter((t) => minutesRemaining <= t);
          if (minutesRemaining <= 0) alreadyPassed.push('over');
          // Add seconds passed
          if (secondsRemaining <= 5) alreadyPassed.push('sec-5');
          if (secondsRemaining <= 4) alreadyPassed.push('sec-4');
          if (secondsRemaining <= 3) alreadyPassed.push('sec-3');
          if (secondsRemaining <= 2) alreadyPassed.push('sec-2');
          if (secondsRemaining <= 1) alreadyPassed.push('sec-1');
          
          stateRef.current[session.id] = new Set(alreadyPassed);
          return;
        }

        const announced = stateRef.current[session.id];

        for (const threshold of THRESHOLDS) {
          if (minutesRemaining <= threshold && !announced.has(threshold)) {
            announced.add(threshold);
            const customerStr = session.customer_name ? ` atas nama ${session.customer_name}` : '';
            speak(`Perhatian, waktu ${session.unit_name}${customerStr} tersisa ${threshold} menit`);
          }
        }

        // 5-second countdown
        if (secondsRemaining <= 5 && secondsRemaining > 0 && !announced.has(`sec-${secondsRemaining}`)) {
          announced.add(`sec-${secondsRemaining}`);
          if (secondsRemaining === 5) {
            const customerStr = session.customer_name ? ` atas nama ${session.customer_name}` : '';
            speak(`${session.unit_name}${customerStr}, 5`);
          } else {
            speak(`${secondsRemaining}`);
          }
        }

        if (secondsRemaining <= 0 && !announced.has('over')) {
          announced.add('over');
          const customerStr = session.customer_name ? ` atas nama ${session.customer_name}` : '';
          speak(`Waktu ${session.unit_name}${customerStr} sudah habis`);
        }
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessions, enabled]);
}

export function speak(text) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.2; // Agak dinaikin pitch-nya biar lebih feminin ala mbak billing warnet

    // Coba pilih suara cewek (Google Bahasa Indonesia / Microsoft Gadis)
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.lang.includes('id') && 
      (v.name.includes('Gadis') || v.name.includes('Google') || v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.includes('id')); // fallback suara Indo pertama yang ketemu

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Web Speech API gak selalu didukung semua browser — gagal diem-diem aja
  }
}

