---
name: seo-blog-marketing
description: >
  Usar al trabajar en el blog profesional, la página pública del consultorio, SEO,
  metadatos, sitemap, datos estructurados (JSON-LD), rendimiento web, o copys de
  marketing. Disparar ante: blog, artículo, SEO, posicionamiento, meta, Open Graph,
  JSON-LD, sitemap, slug, Core Web Vitals, landing, FAQ pública, redes sociales.
---

# SEO, blog y marketing

Objetivo: que las psicólogas **aparezcan en Google** y se vean profesionales. La página pública y el blog son su carta de presentación.

## Blog profesional
- Editor visual **TipTap** con imagen destacada (vía **Cloudinary**, activo público), categorías y etiquetas.
- Borradores y publicación programada.
- Cada artículo tiene **slug amigable** (`/c/{tenant}/blog/{slug}`), título, extracto, imagen destacada, fecha, autor.
- Contenido en español de El Salvador; tono cercano pero profesional.

## SEO técnico
- **Meta** por página: title (< 60 car.), description (< 160 car.), canonical.
- **Open Graph / Twitter Card** para que se vea bien al compartir en redes/WhatsApp.
- **Sitemap.xml** generado (incluye páginas públicas de cada tenant y artículos).
- **robots.txt** correcto.
- URLs limpias y estables; redirecciones si cambia un slug.

## Datos estructurados (JSON-LD)
- Página del consultorio: schema `Physician` / `MedicalBusiness` / `LocalBusiness` con nombre, dirección (departamento/municipio SV), teléfono +503, horarios.
- Artículos: schema `Article` / `BlogPosting`.
- FAQ pública: schema `FAQPage` (mejora la presentación en resultados).

```html
<!-- ejemplo JSON-LD del consultorio -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Physician",
  "name": "Lic. ...",
  "medicalSpecialty": "Psychology",
  "telephone": "+503-...",
  "areaServed": "El Salvador"
}
</script>
```

## Rendimiento (Core Web Vitals)
- Imágenes optimizadas (Cloudinary `f_auto,q_auto`, tamaños responsive, `loading="lazy"`).
- Evitar JS innecesario en páginas públicas; priorizar contenido.
- Buen LCP (imagen/héroe optimizado), CLS bajo (reservar espacio de imágenes), INP ágil.

## Página pública del consultorio
- Hero claro (quién es, qué ofrece, CTA de reserva), servicios con precios US$, especialidades, bio, FAQ, botón WhatsApp (+503), enlaces a redes, CTA de reserva visible.
- Mobile-first impecable (la mayoría llega desde el celular).

## Gotchas
- Cada tenant tiene su propio SEO: títulos/descripciones por consultorio, no genéricos.
- No indexar el panel privado (`noindex` en rutas `/panel`).
- Las imágenes del blog son públicas (Cloudinary); jamás mezclar con adjuntos clínicos.
- Contenido de salud: cuidar afirmaciones; evitar promesas terapéuticas que generen problemas.
