# Especificación de Requerimientos de Software (SRS)
## Plataforma Web Oficial — Mezcal Artesanal "Mil Sensaciones"

- **Estándar de Referencia:** IEEE 830 / ISO/IEC/IEEE 29148
- **Versión:** 1.1
- **Fecha:** 23 de octubre de 2026 (revisión 1.1: 26 de octubre de 2026)
- **Documento relacionado:** Plan de Desarrollo Técnico y Presupuesto: $6,000.00 MXN a 6 semanas ($1,500.00 de infraestructura y $4,500.00 de honorarios)
- **Cliente / Marca:** Mezcal Mil Sensaciones (El Gramal, Nejapa de Madero, Yautepec, Oaxaca)
- **Maestro Mezcalero:** Damián Olivera Díaz (Segunda Generación; marca en Tercera Generación familiar)
- **Equipo de Desarrollo y Mantenimiento:** Ing. en Computación Jose Ramon Aragon Toledo

> Este archivo resume el SRS. La versión completa, con el registro del cuestionario y los formularios de llenado, está en [SRS_Mil_Sensaciones_Mezcal.pdf](SRS_Mil_Sensaciones_Mezcal.pdf).

### Historial de Cambios

| Versión | Fecha | Descripción del cambio |
| :--- | :--- | :--- |
| 1.0 | 23/10/2026 | Emisión inicial: SRS del sitio institucional y registro del cuestionario de levantamiento. |
| 1.1 | 26/10/2026 | Alineación con el Plan de Desarrollo y Presupuesto ($6,000.00 MXN a 6 semanas). Se agregan los módulos comerciales (RF-16 a RF-25), la arquitectura en Go, la matriz de roles, los criterios de aceptación, el alcance excluido, los supuestos, nuevos RNF y el estado real del prototipo. |

---

## 1. Introducción

### 1.1 Propósito del Documento
Este documento define de manera formal, completa y verificable los requerimientos funcionales, no funcionales, de contenido, diseño, legales y operativos de la plataforma web oficial de **Mezcal Mil Sensaciones**. Junto con el Plan de Desarrollo y Presupuesto, es la referencia técnica para aceptar cada entrega.

### 1.2 Alcance del Producto (Fase 1 vs. Fase 2)

**Fase 1: lanzamiento contratado (6 semanas, incluido en el presupuesto de $6,000.00 MXN)**
- **Bloque A. Sitio institucional y de marca:** sitio interactivo, bilingüe (Español / Inglés) y responsivo con la historia de tres generaciones, el perfil del Maestro Mezcalero, el proceso artesanal, fichas técnicas con PDF, galería, Google Maps, contacto, verificación +18 y apartados legales (RF-01 a RF-15).
- **Bloque B. Plataforma comercial y de gestión:** carrito, pedidos con cierre por WhatsApp, cuentas con tres roles, dashboard administrativo, punto de venta (POS), seguimiento de pedidos, chatbot de WhatsApp, chat en vivo y correos transaccionales (RF-16 a RF-25).

**Fase 2: evolutivos futuros (fuera del presupuesto actual, se cotizan por separado)**
- Pasarela de pago en línea (tarjeta, OXXO o SPEI automatizado).
- Facturación electrónica (CFDI 4.0).
- Integración automática con paqueterías por API.
- Reservas para catas o tours al palenque en El Gramal.
- Portal B2B para distribuidores e importadores con precios especiales.
- Gestor de contenido editorial (CMS) para editar textos e imágenes sin programador.
- Blog cultural del mezcal e integración con publicaciones de Instagram.
- Integración con marketplaces (Amazon, MercadoLibre) y aplicación móvil nativa.

### 1.3 Exclusiones Explícitas de la Fase 1
- **Cobro en línea dentro del sitio.** El pago se cierra por WhatsApp con transferencia, depósito o efectivo, y el Administrador lo confirma manualmente.
- **Venta directa a consumidores en EE. UU.** El sitio informa y capta importadores. La venta en EE. UU. requiere un importador autorizado.
- **Modo sin conexión del POS** e insumos de hardware (impresoras, lectores, terminales bancarias).
- **Inteligencia artificial conversacional.** El chatbot funciona con menús y palabras clave.
- **Producción fotográfica o de video profesional.** El cliente entrega el material. El equipo solo genera los loops de botellas con IA.
- **Validación jurídica de los textos legales.** Se recomienda la revisión de un abogado.
- **Costos recurrentes posteriores al mes 7** (servidor, renovación de dominio y mensajes de WhatsApp), a cargo del cliente.

### 1.4 Público Objetivo y Mercados
1. **Consumidor final (+18 años):** busca mezcal artesanal auténtico con identidad e historia.
2. **Bares, restaurantes y coctelería (On-Trade):** buscan fichas técnicas, graduación, volumen por lote, perfil sensorial y contacto comercial.
3. **Importadores internacionales (EE. UU.):** requieren información regulatoria (NOM-070 / CRM, IMPI, capacidad por lote) y navegación 100% en inglés.
4. **Turistas y visitantes en Oaxaca / México:** buscan conocer el origen, el palenque y dónde comprar.

**Mercados prioritarios:** Oaxaca (México) y Estados Unidos.

### 1.5 Definiciones y Acrónimos

| Término | Significado |
| :--- | :--- |
| NOM-070-SCFI-2016 | Norma Oficial Mexicana del mezcal: especificaciones y etiquetado. |
| CRM | Consejo Regulador del Mezcal: certifica el mezcal y emite los marbetes. |
| IMPI | Instituto Mexicano de la Propiedad Industrial. |
| LFPDPPP | Ley Federal de Protección de Datos Personales en Posesión de los Particulares. |
| LFPC | Ley Federal de Protección al Consumidor. |
| POS | Punto de Venta para ventas presenciales. |
| Folio | Identificador único de pedido, por ejemplo `MS-2026-0001`. |
| Go | Lenguaje del backend, compilado como un solo binario. |
| JWT / Argon2id | Token de sesión firmado / algoritmo para almacenar contraseñas. |
| LCP / INP / CLS | Métricas de rendimiento web: carga, respuesta y estabilidad visual. |

### 1.6 Supuestos y Dependencias
- El cliente entrega los contenidos pendientes (Sección 5) a más tardar al final de la semana 2. Si se retrasan, se publica contenido provisional marcado y el retraso no se imputa al equipo.
- El cliente aporta un número telefónico dedicado a la WhatsApp Business Platform, que no puede estar activo en la app de WhatsApp.
- El titular completa la verificación de su empresa en Meta Business.
- El dominio, las cuentas de servicios y los datos quedan a nombre del cliente.
- El cliente aporta una tableta o teléfono con internet para el POS.
- El cliente revisa cada entrega quincenal en un máximo de 3 días hábiles. Sin observaciones, la entrega se considera aceptada.

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del Producto y Referencias Visuales
Aplicación web con **9 páginas públicas** ([index.html](index.html), [historia.html](historia.html), [proceso.html](proceso.html), [mezcales.html](mezcales.html), [contacto.html](contacto.html) y una página por cada expresión) y **2 privadas** ([login.html](login.html) y [dashboard.html](dashboard.html)), conectadas a un backend propio. Inspirada en **400 Conejos** (`400conejos.mx`) y **Casa Chagoya** (`casachagoya.com`).
- **Personalidad de marca:** artesanal y auténtica, tradicional y familiar, sostenible y cercana a la tierra.
- **Paleta cromática:** tonos naturales (tierra, verde agave, madera, carbón y acentos ámbar), elegida en la pregunta 4.5.
- **Tono de comunicación propuesto:** formal y sofisticado, pendiente de confirmar en la pregunta 4.6.
- **Restricciones del cliente:** nada con aspecto de "presentación de PowerPoint", sin animaciones rotas o bruscas y sin imágenes que no se integren con el fondo.

### 2.2 Usuarios, Roles y Permisos
Los permisos se validan en el servidor, no solo en la interfaz.

| Función | Visitante | Cliente | Vendedor POS | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| Navegar el sitio, fichas, galería y descargar PDF | ✔ | ✔ | ✔ | ✔ |
| Usar el carrito y enviar un pedido | ✔ | ✔ | — | — |
| Consultar seguimiento con el enlace del correo | ✔ | ✔ | — | ✔ |
| Ver historial de pedidos propios | — | ✔ | — | — |
| Usar el chat en vivo como visitante | ✔ | ✔ | — | — |
| Responder chats desde el dashboard | — | — | ✔ | ✔ |
| Registrar ventas presenciales en el POS | — | — | ✔ | ✔ |
| Confirmar pagos y cambiar estados de pedidos | — | — | — | ✔ |
| Gestionar productos, precios, lotes e inventario | — | — | — | ✔ |
| Ver métricas y exportar reportes | — | — | — | ✔ |
| Crear usuarios Vendedor POS y Administrador | — | — | — | ✔ |

### 2.3 Arquitectura y Stack Tecnológico

| Capa | Tecnología y función |
| :--- | :--- |
| Frontend | HTML5, Tailwind CSS compilado para producción y JavaScript nativo, a partir del prototipo. |
| Backend | API REST en **Go**, compilada como un solo binario. Incluye el webhook de WhatsApp y el WebSocket del chat. |
| Base de datos | PostgreSQL en el mismo servidor, con migraciones versionadas. |
| Servidor web y HTTPS | Caddy con certificados Let's Encrypt automáticos. |
| Hospedaje | VPS Vultr en la Ciudad de México: 1 vCPU, 1 GB RAM, 25 GB SSD. |
| DNS, CDN y protección | Cloudflare, plan gratuito. |
| Archivos | Cloudflare R2 para videos, fichas PDF y respaldos diarios. |
| Correo | Resend para enviar y Cloudflare Email Routing para recibir `contacto@` y `ventas@`. |
| WhatsApp | WhatsApp Business Platform (Cloud API oficial de Meta). |

### 2.4 Restricciones Operativas y de Capacidad
- **Correos:** Resend gratuito permite 3,000 correos al mes y 100 al día. Un boletín para más de 100 suscriptores se envía en varios días o requiere el plan Pro de US$20.00 al mes.
- **Archivos:** R2 gratuito ofrece 10 GB. Los videos se publican optimizados a 720p.
- **Servidor:** si el uso de CPU o RAM supera el 80% de forma sostenida, se recomienda escalar al plan de 2 GB.
- **WhatsApp:** 1,000 mensajes de servicio gratis al mes. Los adicionales y las plantillas de marketing tienen costo, a cargo del cliente.

---

## 3. Requerimientos Funcionales (RF)

Todos son **Indispensables para la Fase 1**. El estado refleja la revisión del código del prototipo del 26 de octubre de 2026. "Simulado" significa que la interfaz existe pero no guarda ni envía datos reales.

### Bloque A. Sitio institucional y de marca

| ID | Módulo | Descripción | Estado en Prototipo |
| :--- | :--- | :--- | :--- |
| **RF-01** | Verificación de Edad (+18) | Modal que bloquea y difumina el sitio hasta confirmar la mayoría de edad. Guarda la confirmación y muestra restricción si responde "No". | Implementado |
| **RF-02** | Internacionalización (ES / EN) | Traducción del 100% de los textos públicos, incluidos fichas, formularios, correos al cliente y avisos legales. El dashboard y el POS son internos y solo en español. | Parcial: 5 páginas traducidas; faltan las 4 páginas de producto |
| **RF-03** | Hero / Inicio | Pantalla completa con video de fondo o loop de botella con IA, animación de *"MIL SENSACIONES"*, tagline e indicador de scroll. | Parcial: faltan loops de botella y tagline oficial |
| **RF-04** | Historia y Valores | Tres generaciones, origen en El Gramal, misión y visión. | Parcial: falta Misión y Visión |
| **RF-05** | Maestro Mezcalero | Perfil de Damián Olivera Díaz con fotografía real. | Parcial: foto de Instagram; falta alta resolución |
| **RF-06** | Fichas de Productos | Página por expresión (Espadín, Ensamble, Silvestre, Curados) con los 10 atributos de la Sección 3.2 o la etiqueta "Próximamente". | Parcial: datos provisionales |
| **RF-07** | Ficha Técnica PDF | Descarga del PDF oficial en español e inglés. | Parcial: solo impresión desde el navegador |
| **RF-08** | Proceso de Elaboración | Explicación interactiva del proceso con fotos o video real. | Implementado; validar textos |
| **RF-09** | Galería Multimedia | Galería con *lightbox* de fotos y videos del palenque. | Implementado |
| **RF-10** | Google Maps | Mapa con el pin exacto del palenque y lista de puntos de venta. | Parcial: faltan pin y puntos de venta |
| **RF-11** | Formulario de Contacto | Validación de campos, guardado y envío a `contacto@`. | Simulado |
| **RF-12** | Enlaces a WhatsApp | Botón flotante y enlaces `wa.me` con el número real y mensaje prellenado. | Parcial: número ficticio `5219510000000` |
| **RF-13** | Newsletter | Suscripción con doble confirmación y enlace de baja. | Simulado |
| **RF-14** | Redes y Compartir | Enlaces a Instagram y Facebook, y botones para compartir. | Implementado; faltan en páginas de producto |
| **RF-15** | Legal | Aviso de Privacidad (LFPDPPP), Términos y Condiciones de Venta (LFPC), aviso de cookies y leyenda sanitaria en todas las páginas públicas. | Parcial: aviso solo en inicio; faltan Términos |

### Bloque B. Plataforma comercial y de gestión

| ID | Módulo | Descripción | Estado en Prototipo |
| :--- | :--- | :--- | :--- |
| **RF-16** | Carrito Slidebar | Agregar, cambiar cantidades, eliminar y ver totales en MXN. Persiste al recargar y se asocia a la cuenta. | Parcial: las páginas de producto cargan el carrito desde una ruta local `/tmp` que fallará en producción |
| **RF-17** | Pedido y Cierre por WhatsApp | Captura de datos de envío, folio único, estado *Orden Recibida*, correo de confirmación y apertura de WhatsApp con el resumen. | No implementado |
| **RF-18** | Cuentas de Usuario | Registro, verificación de correo, confirmación +18, sesión y recuperación de contraseña con enlace temporal. | Simulado: credenciales fijas en `login.html` |
| **RF-19** | Control de Acceso por Rol | Aplica la matriz de la Sección 2.2. El rol lo asigna el Administrador. | Simulado: el rol se elige en un selector |
| **RF-20** | Dashboard Administrativo | Productos y precios, lotes (agave, fecha, kilos de maguey en horno, % Alc. Vol., botellas, marbetes CRM), inventario, pedidos, clientes, métricas y exportación CSV. | Simulado: datos de ejemplo |
| **RF-21** | Punto de Venta (POS) | Venta presencial táctil con método de pago, descuento de inventario del lote y ticket digital. | Simulado |
| **RF-22** | Seguimiento de Pedidos | Estados *Orden Recibida, Pago Confirmado, En Empaque Artesanal, En Tránsito, Entregado* o *Cancelado*, con guía de paquetería, correo en cada cambio y vínculo al lote. | No implementado |
| **RF-23** | Chatbot de WhatsApp | Menú 24/7: catálogo y precios, mayoreo, importadores, estado por folio y atención humana. | No implementado |
| **RF-24** | Chat en Vivo | Ventana flotante en tiempo real con bandeja e historial en el dashboard. Si nadie está conectado, notifica por correo. | No implementado |
| **RF-25** | Correos Transaccionales | Bienvenida, verificación, recuperación, confirmación de pedido, cambio de estado, ticket POS y boletín, con SPF, DKIM y DMARC. | No implementado |

### 3.1 Criterios de Aceptación

| ID | Criterio verificable en producción |
| :--- | :--- |
| RF-01 | El modal aparece la primera vez. Con "No" sigue bloqueado. Con "Sí" no vuelve a aparecer en ese navegador. |
| RF-02 | En inglés, ningún texto visible de las 9 páginas públicas queda en español, y el idioma se conserva al navegar. |
| RF-03 | El hero carga sin saltos visibles y el video se repite sin cortes y sin audio. |
| RF-04 / RF-05 | Se muestran los textos y fotos oficiales del cliente, sin imágenes de relleno. |
| RF-06 | Las 4 fichas muestran los 10 atributos confirmados por escrito por el cliente. |
| RF-07 | Cada ficha descarga un PDF en el idioma activo con los 10 atributos y el logo. |
| RF-08 / RF-09 | El *lightbox* abre fotos y videos y se cierra con Esc o un toque fuera. |
| RF-10 | El mapa abre el pin exacto y la lista de puntos de venta coincide con la del cliente. |
| RF-11 | Un envío de prueba llega a `contacto@` en menos de 2 minutos y queda guardado. |
| RF-12 | Todos los enlaces abren WhatsApp con el número oficial y mensaje acorde a la página. |
| RF-13 | La suscripción requiere confirmación y el enlace de baja elimina el correo de la lista. |
| RF-14 | Los íconos abren los perfiles oficiales y compartir funciona en Android, iOS y escritorio. |
| RF-15 | Las 9 páginas públicas enlazan Privacidad y Términos, y muestran la leyenda sanitaria. |
| RF-16 | El carrito conserva productos al recargar y el total es correcto. |
| RF-17 | Un pedido de prueba genera folio, aparece en el dashboard, envía correo y abre WhatsApp. |
| RF-18 | Un usuario se registra, verifica su correo, inicia sesión y recupera su contraseña. Un enlace usado o vencido es rechazado. |
| RF-19 | Un Cliente o Vendedor que abre una función de Administrador recibe error de acceso, aun escribiendo la dirección. |
| RF-20 | Un producto o lote creado en el dashboard aparece en el sitio sin tocar código, y el inventario cuadra con las ventas. |
| RF-21 | Una venta en el POS descuenta inventario, emite ticket y aparece en las métricas del día. |
| RF-22 | Cada cambio de estado envía correo y se refleja en la cuenta y en el enlace de seguimiento. |
| RF-23 | Cada opción del menú responde desde un teléfono externo y la consulta por folio devuelve el estado real. |
| RF-24 | Un mensaje del sitio llega a la bandeja en menos de 3 segundos y la respuesta llega al visitante. |
| RF-25 | Los correos llegan a la bandeja principal de Gmail y Outlook y pasan SPF, DKIM y DMARC. |

### 3.2 Detalle Obligatorio de la Ficha de Producto (10 Atributos)
1. **Nombre del producto** (ej. *Mil Sensaciones — Espadín Joven*).
2. **Tipo de agave** (nombre común y científico, tiempo de maduración).
3. **Maestro Mezcalero** (*Damián Olivera Díaz*).
4. **Región y comunidad de origen** (*El Gramal, Nejapa de Madero, Yautepec, Oaxaca*).
5. **Proceso de elaboración** (cocción, molienda, fermentación, alambique y número de destilaciones).
6. **Graduación alcohólica** (`% Alc. Vol.` real por lote).
7. **Notas de cata** (vista, nariz y boca).
8. **Presentaciones disponibles** (`750 ml` u otras).
9. **Cantidad de botellas por lote.**
10. **Código NOM / Certificación CRM** (NOM-070-SCFI-2016).

**Importante:** los valores actuales del prototipo (45%, 47%, 48% y 38% Alc. Vol., micro-lote de 300 botellas, notas de cata y maridajes) son **provisionales** hasta que el cliente los confirme.

---

## 4. Requerimientos No Funcionales (RNF)

- **RNF-01 Rendimiento:** en móvil 4G, LCP menor a 2.5 s, INP menor a 200 ms y CLS menor a 0.1, medidos con PageSpeed Insights. Animaciones a 60 FPS. La API responde en menos de 300 ms en el 95% de los casos.
- **RNF-02 Diseño Responsivo:** teléfonos (320–767 px), tabletas (768–1023 px) y escritorio (1024 px o más), incluidos carrito, chat y POS.
- **RNF-03 Multimedia:** imágenes WebP/AVIF con carga diferida. Botellas sin fondo o en loop 720p sin audio sobre el color del sitio. Cada loop pesa 5 MB como máximo.
- **RNF-04 SEO:** metadatos y Open Graph bilingües, Schema.org de producto y organización, `sitemap.xml`, `robots.txt` y `hreflang`.
- **RNF-05 Mantenibilidad:** productos, precios y lotes se editan desde el dashboard. Los textos institucionales los actualiza el equipo de desarrollo. Incluye migraciones versionadas, pruebas automáticas de registro, pedido e inventario, y manual de despliegue.
- **RNF-06 Seguridad:** HTTPS con HSTS, Argon2id, JWT en cookie `HttpOnly`/`Secure`/`SameSite`, bloqueo tras 5 intentos fallidos en 15 minutos, validación en servidor, consultas parametrizadas y OWASP Top 10. Se eliminan las credenciales de prueba antes del lanzamiento.
- **RNF-07 Disponibilidad y Respaldos:** 99.5% mensual, respaldo diario en R2 con retención de 30 días, pérdida máxima de 24 horas, restauración en menos de 4 horas y prueba de restauración antes del lanzamiento.
- **RNF-08 Privacidad:** datos mínimos, alojados en México, correo para derechos ARCO y solo cookies técnicas sin consentimiento.
- **RNF-09 Compatibilidad:** últimas dos versiones de Chrome, Safari iOS, Firefox, Edge y Samsung Internet.
- **RNF-10 Accesibilidad:** contraste AA de WCAG 2.2, navegación con teclado, texto alternativo y respeto a `prefers-reduced-motion`.
- **RNF-11 Bebidas Alcohólicas:** verificación +18 al entrar, al crear cuenta y al pedir. Leyenda sanitaria en todas las páginas públicas y NOM/CRM visibles en cada ficha.

---

## 5. Checklist de Información y Activos Pendientes del Cliente

El cuestionario ([Cuestionario_Mezcal_Fercho 2.docx](Cuestionario_Mezcal_Fercho%202.docx)) indica que el cliente **ya cuenta** con varios elementos, pero aún no los ha entregado.

### 5.1 Identidad Corporativa y Textos
- [ ] **Logo oficial** en `.SVG`, `.AI`, `.EPS` o `.PNG` sin fondo.
- [ ] **Códigos de color exactos (HEX/RGB)** o manual de marca.
- [ ] **Slogan / tagline oficial.**
- [ ] **Misión y Visión** en texto.
- [ ] **Registro IMPI y código NOM-070 / CRM.**
- [ ] **Tono de comunicación** (pregunta 4.6) y **perfil del cliente ideal** (pregunta 5.4).

### 5.2 Datos Técnicos de los Productos
- [ ] **Espadín 750 ml:** % Alc. Vol., notas de cata, botellas del lote, molienda y destilación.
- [ ] **Ensamble, Silvestre y Curados:** magueyes, sabores y si se muestran con ficha completa o como "Próximamente".

### 5.3 Material Fotográfico y Audiovisual
- [ ] Fotografías de botellas bien iluminadas.
- [ ] Fotografías del palenque y del proceso.
- [ ] Video del proceso de elaboración.
- [ ] Fotografía oficial del Maestro Damián Olivera Díaz.

### 5.4 Contacto y Datos Legales
- [ ] Número de WhatsApp oficial para los enlaces `wa.me`.
- [ ] Correo oficial para el formulario (confirmar `contacto@milsensaciones.com`).
- [ ] Pin exacto de Google Maps y lista de puntos de venta.
- [ ] Razón social y domicilio para el Aviso de Privacidad.

### 5.5 Decisiones Comerciales para la Plataforma de Ventas
- [ ] Precio al público por botella de cada expresión (MXN, IVA incluido).
- [ ] Precio de mayoreo y cantidad mínima.
- [ ] Formas de pago de la Fase 1 y confirmación de que no habrá cobro en línea.
- [ ] Zonas de envío, paquetería y costo de envío.
- [ ] Política de devoluciones por daño en transporte.
- [ ] Nombres y correos de Administradores y Vendedores POS.
- [ ] Horario de atención humana para chat y WhatsApp.
- [ ] Número telefónico dedicado a la API de WhatsApp.
- [ ] Necesidad de factura CFDI (Fase 2).
- [ ] Periodo de garantía y esquema de mantenimiento posterior a la entrega.
