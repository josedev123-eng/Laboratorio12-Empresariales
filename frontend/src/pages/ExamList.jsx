import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteExam, getErrorMessage, listExams } from '../api/client.js'

function Skeleton() {
  return (
    <section className="card" aria-busy="true">
      <div className="card-head">
        <div className="skeleton skeleton-title" />
      </div>
      <div className="skeleton-table">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skeleton-row" key={index}>
            <div className="skeleton skeleton-cell w-10" />
            <div className="skeleton skeleton-cell w-40" />
            <div className="skeleton skeleton-cell w-30" />
            <div className="skeleton skeleton-cell w-10" />
          </div>
        ))}
      </div>
      <p className="state-hint">Cargando exámenes desde la API…</p>
    </section>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <section className="card state-card">
      <div className="state-icon error-icon">!</div>
      <h2>No se pudieron cargar los exámenes</h2>
      <p className="state-message">{message}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Reintentar
      </button>
    </section>
  )
}

export default function ExamList() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setExams(await listExams())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await deleteExam(id)
      await load() // refresca la lista con los datos del servidor
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <Skeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Exámenes</h2>
          <p className="card-sub">{exams.length} registro(s) en la API</p>
        </div>
        <Link to="/nuevo" className="btn btn-primary">Nuevo examen</Link>
      </div>

      {exams.length === 0 ? (
        <p className="empty">Todavía no hay exámenes registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Preguntas</th>
              <th className="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td className="mono">{exam.id}</td>
                <td><strong>{exam.title}</strong></td>
                <td className="muted">{exam.description || '—'}</td>
                <td>{exam.questions?.length ?? 0}</td>
                <td className="right">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(exam.id)}
                    disabled={deletingId === exam.id}
                  >
                    {deletingId === exam.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
