import { joiResolver } from '@hookform/resolvers/joi'
import { useForm } from 'react-hook-form'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/ui/FormField'
import { patientSchema } from '../schemas/patientSchema'

const defaults = { paciente: { dni: '', nombre: '', apellido: '', fechaNacimiento: '', colegio: '', diagnostico: '', poseeCud: false, cudFechaVencimiento: '', observaciones: '' }, tutor: { nombre: '', apellido: '', telefono: '', parentesco: '', email: '', direccion: '', observaciones: '' } }
export default function PatientForm({ initialValues, onSubmit, busy, serverError }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: joiResolver(patientSchema), defaultValues: initialValues || defaults })
  const field = (name, label, type = 'text') => <FormField id={name} label={label} error={name.split('.').reduce((v, key) => v?.[key], errors)?.message}>{(props) => <input {...props} {...register(name)} type={type} />}</FormField>
  return <form onSubmit={handleSubmit(onSubmit)} className="form-stack"><fieldset><legend>Paciente</legend><div className="form-grid">{field('paciente.nombre','Nombre')}{field('paciente.apellido','Apellido')}{field('paciente.dni','DNI')}{field('paciente.fechaNacimiento','Fecha de nacimiento','date')}{field('paciente.colegio','Colegio')}<FormField id="poseeCud" label="Certificado Único de Discapacidad"><input id="poseeCud" type="checkbox" {...register('paciente.poseeCud')} /></FormField>{watch('paciente.poseeCud') && field('paciente.cudFechaVencimiento','Vencimiento CUD','date')}{field('paciente.diagnostico','Diagnóstico')}</div></fieldset><fieldset><legend>Tutor responsable</legend><div className="form-grid">{field('tutor.nombre','Nombre')}{field('tutor.apellido','Apellido')}{field('tutor.telefono','Teléfono')}{field('tutor.parentesco','Parentesco')}{field('tutor.email','Correo','email')}{field('tutor.direccion','Dirección')}</div></fieldset>{serverError && <p role="alert">{serverError}</p>}<Button type="submit" loading={busy}>Guardar paciente y tutor</Button></form>
}
