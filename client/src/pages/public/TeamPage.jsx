import Seo from '../../components/seo/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/FeedbackState'
import { siteConfig } from '../../config/site.config'
import TeamMemberCard from '../../features/public-team/components/TeamMemberCard'
import usePublicTeam from '../../features/public-team/hooks/usePublicTeam'

export default function TeamPage() {
  const { status, data, error, retry } = usePublicTeam()
  return <div className="public-page"><Seo {...siteConfig.seo.team} /><section className="public-section"><div className="container"><div className="section-heading"><h1>Nuestro equipo</h1><p>Un equipo con diferentes miradas y un compromiso compartido.</p></div>{(status === 'idle' || status === 'loading') && <LoadingState label="Cargando equipo" cards={6} />}{status === 'error' && <ErrorState message={error?.message} onRetry={retry} />}{status === 'empty' && <EmptyState title="Equipo en actualización" />}{status === 'success' && <div className="card-grid">{data.map((member) => <TeamMemberCard key={member.id} member={member} />)}</div>}</div></section></div>
}

