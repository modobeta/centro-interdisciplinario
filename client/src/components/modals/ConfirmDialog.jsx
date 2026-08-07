import Button from '../ui/Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title = 'Confirmar acción', message, confirmLabel = 'Confirmar', busy, danger = false, onConfirm, onClose }) {
  return <Modal open={open} title={title} busy={busy} onClose={onClose} footer={<><Button variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button><Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}><p>{message}</p></Modal>
}
