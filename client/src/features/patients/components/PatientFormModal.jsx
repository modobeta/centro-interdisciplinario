import { useState } from 'react'
import Modal from '../../../components/modals/Modal'
import { createPatient, updatePatient } from '../api/patientsApi'
import PatientForm from './PatientForm'
export default function PatientFormModal({ open, patient, onClose, onSaved }) { const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const submit=async(payload)=>{setBusy(true);setError('');try{const saved=patient?await updatePatient(patient.id,payload):await createPatient(payload);onSaved(saved);onClose()}catch(e){setError(e.message)}finally{setBusy(false)}}; return <Modal open={open} title={patient?'Editar paciente':'Nuevo paciente'} onClose={onClose} busy={busy}><PatientForm initialValues={patient ? { paciente: patient, tutor: patient.tutor } : undefined} onSubmit={submit} busy={busy} serverError={error} /></Modal> }
