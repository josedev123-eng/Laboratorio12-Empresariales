import { Link, Route, Routes } from 'react-router-dom'
import ExamList from './pages/ExamList.jsx'
import ExamForm from './pages/ExamForm.jsx'
import { API_BASE_URL } from './api/client.js'

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Q</span>
          <div>
            <h1>Cuestionarios</h1>
            <p className="brand-sub">Cliente React consumiendo la API del Laboratorio 8</p>
          </div>
        </div>
        <nav className="nav">
          <Link to="/">Exámenes</Link>
          <Link to="/nuevo" className="nav-cta">Nuevo examen</Link>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<ExamList />} />
          <Route path="/nuevo" element={<ExamForm />} />
        </Routes>
      </main>

      <footer className="footer">
        API: <code>{API_BASE_URL}</code> · Django REST Framework · Axios
      </footer>
    </div>
  )
}
