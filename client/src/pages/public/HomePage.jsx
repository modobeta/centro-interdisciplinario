import Seo from '../../components/seo/Seo'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../config/routes'
import { siteConfig } from '../../config/site.config'
import ServicesPreview from '../../features/public-services/components/ServicesPreview'
import TeamPreview from '../../features/public-team/components/TeamPreview'
import InstitutionalImage from './InstitutionalImage'
import styles from './PublicPages.module.css'

const needs = [
  ['Desarrollo neurocognitivo', 'Acompañamos procesos de desarrollo desde una mirada integral.'],
  ['Aprendizaje', 'Diseñamos apoyos respetuosos para las trayectorias educativas.'],
  ['Comunicación', 'Fortalecemos herramientas para expresarse, comprender y vincularse.'],
  ['Acompañamiento familiar', 'Trabajamos junto a cada familia para sostener los procesos cotidianos.'],
]

export default function HomePage() {
  const seo = siteConfig.seo.home
  return <div className="public-page"><Seo {...seo} /><section className={styles.hero}><div className={`container ${styles.heroGrid}`}><div><p className={styles.eyebrow}>Centro interdisciplinario</p><h1>Cada proceso merece una mirada atenta y compartida</h1><p className={styles.lead}>{siteConfig.tagline}</p><div className="cluster"><Button to={ROUTES.services}>Conocer servicios</Button><Button to={ROUTES.contact} variant="outline">Contactarnos</Button></div></div><div className={styles.heroMedia}><InstitutionalImage src={siteConfig.images.homeHero} alt="Espacio de acompañamiento de Mentes Luminosas" eager /></div></div></section><section className="public-section public-section--soft"><div className="container"><div className="section-heading"><h2>¿A quiénes acompañamos?</h2><p>Construimos apoyos personalizados para niños, adolescentes y familias.</p></div><div className={styles.featureGrid}>{needs.map(([title, text]) => <article className={styles.feature} key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section><section className="public-section"><div className="container"><div className="section-heading"><h2>Servicios</h2><p>Propuestas que se articulan alrededor de las necesidades de cada persona.</p></div><ServicesPreview /><p><Button to={ROUTES.services} variant="ghost">Ver todos los servicios →</Button></p></div></section><section className="public-section public-section--warm"><div className={`container ${styles.split}`}><InstitutionalImage src={siteConfig.images.homeApproach} alt="Trabajo interdisciplinario" /><div><h2>Cómo trabajamos</h2><ol><li><strong>Primera escucha y orientación.</strong> Conocemos la necesidad y acordamos los próximos pasos.</li><li><strong>Evaluación y planificación.</strong> Definimos objetivos claros y personalizados.</li><li><strong>Acompañamiento interdisciplinario.</strong> Coordinamos estrategias con la familia y los espacios cotidianos.</li></ol></div></div></section><section className="public-section"><div className="container"><div className="section-heading"><h2>Nuestro equipo</h2><p>Profesionales que trabajan de forma articulada y cercana.</p></div><TeamPreview /><p><Button to={ROUTES.team} variant="ghost">Conocer al equipo →</Button></p></div></section><section className="public-section"><div className={`container ${styles.cta}`}><h2>Podemos orientarte</h2><p>Conocé nuestros canales y encontrá la mejor forma de acercarte al centro.</p><Button to={ROUTES.contact} variant="secondary">Ver contacto</Button></div></section></div>
}

