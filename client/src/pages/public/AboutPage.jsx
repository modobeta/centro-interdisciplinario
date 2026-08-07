import Seo from '../../components/seo/Seo'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../config/routes'
import { siteConfig } from '../../config/site.config'
import InstitutionalImage from './InstitutionalImage'
import styles from './PublicPages.module.css'

export default function AboutPage() {
  return <div className="public-page"><Seo {...siteConfig.seo.about} /><section className="public-section"><div className="container"><div className="section-heading"><p className={styles.eyebrow}>Nosotros</p><h1>Un espacio construido desde la escucha y el trabajo compartido</h1><p>{siteConfig.description}</p></div><div className={styles.split}><div className="prose"><h2>Nuestra identidad</h2><p>Entendemos cada trayectoria como única. Por eso articulamos saberes, objetivos y estrategias alrededor de la persona y su contexto.</p><h2>Misión</h2><p>Ofrecer acompañamientos interdisciplinarios responsables, cercanos y orientados al desarrollo de capacidades.</p></div><InstitutionalImage src={siteConfig.images.aboutIdentity} alt="Identidad institucional de Mentes Luminosas" /></div></div></section><section className="public-section public-section--soft"><div className={`container ${styles.split}`}><InstitutionalImage src={siteConfig.images.aboutSpace} alt="Espacio institucional" /><div className="prose"><h2>Visión</h2><p>Ser una comunidad profesional que aprende, coordina y acompaña con respeto por la singularidad.</p><h2>Valores</h2><p>Escucha, respeto, compromiso, trabajo colaborativo y comunicación clara guían nuestras decisiones.</p></div></div></section><section className="public-section"><div className={`container ${styles.split}`}><div className="prose"><h2>Enfoque interdisciplinario</h2><p>La coordinación entre profesionales permite sostener objetivos comunes sin perder la especificidad de cada disciplina.</p><Button to={ROUTES.contact}>Contactarnos</Button></div><InstitutionalImage src={siteConfig.images.aboutValues} alt="Valores y acompañamiento" /></div></section></div>
}

