import Button from '../../../components/ui/Button'
import Modal from '../../../components/modals/Modal'

export default function SessionWarningModal({ open, busy, onContinue, onLogout }) {
  return <Modal open={open} title="Tu sesión está por finalizar" busy={busy} onClose={onLogout} footer={<><Button variant="ghost" onClick={onLogout}>Cerrar sesión</Button><Button loading={busy} onClick={onContinue}>Continuar sesión</Button></>}><p>Detectamos 30 minutos sin actividad. Por seguridad, la sesión se cerrará en cinco minutos.</p></Modal>
}
