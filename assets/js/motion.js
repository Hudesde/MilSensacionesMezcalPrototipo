/**
 * Mezcal Artesanal "Mil Sensaciones" — Arquitectura de Movimiento Editorial (GSAP + ScrollTrigger + SplitText + Flip + Lenis)
 * Desarrollado por: Ing. en Computación Jose Ramon Aragon Toledo
 *
 * Filosofía de diseño:
 *  - Las animaciones NO saturan todo el sitio indiscriminadamente; cada una tiene su propio momento y lugar exclusivo:
 *    1. Scroll Suave con Inercia (Lenis + GSAP Ticker) en páginas públicas.
 *    2. Entrada Teatral Tipográfica (GSAP SplitText) en el Hero y encabezados principales.
 *    3. Momento Exclusivo 3D ("[data-journey]" en proceso.html): Escenario sticky donde la escultura de partículas
 *       se transforma paso a paso a través de las 7 etapas ("Del Maguey a la Copa") sincronizada con GSAP ScrollTrigger.
 *    4. Galerías Conectadas:
 *       - En index.html: Carrete Horizontal Cinemático (Filmstrip Scrollytelling) que une Campo → Horno → Botellas → Convención.
 *       - En proceso.html: Galería Multimedia conectada a las etapas del proceso con transiciones fluidas GSAP Flip y deep-linking (?filter=...).
 *       - En páginas de botellas (mezcal-*.html): Transición GSAP suave entre miniaturas de primer plano y puente hacia la galería general.
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', () => {
        const hasGSAP = typeof window.gsap !== 'undefined';
        const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
        const hasSplitText = typeof window.SplitText !== 'undefined';
        const hasFlip = typeof window.Flip !== 'undefined';
        const hasLenis = typeof window.Lenis !== 'undefined';

        if (hasGSAP && hasScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
        }
        if (hasGSAP && hasSplitText) {
            window.gsap.registerPlugin(window.SplitText);
        }
        if (hasGSAP && hasFlip) {
            window.gsap.registerPlugin(window.Flip);
        }

        // =====================================================================
        // 1. LENIS SMOOTH INERTIA SCROLL (Sincronizado con GSAP ScrollTrigger)
        // =====================================================================
        let lenis = null;
        const isDashboard = window.location.pathname.endsWith('dashboard.html');

        if (hasLenis && !prefersReducedMotion && !isDashboard) {
            lenis = new window.Lenis({
                lerp: 0.085,
                smoothWheel: true,
                wheelMultiplier: 0.95
            });
            window.__mezcalLenis = lenis;

            if (hasGSAP && hasScrollTrigger) {
                lenis.on('scroll', window.ScrollTrigger.update);
                window.gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                window.gsap.ticker.lagSmoothing(0);
            } else {
                const raf = (time) => {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                };
                requestAnimationFrame(raf);
            }

            // Si el modal +18 está bloqueando el body al inicio, pausar Lenis hasta que se desbloquee
            if (document.body.classList.contains('locked')) {
                lenis.stop();
            }
            const btnYes = document.getElementById('btn-yes');
            if (btnYes) {
                btnYes.addEventListener('click', () => {
                    setTimeout(() => lenis.start(), 150);
                });
            }
        }

        // =====================================================================
        // 2. MOMENTO EN PROCESO.HTML: GUÍA SCROLLYTELLING "DEL MAGUEY A LA COPA"
        //    (Nota: Las animaciones con partículas 3D MezcalParticleStage han sido
        //    desactivadas y comentadas por rendimiento para asegurar fluidez y bajo consumo).
        // =====================================================================
        const journeySection = document.querySelector('[data-journey]');
        const journeyCanvas = document.getElementById('journey-particle-canvas');

        if (journeySection) {
            /* =================================================================
             * CONFIGURACIÓN Y MOTOR DE PARTÍCULAS 3D (DESACTIVADO POR RENDIMIENTO)
             * Para reactivar: descomentar este bloque, el script particles-stage.js
             * y el elemento canvas en proceso.html
             * =================================================================
            const DESKTOP_PANELS = [
                { pose: 0, x: 0.0, y:  0.02, scale: 1.24, rx: 0.18, ry: -0.26, rz: -0.06, spin: 0.14, alpha: 0.96 }, // 01 Jima (Maguey)
                { pose: 1, x: 0.0, y:  0.04, scale: 1.22, rx: 0.24, ry:  0.28, rz: -0.08, spin: 0.12, alpha: 0.96 }, // 02 Cocción (Horno)
                { pose: 2, x: 0.0, y:  0.02, scale: 1.20, rx: 0.28, ry: -0.22, rz:  0.05, spin: 0.10, alpha: 0.96 }, // 03 Molienda (Tahona)
                { pose: 3, x: 0.0, y:  0.00, scale: 1.22, rx: 0.20, ry:  0.20, rz:  0.00, spin: 0.11, alpha: 0.96 }, // 04 Fermentación (Tina)
                { pose: 4, x: 0.0, y:  0.00, scale: 1.22, rx: 0.22, ry: -0.24, rz:  0.06, spin: 0.12, alpha: 0.96 }, // 05 Destilación (Alambique)
                { pose: 5, x: 0.0, y:  0.00, scale: 1.26, rx: 0.12, ry: -0.18, rz:  0.04, spin: 0.15, alpha: 0.98 }, // 06 Envasado (Botella 750ml)
                { pose: 6, x: 0.0, y:  0.04, scale: 1.24, rx: 0.26, ry:  0.00, rz:  0.00, spin: 0.10, alpha: 0.96 }  // 07 Copa Servida (Veladora)
            ];

            const MOBILE_PANELS = DESKTOP_PANELS.map((p) => ({
                ...p,
                x: 0.0,
                y: 0.02,
                scale: 1.12,
                alpha: 0.94
            }));

            let stage = null;
            if (journeyCanvas && typeof window.MezcalParticleStage === 'function') {
                stage = new window.MezcalParticleStage(journeyCanvas, {
                    panels: DESKTOP_PANELS,
                    mobilePanels: MOBILE_PANELS
                });
            }
            ================================================================= */
            const stage = null; // Partículas desactivadas para evitar saturación de CPU/GPU

            const chapters = Array.from(journeySection.querySelectorAll('[data-journey-step]'));
            const navPills = Array.from(journeySection.querySelectorAll('[data-journey-pill]'));
            const sculptureTitleEl = document.getElementById('journey-sculpture-label');
            const progressBarEl = document.getElementById('journey-progress-bar');
            const journeyRow = document.getElementById('journey-row');
            const stickyStage = journeySection.querySelector('.journey-sticky-stage');

            const SCULPTURE_NAMES = {
                es: [
                    '01 · Roseta de Maguey Maduro (Jima)',
                    '02 · Horno Cónico de Piedra Volcánica',
                    '03 · Rueda de Piedra y Molienda',
                    '04 · Tina de Madera y Levaduras Silvestres',
                    '05 · Alambique de Cobre y Serpentín',
                    '06 · Botella Artesanal 750 ml (NOM-070)',
                    '07 · Copa Veladora y Cruz de Oaxaca'
                ],
                en: [
                    '01 · Mature Agave Rosette (Harvest)',
                    '02 · Volcanic Stone Earthen Pit Oven',
                    '03 · Stone Wheel & Traditional Milling',
                    '04 · Wooden Vat & Wild Fermentation',
                    '05 · Copper Still & Condenser Coil',
                    '06 · 750 ml Artisanal Bottle (NOM-070)',
                    '07 · Traditional Veladora Glass & Oaxacan Cross'
                ]
            };

            const STAGE_ICONS = [
                'fa-seedling',           // 01 Jima
                'fa-fire',               // 02 Horno
                'fa-gear',               // 03 Molienda
                'fa-droplet',            // 04 Fermentación
                'fa-flask',              // 05 Alambique
                'fa-wine-bottle',        // 06 Envasado
                'fa-champagne-glasses'   // 07 Copa
            ];

            function setActiveChapterUI(idx, rawProgress) {
                const clampedIdx = Math.max(0, Math.min(chapters.length - 1, idx));
                const lang = document.documentElement.lang === 'en' ? 'en' : 'es';

                chapters.forEach((ch, i) => {
                    ch.classList.toggle('is-active-chapter', i === clampedIdx);
                });
                navPills.forEach((pill, i) => {
                    pill.classList.toggle('is-active-pill', i === clampedIdx);
                });
                if (sculptureTitleEl) {
                    sculptureTitleEl.textContent = SCULPTURE_NAMES[lang][clampedIdx] || SCULPTURE_NAMES.es[clampedIdx];
                }
                if (progressBarEl) {
                    const pct = Math.max(8, Math.min(100, Math.round(rawProgress * 100)));
                    progressBarEl.style.width = `${pct}%`;
                }
                const iconEl = document.getElementById('journey-stage-icon');
                if (iconEl && STAGE_ICONS[clampedIdx]) {
                    iconEl.className = `fa-solid ${STAGE_ICONS[clampedIdx]} text-3xl sm:text-4xl text-mezcal-gold`;
                }
                const stepTagEl = document.getElementById('journey-stage-step-tag');
                if (stepTagEl) {
                    stepTagEl.textContent = `Etapa 0${clampedIdx + 1} de 07`;
                }
            }

            // Clic en las píldoras numeradas (01..07) desplaza al capítulo correspondiente
            navPills.forEach((pill, idx) => {
                pill.addEventListener('click', () => {
                    const targetChapter = chapters[idx];
                    const p = chapters.length > 1 ? idx / (chapters.length - 1) : 0;
                    // if (stage) stage.setProgress(p); // Partículas desactivadas
                    setActiveChapterUI(idx, p);
                    if (!targetChapter) return;
                    const offset = window.innerWidth < 1024 ? -340 : -130;
                    if (lenis) {
                        lenis.scrollTo(targetChapter, { offset, duration: 1.1 });
                    } else {
                        targetChapter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            });

            // Calcular el progreso exacto y mantener la tarjeta siguiendo el scroll en todo el recorrido
            const syncJourneyFromScroll = () => {
                if (!chapters.length) return;

                // En pantallas >= 768px (2 columnas), trasladamos físicamente la tarjeta junto con el scroll
                if (journeyRow && stickyStage) {
                    if (window.innerWidth >= 768) {
                        const rowRect = journeyRow.getBoundingClientRect();
                        const stageHeight = stickyStage.offsetHeight;
                        const stickyTopPx = 96; // Debajo de la barra de navegación fija
                        const maxTravel = Math.max(0, rowRect.height - stageHeight);
                        const targetY = Math.max(0, Math.min(maxTravel, stickyTopPx - rowRect.top));
                        stickyStage.style.transform = `translate3d(0, ${targetY.toFixed(1)}px, 0)`;
                    } else {
                        stickyStage.style.transform = '';
                    }
                }

                const firstRect = chapters[0].getBoundingClientRect();
                const lastRect = chapters[chapters.length - 1].getBoundingClientRect();
                const anchorY = window.innerWidth < 768
                    ? window.innerHeight * 0.68
                    : window.innerHeight * 0.45;

                const totalSpan = Math.max(1, (lastRect.top + lastRect.height * 0.5) - (firstRect.top + firstRect.height * 0.5));
                const currentOffset = anchorY - (firstRect.top + firstRect.height * 0.5);
                const p = Math.max(0, Math.min(1, currentOffset / totalSpan));

                // if (stage) stage.setProgress(p); // Partículas desactivadas
                const activeIdx = Math.round(p * (chapters.length - 1));
                setActiveChapterUI(activeIdx, p);
            };

            if (hasGSAP && hasScrollTrigger) {
                window.ScrollTrigger.create({
                    trigger: journeySection,
                    start: 'top bottom',
                    end: 'bottom top',
                    /* Partículas desactivadas por rendimiento:
                    onEnter: () => {
                        if (stage) { stage.start(); stage.burst(); }
                    },
                    onEnterBack: () => { if (stage) stage.start(); },
                    onLeave: () => { if (stage) stage.stop(); },
                    onLeaveBack: () => { if (stage) stage.stop(); },
                    */
                    onUpdate: () => syncJourneyFromScroll()
                });
            }

            window.addEventListener('scroll', syncJourneyFromScroll, { passive: true });
            // if (stage) stage.start(); // Partículas desactivadas
            syncJourneyFromScroll();

            window.addEventListener('resize', () => {
                // if (stage) stage.resize(); // Partículas desactivadas
                syncJourneyFromScroll();
            }, { passive: true });

            /* Partículas desactivadas por rendimiento:
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                journeySection.addEventListener('pointermove', (e) => {
                    const rect = journeySection.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
                    const py = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
                    if (stage) stage.setPointer(px, py);
                }, { passive: true });
            }
            */
        }

        // =====================================================================
        // 3. MOMENTO EXCLUSIVO EN INDEX.HTML: CARRETE HORIZONTAL CINEMÁTICO
        //    (Une la narrativa Campo → Horno → Las 4 Botellas → Convención)
        // =====================================================================
        const filmstripSection = document.getElementById('filmstrip-gallery-section');
        const filmstripTrack = document.getElementById('filmstrip-track');
        const filmstripProgress = document.getElementById('filmstrip-progress-bar');
        const filmstripPrevBtn = document.getElementById('filmstrip-prev');
        const filmstripNextBtn = document.getElementById('filmstrip-next');

        if (filmstripSection && filmstripTrack) {
            const updateFilmstripProgress = () => {
                const maxScroll = Math.max(1, filmstripTrack.scrollWidth - filmstripTrack.clientWidth);
                const ratio = Math.max(0, Math.min(1, filmstripTrack.scrollLeft / maxScroll));
                if (filmstripProgress) {
                    filmstripProgress.style.transform = `scaleX(${Math.max(0.08, ratio).toFixed(3)})`;
                }
            };

            filmstripTrack.addEventListener('scroll', updateFilmstripProgress, { passive: true });
            updateFilmstripProgress();

            if (filmstripPrevBtn) {
                filmstripPrevBtn.addEventListener('click', () => {
                    filmstripTrack.scrollBy({ left: -380, behavior: 'smooth' });
                });
            }
            if (filmstripNextBtn) {
                filmstripNextBtn.addEventListener('click', () => {
                    filmstripTrack.scrollBy({ left: 380, behavior: 'smooth' });
                });
            }

            // Entrada escalonada de las tarjetas del carrete cuando la sección entra en pantalla
            if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
                const cards = filmstripTrack.querySelectorAll('.filmstrip-card');
                window.gsap.fromTo(
                    cards,
                    { y: 36, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        stagger: 0.1,
                        ease: 'expo.out',
                        scrollTrigger: {
                            trigger: filmstripSection,
                            start: 'top 78%'
                        }
                    }
                );
            }
        }

        // =====================================================================
        // 4. GALERÍA MULTIMEDIA CONECTADA CON GSAP FLIP Y DEEP-LINKING (?filter=...)
        // =====================================================================
        const gallerySection = document.getElementById('galeria-multimedia');
        const mediaFilterBtns = Array.from(document.querySelectorAll('[data-media-filter]'));
        const mediaItems = Array.from(document.querySelectorAll('[data-media-type]'));
        const activeFilterBanner = document.getElementById('gallery-active-connection-banner');
        const activeFilterText = document.getElementById('gallery-active-connection-text');

        const FILTER_DESCRIPTIONS = {
            all: {
                es: 'Mostrando el archivo completo conectado (23 piezas: 11 videos en vivo, 5 primeros planos de botella y 7 fotografías de campo, horno y convención).',
                en: 'Showing the complete connected archive (23 items: 11 live videos, 5 bottle close-ups, and 7 field, oven & convention photos).'
            },
            videos: {
                es: 'Conectado a: Documentales cortos y reels en vivo desde el palenque de El Gramal (11 videos con reproducción directa).',
                en: 'Connected to: Short documentaries and live reels from the El Gramal palenque (11 inline-playable videos).'
            },
            botellas: {
                es: 'Conectado a: Primeros planos de nuestras botellas artesanales en campo, horno de piedra volcánica y barra oaxaqueña.',
                en: 'Connected to: Close-ups of our artisanal bottles in the agave field, volcanic stone oven, and Oaxacan bar.'
            },
            campo: {
                es: 'Conectado a Etapa 01 (Selección y Jima): Magueyes maduros de 8 a 15 años en los cerros de El Gramal, Yautepec.',
                en: 'Connected to Stage 01 (Selection & Jima): Mature 8–15 year agaves in the hills of El Gramal, Yautepec.'
            },
            palenque: {
                es: 'Conectado a Etapas 02–05 (Cocción, Molienda, Fermentación y Destilación): Fuego, piedra volcánica y alambique en el palenque.',
                en: 'Connected to Stages 02–05 (Roasting, Milling, Fermentation & Distillation): Fire, volcanic stone, and still at the palenque.'
            },
            eventos: {
                es: 'Conectado a: Presencia oficial de Mezcal Mil Sensaciones y el Maestro Damián Olivera Díaz en la Convención Nacional del Mezcal.',
                en: 'Connected to: Official presence of Mezcal Mil Sensaciones and Master Damián Olivera Díaz at the National Mezcal Convention.'
            }
        };

        function applyConnectedGalleryFilter(filter, animateWithFlip = true) {
            if (!mediaFilterBtns.length || !mediaItems.length) return;

            const flipState = (animateWithFlip && hasGSAP && hasFlip && !prefersReducedMotion)
                ? window.Flip.getState(mediaItems)
                : null;

            mediaFilterBtns.forEach((b) => {
                const isMatch = b.getAttribute('data-media-filter') === filter;
                b.classList.toggle('bg-mezcal-gold', isMatch);
                b.classList.toggle('text-mezcal-dark', isMatch);
                b.classList.toggle('shadow-lg', isMatch);
                b.classList.toggle('bg-mezcal-charcoal', !isMatch);
                b.classList.toggle('text-mezcal-light', !isMatch);
            });

            mediaItems.forEach((card) => {
                const types = (card.getAttribute('data-media-type') || '').split(/\s+/);
                const show = filter === 'all' || types.includes(filter);
                card.classList.toggle('hidden', !show);
            });

            if (activeFilterText && FILTER_DESCRIPTIONS[filter]) {
                const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
                activeFilterText.textContent = FILTER_DESCRIPTIONS[filter][lang];
                if (activeFilterBanner) {
                    activeFilterBanner.dataset.currentFilter = filter;
                }
            }

            if (flipState) {
                window.Flip.from(flipState, {
                    duration: 0.55,
                    scale: true,
                    ease: 'power3.out',
                    stagger: 0.025,
                    onEnter: (elements) => window.gsap.fromTo(elements, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }),
                    onLeave: (elements) => window.gsap.to(elements, { opacity: 0, scale: 0.88, duration: 0.3 })
                });
            }
        }

        if (mediaFilterBtns.length && mediaItems.length) {
            // Reemplazar listeners previos con animación GSAP Flip
            mediaFilterBtns.forEach((btn) => {
                const clone = btn.cloneNode(true);
                btn.parentNode.replaceChild(clone, btn);
            });

            const freshBtns = Array.from(document.querySelectorAll('[data-media-filter]'));
            mediaFilterBtns.length = 0;
            freshBtns.forEach((b) => {
                mediaFilterBtns.push(b);
                b.addEventListener('click', () => {
                    const f = b.getAttribute('data-media-filter') || 'all';
                    applyConnectedGalleryFilter(f, true);
                });
            });

            // Botones en las tarjetas del proceso ("Ver fotos y videos de esta etapa ↓")
            document.querySelectorAll('[data-jump-filter]').forEach((jumpBtn) => {
                jumpBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetFilter = jumpBtn.getAttribute('data-jump-filter') || 'all';
                    applyConnectedGalleryFilter(targetFilter, true);
                    if (gallerySection) {
                        if (lenis) {
                            lenis.scrollTo(gallerySection, { offset: -80, duration: 1.15 });
                        } else {
                            gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });

            // Leer parámetro ?filter=campo|palenque|botellas|videos|eventos si viene desde index.html o desde una botella
            const params = new URLSearchParams(window.location.search);
            const initialFilter = params.get('filter');
            if (initialFilter && FILTER_DESCRIPTIONS[initialFilter]) {
                applyConnectedGalleryFilter(initialFilter, false);
                setTimeout(() => {
                    if (gallerySection) {
                        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 350);
            } else {
                applyConnectedGalleryFilter('all', false);
            }
        }

        // =====================================================================
        // 5. TRANSICIÓN SUAVE GSAP EN GALERÍA DE MINIATURAS DE BOTELLAS (mezcal-*.html)
        // =====================================================================
        const mainBottleImg = document.getElementById('main-bottle-img');
        if (mainBottleImg && typeof window.changeBottleImg === 'function') {
            window.changeBottleImg = function (src, btnEl) {
                if (hasGSAP && !prefersReducedMotion) {
                    window.gsap.to(mainBottleImg, {
                        opacity: 0,
                        scale: 0.96,
                        duration: 0.2,
                        ease: 'power2.in',
                        onComplete: () => {
                            mainBottleImg.src = src;
                            window.gsap.to(mainBottleImg, {
                                opacity: 1,
                                scale: 1,
                                duration: 0.45,
                                ease: 'expo.out'
                            });
                        }
                    });
                } else {
                    mainBottleImg.src = src;
                }
                document.querySelectorAll('.thumb-btn').forEach((b) => {
                    b.classList.remove('border-mezcal-gold');
                    b.classList.add('border-white/15');
                });
                if (btnEl) {
                    btnEl.classList.remove('border-white/15');
                    btnEl.classList.add('border-mezcal-gold');
                }
            };
        }
    });
})();

