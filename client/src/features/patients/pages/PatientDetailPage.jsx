import { lazy, Suspense, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import FeedbackState from '../../../components/ui/FeedbackState'
import { formatDate } from '../../../utils/formatters'
import PatientFormModal from '../components/PatientFormModal'
import usePatient from '../hooks/usePatient'

const LazyRelated = lazy(async () => ({ default: ({ type, patientId }) => <section className="panel"><h2>{type}</h2><p>Este panel consulta sus datos bajo demanda para el paciente {patientId}.</p></section> }))
export default function PatientDetailPage(){const {patientId}=useParams();const remote=usePatient(patientId);const [edit,setEdit]=useState(false),[tab,setTab]=useState('Resumen');if(remote.status==='loading')return <FeedbackState title="Cargando ficha"/>;if(remote.status==='error')return <FeedbackState type="error" message={remote.error.message} onRetry={remote.refresh}/>;const p=remote.data;if(!p)return <FeedbackState type="empty"/>;return <div className="private-page"><header className="page-header"><div><h1>{p.nombre} {p.apellido}</h1><p>DNI {p.dni||'no informado'} · Nacimiento {formatDate(p.fechaNacimiento)}</p></div><Button onClick={()=>setEdit(true)}>Editar</Button></header><div className="tabs" role="tablist">{['Resumen','Turnos','Informes','Conversaciones'].map(value=><button role="tab" aria-selected={tab===value} key={value} onClick={()=>setTab(value)}>{value}</button>)}</div>{tab==='Resumen'?<section className="panel"><h2>Información general</h2><dl><dt>Colegio</dt><dd>{p.colegio||'—'}</dd><dt>Diagnóstico</dt><dd>{p.diagnostico||'—'}</dd><dt>Tutor</dt><dd>{p.tutor?`${p.tutor.nombre} ${p.tutor.apellido} · ${p.tutor.telefono}`:'—'}</dd></dl></section>:<Suspense fallback={<FeedbackState/>}><LazyRelated type={tab} patientId={patientId}/></Suspense>}<PatientFormModal open={edit} patient={p} onClose={()=>setEdit(false)} onSaved={remote.refresh}/></div>}
