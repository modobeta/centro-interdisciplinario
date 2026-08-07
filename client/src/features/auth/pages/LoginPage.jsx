import Seo from '../../../components/seo/Seo'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return <><Seo title="Acceso" description="Acceso privado al sistema de gestión." path="/login" noIndex /><section><h1>Acceso al panel</h1><p className="muted">Ingresá con las credenciales provistas por el centro.</p><LoginForm /></section></>
}
