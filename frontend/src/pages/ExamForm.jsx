import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createExam, getErrorMessage } from '../api/client.js'

export default function ExamForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault() // evita el envío del navegador
    setSubmitting(true)
    setError('')
    try {
      await createExam({
        title: form.title,
        description: form.description,
      })
      navigate('/') // vuelve al listado
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card form-card">
      <div className="card-head">
        <div>
          <h2>Nuevo examen</h2>
          <p className="card-sub">POST /quiz/exams/</p>
        </div>
        <Link to="/" className="btn btn-ghost">Volver al listado</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej. Examen final de Django"
          />
        </label>

        <label className="field">
          <span>Descripción</span>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción del examen"
          />
        </label>

        {error && (
          <div className="alert" role="alert">
            <strong>La API rechazó el envío</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar examen'}
          </button>
        </div>
      </form>
    </section>
  )
}
