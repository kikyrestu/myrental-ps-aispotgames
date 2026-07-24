import SessionTimer from './SessionTimer';

const STATUS_LABEL = {
  kosong: 'Kosong',
  dipakai: 'Dipakai',
  maintenance: 'Maintenance',
};

export default function UnitCard({ unit, session, onStart, onComplete, onMaintenance }) {
  return (
    <div className={`unit-card unit-card--${unit.status}`}>
      <div className="unit-card__header">
        <h3>{unit.name}</h3>
        <span className="unit-card__badge">{STATUS_LABEL[unit.status]}</span>
      </div>

      <p className="unit-card__type">{unit.console_type}</p>

      {unit.status === 'dipakai' && session && (
        <div className="unit-card__session">
          <p className="unit-card__customer">{session.customer_name || 'Walk-in'}</p>
          <SessionTimer plannedEndTime={session.planned_end_time} />
        </div>
      )}

      <div className="unit-card__actions">
        {unit.status === 'kosong' && (
          <button className="btn btn--primary btn--sm" onClick={() => onStart(unit)}>
            Mulai Sesi
          </button>
        )}
        {unit.status === 'dipakai' && session && (
          <button className="btn btn--success btn--sm" onClick={() => onComplete(session)}>
            Selesaikan
          </button>
        )}
        {unit.status !== 'maintenance' && (
          <button className="btn btn--ghost btn--sm" onClick={() => onMaintenance(unit)}>
            Maintenance
          </button>
        )}
      </div>
    </div>
  );
}
