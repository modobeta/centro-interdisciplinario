import Button from '../../components/ui/Button'

export default function UnexpectedErrorPage({ onRetry }) {
  return <section className="panel"><h1>No pudimos cargar esta sección</h1><p>Intentá nuevamente. Si el problema continúa, volvé más tarde.</p>{onRetry && <Button onClick={onRetry}>Reintentar</Button>}</section>
}
