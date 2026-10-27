/**
 * Mezcal Artesanal "Mil Sensaciones" — Controlador Global (ES/EN, +18, Modales, Fichas PDF, Galería Foto/Video, Validación)
 *Equipo de Desarrollo: Ing. en Computación Jose Ramon Aragon Toledo
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. INTERNACIONALIZACIÓN COMPLETA (ES / EN) PERSISTENTE (RF-02)
    // =========================================================================
    let currentLang = localStorage.getItem('mezcalLang') || 'es';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('mezcalLang', lang);
        document.documentElement.lang = lang;

        // Actualizar indicadores visuales de botones ES | EN (Desktop y Móvil)
        document.querySelectorAll('.lang-es-indicator').forEach(el => {
            el.className = lang === 'es'
                ? 'lang-es-indicator text-xs font-bold text-mezcal-gold'
                : 'lang-es-indicator text-xs font-bold text-mezcal-light/50 hover:text-mezcal-light';
        });
        document.querySelectorAll('.lang-en-indicator').forEach(el => {
            el.className = lang === 'en'
                ? 'lang-en-indicator text-xs font-bold text-mezcal-gold'
                : 'lang-en-indicator text-xs font-bold text-mezcal-light/50 hover:text-mezcal-light';
        });

        // Traducir textos con data-lang-es / data-lang-en
        document.querySelectorAll('[data-lang-es]').forEach(el => {
            const translation = el.getAttribute(`data-lang-${lang}`);
            if (translation !== null) {
                el.textContent = translation;
            }
        });

        // Traducir placeholders de formularios
        document.querySelectorAll('[data-placeholder-es]').forEach(el => {
            const ph = el.getAttribute(`data-placeholder-${lang}`);
            if (ph !== null) {
                el.setAttribute('placeholder', ph);
            }
        });
    }

    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(currentLang === 'es' ? 'en' : 'es');
            updatePaletteLabels();
        });
    });

    applyLanguage(currentLang);

    // =========================================================================
    // 1B. CONMUTADOR INTERACTIVO DE 4 PALETAS DE COLORES (MODO DEMOSTRACIÓN)
    // =========================================================================
    const PALETTES = [
        {
            id: 'natural',
            shortEs: '1. Natural',
            shortEn: '1. Natural',
            titleEs: 'Paleta 1/4: Equilibrio Natural (Principal)',
            titleEn: 'Palette 1/4: Natural Balance (Primary)',
            descEs: 'Integra Tierra (#8b5a2b), Verde Maguey (#4b6043) y Madera (#281910)',
            descEn: 'Integrates Earth (#8b5a2b), Agave Green (#4b6043) & Wood (#281910)',
            dots: ['#8b5a2b', '#4b6043', '#281910']
        },
        {
            id: 'tierra',
            shortEs: '2. Tierra',
            shortEn: '2. Earth',
            titleEs: 'Paleta 2/4: Tierra Oaxaqueña y Barro',
            titleEn: 'Palette 2/4: Oaxacan Earth & Clay',
            descEs: 'Enfocada en suelos minerales (#a85d34), arcilla de horno (#311b11) y ocre (#df9a57)',
            descEn: 'Focused on mineral soils (#a85d34), pit-oven clay (#311b11) & ochre (#df9a57)',
            dots: ['#df9a57', '#a85d34', '#311b11']
        },
        {
            id: 'maguey',
            shortEs: '3. Maguey',
            shortEn: '3. Agave',
            titleEs: 'Paleta 3/4: Penca de Maguey Silvestre',
            titleEn: 'Palette 3/4: Wild Agave Leaf Greens',
            descEs: 'Enfocada en verdes de penca (#2d6e42), bosque de sierra (#12261b) y quiote (#a6c96a)',
            descEn: 'Focused on agave leaf greens (#2d6e42), mountain forest (#12261b) & botanical gold (#a6c96a)',
            dots: ['#a6c96a', '#2d6e42', '#12261b']
        },
        {
            id: 'cobre',
            shortEs: '4. Cobre',
            shortEn: '4. Copper',
            titleEs: 'Paleta 4/4: Cobre de Alambique y Barrica',
            titleEn: 'Palette 4/4: Copper Still & Oak Barrel',
            descEs: 'Enfocada en cobre martillado (#b85a27), barrica tostada (#2c160c) y ámbar (#e58e49)',
            descEn: 'Focused on hammered copper (#b85a27), toasted oak barrel (#2c160c) & amber (#e58e49)',
            dots: ['#e58e49', '#b85a27', '#2c160c']
        }
    ];

    let currentPalette = localStorage.getItem('mezcalPalette') || 'natural';
    if (!PALETTES.some(p => p.id === currentPalette)) {
        currentPalette = 'natural';
    }
    let paletteToastTimer = null;

    // Crear contenedor Toast para informar qué paleta está activa durante la demostración
    let paletteToast = document.getElementById('palette-demo-toast');
    if (!paletteToast) {
        paletteToast = document.createElement('div');
        paletteToast.id = 'palette-demo-toast';
        paletteToast.setAttribute('role', 'status');
        paletteToast.setAttribute('aria-live', 'polite');
        document.body.appendChild(paletteToast);
    }

    // Inyectar el conmutador de paletas junto a cada selector de idioma (.lang-toggle-btn)
    document.querySelectorAll('.lang-toggle-btn').forEach((langBtn) => {
        if (langBtn.parentElement && langBtn.parentElement.querySelector('.palette-switcher-wrap')) return;
        const wrap = document.createElement('div');
        wrap.className = 'palette-switcher-wrap';
        wrap.setAttribute('title', 'Alternar paleta de colores para demostración (4 estilos)');
        wrap.innerHTML = `
            <button type="button" class="palette-cycle-btn" aria-label="Alternar paleta de colores">
                <i class="fa-solid fa-palette"></i>
                <span class="palette-active-label">1. Natural</span>
            </button>
            <div class="palette-dots-group">
                ${PALETTES.map(p => `
                    <button type="button"
                            class="palette-dot-btn"
                            data-palette-target="${p.id}"
                            title="${p.titleEs}"
                            aria-label="${p.titleEs}"></button>
                `).join('')}
            </div>
        `;
        langBtn.insertAdjacentElement('afterend', wrap);

        const cycleBtn = wrap.querySelector('.palette-cycle-btn');
        if (cycleBtn) {
            cycleBtn.addEventListener('click', () => {
                const idx = PALETTES.findIndex(p => p.id === currentPalette);
                const nextPalette = PALETTES[(idx + 1) % PALETTES.length];
                applyPalette(nextPalette.id, true);
            });
        }

        wrap.querySelectorAll('.palette-dot-btn').forEach(dotBtn => {
            dotBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = dotBtn.getAttribute('data-palette-target');
                if (targetId) applyPalette(targetId, true);
            });
        });
    });

    function updatePaletteLabels() {
        const activeObj = PALETTES.find(p => p.id === currentPalette) || PALETTES[0];
        document.querySelectorAll('.palette-active-label').forEach(lbl => {
            lbl.textContent = currentLang === 'es' ? activeObj.shortEs : activeObj.shortEn;
        });
        document.querySelectorAll('.palette-dot-btn').forEach(dot => {
            const targetId = dot.getAttribute('data-palette-target');
            const pObj = PALETTES.find(p => p.id === targetId);
            if (pObj) {
                dot.title = currentLang === 'es' ? `${pObj.titleEs} — ${pObj.descEs}` : `${pObj.titleEn} — ${pObj.descEn}`;
            }
            dot.classList.toggle('active-palette-dot', targetId === currentPalette);
        });
    }

    function applyPalette(paletteId, showNotification = false) {
        currentPalette = paletteId;
        localStorage.setItem('mezcalPalette', paletteId);
        document.documentElement.setAttribute('data-palette', paletteId);
        updatePaletteLabels();

        // Actualizar puntos de muestra en la insignia del Hero si existen
        const activeObj = PALETTES.find(p => p.id === paletteId) || PALETTES[0];
        const heroDots = document.querySelectorAll('.hero-palette-dot');
        if (heroDots.length === 3 && activeObj.dots) {
            heroDots.forEach((dotEl, i) => {
                dotEl.style.backgroundColor = activeObj.dots[i];
            });
        }

        if (showNotification && paletteToast) {
            const title = currentLang === 'es' ? activeObj.titleEs : activeObj.titleEn;
            const desc = currentLang === 'es' ? activeObj.descEs : activeObj.descEn;
            paletteToast.innerHTML = `
                <div class="flex items-center gap-2.5">
                    <div class="flex items-center gap-1">
                        <span class="w-3 h-3 rounded-full border border-white/40 inline-block" style="background:${activeObj.dots[0]}"></span>
                        <span class="w-3 h-3 rounded-full border border-white/40 inline-block" style="background:${activeObj.dots[1]}"></span>
                        <span class="w-3 h-3 rounded-full border border-white/40 inline-block" style="background:${activeObj.dots[2]}"></span>
                    </div>
                    <div>
                        <p class="font-bold text-mezcal-gold leading-tight">${title}</p>
                        <p class="text-[11px] text-mezcal-light/85 leading-snug mt-0.5">${desc}</p>
                    </div>
                </div>
            `;
            paletteToast.classList.add('show-toast');
            if (paletteToastTimer) clearTimeout(paletteToastTimer);
            paletteToastTimer = setTimeout(() => {
                paletteToast.classList.remove('show-toast');
            }, 3400);
        }
    }

    applyPalette(currentPalette, false);

    // =========================================================================
    // 2. TIPOGRAFÍA OFICIAL DEL REEL ("Mezcal" Script + "Mil" + "SENSACIONES")
    // =========================================================================
    const botanicalDividerSVG = `
        <svg class="brand-botanical-divider mx-auto" viewBox="0 0 420 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <!-- Hojas simétricas izquierda -->
            <path d="M56 17 C42 17, 25 14, 15 17 C25 20, 42 17, 56 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <path d="M56 17 C49 9, 41 3, 35 4 C35 10, 44 15, 56 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <path d="M56 17 C49 25, 41 31, 35 30 C35 24, 44 19, 56 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <!-- Línea horizontal izquierda -->
            <line x1="56" y1="17" x2="194" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Punto central -->
            <circle cx="210" cy="17" r="4" fill="currentColor"/>
            <!-- Línea horizontal derecha -->
            <line x1="226" y1="17" x2="364" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Hojas simétricas derecha -->
            <path d="M364 17 C378 17, 395 14, 405 17 C395 20, 378 17, 364 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <path d="M364 17 C371 9, 379 3, 385 4 C385 10, 376 15, 364 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <path d="M364 17 C371 25, 379 31, 385 30 C385 24, 376 19, 364 17 Z" stroke="currentColor" stroke-width="1.6" fill="none"/>
        </svg>
    `;

    // Aplicar tipografía oficial en el logo de la barra de navegación en todas las páginas
    document.querySelectorAll('#navbar a[href="index.html"]').forEach((brandLink) => {
        if (brandLink.textContent.trim().toLowerCase().includes('mil sensaciones')) {
            brandLink.innerHTML = `
                <span class="navbar-brand-lockup">
                    <span class="nav-script">Mezcal</span>
                    <span class="nav-mil">Mil</span>
                    <span class="nav-sensaciones">SENSACIONES</span>
                </span>
            `;
        }
    });

    const titleEl = document.getElementById('hero-title');
    const titleLines = [];

    if (titleEl && titleEl.dataset.animatedTitle === 'true') {
        titleEl.className = 'brand-lockup mb-4 mx-auto lg:mx-0 select-none';
        titleEl.innerHTML = `
            <span class="brand-script-mezcal text-6xl sm:text-7xl md:text-8xl lg:text-[6.2rem] letter-anim opacity-0">Mezcal</span>
            <span class="brand-serif-mil text-3xl sm:text-4xl md:text-5xl mt-1 letter-anim opacity-0">Mil</span>
            <span class="brand-serif-sensaciones text-4xl sm:text-6xl md:text-7xl lg:text-[5.15rem] mt-0.5 letter-anim opacity-0">SENSACIONES</span>
            <span class="w-full flex justify-center letter-anim opacity-0">${botanicalDividerSVG}</span>
        `;
        titleEl.querySelectorAll('.letter-anim').forEach((el) => titleLines.push(el));
    }

    function triggerTitleAnimation() {
        if (!titleLines.length) return;
        titleLines.forEach((el, index) => {
            el.style.transition = 'none';
            el.style.transform = 'translateY(24px) scale(0.94)';
            void el.offsetWidth;
            el.style.transition = 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease-out';
            setTimeout(() => {
                el.style.transform = 'translateY(0px) scale(1)';
                el.classList.remove('opacity-0');
                el.classList.add('opacity-100');
            }, index * 140);
        });
    }

    // =========================================================================
    // 3. VERIFICACIÓN DE EDAD LEGAL (+18) (RF-01)
    // =========================================================================
    const ageGate = document.getElementById('age-gate');
    const mainContent = document.getElementById('main-content');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const ageError = document.getElementById('age-error');
    const body = document.body;

    function unlockSite(animateHero = false) {
        if (ageGate) {
            ageGate.classList.add('opacity-0');
            setTimeout(() => {
                ageGate.classList.add('hidden');
            }, 600);
        }
        if (mainContent) mainContent.classList.remove('blurred');
        body.classList.remove('locked');
        if (animateHero) {
            setTimeout(triggerTitleAnimation, 250);
        }
    }

    if (sessionStorage.getItem('ageVerified') === 'true' || localStorage.getItem('ageVerified') === 'true') {
        if (ageGate) ageGate.classList.add('hidden');
        if (mainContent) mainContent.classList.remove('blurred');
        body.classList.remove('locked');
        setTimeout(triggerTitleAnimation, 250);
    } else if (ageGate && btnYes && btnNo) {
        btnYes.addEventListener('click', () => {
            sessionStorage.setItem('ageVerified', 'true');
            localStorage.setItem('ageVerified', 'true');
            unlockSite(true);
        });

        btnNo.addEventListener('click', () => {
            if (ageError) {
                ageError.classList.remove('hidden');
                setTimeout(() => ageError.classList.remove('opacity-0'), 10);
            }
        });
    } else {
        unlockSite(true);
    }

    // =========================================================================
    // 4. SCROLL REVEAL (INTERSECTION OBSERVER) Y NAVBAR (RNF-01)
    // =========================================================================
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('bg-mezcal-charcoal/95', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-mezcal-light/10', 'py-3');
                navbar.classList.remove('bg-transparent', 'py-5');
            } else {
                navbar.classList.remove('bg-mezcal-charcoal/95', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-mezcal-light/10', 'py-3');
                navbar.classList.add('bg-transparent', 'py-5');
            }
        });
    }

    // Menú Móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // =========================================================================
    // 5. SOPORTE Y FALLBACK PARA <dialog closedby="any"> (Light-Dismiss)
    // =========================================================================
    document.querySelectorAll('dialog.mezcal-dialog').forEach((dialog) => {
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            dialog.addEventListener('click', (event) => {
                if (event.target !== dialog) return;
                const rect = dialog.getBoundingClientRect();
                const isDialogContent = (
                    rect.top <= event.clientY &&
                    event.clientY <= rect.top + rect.height &&
                    rect.left <= event.clientX &&
                    event.clientX <= rect.left + rect.width
                );
                if (isDialogContent) return;
                dialog.close();
            });
        }
    });

    // Modal de Aviso de Privacidad (RF-15)
    const privacyDialog = document.getElementById('privacy-dialog');
    document.querySelectorAll('.open-privacy-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (privacyDialog) privacyDialog.showModal();
        });
    });

    // =========================================================================
    // 6. DATOS DE FICHAS TÉCNICAS (10 ATRIBUTOS OBLIGATORIOS) Y DESCARGA PDF (RF-06, RF-07)
    // =========================================================================
    const PRODUCT_SHEETS = {
        espadin: {
            name: 'Mil Sensaciones — Mezcal Espadín Joven',
            badgeEs: 'Lanzamiento Actual · Joven Artesanal',
            badgeEn: 'Current Release · Artisanal Joven',
            agaveEs: 'Maguey Espadín (Agave Angustifolia Haw) — 8 a 10 años de maduración',
            agaveEn: 'Espadín Agave (Agave Angustifolia Haw) — 8 to 10 years maturation',
            maestro: 'Damián Olivera Díaz (2.ª Generación de Maestros Mezcaleros)',
            origen: 'El Gramal, Nejapa de Madero, Yautepec, Oaxaca, México',
            procesoEs: 'Cocción en horno cónico de tierra con piedra volcánica y leña de encino; molienda tradicional; fermentación natural en tinas de madera con agua de manantial; doble destilación en alambique de cobre.',
            procesoEn: 'Conical earthen pit oven with volcanic stone and oak firewood; traditional milling; wild fermentation in wooden vats with spring water; double distillation in copper still.',
            abv: '45% — 47% Alc. Vol. (ajustado a cordón cerrado por lote)',
            notasEs: 'Vista: Cristalino brillante con perlas persistentes. Nariz: Notas cítricas frescas, tierra húmeda, agave cocido y humo sutil. Boca: Entrada sedosa, equilibrio mineral, tonos herbáceos y retrogusto cálido prolongado.',
            notasEn: 'Sight: Bright crystalline with persistent pearls. Nose: Fresh citrus, wet earth, roasted agave and subtle smoke. Palate: Silky entry, mineral balance, herbal tones and long warm finish.',
            presentacion: '750 ml (Botella artesanal etiquetada por lote)',
            loteEs: 'Edición limitada artesanal (producción de pequeño lote)',
            loteEn: 'Artisanal limited edition (small-batch production)',
            nom: 'NOM-070-SCFI-2016 / Registro IMPI Mezcal Mil Sensaciones'
        },
        ensamble: {
            name: 'Mil Sensaciones — Ensamble de Agaves (Edición Limitada)',
            badgeEs: 'Próximo Lanzamiento · Edición Limitada',
            badgeEn: 'Upcoming Release · Limited Edition',
            agaveEs: 'Ensamble selecto de magueyes cultivados y silvestres de la Sierra Sur / Yautepec (8 a 12 años)',
            agaveEn: 'Selected blend of cultivated and wild agaves from Sierra Sur / Yautepec (8 to 12 years)',
            maestro: 'Damián Olivera Díaz (2.ª Generación de Maestros Mezcaleros)',
            origen: 'El Gramal, Nejapa de Madero, Yautepec, Oaxaca, México',
            procesoEs: 'Co-fermentación y destilación conjunta de piñas seleccionadas en su punto óptimo de azúcares, cocidas en horno cónico de tierra y destiladas en cobre.',
            procesoEn: 'Co-fermentation and joint distillation of agaves harvested at peak sugar maturity, roasted in conical earthen oven and distilled in copper.',
            abv: '47% Alc. Vol. (referencia de lote)',
            notasEs: 'Vista: Cristalino con destellos plateados. Nariz: Floral, especiado y dulce de maguey asado. Boca: Complejidad multicapa donde convergen la dulzura del espadín y la fuerza mineral de agaves silvestres.',
            notasEn: 'Sight: Crystalline with silver hues. Nose: Floral, spicy and sweet roasted agave. Palate: Multi-layered complexity merging sweet espadín and wild mineral depth.',
            presentacion: '750 ml',
            loteEs: 'Micro-lote numerado a mano',
            loteEn: 'Hand-numbered micro-batch',
            nom: 'NOM-070-SCFI-2016 / Registro IMPI Mezcal Mil Sensaciones'
        },
        silvestre: {
            name: 'Mil Sensaciones — Mezcal Silvestre',
            badgeEs: 'Próximo Lanzamiento · Agave Silvestre',
            badgeEn: 'Upcoming Release · Wild Agave',
            agaveEs: 'Magueyes silvestres endémicos de los cerros de Nejapa de Madero, Yautepec (12 a 15+ años)',
            agaveEn: 'Endemic wild agaves from the hills of Nejapa de Madero, Yautepec (12 to 15+ years)',
            maestro: 'Damián Olivera Díaz (2.ª Generación de Maestros Mezcaleros)',
            origen: 'El Gramal, Nejapa de Madero, Yautepec, Oaxaca, México',
            procesoEs: 'Recolección sostenible respetando la floración y semilla en el monte; cocción lenta en horno de tierra, fermentación salvaje y doble destilación.',
            procesoEn: 'Sustainable wild harvesting respecting flowering cycles; slow earthen pit roasting, wild fermentation and double distillation.',
            abv: '48% Alc. Vol. (referencia de lote)',
            notasEs: 'Vista: Cuerpo denso y perlado fino. Nariz: Intenso carácter herbal, copal, corteza y cacao tostado. Boca: Potente, franco y profundo, reflejo puro de la montaña oaxaqueña.',
            notasEn: 'Sight: Full-bodied with fine beading. Nose: Intense herbal character, copal, bark and roasted cacao. Palate: Powerful, honest and deep reflection of the Oaxacan mountain.',
            presentacion: '750 ml',
            loteEs: 'Producción única de temporada (menos de 150 botellas por lote)',
            loteEn: 'Single seasonal batch (under 150 bottles per batch)',
            nom: 'NOM-070-SCFI-2016 / Registro IMPI Mezcal Mil Sensaciones'
        },
        curados: {
            name: 'Mil Sensaciones — Curados Artesanales de Mezcal',
            badgeEs: 'Próximo Lanzamiento · Receta Familiar',
            badgeEn: 'Upcoming Release · Family Recipe',
            agaveEs: 'Base 100% Mezcal Espadín Artesanal macerado con frutas e ingredientes naturales de la región',
            agaveEn: '100% Artisanal Espadín Mezcal base infused with natural regional fruits and botanicals',
            maestro: 'Damián Olivera Díaz (2.ª Generación de Maestros Mezcaleros)',
            origen: 'El Gramal, Nejapa de Madero, Yautepec, Oaxaca, México',
            procesoEs: 'Maceración artesanal en frío con fruta natural de temporada sobre mezcal joven de primera calidad, sin saborizantes ni colorantes artificiales.',
            procesoEn: 'Artisanal cold maceration with natural seasonal fruit over premium joven mezcal, free of artificial flavors or colorings.',
            abv: '36% — 38% Alc. Vol.',
            notasEs: 'Vista: Tonos ámbar y frutales naturales. Nariz: Fruta fresca madura integrada con el toque ahumado del agave. Boca: Suave, aterciopelado, ideal como digestivo o para compartir en celebraciones.',
            notasEn: 'Sight: Natural amber and fruit tones. Nose: Ripe fresh fruit integrated with smoky agave. Palate: Smooth, velvety, ideal as a digestif or for celebrations.',
            presentacion: '750 ml',
            loteEs: 'Lotes estacionales según cosecha de fruta',
            loteEn: 'Seasonal batches according to fruit harvest',
            nom: 'Receta Tradicional Familiar — Mezcal Mil Sensaciones'
        }
    };

    const sheetDialog = document.getElementById('tech-sheet-dialog');
    let activeProductKey = 'espadin';

    function openTechSheet(productKey) {
        const data = PRODUCT_SHEETS[productKey] || PRODUCT_SHEETS.espadin;
        activeProductKey = productKey;
        const isEn = currentLang === 'en';

        if (!sheetDialog) return;

        document.getElementById('sheet-title').textContent = data.name;
        document.getElementById('sheet-badge').textContent = isEn ? data.badgeEn : data.badgeEs;
        document.getElementById('sheet-agave').textContent = isEn ? data.agaveEn : data.agaveEs;
        document.getElementById('sheet-maestro').textContent = data.maestro;
        document.getElementById('sheet-origen').textContent = data.origen;
        document.getElementById('sheet-proceso').textContent = isEn ? data.procesoEn : data.procesoEs;
        document.getElementById('sheet-abv').textContent = data.abv;
        document.getElementById('sheet-notas').textContent = isEn ? data.notasEn : data.notasEs;
        document.getElementById('sheet-presentacion').textContent = data.presentacion;
        document.getElementById('sheet-lote').textContent = isEn ? data.loteEn : data.loteEs;
        document.getElementById('sheet-nom').textContent = data.nom;

        sheetDialog.showModal();
    }

    document.querySelectorAll('[data-open-sheet]').forEach(btn => {
        btn.addEventListener('click', () => {
            openTechSheet(btn.getAttribute('data-open-sheet'));
        });
    });

    // Impresión / Descarga de Ficha Técnica en PDF (RF-07)
    const printSheetBtn = document.getElementById('btn-print-sheet');
    if (printSheetBtn) {
        printSheetBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Botones de Compartir en Redes Sociales / Web Share API (RF-14)
    document.querySelectorAll('[data-share-product]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const key = btn.getAttribute('data-share-product');
            const data = PRODUCT_SHEETS[key] || PRODUCT_SHEETS.espadin;
            const shareData = {
                title: data.name,
                text: `${data.name} — Mezcal Artesanal de El Gramal, Oaxaca (Maestro Damián Olivera Díaz).`,
                url: window.location.href
            };
            if (navigator.share) {
                try { await navigator.share(shareData); } catch (_) {}
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(`${shareData.title}: ${shareData.url}`);
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check text-mezcal-gold"></i>';
                setTimeout(() => { btn.innerHTML = original; }, 1800);
            }
        });
    });

    // =========================================================================
    // 7. FILTRO DE CATÁLOGO EN MEZCALES.HTML
    // =========================================================================
    const filterButtons = document.querySelectorAll('[data-filter-category]');
    const productCards = document.querySelectorAll('[data-product-category]');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-filter-category');
            filterButtons.forEach(b => {
                b.classList.remove('bg-mezcal-gold', 'text-mezcal-dark');
                b.classList.add('bg-mezcal-charcoal', 'text-mezcal-light');
            });
            btn.classList.add('bg-mezcal-gold', 'text-mezcal-dark');
            btn.classList.remove('bg-mezcal-charcoal', 'text-mezcal-light');

            productCards.forEach(card => {
                const cardCats = card.getAttribute('data-product-category').split(' ');
                if (cat === 'all' || cardCats.includes(cat)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // =========================================================================
    // 8. INTERACCIÓN INLINE DE GALERÍA Y CAPA INTERMEDIA DE VIDEOS VERTICALES
    // =========================================================================
    // 8.1 Reproducción inline de tarjetas de video y leyendas inline (Sin modal intrusivo)
    document.querySelectorAll('[data-lightbox-src], [data-lightbox-video]').forEach(item => {
        const videoSrc = item.getAttribute('data-lightbox-video');
        const captionText = item.getAttribute('data-lightbox-caption') || '';
        const inlineVideo = item.querySelector('video');

        // Agregar descripción emergente suave dentro de la propia tarjeta si tiene caption
        if (captionText && !item.querySelector('.inline-caption-overlay')) {
            item.classList.add('group', 'relative', 'overflow-hidden');
            const overlay = document.createElement('div');
            overlay.className = 'inline-caption-overlay';
            overlay.innerHTML = `<p class="text-[11px] text-mezcal-light/95 font-sans leading-snug"><i class="fa-solid fa-sparkles text-mezcal-gold mr-1.5"></i>${captionText}</p>`;
            item.appendChild(overlay);
        }

        if (videoSrc && inlineVideo) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Pausar otros videos inline de tarjetas
                document.querySelectorAll('[data-lightbox-video] video').forEach(v => {
                    if (v !== inlineVideo) {
                        v.pause();
                        v.muted = true;
                    }
                });
                const badge = item.querySelector('span');
                if (inlineVideo.paused) {
                    inlineVideo.muted = false;
                    inlineVideo.play().catch(() => {
                        inlineVideo.muted = true;
                        inlineVideo.play().catch(() => {});
                    });
                    if (badge) badge.innerHTML = '<i class="fa-solid fa-pause mr-1"></i> Reproduciendo';
                } else {
                    inlineVideo.pause();
                    if (badge) badge.innerHTML = '<i class="fa-solid fa-play mr-1"></i> Video';
                }
            });
        } else {
            // Para tarjetas de fotografía: en dispositivos táctiles alterna la leyenda inline sin abrir ningún modal
            item.addEventListener('click', () => {
                item.classList.toggle('caption-expanded');
            });
        }
    });

    // 8.2 Capa intermedia de videos verticales al 40% de opacidad en secciones negro sólido (bg-mezcal-dark)
    // Se renderiza con posicionamiento absoluto full-bleed detrás del texto (z-0) y cicla automáticamente la lista de videos verticales.
    const verticalVideosPool = [
        'assets/video/%F0%9F%94%A5%20Entre%20fuego%2C%20tierra%20y%20tradici%C3%B3n%20nace%20algo%20m%C3%A1s%20que%20mezcal%E2%80%A6%20nace%20una%20experiencia.En%20cada%20horno%20.mp4',
        'assets/video/Desde%20el%20coraz%C3%B3n%20del%20campo%20nace%20la%20esencia%20de%20Mil%20Sensaciones.%20%F0%9F%8C%B5Cortamos%20con%20respeto%2C%20elegimos%20.mp4',
        'assets/video/SaveClip.App_AQN6K80Pg3YEN8EaasC7XwlMqcn9lQqfZ4ldKlrESk_IKLsEK880g07voNS-_6kE9gdMmdwuBZjxU23yXnIxQmge.mp4',
        'assets/video/SaveClip.App_AQMmwVXH_c1ViDR3Qzx8ydIzkvwCIn6bMi6tT2vSekzFHmuJHLwyHFxUsO3jjR7jEehCSg4gQhD9VVHrJsnqiEXS.mp4',
        'assets/video/SaveClip.App_AQPAGhWhgIu9oUWSywwxmoSMgj0bNHA8ThhhoRK9uNGrnQ7PqyFiSAzTdolxDHWFJcAyCtVtzD_BZeyQgQbWkcg.mp4',
        'assets/video/SaveClip.App_AQPDhSPvOMFzfOm-l7cEVbfsZf2hrjAxxEjZ3fTM9vIAZGx8WuRYLezi5mHOarmc1pFOyxcZ67t4Gf1C9hCQIfYZ.mp4',
        'assets/video/SaveClip.App_AQPJVlD7MGCltHSI1EwVkq-jyOH2QUzfLnAwZerrOX84H5DG5GHjksYLPzk9-B5MDP499lYnHf01-Wi5a4nnnWz0.mp4',
        'assets/video/SaveClip.App_AQPLfKzPQkn2seWXwNhm1ldSAK_3lNgcSPtxRCT4yDosCpjuWYmmSWGJM9ZETyYPZLZDR3evtP2cMDtQ5GdEGJI.mp4',
        'assets/video/SaveClip.App_AQPorQWg-KHXhD4FM9VVEVjC5iBWAHiiVL2SOK2ZbrGdNk7KhZw5YQCBpUgZ3DQFzX5jvGXEbE9Ovog2CIYY9pg.mp4',
        'assets/video/SaveClip.App_AQOX7MFntzgA74h5-_ErWRVKfPvc9xyiVcatVtBKyyWGwC27z6Kk6vP_czbLmG3H4KW00u-DsO01TcyBh9se0enq.mp4'
    ];

    const solidBlackSections = document.querySelectorAll('section.bg-mezcal-dark');
    let videoOffset = 0;

    solidBlackSections.forEach((sec) => {
        if (sec.classList.contains('bg-texture')) return; // Solo en secciones negro sólido sin textura granito
        sec.classList.add('ambient-video-section', 'relative', 'overflow-hidden');
        sec.style.position = 'relative';
        sec.style.overflow = 'hidden';

        // Asegurar que los contenedores hijos directos estén por encima (z-10) del video de fondo
        Array.from(sec.children).forEach((child) => {
            if (!child.classList.contains('ambient-video-layer') && !child.classList.contains('ambient-video-vignette')) {
                child.classList.add('relative', 'z-10');
                child.style.position = 'relative';
                child.style.zIndex = '10';
            }
        });

        let currentIdx = videoOffset % verticalVideosPool.length;
        videoOffset += 2;

        // Si ya existe una capa estática, normalizarla a un único video full-bleed detrás del contenido
        let layer = sec.querySelector('.ambient-video-layer');
        if (!layer) {
            layer = document.createElement('div');
            sec.prepend(layer);
        }
        layer.className = 'ambient-video-layer absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden opacity-40';
        layer.setAttribute('aria-hidden', 'true');
        layer.style.cssText = 'position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;z-index:0 !important;opacity:0.40 !important;pointer-events:none !important;overflow:hidden !important;';

        const initialVideoSrc = verticalVideosPool[currentIdx];
        layer.innerHTML = `
            <video autoplay muted playsinline preload="metadata" tabindex="-1"
                   class="absolute inset-0 w-full h-full object-cover pointer-events-none"
                   style="position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;object-fit:cover !important;pointer-events:none !important;">
                <source src="${initialVideoSrc}" type="video/mp4">
            </video>
        `;

        const bgVid = layer.querySelector('video');
        if (bgVid) {
            bgVid.addEventListener('ended', () => {
                currentIdx = (currentIdx + 1) % verticalVideosPool.length;
                bgVid.src = verticalVideosPool[currentIdx];
                bgVid.play().catch(() => {});
            });
        }

        let vignette = sec.querySelector('.ambient-video-vignette');
        if (!vignette) {
            vignette = document.createElement('div');
            sec.prepend(vignette);
        }
        vignette.className = 'ambient-video-vignette absolute inset-0 z-[1] pointer-events-none';
        vignette.setAttribute('aria-hidden', 'true');
        vignette.style.cssText = 'position:absolute !important;inset:0 !important;z-index:1 !important;pointer-events:none !important;background:linear-gradient(180deg, rgba(13,12,11,0.92) 0%, rgba(13,12,11,0.28) 20%, rgba(13,12,11,0.28) 80%, rgba(13,12,11,0.92) 100%) !important;';

        // Garantizar que layer sea el primer hijo (z-0) y vignette el segundo (z-1)
        sec.prepend(vignette);
        sec.prepend(layer);
    });

    // Gestión eficiente de reproducción en segundo plano (content-visibility + IntersectionObserver fallback)
    const setSectionVideosState = (sec, shouldPlay) => {
        sec.querySelectorAll('.ambient-video-layer video').forEach((v) => {
            if (shouldPlay) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    };

    const supportsContentVisibility = 'contentVisibility' in document.documentElement.style;
    document.querySelectorAll('.ambient-video-section').forEach((sec) => {
        if (supportsContentVisibility) {
            sec.addEventListener('contentvisibilityautostatechange', (event) => {
                setSectionVideosState(sec, !event.skipped);
            });
        }
    });

    if ('IntersectionObserver' in window) {
        const bgVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setSectionVideosState(entry.target, entry.isIntersecting);
            });
        }, { rootMargin: '200px' });

        document.querySelectorAll('.ambient-video-section').forEach((sec) => {
            bgVideoObserver.observe(sec);
        });
    }

    // Filtro de galería multimedia (Fotos vs Videos vs Eventos)
    const mediaFilterBtns = document.querySelectorAll('[data-media-filter]');
    const mediaItems = document.querySelectorAll('[data-media-type]');

    mediaFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-media-filter');
            mediaFilterBtns.forEach(b => {
                b.classList.remove('bg-mezcal-gold', 'text-mezcal-dark');
                b.classList.add('bg-mezcal-charcoal', 'text-mezcal-light');
            });
            btn.classList.add('bg-mezcal-gold', 'text-mezcal-dark');
            btn.classList.remove('bg-mezcal-charcoal', 'text-mezcal-light');

            mediaItems.forEach(card => {
                const types = card.getAttribute('data-media-type').split(' ');
                if (filter === 'all' || types.includes(filter)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // =========================================================================
    // 9. VALIDACIÓN DE FORMULARIOS DESPUÉS DE INTERACCIÓN (:user-invalid + ARIA)
    // =========================================================================
    const UserInvalidFallback = (() => {
        const dirtyState = new WeakMap();
        const updateState = (input) => {
            const isValid = input.checkValidity();
            input.classList.toggle('user-invalid-fallback', !isValid);
            input.classList.toggle('user-valid-fallback', isValid);
            if (!isValid) {
                input.setAttribute('aria-invalid', 'true');
            } else {
                input.removeAttribute('aria-invalid');
            }
        };
        const handleEvent = (event) => {
            const input = event.target;
            if (event.type === 'reset') {
                const controls = input.elements || [];
                for (const control of controls) {
                    dirtyState.delete(control);
                    control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
                    control.removeAttribute('aria-invalid');
                }
                return;
            }
            if (!input.checkValidity) return;
            if (event.type === 'input' || event.type === 'change') {
                const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
                state.hasInteracted = true;
                dirtyState.set(input, state);
                if (state.hasBlurred) updateState(input);
            } else if (event.type === 'blur') {
                const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
                state.hasBlurred = true;
                dirtyState.set(input, state);
                if (state.hasInteracted) updateState(input);
            }
        };
        const init = (root = document) => {
            if (CSS.supports('selector(:user-invalid)')) return;
            root.addEventListener('blur', handleEvent, true);
            root.addEventListener('input', handleEvent);
            root.addEventListener('change', handleEvent);
            root.addEventListener('reset', handleEvent, true);
        };
        return { init };
    })();

    UserInvalidFallback.init(document);

    // Sincronizar aria-invalid con :user-invalid nativo
    const syncAria = (el) => {
        if (el && el.matches && el.classList?.contains('mezcal-input')) {
            try {
                el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
            } catch (_) {}
        }
    };
    document.addEventListener('blur', (e) => syncAria(e.target), true);
    document.addEventListener('input', (e) => {
        if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
            syncAria(e.target);
        }
    });
});

// Helper global para mensajes de formularios (Contacto y Newsletter)
function showFormFeedback(boxId, messageEs, messageEn, type = 'success') {
    const box = document.getElementById(boxId);
    if (!box) return;
    const lang = localStorage.getItem('mezcalLang') || 'es';
    box.textContent = lang === 'en' ? messageEn : messageEs;
    box.classList.remove('hidden', 'bg-green-500/20', 'text-green-300', 'border-green-500/40', 'bg-red-500/20', 'text-red-300', 'border-red-500/40');
    box.classList.add('border');
    if (type === 'success') {
        box.classList.add('bg-green-500/20', 'text-green-300', 'border-green-500/40');
    } else {
        box.classList.add('bg-red-500/20', 'text-red-300', 'border-red-500/40');
    }
    setTimeout(() => box.classList.add('hidden'), 6000);
}


    // =========================================================================
    // 9. CARRITO DE COMPRAS SLIDEBAR FLUID UI & LOCALSTORAGE
    // =========================================================================
    let cart = JSON.parse(localStorage.getItem('mezcalCart') || '[]');

    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const openCartBtns = document.querySelectorAll('.open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadges = document.querySelectorAll('.cart-count-badge');
    const cartTotalEl = document.getElementById('cart-total');

    function saveCart() {
        localStorage.setItem('mezcalCart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
        cartCountBadges.forEach(b => {
            b.textContent = totalCount;
            b.classList.toggle('hidden', totalCount === 0);
        });

        if (cartTotalEl) {
            const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            cartTotalEl.textContent = `$${totalPrice.toLocaleString('es-MX')} MXN`;
        }

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-12 text-mezcal-light/50">
                    <i class="fa-solid fa-basket-shopping text-4xl mb-3 text-mezcal-gold/40"></i>
                    <p class="text-sm font-light" data-lang-es="Tu cesta de mezcal está vacía" data-lang-en="Your mezcal basket is empty">Tu cesta de mezcal está vacía</p>
                    <a href="mezcales.html" class="inline-block mt-4 text-xs font-semibold uppercase tracking-wider text-mezcal-gold border border-mezcal-gold/40 px-4 py-2 rounded-full hover:bg-mezcal-gold hover:text-mezcal-dark transition-colors">
                        Explorar Mezcales
                    </a>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, idx) => `
            <div class="flex items-center gap-3 p-3.5 bg-mezcal-charcoal/80 rounded-xl border border-white/10 relative overflow-hidden group">
                <img src="${item.img}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg border border-mezcal-gold/30">
                <div class="flex-1 min-w-0">
                    <h4 class="font-serif text-xs md:text-sm font-bold text-mezcal-light truncate">${item.name}</h4>
                    <p class="text-[11px] text-mezcal-gold font-semibold">$${item.price.toLocaleString('es-MX')} MXN</p>
                    <div class="flex items-center gap-2 mt-1.5">
                        <button type="button" class="w-6 h-6 rounded bg-mezcal-dark text-mezcal-light hover:text-mezcal-gold flex items-center justify-center text-xs border border-white/10" onclick="window.changeCartQty(${idx}, -1)">-</button>
                        <span class="text-xs font-bold px-1.5 text-mezcal-light">${item.qty}</span>
                        <button type="button" class="w-6 h-6 rounded bg-mezcal-dark text-mezcal-light hover:text-mezcal-gold flex items-center justify-center text-xs border border-white/10" onclick="window.changeCartQty(${idx}, 1)">+</button>
                    </div>
                </div>
                <button type="button" class="text-red-400 hover:text-red-300 p-2 text-xs" onclick="window.removeFromCart(${idx})" aria-label="Eliminar producto">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    window.addToCart = function(product) {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            existing.qty += (product.qty || 1);
        } else {
            cart.push({ ...product, qty: product.qty || 1 });
        }
        saveCart();
        openCartDrawer();
    };

    window.changeCartQty = function(index, delta) {
        if (cart[index]) {
            cart[index].qty += delta;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            saveCart();
        }
    };

    window.removeFromCart = function(index) {
        if (cart[index]) {
            cart.splice(index, 1);
            saveCart();
        }
    };

    function openCartDrawer() {
        if (cartDrawer) {
            cartDrawer.classList.remove('translate-x-full');
            if (cartBackdrop) cartBackdrop.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    }

    function closeCartDrawer() {
        if (cartDrawer) {
            cartDrawer.classList.add('translate-x-full');
            if (cartBackdrop) cartBackdrop.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }

    openCartBtns.forEach(btn => btn.addEventListener('click', openCartDrawer));
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

    updateCartUI();

    // =========================================================================
    // 9b. CHECKOUT: ENVÍA EL PEDIDO AL BACKEND EN GO (POST /api/orders)
    // =========================================================================
    const WHATSAPP_NUMBER = '5219510000000';
    const checkoutBtn = document.getElementById('checkout-btn');
    const inputClass = 'w-full bg-mezcal-dark/80 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-mezcal-light placeholder-mezcal-light/40 focus:outline-none focus:border-mezcal-gold';

    function formatCents(cents) {
        return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
    }

    function showCheckoutForm() {
        cartItemsContainer.innerHTML = `
            <form id="checkout-form" class="space-y-3" novalidate>
                <h4 class="font-serif text-lg text-mezcal-gold">Datos de envío</h4>
                <input name="name" autocomplete="name" placeholder="Nombre completo" class="${inputClass}">
                <input name="phone" type="tel" autocomplete="tel" placeholder="Teléfono (10 dígitos)" class="${inputClass}">
                <input name="email" type="email" autocomplete="email" placeholder="Correo electrónico" class="${inputClass}">
                <textarea name="address" rows="3" autocomplete="street-address" placeholder="Dirección de envío completa" class="${inputClass}"></textarea>
                <p id="checkout-error" class="text-xs text-red-400 hidden"></p>
                <button type="submit" class="w-full py-3 bg-mezcal-agave hover:bg-mezcal-agave-light text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">
                    Confirmar pedido
                </button>
                <button type="button" id="checkout-back" class="w-full py-2 text-xs text-mezcal-light/60 hover:text-mezcal-gold">Volver a la cesta</button>
            </form>
        `;
        document.getElementById('checkout-back').addEventListener('click', updateCartUI);
        document.getElementById('checkout-form').addEventListener('submit', submitOrder);
    }

    async function submitOrder(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('checkout-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        const data = Object.fromEntries(new FormData(form));
        const fieldNames = { name: 'nombre', phone: 'teléfono', email: 'correo', address: 'dirección', items: 'cesta' };

        form.querySelectorAll('[name]').forEach(el => el.classList.remove('border-red-400'));
        errorEl.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: data,
                    items: cart.map(i => ({ id: i.id, qty: i.qty }))
                })
            });
            const body = await res.json();

            if (res.status === 201) {
                showOrderConfirmation(body);
                return;
            }
            let msg = body.error || 'No se pudo registrar el pedido.';
            if (body.fields) {
                Object.keys(body.fields).forEach(k => form.querySelector(`[name="${k}"]`)?.classList.add('border-red-400'));
                msg = 'Revisa: ' + Object.entries(body.fields).map(([k, v]) => `${fieldNames[k] || k} (${v})`).join(', ');
            }
            errorEl.textContent = msg;
        } catch (err) {
            errorEl.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo.';
        }
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar pedido';
    }

    function showOrderConfirmation(order) {
        cart = [];
        saveCart();
        const summary = order.items.map(i => `${i.qty} x ${i.name}`).join(', ');
        const waText = encodeURIComponent(`Hola, acabo de registrar el pedido ${order.folio} (${summary}) por ${formatCents(order.totalCents)}.`);
        cartItemsContainer.innerHTML = `
            <div class="text-center py-8 space-y-4">
                <i class="fa-solid fa-circle-check text-5xl text-mezcal-agave-light"></i>
                <h4 class="font-serif text-xl text-mezcal-light">¡Pedido registrado!</h4>
                <p class="text-sm text-mezcal-light/70">Tu folio es</p>
                <p id="order-folio" class="font-mono text-2xl font-bold text-mezcal-gold"></p>
                <p class="text-sm text-mezcal-light/70">Total: <strong class="text-mezcal-light">${formatCents(order.totalCents)}</strong></p>
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider">
                    <i class="fa-brands fa-whatsapp text-base"></i> Coordinar pago por WhatsApp
                </a>
            </div>
        `;
        document.getElementById('order-folio').textContent = order.folio;
    }

    if (checkoutBtn && cartItemsContainer) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length === 0) return;
            showCheckoutForm();
        });
    }

    // =========================================================================
    // 10. CINTILLA DE COOKIES (CONSENT BANNER)
    // =========================================================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const rejectCookiesBtn = document.getElementById('reject-cookies-btn');

    if (cookieBanner) {
        const cookieConsent = localStorage.getItem('mezcalCookieConsent');
        if (!cookieConsent) {
            setTimeout(() => {
                cookieBanner.classList.remove('hidden-banner');
            }, 800);
        }

        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', () => {
                localStorage.setItem('mezcalCookieConsent', 'accepted');
                cookieBanner.classList.add('hidden-banner');
            });
        }

        if (rejectCookiesBtn) {
            rejectCookiesBtn.addEventListener('click', () => {
                localStorage.setItem('mezcalCookieConsent', 'rejected');
                cookieBanner.classList.add('hidden-banner');
            });
        }
    }

    // =========================================================================
    // 11. SISTEMA DE LOGIN Y SESIÓN DE USUARIO (CLIENTE / ADMIN / POS)
    // =========================================================================
    function updateAuthUI() {
        const authUser = JSON.parse(localStorage.getItem('mezcalUser') || 'null');
        const userRoleBadges = document.querySelectorAll('.user-role-badge');
        const authLinks = document.querySelectorAll('.auth-link');
        const logoutBtns = document.querySelectorAll('.logout-nav-btn');

        if (authUser) {
            const roleParam = authUser.role || 'admin';
            const clientParam = authUser.clientId && authUser.clientId !== 'admin' ? `&client=${authUser.clientId}` : '';
            const shortLabel = roleParam === 'admin' ? 'Dashboard Admin' : `Mi Panel (${(authUser.name || 'Cliente').split(' ')[0]})`;

            authLinks.forEach(l => {
                l.setAttribute('href', `dashboard.html?role=${roleParam}${clientParam}`);
                l.innerHTML = `<i class="fa-solid fa-gauge-high"></i> <span>${shortLabel}</span>`;
            });
            logoutBtns.forEach(btn => {
                btn.classList.remove('hidden');
            });
            userRoleBadges.forEach(b => {
                b.textContent = roleParam.toUpperCase();
                b.classList.remove('hidden');
            });
        } else {
            authLinks.forEach(l => {
                l.setAttribute('href', 'login.html');
                l.innerHTML = `<i class="fa-solid fa-user"></i> <span>Iniciar Sesión</span>`;
            });
            logoutBtns.forEach(btn => {
                btn.classList.add('hidden');
            });
            userRoleBadges.forEach(b => {
                b.classList.add('hidden');
            });
        }
    }
    updateAuthUI();
    document.addEventListener('DOMContentLoaded', updateAuthUI);

    window.mezcalLogout = function() {
        localStorage.removeItem('mezcalUser');
        updateAuthUI();
        window.location.href = 'login.html';
    };
