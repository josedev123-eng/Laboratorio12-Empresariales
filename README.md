# Laboratorio 12 — Consumo de la API del Laboratorio 8 desde React

**Curso:** Desarrollo de Aplicaciones Empresariales — Servicios Web (4-C24-A)
**Alumno:** Michael Montgomery Rosell

Cliente en React que consume con **Axios** la API REST construida en el Laboratorio 8
(Django + Django REST Framework), con **CORS** configurado para autorizar únicamente
el origen del servidor de desarrollo de Vite.

---

## 1. Estructura del repositorio

```
Laboratorio12-Empresariales/
├── backend/                 API del Laboratorio 8 (Django + DRF)
│   ├── config/settings.py   CORS, middleware y apps instaladas
│   ├── quiz/                app de exámenes y preguntas (recurso consumido)
│   ├── quiz/fixtures/       datos de ejemplo para cargar con loaddata
│   ├── manage.py
│   └── requirements.txt
├── frontend/                Cliente React (Vite + Axios)
│   ├── src/api/client.js    dirección base y funciones listar / crear / eliminar
│   ├── src/pages/ExamList.jsx   listado con los tres estados y borrado
│   ├── src/pages/ExamForm.jsx   formulario de alta y error de validación
│   ├── src/App.jsx          rutas `/` y `/nuevo`
│   └── vite.config.js       puerto fijo 5173
└── docs/
    ├── capturas/            evidencia de los estados y de los errores
    └── Entregable_Lab12_React.docx
```

---

## 2. Cómo levantar el servidor (backend)

Requiere Python 3.11 o superior.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata examenes_iniciales.json   # datos de ejemplo (opcional)
python manage.py runserver 127.0.0.1:8000
```

La API queda en **http://127.0.0.1:8000** y se puede comprobar en el navegador:

- http://127.0.0.1:8000/quiz/exams/ → listado paginado de exámenes
- http://127.0.0.1:8000/quiz/questions/ → listado de preguntas
- http://127.0.0.1:8000/quiz/questions/?exam=6 → filtro por examen
- http://127.0.0.1:8000/quiz/questions/?search=Python → búsqueda por texto

### Recursos que consume el cliente

| Recurso | Dirección | Método | Uso en el cliente |
|---|---|---|---|
| Exámenes | `/quiz/exams/` | `GET` | carga el listado al montar la página |
| Exámenes | `/quiz/exams/` | `POST` | crea un examen desde el formulario |
| Examen | `/quiz/exams/{id}/` | `DELETE` | elimina una fila de la tabla |

### Configuración de CORS (`backend/config/settings.py`)

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',   # justo después del de seguridad
    'django.contrib.sessions.middleware.SessionMiddleware',
    ...
]

# Solo el origen del cliente React. No se usa CORS_ALLOW_ALL_ORIGINS.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = False
```

Se autorizan **solo** los dos nombres con los que Vite puede abrir la aplicación en el
puerto 5173. Cualquier otro origen recibe la respuesta sin la cabecera
`Access-Control-Allow-Origin` y el navegador bloquea la petición.

---

## 3. Cómo levantar el cliente (frontend)

Requiere Node.js 20 o superior.

```powershell
cd frontend
npm install        # instala React, Vite, Axios y React Router
npm run dev        # servidor de desarrollo en http://localhost:5173
```

Abrir **http://localhost:5173**. Ese es el origen que el backend tiene autorizado.

---

## 4. Qué origen espera cada lado

| Lado | Escucha en | Espera peticiones de |
|---|---|---|
| Backend (Django) | `http://127.0.0.1:8000` | `http://localhost:5173` y `http://127.0.0.1:5173` |
| Frontend (Vite) | `http://localhost:5173` | nada; solo llama a `http://127.0.0.1:8000` |

La dirección de la API se declara **una sola vez**, en `frontend/src/api/client.js`
(`API_BASE_URL`). Ningún componente escribe la URL a mano.

Si se cambia el puerto de Vite hay que añadir el nuevo origen a `CORS_ALLOWED_ORIGINS`;
si se abre el cliente como `http://127.0.0.1:5173`, el origen autorizado es el segundo
de la lista.

---

## 5. La pantalla y sus estados

| Momento | Petición | Qué se muestra |
|---|---|---|
| Al entrar a `/` | `GET /quiz/exams/` dentro de `useEffect` | primero el **esqueleto de carga** (filas grises animadas) |
| Respuesta correcta | — | **tabla** con ID, título, descripción, número de preguntas y botón Eliminar |
| Respuesta fallida | — | **tarjeta de error** con el mensaje y el botón **Reintentar** |
| Al pulsar Eliminar | `DELETE /quiz/exams/{id}/` y luego `GET` | la fila desaparece y el contador se actualiza sin recargar la página |
| Al guardar en `/nuevo` | `POST /quiz/exams/` | vuelve al listado con el examen creado |
| Si la API rechaza el alta | `POST` con 400 | alerta con el mensaje que devuelve la API |

El estado de error se dibuja siempre que la petición falla, así que **nunca queda una
pantalla en blanco**: ni con el servidor de Django apagado ni con el origen bloqueado
por CORS.

---

## 6. Evidencia de los errores provocados

En `docs/capturas/`:

| Archivo | Contenido |
|---|---|
| `01_estado_datos.png` | listado con datos reales de la API |
| `02_estado_carga.png` | esqueleto de carga (respuesta retrasada a propósito) |
| `03_formulario_alta.png` | formulario de alta con entradas controladas |
| `04_alta_registrada.png` | examen creado con `POST`, ya visible en la tabla |
| `05_borrado_refrescado.png` | fila eliminada con `DELETE` y lista refrescada |
| `06_error_validacion.png` | error 400 de la API mostrado en el formulario |
| `07_error_cors.png` | origen quitado de `CORS_ALLOWED_ORIGINS`: la pantalla muestra el estado de error |
| `07_error_cors_consola.txt` | mensaje de la consola del navegador para el caso CORS |
| `08_error_servidor_apagado.png` | Django apagado: estado de error, no pantalla en blanco |
| `08_error_servidor_apagado_consola.txt` | consola del navegador con `net::ERR_CONNECTION_REFUSED` |

Para reproducir el error de CORS: comentar los dos orígenes de `CORS_ALLOWED_ORIGINS`,
reiniciar Django, recargar la página y leer la consola del navegador
(`has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`).
Después se vuelven a habilitar los orígenes y todo funciona otra vez.

---

## 7. Entregable

El documento con la tabla de la pantalla, las capturas de los tres estados y las
capturas de los dos errores provocados está en
[`docs/Entregable_Lab12_React.docx`](docs/Entregable_Lab12_React.docx).
