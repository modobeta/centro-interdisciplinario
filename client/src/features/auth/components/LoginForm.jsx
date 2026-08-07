import { joiResolver } from '@hookform/resolvers/joi'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/ui/FormField'
import useAuth from '../hooks/useAuth'
import { loginSchema } from '../schemas/loginSchema'

export default function LoginForm() {
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: joiResolver(loginSchema), defaultValues: { email: '', dni: '' } })
  const submit = async (values) => { setServerError(''); try { await signIn(values) } catch (error) { setServerError(error.message || 'No pudimos iniciar sesión.') } }
  return <form className="stack" onSubmit={handleSubmit(submit)} noValidate>{serverError && <p role="alert" className="text-danger">{serverError}</p>}<FormField id="email" label="Correo electrónico" error={errors.email?.message}>{(props) => <input type="email" autoComplete="username" {...props} {...register('email')} />}</FormField><FormField id="dni" label="DNI" help="Ingresá solo números." error={errors.dni?.message}>{(props) => <input inputMode="numeric" autoComplete="current-password" {...props} {...register('dni')} />}</FormField><Button type="submit" loading={isSubmitting}>Ingresar</Button></form>
}
