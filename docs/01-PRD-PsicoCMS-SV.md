# PRD — PsicoCMS SV (versión multi-tenant)
### Documento de Requisitos de Producto · Software de gestión para psicólogos independientes

> **Origen:** Reconstruido a partir de las funcionalidades descritas para *PsicoCMS* (Víctor Robles), reinterpretadas como un **SaaS multi-tenant** y **adaptadas al contexto salvadoreño**.
> **Estado:** Borrador v1 para arrancar desarrollo con Claude Code.
> **Mercado objetivo:** Psicólogos/as independientes y pequeños consultorios en El Salvador (y, por extensión, Centroamérica).

---

## 1. Resumen ejecutivo

PsicoCMS SV es una plataforma web que le permite a un/a psicólogo/a independiente tener **su propia web profesional + un panel de gestión clínica + un sistema de reservas de citas en línea 24/7**, todo en una sola herramienta, sin necesidad de saber programar.

A diferencia del PsicoCMS original (que se instala en el servidor propio de cada profesional, un sistema *single-tenant* auto-alojado), esta versión es **multi-tenant**: una sola aplicación da servicio a muchos profesionales a la vez, cada uno con sus datos completamente aislados. Esto reduce el costo por cliente, permite vender por suscripción y elimina la fricción de "contratá un hosting e instalá esto".

### Propuesta de valor en una frase
> *"Tu consultorio en línea: agenda, expediente y página web profesional, listos en 10 minutos, desde tu celular o computadora."*

---

## 2. Personas (usuarios tipo)

| Persona | Quién es | Qué necesita |
|---|---|---|
| **La profesional (tenant owner)** | Psicóloga independiente, 25–50 años, con o sin secretaria. Trabaja sola o en un consultorio pequeño. | Organizar su agenda, llevar expedientes, que los pacientes reserven solos, verse profesional en internet. |
| **El asistente / secretaria (rol opcional)** | Persona de apoyo que agenda y gestiona pacientes pero **no** ve notas clínicas sensibles. | Crear/editar citas, registrar pacientes, sin acceso a historias clínicas. |
| **El paciente** | Persona que busca terapia. No necesita cuenta para reservar. | Reservar una cita fácil desde el celular, recibir confirmación, encontrar al profesional en Google. |
| **El super-admin (vos / LTSOFT)** | Operador de la plataforma. | Alta/baja de tenants, planes, métricas globales, soporte. |

---

## 3. Glosario y adaptación de términos a El Salvador 🇸🇻

El PsicoCMS original usa terminología y marco legal de España. Esta es la tabla de equivalencias que se aplica en **todo** el producto (UI, plantillas, documentos, copys).

| Término original (España) | Adaptación El Salvador | Nota |
|---|---|---|
| **DNI** | **DUI** (Documento Único de Identidad) | Campo principal de identificación del paciente adulto. Validar formato `########-#` (8 dígitos + guion + dígito verificador). |
| (menores sin DUI) | **Carné de minoridad / N.º de partida / DUI del responsable** | Para pacientes menores de edad. Guardar también datos del **encargado/responsable**. |
| **NIF / NIE** | **NIT / DUI** | El NIT (`####-######-###-#`) aplica si se requiere identificación tributaria. |
| **RGPD / LOPD** | **Ley para la Protección de Datos Personales (Decreto Legislativo N.° 144, vigente desde nov. 2024)** | Supervisada por la **Agencia de Ciberseguridad del Estado (ACE)**. Sustituye toda referencia al RGPD europeo. |
| **PDF de protección de datos** | **Aviso de privacidad / Consentimiento informado de tratamiento de datos** | Documento que el paciente firma autorizando el tratamiento de sus datos personales sensibles (salud). Debe contemplar derechos **ARCO-POL**. |
| **Derechos del interesado (RGPD)** | **Derechos ARCO-POL** | Acceso, Rectificación, Cancelación, Oposición, **P**ortabilidad, **O**lvido y **L**imitación. |
| **Móvil** | **Celular** | En labels y textos de UI. |
| **Ordenador** | **Computadora** | En textos de ayuda/onboarding. |
| **Coger / pedir cita** | **Reservar / agendar / sacar una cita** | "Coger" tiene connotación vulgar en ES; evitar siempre. |
| **Gabinete / consulta** | **Consultorio** | Espacio físico del profesional. |
| **€ (euros)** | **US$ (dólares)** | Moneda oficial. Formato `$25.00`. Bitcoin **no** se incluye en MVP. |
| **Código postal** | **Departamento + municipio + distrito** | El Salvador no usa CP de forma generalizada; usar selector de departamento/municipio. |
| **Teléfono fijo +34** | **+503** | Prefijo país por defecto. Celular salvadoreño: 8 dígitos, suele iniciar en 6 o 7. |
| **Zona horaria** | **America/El_Salvador (UTC−6, sin horario de verano)** | Crítico para el motor de reservas. **Toda** la lógica de slots debe anclarse a esta zona. |
| **"online y presencial"** | **"en línea (videollamada) y presencial"** | Mantener ambas modalidades con precios independientes. |
| **Idioma** | **Español de El Salvador (registro voseante opcional en copys de marketing)** | El panel: español neutro-profesional. Marketing: tono cercano salvadoreño. |

> **Decisión de producto:** los textos del **panel administrativo** se redactan en español neutro-profesional (claridad ante todo). Los textos de **marketing y la página pública del consultorio** pueden usar un tono más cercano/salvadoreño.

---

## 4. Marco legal salvadoreño (impacto en el producto)

La **Ley para la Protección de Datos Personales (D.L. 144/2024)** aplica a personas naturales y jurídicas que traten datos personales en El Salvador. Para un sistema que maneja **datos sensibles de salud mental**, esto se traduce en requisitos concretos de producto:

1. **Consentimiento expreso e informado** del paciente para tratar sus datos (especialmente datos sensibles de salud). → *Funcionalidad: generación y registro de consentimiento informado por paciente.*
2. **Derechos ARCO-POL** ejercibles por el titular. → *Funcionalidad: exportar datos del paciente (portabilidad), rectificar, y borrar/anonimizar (olvido).*
3. **Medidas de seguridad** razonables: cifrado, control de acceso, registro de actividad. → *Funcionalidad: RLS estricto, cifrado en reposo/tránsito, bitácora de auditoría.*
4. **Minimización**: solo recolectar lo necesario. → *Diseño de fichas con campos opcionales bien marcados.*
5. **Transferencia a terceros** solo con consentimiento y garantías equivalentes. → *Decisión: los datos clínicos sensibles NO salen a terceros (no Cloudinary para adjuntos clínicos); se quedan en almacenamiento privado de Supabase.*

> ⚠️ **Nota legal:** este producto **facilita** el cumplimiento pero no sustituye la asesoría legal. Las plantillas de consentimiento deben ser revisadas por un abogado salvadoreño antes de ofrecerlas como "listas para usar". Sanciones de la ley van de **$408.80 a $16,352.00** según la gravedad.

---

## 5. Mapa de funcionalidades (feature map)

Reconstruido de PsicoCMS y reorganizado por módulos. Se marca cada feature como **[Core]** (paridad con el original), **[Mejora]** (valor agregado nuestro) o **[SaaS]** (necesario por ser multi-tenant).

```
PsicoCMS SV
│
├── A. Plataforma / Multi-tenant ............................. [SaaS]
│   ├── A1. Registro/onboarding del profesional (alta de tenant)
│   ├── A2. Aislamiento de datos por tenant (RLS)
│   ├── A3. Roles: Owner / Asistente / (futuro) Super-admin
│   ├── A4. Subdominio o slug público por consultorio (ej: mariaperez.psicocms.sv)
│   ├── A5. Planes y suscripción (Free / Pro) ................ [Mejora]
│   └── A6. Panel super-admin (gestión de tenants, métricas)
│
├── B. Configuración del consultorio ........................ [Core]
│   ├── B1. Datos del profesional (nombre, título, JVPP/colegiatura, bio)
│   ├── B2. Foto de perfil y logo
│   ├── B3. Especialidades
│   ├── B4. Servicios con precio (en línea y presencial, en US$)
│   ├── B5. Horarios de disponibilidad (por día, rangos, duración de sesión)
│   ├── B6. Excepciones de agenda (feriados SV, vacaciones, bloqueos)
│   ├── B7. Datos de contacto (celular +503, dirección, redes, WhatsApp)
│   └── B8. Política de cancelación / antelación mínima
│
├── C. Sistema de reservas / citas .......................... [Core] ⭐ diferenciador
│   ├── C1. Reserva en línea 24/7 desde la página pública
│   ├── C2. Generación de slots según disponibilidad + duración
│   ├── C3. Validación de solapamientos (server-side, anti-doble-reserva)
│   ├── C4. Citas en línea (videollamada) y presenciales
│   ├── C5. Estados de cita (pendiente, confirmada, atendida, cancelada, no-show)
│   ├── C6. Confirmación y recordatorios por email (Resend)
│   ├── C7. Recordatorio por WhatsApp ....................... [Mejora]
│   ├── C8. Reprogramación / cancelación por el paciente (con token)
│   └── C9. Zona horaria fija America/El_Salvador
│
├── D. Calendario ........................................... [Core]
│   ├── D1. Vistas mes / semana / día (estilo Google Calendar)
│   ├── D2. Eventos extra (no-citas: reuniones, bloqueos personales)
│   ├── D3. Arrastrar/soltar para reprogramar ............... [Mejora]
│   ├── D4. Código de color por servicio/estado
│   └── D5. (Futuro) Sincronización con Google Calendar ..... [Mejora]
│
├── E. Pacientes ............................................ [Core]
│   ├── E1. Ficha: nombre, DUI, celular, email, fecha nac., sexo
│   ├── E2. Datos del encargado (si es menor)
│   ├── E3. Motivo de consulta
│   ├── E4. Notas internas (privadas del profesional)
│   ├── E5. Historial de citas del paciente
│   ├── E6. Etiquetas / segmentación ....................... [Mejora]
│   └── E7. Estado del paciente (activo, alta, inactivo)
│
├── F. Historias clínicas / expediente ...................... [Core] (sensible)
│   ├── F1. Nota por sesión (editor visual TipTap)
│   ├── F2. Adjuntar fotos o PDFs escaneados (almacenamiento privado)
│   ├── F3. Visor integrado (imágenes y PDF)
│   ├── F4. Vinculación nota ↔ cita ↔ paciente
│   ├── F5. Línea de tiempo de la evolución del paciente .... [Mejora]
│   └── F6. Plantillas de nota (motivo, evolución, plan) .... [Mejora]
│
├── G. Cumplimiento y documentos ............................ [Core]
│   ├── G1. Plantilla de consentimiento/aviso de privacidad (Ley 144)
│   ├── G2. Generador de PDF relleno con datos del paciente
│   ├── G3. Registro de consentimiento (fecha, versión, firma)
│   ├── G4. Exportar datos del paciente (portabilidad ARCO-POL) [Mejora]
│   ├── G5. Borrado/anonimización (derecho al olvido) ....... [Mejora]
│   └── G6. Bitácora de auditoría (quién vio/cambió qué) .... [Mejora]
│
├── H. Página pública / sitio web ........................... [Core]
│   ├── H1. Landing del consultorio (hero, servicios, precios, bio)
│   ├── H2. Sección de especialidades y preguntas frecuentes (FAQ)
│   ├── H3. Botón flotante de WhatsApp (+503)
│   ├── H4. Enlaces a redes sociales
│   ├── H5. Formulario/CTA de reserva
│   └── H6. SEO básico (meta, Open Graph, sitemap) .......... [Core+Mejora]
│
├── I. Blog profesional ..................................... [Core]
│   ├── I1. Editor visual (TipTap) con imagen destacada
│   ├── I2. Categorías y etiquetas
│   ├── I3. Páginas públicas de artículos (SEO-friendly)
│   ├── I4. Imagen destacada vía Cloudinary (optimización/CDN)
│   └── I5. Borradores y publicación programada ............. [Mejora]
│
├── J. Panel de inicio (dashboard) .......................... [Core]
│   ├── J1. Resumen del día (próximas citas)
│   ├── J2. Estadísticas (citas/mes, ingresos estimados, no-shows) [Mejora]
│   ├── J3. Buscador global (pacientes, citas, notas)
│   └── J4. Gráficas (Recharts/Tremor) ..................... [Mejora]
│
├── K. Diseño / apariencia .................................. [Core]
│   ├── K1. 11+ temas visuales profesionales
│   ├── K2. Modo claro / oscuro del panel
│   ├── K3. Personalización de color, logo e imágenes
│   ├── K4. Diseño 100% responsive (celular, tablet, escritorio)
│   └── K5. Accesibilidad (contraste, teclado, lectores) ... [Mejora]
│
└── L. Notificaciones / integraciones ....................... [Core+Mejora]
    ├── L1. Email transaccional (Resend) — confirmaciones, recordatorios
    ├── L2. WhatsApp Cloud API — recordatorios automáticos . [Mejora]
    ├── L3. Cloudinary — imágenes públicas (blog, perfil, temas)
    └── L4. (Futuro/Opcional) Facturación DTE El Salvador .. [Mejora SV]
```

---

## 6. Requisitos funcionales clave (detallados)

### RF-C: Motor de reservas (el corazón del producto)
- El sistema genera *slots* disponibles combinando: horarios de disponibilidad del profesional, duración de la sesión por servicio, citas ya existentes, excepciones/bloqueos y antelación mínima de reserva.
- La validación de solapamiento se hace **en el servidor** (constraint en BD + verificación en Edge Function), nunca solo en el cliente, para impedir doble reserva en condiciones de carrera.
- Todos los cálculos de tiempo usan `America/El_Salvador`. Se guarda en BD en UTC (`timestamptz`) y se presenta convertido.
- El paciente puede reservar sin crear cuenta; se identifica por email/celular. Recibe un enlace con token firmado para reprogramar/cancelar.

### RF-F: Historias clínicas (datos sensibles)
- Los adjuntos clínicos (fotos, PDFs) se guardan en **buckets privados de Supabase Storage** con RLS, **nunca** en Cloudinary ni en CDNs públicos.
- El acceso a las notas clínicas se restringe al rol Owner (el asistente NO puede verlas).
- Toda lectura/edición de historia clínica queda registrada en la bitácora de auditoría.

### RF-G: Cumplimiento legal
- Al registrar un paciente, el sistema ofrece generar el **consentimiento informado** en PDF, prellenado con los datos del paciente y la fecha.
- Se versiona la plantilla de consentimiento (si cambia el texto legal, se sabe qué versión firmó cada paciente).
- El profesional puede **exportar** todos los datos de un paciente (JSON/PDF) y **anonimizar/borrar** un expediente cumpliendo el derecho al olvido.

### RF-A: Multi-tenancy
- Cada profesional es un *tenant*. Todos los registros llevan `tenant_id`.
- El aislamiento se garantiza con **Row Level Security** de PostgreSQL: las políticas filtran por el `tenant_id` que viaja en el JWT (custom claim inyectado por un *Auth Hook*).
- El registro de un nuevo profesional crea automáticamente su tenant, su perfil y su página pública (slug).

---

## 7. Requisitos no funcionales

| Atributo | Requisito |
|---|---|
| **Rendimiento** | Carga inicial < 2.5 s en 4G; interacciones < 100 ms percibidas. |
| **Responsive** | Mobile-first. Probado en celular (360px), tablet y escritorio. |
| **Disponibilidad** | Reservas 24/7; objetivo 99.5% (limitado por capa gratuita). |
| **Seguridad** | RLS en todas las tablas, cifrado en reposo (Supabase) y TLS en tránsito, rate limiting en endpoints públicos, validación con Zod. |
| **Privacidad** | Cumplimiento de la Ley 144; datos clínicos sin terceros. |
| **Accesibilidad** | WCAG 2.1 AA en el flujo de reserva público. |
| **i18n** | Español por defecto; arquitectura preparada para más idiomas. |
| **Mantenibilidad** | TypeScript estricto, tests, convenciones de código (ver skills). |

---

## 8. Fuera de alcance del MVP (backlog)

- Telemedicina/videollamada integrada (en MVP: enlace externo Meet/Zoom).
- Pasarela de pago para cobrar la sesión al reservar (MVP: solo registra precio).
- Facturación electrónica **DTE** (queda como fase opcional, aprovechando experiencia de LTSOFT con Facturador SV).
- App móvil nativa (la web responsive cubre el MVP).
- Multi-profesional dentro de un mismo tenant (varios psicólogos en una clínica) — el MVP asume 1 profesional + asistentes.

---

## 9. Métricas de éxito

- Tiempo de onboarding hasta primera cita reservable: **< 10 minutos**.
- % de citas reservadas por el propio paciente (self-service) vs. manuales.
- Tasa de no-show antes/después de activar recordatorios WhatsApp.
- Tenants activos y retención mensual.
