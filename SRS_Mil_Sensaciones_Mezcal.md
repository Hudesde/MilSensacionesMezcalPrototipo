# Especificación de Requerimientos de Software (SRS)
## Plataforma Web Oficial — Mezcal Artesanal "Mil Sensaciones"

- **Estándar de Referencia:** IEEE 830 / ISO/IEC/IEEE 29148
- **Versión:** 1.0
- **Fecha:** 23 de octubre de 2026
- **Cliente / Marca:** Mezcal Mil Sensaciones (El Gramal, Nejapa de Madero, Yautepec, Oaxaca)
- **Maestro Mezcalero:** Damián Olivera Díaz (Segunda Generación; marca en Tercera Generación familiar)
- **Equipo de Desarrollo y Mantenimiento:** Ing. en Computación Jose Ramon Aragon Toledo

---

## 1. Introducción

### 1.1 Propósito del Documento
El presente documento de **Especificación de Requerimientos de Software (SRS)** define de manera formal, completa y verificable todos los requerimientos funcionales, no funcionales, de contenido, diseño, legales y operativos para el desarrollo y lanzamiento de la plataforma web oficial de **Mezcal Mil Sensaciones**, así como la matriz de brechas e información faltante indispensable para completar el levantamiento con el cliente.

### 1.2 Alcance del Producto (Fase 1 vs. Fase 2)
- **Fase 1 (Lanzamiento Inicial - MVP Comercial e Institucional):**
  Sitio web interactivo, bilingüe (Español / Inglés), responsivo y de alto impacto visual que presenta la historia familiar de tres generaciones, el perfil del Maestro Mezcalero Damián Olivera Díaz, el proceso artesanal, las fichas técnicas detalladas de sus expresiones de mezcal (con descarga en PDF), galería visual del palenque, ubicación en Google Maps, canales de contacto directo (WhatsApp Business, formulario por correo, redes sociales) y verificación legal de mayoría de edad (+18).
- **Fase 2 (Visión a Futuro / Evolutivos planeados):**
  - Tienda en línea (E-commerce B2C con pasarela de pagos).
  - Sistema de reservas para catas o tours al palenque en El Gramal.
  - Portal B2B para distribuidores e importadores con precios especiales.
  - Panel de administración (CMS) autogestionable.
  - Blog cultural del mezcal.
  - Integración con marketplaces (Amazon, MercadoLibre) y aplicación móvil.

### 1.3 Público Objetivo y Mercados
- **Perfiles de usuario principales:**
  1. **Consumidor final (+18 años):** Busca mezcal artesanal auténtico con identidad e historia.
  2. **Bares, restaurantes y centros de coctelería (On-Trade):** Buscan fichas técnicas, graduación alcohólica, volumen por lote, perfil sensorial y contacto comercial directo.
  3. **Importadores internacionales (EE. UU.):** Requieren información regulatoria clara (Código NOM-070 / CRM, registro IMPI, capacidad por lote) y navegación 100% en inglés.
  4. **Turistas y visitantes en Oaxaca / México:** Buscan conocer el origen, el palenque y dónde adquirir las botellas.
- **Mercados prioritarios:** Oaxaca (México) y Estados Unidos (exportación/importación).

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del Producto y Referencias Visuales
El sistema es una aplicación web pública ([index.html](file:///home/huesomx/Documentos/GitHub/MilSensacionesMezcal/index.html)) inspirada en la interactividad y narrativa visual de **400 Conejos** (`400conejos.mx`) y **Casa Chagoya** (`casachagoya.com`).
- **Personalidad de marca:** Artesanal y auténtica, tradicional y familiar, sostenible y cercana a la tierra.
- **Paleta cromática:** Tonos naturales (tierra, verde agave, madera, carbón orgánico y acentos dorados/ámbar).
- **Tono de comunicación:** Formal, sofisticado y con trasfondo de herencia familiar.
- **Restricciones de diseño explícitas del cliente:**
  - Prohibido el aspecto de "presentación de PowerPoint" o diseño plano/simple.
  - Prohibidas las animaciones rotas o bruscas.
  - Prohibidas las imágenes sobrepuestas que no se vean integradas orgánicamente con el fondo del sitio.

---

## 3. Requerimientos Funcionales (RF)

| ID | Módulo / Sección | Descripción del Requerimiento | Prioridad | Estado en Prototipo ([index.html](file:///home/huesomx/Documentos/GitHub/MilSensacionesMezcal/index.html)) |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | **Verificación de Edad (+18)** | Al ingresar al sitio, bloquear el scroll y difuminar el contenido mostrando un modal de mayoría de edad legal. Guardar confirmación en `sessionStorage`/`localStorage`. Mostrar mensaje de restricción si el usuario selecciona "No". | Indispensable (Fase 1) | Implementado |
| **RF-02** | **Internacionalización (ES / EN)** | Selector de idioma en la barra de navegación (Desktop y Móvil) que traduzca **el 100% de los textos** de la interfaz, incluyendo fichas de productos, etapas del proceso, placeholders de formularios, botones y avisos legales. | Indispensable (Fase 1) | Parcial (faltan productos, proceso, formulario y móvil) |
| **RF-03** | **Hero / Inicio Impactante** | Encabezado a pantalla completa con video de fondo (del palenque/proceso) o fotografía profesional de alta resolución, animación tipográfica fluida de *"MIL SENSACIONES"*, tagline e indicador de scroll. | Indispensable (Fase 1) | Parcial (usa foto genérica de Unsplash) |
| **RF-04** | **Historia y Valores de la Marca** | Sección narrativa sobre las 3 generaciones (abuelo, padre e hijo), origen en *El Gramal, Nejapa de Madero, Yautepec, Oaxaca*, misión y visión de la marca. | Indispensable (Fase 1) | Parcial (falta integrar Misión y Visión redactadas) |
| **RF-05** | **Perfil del Maestro Mezcalero** | Sección dedicada a **Damián Olivera Díaz** (2.ª generación de maestros mezcaleros), su trayectoria desde la niñez y fotografía real integrada al estilo visual. | Indispensable (Fase 1) | Parcial (usa foto placeholder de Unsplash) |
| **RF-06** | **Fichas Detalladas de Productos** | Mostrar las expresiones: **Mezcal Espadín 750ml** (actual) y próximos lanzamientos (**Ensambles, Mezcal Silvestre, Curados de Mezcal**). Cada ficha debe incluir obligatoriamente los **10 atributos requeridos por el cliente** (ver Sección 3.1). | Indispensable (Fase 1) | Incompleto (faltan 5 atributos y fotos reales de botellas) |
| **RF-07** | **Descarga de Ficha Técnica en PDF** | Botón funcional en cada producto para visualizar/descargar su Ficha Técnica oficial en formato PDF (en español e inglés). | Indispensable (Fase 1) | Pendiente (botón sin acción asignada) |
| **RF-08** | **Proceso de Elaboración** | Explicación interactiva paso a paso del proceso artesanal (Selección/Corte, Cocción en horno cónico de tierra, Molienda, Fermentación natural, Destilación y Envasado) apoyada con fotos o video real del palenque. | Indispensable (Fase 1) | Básico (4 pasos estáticos sin traducción EN ni fotos) |
| **RF-09** | **Galería Multimedia** | Galería visual interactiva (con *lightbox*) que muestre fotografías reales del palenque, campos de maguey en El Gramal, proceso de destilación y video del proceso. | Indispensable (Fase 1) | No implementado |
| **RF-10** | **Dónde Comprar / Ubicación (Google Maps)** | Mapa interactivo o enlace directo real a Google Maps hacia **El Gramal, Nejapa de Madero, Yautepec, Oaxaca**, más lista/mapa de puntos de venta autorizados. | Indispensable (Fase 1) | Pendiente (actualmente es imagen sin enlace) |
| **RF-11** | **Formulario de Contacto con Notificación** | Formulario con validación de campos (Nombre, Correo, Teléfono/Empresa, Tipo de consulta: Consumidor / Bar-Restaurante / Importador, Mensaje) que envíe notificación al correo oficial de la empresa. | Indispensable (Fase 1) | Simulado en frontend (sin envío real a correo) |
| **RF-12** | **Integración con WhatsApp Business** | Botón flotante y enlaces de acción directa (`wa.me`) configurados con el número real de WhatsApp Business de la marca y mensaje prellenado según el producto o sección. | Indispensable (Fase 1) | Parcial (tiene número ficticio `5211234567890`) |
| **RF-13** | **Suscripción a Newsletter** | Campo de captura de correo electrónico para lista de correo / novedades de lotes y lanzamientos. | Indispensable (Fase 1) | No implementado |
| **RF-14** | **Redes Sociales y Botones para Compartir** | Enlaces verificados a Instagram (`@mezcalmilsensaciones`) y Facebook oficial, además de botones para compartir fichas de producto o el sitio en redes sociales (Web Share API / enlaces directos). | Indispensable (Fase 1) | Parcial (faltan botones para compartir) |
| **RF-15** | **Aviso de Privacidad y Cumplimiento Legal** | Modal o página de Aviso de Privacidad conforme a la LFPDPPP (México), Términos de Uso y leyenda sanitaria obligatoria (*"EL ABUSO EN EL CONSUMO DE ESTE PRODUCTO ES NOCIVO PARA LA SALUD / EVITA EL EXCESO"*). | Indispensable (Fase 1) | Parcial (enlace `#` sin contenido legal) |

### 3.1 Detalle Obligatorio de la Ficha de Producto (según Sección 2.4 del Cuestionario)
Cada producto presentado en el sitio debe mostrar estos **10 campos**:
1. **Nombre del producto** (ej. *Mil Sensaciones — Espadín Joven*).
2. **Tipo de agave utilizado** (nombre común y científico, ej. *Agave Angustifolia Haw*, tiempo de maduración).
3. **Maestro Mezcalero** (*Damián Olivera Díaz*).
4. **Región y comunidad de origen** (*El Gramal, Nejapa de Madero, Yautepec, Oaxaca*).
5. **Proceso de elaboración** (tipo de cocción, molienda, fermentación, tipo de alambique y número de destilaciones).
6. **Graduación alcohólica** (`% Alc. Vol.` real por lote).
7. **Notas de cata** (vista, aromas en nariz y sabores en boca).
8. **Presentaciones disponibles** (`750 ml` u otras capacidades).
9. **Cantidad de botellas por lote** (ej. *Edición de X botellas por lote*).
10. **Código NOM / Certificación CRM** (NOM-070-SCFI-2016).

---

## 4. Requerimientos No Funcionales (RNF)

- **RNF-01 Rendimiento y Fluidez Visual:** Las animaciones deben ejecutarse a 60 FPS utilizando aceleración por hardware (`transform`, `opacity`) e `IntersectionObserver`, evitando bloqueos del hilo principal. Tiempo de carga inicial (LCP) menor a 2.5 segundos en conexiones 4G.
- **RNF-02 Diseño Responsivo (Mobile-First):** Adaptación completa a teléfonos móviles (320px - 767px), tablets (768px - 1023px) y pantallas de escritorio (1024px+), incluyendo el selector de idioma y menú móvil accesible.
- **RNF-03 Optimización Multimedia:** Imágenes en formato `WebP`/`AVIF` con recorte transparente (PNG/WebP sin fondo para botellas) para garantizar integración visual perfecta, y carga diferida (`loading="lazy"`).
- **RNF-04 SEO y Metadatos (Open Graph):** Etiquetas `<meta>` bilingües, `og:title`, `og:description`, `og:image` y datos estructurados (`Schema.org/Product` y `Schema.org/Organization`) para previsualización óptima al compartir en WhatsApp, Instagram y Facebook.
- **RNF-05 Mantenibilidad:** Código estructurado y documentado para que el equipo de desarrollo (*Ing. en Computación Jose Ramon Aragon Toledo*) pueda actualizar lotes, productos y textos rápidamente sin necesidad de un CMS complejo en Fase 1.

---

## 5. Checklist de Levantamiento: Información y Activos Pendientes de Solicitar al Cliente

A pesar de que el cuestionario inicial ([Cuestionario_Mezcal_Fercho 2.docx](file:///home/huesomx/Documentos/GitHub/MilSensacionesMezcal/Cuestionario_Mezcal_Fercho%202.docx)) indica que el cliente **ya cuenta** con varios elementos de marca y producto, **aún no han sido entregados como archivos o datos específicos**. Esta es la lista indispensable que debes solicitarle para cerrar el levantamiento:

### 5.1 Identidad Corporativa y Textos Faltantes
- [ ] **Archivo del Logo oficial:** En formato vectorial (`.SVG`, `.AI`, `.EPS`) o `.PNG` en alta resolución con fondo transparente.
- [ ] **Manual de marca o códigos de color exactos (HEX/RGB):** Confirmar los colores seleccionados en el punto 1.7.
- [ ] **Slogan / Tagline oficial:** El cliente marcó en el punto 1.7 que ya tiene slogan redactado, pero no escribió cuál es.
- [ ] **Misión y Visión:** El cliente marcó en los puntos 1.7 y 8.1 que ya las tiene redactadas; solicitar el documento de texto.
- [ ] **Número de Registro IMPI y Código NOM-070 / CRM:** Confirmar el número exacto de NOM para mostrarlo en las fichas técnicas y en el pie de página.

### 5.2 Datos Técnicos de los Productos (Fichas Técnicas)
- [ ] **Fichas técnicas existentes (punto 8.1):** Solicitar los archivos o datos exactos de:
  1. **Mezcal Espadín 750 ml (Lanzamiento actual):** % Alc. Vol. exacto, notas de cata reales, cantidad de botellas del lote actual, tipo de molienda y destilación.
  2. **Próximos lanzamientos (Ensambles, Silvestre, Curados):** Confirmar cuáles magueyes conforman el Ensamble y el Silvestre, qué sabores de Curados tendrán, y si deben mostrarse con etiqueta *"Próximamente / Coming Soon"* o con ficha completa.

### 5.3 Material Fotográfico y Audiovisual
- [ ] **Fotografías de las botellas:** Programar o recopilar las fotos con cámara profesional (punto 2.5 y 8.3) en buena iluminación para recortar el fondo e integrarlas al diseño tipo *400 Conejos*.
- [ ] **Fotografías del palenque y proceso (punto 8.1):** Solicitar la carpeta de fotos que ya tienen tomadas.
- [ ] **Video del proceso de elaboración (punto 8.1):** Solicitar el archivo de video para integrarlo en el Hero y/o en la sección de Proceso.
- [ ] **Fotografía del Maestro Mezcalero Damián Olivera Díaz:** Para reemplazar el placeholder actual.

### 5.4 Datos de Contacto y Operación Comercial
- [ ] **Número de WhatsApp Business oficial:** Para reemplazar el número temporal `5211234567890`.
- [ ] **Correo electrónico oficial de la empresa:** Donde llegarán las notificaciones del formulario de contacto (ej. confirmar si es `contacto@milsensaciones.com` u otro).
- [ ] **Coordenadas o Pin exacto de Google Maps:** Del palenque en *El Gramal, Nejapa de Madero* y/o lista de puntos de venta físicos en Oaxaca donde ya se puede comprar la botella.
- [ ] **Razón social o nombre del titular y domicilio fiscal:** Para redactar el **Aviso de Privacidad** obligatorio.
