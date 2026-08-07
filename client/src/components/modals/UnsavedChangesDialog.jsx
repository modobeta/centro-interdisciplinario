import ConfirmDialog from './ConfirmDialog'

export default function UnsavedChangesDialog({ open, onDiscard, onContinue }) {
  return <ConfirmDialog open={open} title="Hay cambios sin guardar" message="Si salís ahora, los cambios ingresados se perderán." confirmLabel="Descartar cambios" danger onConfirm={onDiscard} onClose={onContinue} />
}
