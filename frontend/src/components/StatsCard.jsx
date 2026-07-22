import './StatsCard.css';

export default function StatsCard({ icon, label, value, trend, color = 'primary' }) {
  return (
    <div className={`stats-card glass-card stats-card--${color}`}>
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-body">
        <span className="stats-card-value">{value}</span>
        <span className="stats-card-label">{label}</span>
      </div>
      {trend !== undefined && (
        <div className={`stats-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
