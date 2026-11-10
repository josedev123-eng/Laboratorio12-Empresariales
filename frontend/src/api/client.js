import axios from 'axios'

// Única definición de la dirección base de la API.
// Ningún componente escribe la URL a mano: todos usan estas funciones.
export const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

/** Devuelve la lista de exámenes (la paginación de DRF viene en `results`). */
export async function listExams() {
  const { data } = await api.get('/quiz/exams/')
  return data.results ?? data
}

/** Crea un examen y devuelve el objeto creado. */
export async function createExam(exam) {
  const { data } = await api.post('/quiz/exams/', exam)
  return data
}

/** Elimina un examen por su identificador. */
export async function deleteExam(id) {
  await api.delete(`/quiz/exams/${id}/`)
}

/**
 * Traduce el error de Axios a un texto legible.
 * Si la API respondió con errores de validación de DRF, los devuelve juntos.
 */
export function getErrorMessage(error) {
  if (error.response) {
    const { data, status } = error.response
    if (data && typeof data === 'object') {
      const detalles = Object.entries(data)
        .map(([campo, mensajes]) => {
          const texto = Array.isArray(mensajes) ? mensajes.join(' ') : String(mensajes)
          return `${campo}: ${texto}`
        })
        .join(' | ')
      if (detalles) return `${detalles} (HTTP ${status})`
    }
    return `La API respondió con el código ${status}.`
  }
  if (error.code === 'ECONNABORTED') {
    return 'La API tardó demasiado en responder. Revisa que el servidor de Django esté encendido.'
  }
  if (error.code === 'ERR_NETWORK') {
    return (
      'No se pudo conectar con la API en http://127.0.0.1:8000. ' +
      'Puede ser que el servidor de Django esté apagado o que este origen ' +
      '(http://localhost:5173) no esté autorizado en CORS: revisa la consola del navegador.'
    )
  }
  return 'No se pudo conectar con la API. Revisa que el servidor de Django esté encendido en http://127.0.0.1:8000.'
}
