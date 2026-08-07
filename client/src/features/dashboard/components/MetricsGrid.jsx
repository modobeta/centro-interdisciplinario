import MetricCard from './MetricCard'
export default function MetricsGrid({ cards, selected, onSelect }) { return <div className="card-grid">{cards.map((metric) => <MetricCard key={metric.key} metric={metric} selected={selected?.key === metric.key} onSelect={onSelect} />)}</div> }
