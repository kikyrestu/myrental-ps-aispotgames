import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { settingsApi } from '../../api/settings';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../../hooks/useAuth';

export default function AutoShiftReminder() {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [shiftStart, setShiftStart] = useState(null);
  
  useEffect(() => {
    // Only kasir or admin needs to open shift
    if (!user || user.role === 'mitra') return;

    let interval;
    
    const checkShift = async () => {
      try {
        // Fetch current shift
        const shiftRes = await api.get('/shifts/current');
        // Fetch settings
        const settingsRes = await settingsApi.get();
        
        const startTimeStr = settingsRes.shift_start_time;
        if (!startTimeStr) return;
        
        setShiftStart(startTimeStr);

        if (!shiftRes) {
          // No active shift. Check if current time is past shift_start_time
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          const [startHour, startMinute] = startTimeStr.split(':').map(Number);
          
          // Simple time comparison
          const currentTotalMins = currentHour * 60 + currentMinute;
          const startTotalMins = startHour * 60 + startMinute;
          
          if (currentTotalMins >= startTotalMins) {
            setShowReminder(true);
          } else {
            setShowReminder(false);
          }
        } else {
          // Shift is active, don't show reminder
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Error checking shift reminder', err);
      }
    };

    checkShift();
    interval = setInterval(checkShift, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  if (!showReminder) return null;

  return (
    <Modal title="Peringatan Kasir" onClose={() => setShowReminder(false)}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Waktunya Buka Kasir!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Jam operasional ({shiftStart}) sudah dimulai. Jangan lupa untuk membuka shift dan menghitung saldo awal laci kasir ya!
        </p>
        <Button variant="primary" fullWidth onClick={() => setShowReminder(false)}>
          Baik, Saya Mengerti
        </Button>
      </div>
    </Modal>
  );
}
