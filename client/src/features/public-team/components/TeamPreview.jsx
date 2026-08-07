import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/FeedbackState'
import usePublicTeam from '../hooks/usePublicTeam'
import TeamMemberCard from './TeamMemberCard'

export default function TeamPreview({ limit = 4 }) {
  const { status, data, error, retry } = usePublicTeam({ limit })
  if (status === 'loading' || status === 'idle') return <LoadingState label="Cargando equipo" cards={limit} />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={retry} />
  if (status === 'empty') return <EmptyState title="Equipo en actualización" message="Pronto vas a poder conocer a quienes forman parte del centro." />
  return <div className="card-grid">{data.map((member) => <TeamMemberCard member={member} preview key={member.id} />)}</div>
}
