/**
 * Mezcal Artesanal "Mil Sensaciones" — Motor de Partículas 3D (Escultura Morphing)
 * Desarrollado por: Ing. en Computación Jose Ramon Aragon Toledo
 *
 * IMPORTANTE: este motor YA NO se monta en todo el sitio.
 * Solo vive dentro del recorrido "Del Maguey a la Copa" (proceso.html, [data-journey]).
 * motion.js crea la instancia y le entrega el progreso del scroll (0 → 1).
 *
 * API pública:
 *   const stage = new window.MezcalParticleStage(canvas, { panels: PANEL_CONFIGS });
 *   stage.setProgress(0..1)   // progreso continuo del recorrido
 *   stage.burst()             // explosión inicial desde el centro
 *   stage.start() / stage.stop() / stage.resize()
 *
 * 7 esculturas (una por capítulo del proceso):
 *   0 Roseta de maguey (Jima)        4 Alambique de cobre (Destilación)
 *   1 Horno cónico + fuego (Cocción) 5 Botella 750 ml (Envasado)
 *   2 Tahona de piedra (Molienda)    6 Copa veladora + cruz (A tu copa)
 *   3 Tina de madera + burbujas (Fermentación)
 */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a * 1664525 + 1013904223) >>> 0;
            return a / 4294967296;
        };
    }
    function gauss(rng) {
        const u = Math.max(1e-6, rng());
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * rng());
    }
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function smoothstep(e0, e1, x) {
        const t = clamp01((x - e0) / (e1 - e0));
        return t * t * (3 - 2 * t);
    }

    // Colores por paleta: [acento, verde/primario, tierra, crema, profundo]
    const PALETTE_COLORS = {
        natural: [[212, 175, 55], [108, 134, 99], [139, 90, 43], [244, 241, 234], [75, 96, 67]],
        tierra:  [[223, 154, 87], [168, 93, 52], [140, 70, 34], [247, 239, 230], [110, 56, 28]],
        maguey:  [[166, 201, 106], [68, 145, 93], [45, 110, 66], [238, 246, 240], [59, 122, 82]],
        cobre:   [[229, 142, 73], [214, 113, 57], [184, 90, 39], [249, 241, 233], [168, 78, 36]]
    };

    function makeBuffers(count) {
        return { pos: new Float32Array(count * 3), colorIdx: new Uint8Array(count), size: new Float32Array(count) };
    }
    function put(b, i, x, y, z, c, s) {
        b.pos[i * 3] = x; b.pos[i * 3 + 1] = y; b.pos[i * 3 + 2] = z;
        b.colorIdx[i] = c; b.size[i] = s;
    }

    // ---------------------------------------------------------------------
    // 0. Roseta de maguey (piña + pencas en espiral Fibonacci)
    // ---------------------------------------------------------------------
    function buildAgave(count, rng) {
        const b = makeBuffers(count);
        const leaves = 22;
        for (let i = 0; i < count; i++) {
            const r = rng();
            if (r < 0.24) {
                const u = rng() * 2 - 1, th = rng() * Math.PI * 2, rad = Math.pow(rng(), 0.65) * 0.42, s = Math.sqrt(1 - u * u);
                put(b, i, Math.cos(th) * s * rad, u * rad * 0.9 - 0.1, Math.sin(th) * s * rad, r < 0.12 ? 0 : 2, 1.6 + rng() * 1.4);
            } else if (r < 0.9) {
                const leaf = i % leaves, ang = leaf * 2.39996, tier = (leaf % 3) * 0.22 + 0.18;
                const t = Math.pow(rng(), 0.78), len = 1.35 + (leaf % 4) * 0.16, dist = 0.25 + t * len;
                const arch = Math.sin(t * Math.PI * 0.82) * (0.45 + tier) - t * 0.25;
                const spread = (rng() * 2 - 1) * (1 - t * 0.85) * 0.14;
                const ca = Math.cos(ang), sa = Math.sin(ang);
                put(b, i, ca * dist - sa * spread, arch - 0.15 + gauss(rng) * 0.025, sa * dist + ca * spread,
                    t > 0.88 ? 0 : (leaf % 2 === 0 ? 1 : 4), t > 0.88 ? 1.8 : 1.1 + (1 - t) * 0.9);
            } else {
                const th = rng() * Math.PI * 2, rad = 0.8 + rng() * 1.3;
                put(b, i, Math.cos(th) * rad, (rng() * 2 - 1) * 1.1, Math.sin(th) * rad, 3, 0.9 + rng() * 1.1);
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 1. Horno cónico de tierra + vórtice de fuego
    // ---------------------------------------------------------------------
    function buildOven(count, rng) {
        const b = makeBuffers(count);
        for (let i = 0; i < count; i++) {
            const th = rng() * Math.PI * 2;
            if (rng() < 0.52) {
                const t = rng(), rad = 1.28 - t * 0.62 + gauss(rng) * 0.04;
                put(b, i, Math.cos(th) * rad, -1.05 + t * 0.95, Math.sin(th) * rad, t < 0.4 ? 2 : 0, 1.2 + rng() * 1.1);
            } else {
                const t = rng(), sp = th + t * 5.5, rad = (0.18 + t * 0.72) * (0.65 + 0.35 * Math.sin(t * Math.PI));
                put(b, i, Math.cos(sp) * rad + gauss(rng) * 0.06, -0.35 + t * 1.75, Math.sin(sp) * rad + gauss(rng) * 0.06,
                    t < 0.45 ? 0 : (t < 0.75 ? 2 : 3), (1 - t * 0.4) * (1.4 + rng() * 1.3));
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 2. Tahona: canal circular de piedra + rueda vertical + fibras
    // ---------------------------------------------------------------------
    function buildTahona(count, rng) {
        const b = makeBuffers(count);
        for (let i = 0; i < count; i++) {
            const r = rng();
            if (r < 0.42) {
                // Canal circular (toro aplanado) donde se machaca el maguey
                const a = rng() * Math.PI * 2, tube = rng() * Math.PI * 2;
                const R = 1.25, rr = 0.2;
                put(b, i, Math.cos(a) * (R + Math.cos(tube) * rr), -0.75 + Math.sin(tube) * rr * 0.45,
                    Math.sin(a) * (R + Math.cos(tube) * rr), 2, 1.1 + rng() * 0.9);
            } else if (r < 0.72) {
                // Rueda de piedra vertical (disco con espesor) sobre el canal
                const a = rng() * Math.PI * 2, rad = 0.62 * Math.sqrt(rng()), w = (rng() * 2 - 1) * 0.16;
                put(b, i, 1.25 + w, -0.15 + Math.sin(a) * rad, Math.cos(a) * rad, rad > 0.55 ? 0 : 3, 1.2 + rng() * 0.8);
            } else if (r < 0.8) {
                // Eje / brazo central que hace girar la rueda
                const t = rng();
                put(b, i, t * 1.25, -0.15 + gauss(rng) * 0.02, gauss(rng) * 0.02, 0, 1.4);
            } else {
                // Fibras de maguey cocido levantándose del canal
                const a = rng() * Math.PI * 2, h = rng() * 0.9;
                put(b, i, Math.cos(a) * (1.25 + gauss(rng) * 0.15), -0.7 + h, Math.sin(a) * (1.25 + gauss(rng) * 0.15),
                    h > 0.5 ? 0 : 1, 0.9 + rng());
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 3. Tina de madera (duelas + aros) con burbujas de fermentación
    // ---------------------------------------------------------------------
    function buildVat(count, rng) {
        const b = makeBuffers(count);
        const staves = 18;
        for (let i = 0; i < count; i++) {
            const r = rng();
            if (r < 0.55) {
                // Duelas: cilindro ligeramente abombado, con separación entre tablas
                const st = Math.floor(rng() * staves), a = (st + 0.1 + rng() * 0.8) / staves * Math.PI * 2;
                const t = rng(), y = -1.0 + t * 1.6, rad = 0.95 + Math.sin(t * Math.PI) * 0.08;
                put(b, i, Math.cos(a) * rad, y, Math.sin(a) * rad, 2, 1.1 + rng() * 0.8);
            } else if (r < 0.68) {
                // Aros metálicos
                const a = rng() * Math.PI * 2, ring = Math.floor(rng() * 3), y = [-0.82, -0.2, 0.42][ring];
                const t = (y + 1.0) / 1.6, rad = 0.99 + Math.sin(t * Math.PI) * 0.08;
                put(b, i, Math.cos(a) * rad, y, Math.sin(a) * rad, 0, 1.5 + rng() * 0.6);
            } else if (r < 0.8) {
                // Superficie del mosto
                const a = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * 0.92;
                put(b, i, Math.cos(a) * rad, 0.5 + gauss(rng) * 0.02, Math.sin(a) * rad, 1, 1.0 + rng() * 0.8);
            } else {
                // Burbujas ascendiendo desde el mosto
                const a = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * 0.8, h = Math.pow(rng(), 1.6) * 1.2;
                put(b, i, Math.cos(a) * rad, 0.55 + h, Math.sin(a) * rad, 3, 1.4 + rng() * 1.6);
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 4. Alambique de cobre + serpentín
    // ---------------------------------------------------------------------
    function buildStill(count, rng) {
        const b = makeBuffers(count);
        for (let i = 0; i < count; i++) {
            const r = rng(), th = rng() * Math.PI * 2;
            if (r < 0.48) {
                const u = rng() * 2 - 1, rad = 0.78 * Math.sqrt(1 - u * u * 0.75);
                put(b, i, Math.cos(th) * rad, u * 0.58 - 0.42, Math.sin(th) * rad, 0, 1.3 + rng());
            } else if (r < 0.72) {
                const t = rng(), rad = 0.42 * (1 - t * 0.65) + Math.sin(t * Math.PI) * 0.12;
                put(b, i, Math.cos(th) * rad + (t > 0.6 ? (t - 0.6) * 0.65 : 0), 0.16 + t * 0.78, Math.sin(th) * rad, 2, 1.2 + rng() * 0.9);
            } else {
                const t = rng(), ca = t * Math.PI * 2 * 5.5, tube = rng() * Math.PI * 2;
                put(b, i, Math.cos(ca) * (0.98 + Math.cos(tube) * 0.055), 0.75 - t * 1.65 + Math.sin(tube) * 0.055,
                    Math.sin(ca) * (0.98 + Math.cos(tube) * 0.055), 3, 1.35 + rng());
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 5. Botella artesanal 750 ml
    // ---------------------------------------------------------------------
    function buildBottle(count, rng) {
        const b = makeBuffers(count);
        for (let i = 0; i < count; i++) {
            const r = rng(), th = rng() * Math.PI * 2;
            if (r < 0.56) {
                const t = rng(), y = -1.15 + t * 1.4, rad = 0.52 + Math.sin(t * Math.PI) * 0.02 + gauss(rng) * 0.015;
                const label = y > -0.62 && y < -0.02 && Math.cos(th) > -0.2;
                put(b, i, Math.cos(th) * rad, y, Math.sin(th) * rad, label ? 0 : 1, label ? 1.5 + rng() * 0.9 : 1.05 + rng() * 0.7);
            } else if (r < 0.74) {
                const t = rng(), rad = 0.52 - easeInOutCubic(t) * 0.34 + gauss(rng) * 0.012;
                put(b, i, Math.cos(th) * rad, 0.25 + t * 0.37, Math.sin(th) * rad, 2, 1.2 + rng() * 0.8);
            } else if (r < 0.88) {
                const t = rng(), lip = t > 0.86, rad = (lip ? 0.21 : 0.18) + gauss(rng) * 0.01;
                put(b, i, Math.cos(th) * rad, 0.62 + t * 0.56, Math.sin(th) * rad, lip ? 0 : 3, lip ? 1.7 : 1.15);
            } else {
                const rad = rng() * 0.38;
                put(b, i, Math.cos(th) * rad, -1.0 + rng() * 2.2, Math.sin(th) * rad, 0, 1.5 + rng() * 1.3);
            }
        }
        return b;
    }

    // ---------------------------------------------------------------------
    // 6. Copa veladora + cruz oaxaqueña
    // ---------------------------------------------------------------------
    function buildGlass(count, rng) {
        const b = makeBuffers(count);
        for (let i = 0; i < count; i++) {
            const th = rng() * Math.PI * 2;
            if (rng() < 0.62) {
                const t = rng(), rad = 0.42 + t * 0.28 + Math.cos(th * 12) * 0.035 + gauss(rng) * 0.01;
                put(b, i, Math.cos(th) * rad, -0.88 + t * 1.55, Math.sin(th) * rad, t > 0.88 ? 0 : 1, t > 0.88 ? 1.7 : 1.15 + rng() * 0.8);
            } else {
                const arm = i % 4, aa = (arm * Math.PI) / 2, dist = rng() * 1.15, sp = (rng() * 2 - 1) * (1 - dist / 1.25) * 0.16;
                put(b, i, Math.cos(aa) * dist - Math.sin(aa) * sp, -0.15 + Math.sin(dist * 4) * 0.08,
                    Math.sin(aa) * dist + Math.cos(aa) * sp, 0, 1.4 + rng() * 1.1);
            }
        }
        return b;
    }

    const POSE_BUILDERS = [buildAgave, buildOven, buildTahona, buildVat, buildStill, buildBottle, buildGlass];
    const STAGE_KEYS = ['pose', 'x', 'y', 'scale', 'rx', 'ry', 'rz', 'spin', 'alpha'];

    class MezcalParticleStage {
        /**
         * @param {HTMLCanvasElement} canvas
         * @param {{ panels: Array<object>, mobilePanels?: Array<object> }} options
         */
        constructor(canvas, options) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: true });
            this.panelsDesktop = options.panels;
            this.panelsMobile = options.mobilePanels || options.panels;
            this.count = this.isCompact() ? 900 : 2000;

            const rng = mulberry32(9001);
            this.poses = POSE_BUILDERS.map((build) => build(this.count, rng));

            this.pos = new Float32Array(this.count * 3);
            this.vel = new Float32Array(this.count * 3);
            this.col = new Float32Array(this.count * 3);
            this.size = new Float32Array(this.count);
            this.seed = new Float32Array(this.count);
            this.stiff = new Float32Array(this.count);
            for (let i = 0; i < this.count; i++) {
                this.seed[i] = rng();
                this.stiff[i] = 0.018 + rng() * rng() * 0.055;
            }

            this.progress = 0;
            this.cur = this.configAt(0);
            this.tgt = this.configAt(0);
            this.spinAngle = 0;
            this.pointer = { x: 0, y: 0, cx: 0, cy: 0 };
            this.time = 0;
            this.lastTime = 0;
            this.running = false;
            this.rafId = null;

            this.resize();
            this.integrate(1, true);
            this.render();
        }

        isCompact() {
            return window.innerWidth < 768;
        }

        panels() {
            return this.isCompact() ? this.panelsMobile : this.panelsDesktop;
        }

        /** Interpola la configuración entre paneles para un progreso 0..1 */
        configAt(p) {
            const list = this.panels();
            const f = clamp01(p) * (list.length - 1);
            const i = Math.min(list.length - 2, Math.floor(f));
            const t = f - i;
            const a = list[i], b = list[i + 1];
            const eased = easeInOutCubic(t);
            // La pose cambia en la mitad central del tramo para que cada escultura "respire" entre capítulos
            const poseT = clamp01((t - 0.2) / 0.6);
            const out = {};
            for (const k of STAGE_KEYS) {
                const w = k === 'pose' ? poseT : eased;
                out[k] = a[k] + (b[k] - a[k]) * w;
            }
            return out;
        }

        setProgress(p) {
            this.progress = clamp01(p);
            this.tgt = this.configAt(this.progress);
            if (prefersReducedMotion) {
                Object.assign(this.cur, this.tgt);
                this.integrate(1, true);
                this.render();
            }
        }

        setPointer(x, y) {
            this.pointer.x = x;
            this.pointer.y = y;
        }

        palette() {
            const id = document.documentElement.getAttribute('data-palette') || 'natural';
            return PALETTE_COLORS[id] || PALETTE_COLORS.natural;
        }

        burst() {
            if (prefersReducedMotion) return;
            const rng = mulberry32(4242);
            for (let i = 0; i < this.count; i++) {
                const th = rng() * Math.PI * 2, u = rng() * 2 - 1, s = Math.sqrt(1 - u * u), sp = 0.08 + rng() * rng() * 0.36;
                this.pos[i * 3] = this.pos[i * 3 + 1] = this.pos[i * 3 + 2] = 0;
                this.vel[i * 3] = Math.cos(th) * s * sp;
                this.vel[i * 3 + 1] = u * sp;
                this.vel[i * 3 + 2] = Math.sin(th) * s * sp;
            }
            this.cur.alpha = 0.05;
        }

        integrate(dt, instant) {
            const max = this.poses.length - 1;
            const d = Math.max(0, Math.min(max, this.cur.pose));
            const ia = Math.min(max - 1, Math.floor(d));
            const frac = d - ia;
            const A = this.poses[ia], B = this.poses[ia + 1];
            const pal = this.palette();
            const damping = Math.pow(0.86, dt);
            const lerpC = instant ? 1 : 1 - Math.pow(1 - 0.09, dt);
            const stagger = 0.72;

            for (let i = 0; i < this.count; i++) {
                const i3 = i * 3;
                const w = smoothstep(0, 1, frac * (1 + stagger) - this.seed[i] * stagger);
                const tx = A.pos[i3] + (B.pos[i3] - A.pos[i3]) * w;
                const ty = A.pos[i3 + 1] + (B.pos[i3 + 1] - A.pos[i3 + 1]) * w;
                const tz = A.pos[i3 + 2] + (B.pos[i3 + 2] - A.pos[i3 + 2]) * w;

                if (instant) {
                    this.pos[i3] = tx; this.pos[i3 + 1] = ty; this.pos[i3 + 2] = tz;
                    this.vel[i3] = this.vel[i3 + 1] = this.vel[i3 + 2] = 0;
                } else {
                    const k = this.stiff[i] * dt;
                    this.vel[i3] = (this.vel[i3] + (tx - this.pos[i3]) * k) * damping;
                    this.vel[i3 + 1] = (this.vel[i3 + 1] + (ty - this.pos[i3 + 1]) * k) * damping;
                    this.vel[i3 + 2] = (this.vel[i3 + 2] + (tz - this.pos[i3 + 2]) * k) * damping;
                    this.pos[i3] += this.vel[i3] * dt;
                    this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
                    this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
                }

                const cA = pal[A.colorIdx[i] % pal.length], cB = pal[B.colorIdx[i] % pal.length];
                this.col[i3] += (cA[0] + (cB[0] - cA[0]) * w - this.col[i3]) * lerpC;
                this.col[i3 + 1] += (cA[1] + (cB[1] - cA[1]) * w - this.col[i3 + 1]) * lerpC;
                this.col[i3 + 2] += (cA[2] + (cB[2] - cA[2]) * w - this.col[i3 + 2]) * lerpC;
                this.size[i] += (A.size[i] + (B.size[i] - A.size[i]) * w - this.size[i]) * lerpC;
            }
        }

        update(dtSec) {
            const dt = Math.min(2.2, Math.max(0.4, dtSec * 60));
            const ease = 1 - Math.pow(1 - 0.08, dt);
            for (const k of STAGE_KEYS) this.cur[k] += (this.tgt[k] - this.cur[k]) * ease;
            this.pointer.cx += (this.pointer.x - this.pointer.cx) * ease;
            this.pointer.cy += (this.pointer.y - this.pointer.cy) * ease;
            this.spinAngle += this.cur.spin * dtSec;
            this.time += dtSec;
            this.integrate(dt, false);
        }

        render() {
            const ctx = this.ctx, w = this.width, h = this.height;
            ctx.clearRect(0, 0, w, h);
            if (this.cur.alpha <= 0.01) return;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const rx = this.cur.rx + this.pointer.cy * 0.22;
            const ry = this.cur.ry + this.spinAngle + this.pointer.cx * 0.32;
            const rz = this.cur.rz;
            const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
            const centerX = w * (0.5 + this.cur.x), centerY = h * (0.5 + this.cur.y);
            const baseScale = Math.min(w, h) * 0.28 * this.cur.scale;
            const camZ = 4.2;

            for (let i = 0; i < this.count; i++) {
                const i3 = i * 3;
                const drift = Math.sin(this.time * 1.6 + this.seed[i] * 18.0) * 0.018;
                const px = this.pos[i3] + drift, py = this.pos[i3 + 1] + drift * 0.7, pz = this.pos[i3 + 2];
                const x1 = px * cy + pz * sy, z1 = -px * sy + pz * cy;
                const y2 = py * cx - z1 * sx, z2 = py * sx + z1 * cx;
                const x3 = x1 * cz - y2 * sz, y3 = x1 * sz + y2 * cz;
                const depth = camZ - z2;
                if (depth <= 0.3) continue;
                const persp = 2.6 / depth;
                const X = centerX + x3 * baseScale * persp, Y = centerY - y3 * baseScale * persp;
                if (X < -40 || X > w + 40 || Y < -40 || Y > h + 40) continue;
                const dof = Math.abs(depth - 4.1);
                const radius = Math.max(0.8, this.size[i] * persp * 1.15 + dof * 0.95);
                const alpha = Math.min(0.92, this.cur.alpha * (0.55 / (1 + dof * 1.45)));
                ctx.fillStyle = `rgba(${this.col[i3] | 0},${this.col[i3 + 1] | 0},${this.col[i3 + 2] | 0},${alpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(X, Y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            this.width = rect.width || window.innerWidth;
            this.height = rect.height || window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, this.isCompact() ? 1.25 : 1.5);
            this.canvas.width = Math.floor(this.width * dpr);
            this.canvas.height = Math.floor(this.height * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.tgt = this.configAt(this.progress);
            if (!this.running) this.render();
        }

        start() {
            if (this.running || prefersReducedMotion) return;
            this.running = true;
            this.lastTime = 0;
            const loop = (now) => {
                if (!this.running) return;
                const dt = this.lastTime ? Math.min(0.05, (now - this.lastTime) / 1000) : 1 / 60;
                this.lastTime = now;
                this.update(dt);
                this.render();
                this.rafId = requestAnimationFrame(loop);
            };
            this.rafId = requestAnimationFrame(loop);
        }

        stop() {
            this.running = false;
            if (this.rafId !== null) cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    window.MezcalParticleStage = MezcalParticleStage;
})();
