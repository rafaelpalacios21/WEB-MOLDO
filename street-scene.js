/**
 * moldoLab — Street Hero 3D Scene
 * Three.js + scroll-based animation (Lenis-compatible via getBoundingClientRect)
 * Estética: ciudad tropical editorial, imperfecta, cálida y premium
 */

(function initStreetScene() {
    const canvas = document.getElementById('street-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // ─────────────────────────────────────────────────────────
    // 1. RENDERER & CAMERA
    // ─────────────────────────────────────────────────────────

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ab0cc);
    scene.fog = new THREE.FogExp2(0xc8b488, 0.016);

    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2.5, 11);
    camera.lookAt(0, 2.2, -2);

    // ─────────────────────────────────────────────────────────
    // 2. LIGHTS
    // ─────────────────────────────────────────────────────────

    const ambient = new THREE.AmbientLight(0xfff8e8, 1.1);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0c8, 4.8);
    sun.position.set(5, 16, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    const deepGlow = new THREE.PointLight(0xffcc88, 1.0, 30);
    deepGlow.position.set(0, 3.5, -20);
    scene.add(deepGlow);

    const warmFill = new THREE.PointLight(0xffe0a0, 0.7, 20);
    warmFill.position.set(2, 0.5, 3);
    scene.add(warmFill);

    const rimLight = new THREE.PointLight(0xffffff, 0.8, 16);
    rimLight.position.set(-4, 8, 5);
    scene.add(rimLight);

    // ─────────────────────────────────────────────────────────
    // 3. PROCEDURAL TEXTURE GENERATORS
    // ─────────────────────────────────────────────────────────

    function makeFacadeTexture({
        w = 1024, h = 1024,
        wallColor = '#C9A848',
        signText = 'TIENDA',
        signColor = '#8B1512',
        shutterColor = '#7a5030',
        floors = 4,
        label = '12'
    } = {}) {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d');

        // Base wall — upper portion
        ctx.fillStyle = wallColor;
        ctx.fillRect(0, 0, w, h);

        // Two-tone: darker lower band (like San Miguel de Allende style)
        // Lower ~30% is a deeper/contrasting tone
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(0, h * 0.70, w, h * 0.30);

        // Subtle vertical color variation (wet/dry patches)
        for (let x = 0; x < w; x += 36) {
            const v = (Math.random() - 0.5) * 18;
            ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},0,0,0.022)`;
            ctx.fillRect(x, 0, 36, h);
        }

        // Aging gradient — sunbleached top, darker at join
        const ag = ctx.createLinearGradient(0, 0, 0, h);
        ag.addColorStop(0, 'rgba(255,250,200,0.18)');
        ag.addColorStop(0.22, 'rgba(255,255,255,0.06)');
        ag.addColorStop(0.68, 'rgba(0,0,0,0.04)');
        ag.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = ag; ctx.fillRect(0, 0, w, h);

        const fH = h / floors;

        // Cornice lines between floors
        for (let f = 0; f <= floors; f++) {
            ctx.fillStyle = 'rgba(0,0,0,0.24)'; ctx.fillRect(0, f * fH - 4, w, 8);
            ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, f * fH + 3, w, 3);
        }

        // Windows
        const nW = 3;
        const wW = Math.floor(w / nW * 0.46);
        const wH = Math.floor(fH * 0.42);
        const wPX = Math.floor((w / nW - wW) / 2);
        const wPY = Math.floor(fH * 0.18);

        for (let f = 0; f < floors; f++) {
            const isGround = f === floors - 1;
            for (let wn = 0; wn < nW; wn++) {
                if (isGround && wn === 1) continue;

                const wx = wn * (w / nW) + wPX;
                const wy = f * fH + wPY;

                // Deep reveal
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                ctx.fillRect(wx - 6, wy - 6, wW + 12, wH + 12);

                // Glass
                const gg = ctx.createLinearGradient(wx, wy, wx, wy + wH);
                gg.addColorStop(0, 'rgba(48,75,108,0.88)');
                gg.addColorStop(1, 'rgba(14,22,42,0.97)');
                ctx.fillStyle = gg; ctx.fillRect(wx, wy, wW, wH);

                // Shutter slats (some windows)
                if (Math.random() > 0.38) {
                    const sc = 8;
                    for (let s = 0; s < sc; s++) {
                        ctx.fillStyle = s % 2 === 0 ? shutterColor : 'rgba(0,0,0,0.22)';
                        ctx.fillRect(wx, wy + s * (wH / sc), wW, wH / sc - 1);
                    }
                }

                // Metal rejas (bars)
                ctx.strokeStyle = 'rgba(15,12,8,0.88)';
                ctx.lineWidth = 2.5;
                for (let b = 1; b <= 3; b++) {
                    ctx.beginPath();
                    ctx.moveTo(wx + (wW / 4) * b, wy);
                    ctx.lineTo(wx + (wW / 4) * b, wy + wH);
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.moveTo(wx, wy + wH * 0.5);
                ctx.lineTo(wx + wW, wy + wH * 0.5);
                ctx.stroke();

                // Glass reflection glint
                ctx.fillStyle = 'rgba(255,255,255,0.055)';
                ctx.beginPath();
                ctx.moveTo(wx + 3, wy + 3);
                ctx.lineTo(wx + wW * 0.38, wy + 3);
                ctx.lineTo(wx + 3, wy + wH * 0.48);
                ctx.closePath(); ctx.fill();
            }
        }

        // Entrance door (ground floor center)
        const gY = (floors - 1) * fH;
        const dW = Math.floor(w * 0.21);
        const dH = Math.floor(fH * 0.74);
        const dX = w / 2 - dW / 2;
        const dY = gY + fH - dH;
        ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(dX - 7, dY - 7, dW + 14, dH + 7);
        ctx.fillStyle = '#2a1608'; ctx.fillRect(dX, dY, dW, dH);
        ctx.fillStyle = '#3c2210';
        ctx.fillRect(dX + 5, dY + 5, dW / 2 - 8, dH * 0.58);
        ctx.fillRect(dX + dW / 2 + 3, dY + 5, dW / 2 - 8, dH * 0.58);
        ctx.fillRect(dX + 5, dY + dH * 0.64, dW / 2 - 8, dH * 0.3);
        ctx.fillRect(dX + dW / 2 + 3, dY + dH * 0.64, dW / 2 - 8, dH * 0.3);
        ctx.fillStyle = '#c8a040';
        ctx.fillRect(dX + dW * 0.73, dY + dH * 0.46, 5, 18);
        ctx.fillRect(dX + dW * 0.73, dY + dH * 0.51, 13, 4);

        // Painted sign (above ground floor)
        const sY = gY - fH * 0.06;
        const sH = fH * 0.19;
        ctx.fillStyle = signColor; ctx.fillRect(w * 0.05, sY - sH, w * 0.9, sH);
        ctx.fillStyle = '#f5e8c0';
        ctx.font = `bold ${Math.floor(sH * 0.58)}px Arial, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(signText, w / 2, sY - sH / 2);

        // Building number
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.font = `bold ${Math.floor(fH * 0.27)}px Arial`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(label, w * 0.05, fH * 0.08);

        // Water stain streaks
        for (let i = 0; i < 14; i++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h * 0.55;
            const sl = 35 + Math.random() * 110;
            ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.07})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(sx + (Math.random() - 0.5) * 18, sy + sl * 0.35,
                sx + (Math.random() - 0.5) * 14, sy + sl * 0.7,
                sx + (Math.random() - 0.5) * 8, sy + sl);
            ctx.stroke();
        }

        // Stucco grain
        for (let i = 0; i < 5000; i++) {
            ctx.fillStyle = `rgba(0,0,0,${0.012 + Math.random() * 0.028})`;
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    function makeFloorTexture() {
        const cv = document.createElement('canvas');
        cv.width = 512; cv.height = 512;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#8a7c68'; ctx.fillRect(0, 0, 512, 512);

        const tw = 42, th = 26;
        for (let row = 0; row <= 512 / th + 1; row++) {
            for (let col = 0; col <= 512 / tw + 2; col++) {
                const ox = row % 2 === 0 ? 0 : tw / 2;
                const x = col * tw - tw + ox;
                const y = row * th;
                const sh = 0.78 + Math.random() * 0.36;
                ctx.fillStyle = `rgb(${Math.floor(148 * sh)},${Math.floor(130 * sh)},${Math.floor(100 * sh)})`;
                ctx.fillRect(x + 2, y + 2, tw - 4, th - 4);
                ctx.strokeStyle = 'rgba(38,28,18,0.52)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1.5, y + 1.5, tw - 3, th - 3);
            }
        }

        // Worn center track
        const tr = ctx.createLinearGradient(190, 0, 322, 0);
        tr.addColorStop(0, 'rgba(0,0,0,0)');
        tr.addColorStop(0.5, 'rgba(0,0,0,0.14)');
        tr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tr; ctx.fillRect(0, 0, 512, 512);

        // Moisture/wet patches
        for (let i = 0; i < 6; i++) {
            const mx = Math.random() * 512, my = Math.random() * 512;
            const mr = 18 + Math.random() * 38;
            const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
            mg.addColorStop(0, 'rgba(22,32,55,0.28)');
            mg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = mg;
            ctx.beginPath(); ctx.ellipse(mx, my, mr, mr * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 22);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    function makeBuildingTex(baseColor, rows = 4, cols = 2) {
        const cv = document.createElement('canvas');
        cv.width = 512; cv.height = 512;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 512, 512);

        const ag = ctx.createLinearGradient(0, 0, 0, 512);
        ag.addColorStop(0, 'rgba(255,240,180,0.09)');
        ag.addColorStop(1, 'rgba(0,0,0,0.44)');
        ctx.fillStyle = ag; ctx.fillRect(0, 0, 512, 512);

        const fH = 512 / rows;
        const wW = (512 / cols) * 0.5;
        const wH = fH * 0.38;
        const wPX = (512 / cols - wW) / 2;
        const wPY = fH * 0.22;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const wx = c * (512 / cols) + wPX;
                const wy = r * fH + wPY;
                const lit = Math.random() > 0.42;
                ctx.fillStyle = 'rgba(0,0,0,0.58)'; ctx.fillRect(wx - 3, wy - 3, wW + 6, wH + 6);
                if (lit) {
                    const wg = ctx.createLinearGradient(wx, wy, wx, wy + wH);
                    wg.addColorStop(0, '#ffd060'); wg.addColorStop(1, '#c07818');
                    ctx.fillStyle = wg; ctx.fillRect(wx, wy, wW, wH);
                    const glo = ctx.createRadialGradient(wx + wW / 2, wy + wH / 2, 0, wx + wW / 2, wy + wH / 2, wW * 1.2);
                    glo.addColorStop(0, 'rgba(255,175,45,0.22)'); glo.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = glo; ctx.fillRect(wx - wW, wy - wH, wW * 3, wH * 3);
                } else {
                    ctx.fillStyle = '#0c1522'; ctx.fillRect(wx, wy, wW, wH);
                }
                // Bars
                ctx.strokeStyle = 'rgba(8,8,8,0.72)'; ctx.lineWidth = 2;
                for (let b = 1; b <= 2; b++) {
                    ctx.beginPath();
                    ctx.moveTo(wx + (wW / 3) * b, wy);
                    ctx.lineTo(wx + (wW / 3) * b, wy + wH);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, r * fH, 512, 3);
        }

        for (let i = 0; i < 2500; i++) {
            ctx.fillStyle = `rgba(0,0,0,${0.01 + Math.random() * 0.03})`;
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    function makeSkyTex() {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 512;
        const ctx = cv.getContext('2d');
        // Afternoon blue sky
        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0,    '#3a6ea0');
        g.addColorStop(0.35, '#6098c0');
        g.addColorStop(0.65, '#90bcd8');
        g.addColorStop(0.85, '#d8e8f0');
        g.addColorStop(1,    '#f0e8d0');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512);
        // Painterly cloud suggestions
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        [[80,120,90,32],[160,90,110,24],[40,180,70,18],[200,150,85,20]].forEach(([cx,cy,rw,rh]) => {
            ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2); ctx.fill();
        });
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        [[100,100,130,18],[180,130,100,15]].forEach(([cx,cy,rw,rh]) => {
            ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2); ctx.fill();
        });
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    // ─────────────────────────────────────────────────────────
    // 4. SCENE CONSTRUCTION
    // ─────────────────────────────────────────────────────────

    // Sky
    const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(130, 65),
        new THREE.MeshBasicMaterial({ map: makeSkyTex(), fog: false })
    );
    sky.position.set(0, 20, -70);
    scene.add(sky);

    // Floor (cobblestone street)
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 110),
        new THREE.MeshLambertMaterial({ map: makeFloorTexture() })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -38);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling / sky cutoff (top of narrow street)
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 110),
        new THREE.MeshLambertMaterial({ color: 0x08080a })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 11.5, -38);
    scene.add(ceiling);

    // Front facades (the gates that open)
    const FAC_W = 7.5, FAC_H = 11.5;

    const leftFac = new THREE.Mesh(
        new THREE.PlaneGeometry(FAC_W, FAC_H),
        new THREE.MeshLambertMaterial({
            map: makeFacadeTexture({
                wallColor: '#E8A818',
                signText: 'FRUTAS & VERDURAS',
                signColor: '#8B1210',
                shutterColor: '#6a4020',
                floors: 4, label: '14'
            })
        })
    );
    leftFac.position.set(-FAC_W / 2, FAC_H / 2, 7.2);
    leftFac.castShadow = true;
    scene.add(leftFac);

    const rightFac = new THREE.Mesh(
        new THREE.PlaneGeometry(FAC_W, FAC_H),
        new THREE.MeshLambertMaterial({
            map: makeFacadeTexture({
                wallColor: '#6a9048',
                signText: 'MERCADO CENTRAL',
                signColor: '#3a1808',
                shutterColor: '#3a5028',
                floors: 4, label: '8B'
            })
        })
    );
    rightFac.position.set(FAC_W / 2, FAC_H / 2, 7.2);
    rightFac.castShadow = true;
    scene.add(rightFac);

    // Side building palette — dirección visual: tresuno / tresdos / trestres
    const palette = [
        { c: '#C84020', r: 4, col: 2 }, // terracota roja intensa
        { c: '#6A8A48', r: 5, col: 2 }, // verde salvia
        { c: '#D47858', r: 3, col: 2 }, // rosa coral envejecido
        { c: '#E0A020', r: 4, col: 2 }, // amarillo ámbar
        { c: '#A05848', r: 4, col: 2 }, // mauve/sienna
    ];

    function buildSide(xSign) {
        const g = new THREE.Group();
        const cfgs = [
            { z: -4,  w: 5,   h: 9,  d: 3,   pi: 0 },
            { z: -13, w: 4.5, h: 13, d: 3.5, pi: 1 },
            { z: -22, w: 5.5, h: 10, d: 3,   pi: 2 },
            { z: -32, w: 4.2, h: 12, d: 3.2, pi: 3 },
            { z: -42, w: 6,   h: 8,  d: 4,   pi: 4 },
        ];

        cfgs.forEach(({ z, w, h, d, pi }) => {
            const { c, r, col } = palette[pi];
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                new THREE.MeshLambertMaterial({ map: makeBuildingTex(c, r, col) })
            );
            mesh.position.set(xSign * (7 + w / 2), h / 2, z);
            mesh.castShadow = true; mesh.receiveShadow = true;
            g.add(mesh);

            // Balcony ledge on taller buildings
            if (h > 10) {
                const ledge = new THREE.Mesh(
                    new THREE.BoxGeometry(w * 0.9, 0.18, 0.75),
                    new THREE.MeshLambertMaterial({ color: 0x281606 })
                );
                ledge.position.set(xSign * (7 + w / 2), h * 0.52, z + d / 2 + 0.38);
                g.add(ledge);
                // Railing posts
                for (let p = 0; p < 6; p++) {
                    const post = new THREE.Mesh(
                        new THREE.BoxGeometry(0.06, 0.58, 0.06),
                        new THREE.MeshLambertMaterial({ color: 0x140a02 })
                    );
                    post.position.set(
                        xSign * (7 + w / 2) + (-w * 0.4 + p * w * 0.16),
                        h * 0.52 + 0.3,
                        z + d / 2 + 0.38
                    );
                    g.add(post);
                }
            }

            // Awning (on some)
            if ((pi + (xSign > 0 ? 2 : 0)) % 3 === 0) {
                const awColors = [0x8B1512, 0x2a1808, 0x3a5820, 0xb86020];
                const aw = new THREE.Mesh(
                    new THREE.PlaneGeometry(w * 0.86, 1.5),
                    new THREE.MeshLambertMaterial({
                        color: awColors[pi % awColors.length],
                        side: THREE.DoubleSide
                    })
                );
                aw.rotation.x = -Math.PI * 0.28;
                aw.position.set(xSign * (7 + w / 2), h * 0.2 + 1.6, z + d / 2 + 0.55);
                g.add(aw);
            }

            // Wall-mount iron lantern (farol de pared)
            const lanternMat = new THREE.MeshLambertMaterial({ color: 0x1a1008 });
            const bracketGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6);
            const bracket = new THREE.Mesh(bracketGeo, lanternMat);
            bracket.rotation.z = xSign * Math.PI * 0.5;
            bracket.position.set(
                xSign * (7 + w / 2) + xSign * (-d / 2 - 0.28),
                h * 0.18 + 0.22,
                z + d / 2
            );
            g.add(bracket);
            const lanternBody = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.28, 0.18),
                lanternMat
            );
            lanternBody.position.set(
                xSign * (7 + w / 2) + xSign * (-d / 2 - 0.55),
                h * 0.18,
                z + d / 2
            );
            g.add(lanternBody);
            // Lantern glow glass
            const lanternGlass = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.20, 0.12),
                new THREE.MeshBasicMaterial({ color: 0xffe888, transparent: true, opacity: 0.75 })
            );
            lanternGlass.position.copy(lanternBody.position);
            g.add(lanternGlass);

            // Terracotta pot on rooftop (visible on taller buildings)
            if (h > 9 && pi % 2 === 0) {
                const potMat = new THREE.MeshLambertMaterial({ color: 0xc05828 });
                const potCount = 2 + (pi % 2);
                for (let pot = 0; pot < potCount; pot++) {
                    const potMesh = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.18, 0.14, 0.28, 8),
                        potMat
                    );
                    potMesh.position.set(
                        xSign * (7 + w / 2) + (-w * 0.3 + pot * w * 0.3),
                        h + 0.14,
                        z + (Math.random() - 0.5) * d * 0.5
                    );
                    g.add(potMesh);
                    // Plant (green sphere blob)
                    const plant = new THREE.Mesh(
                        new THREE.SphereGeometry(0.22 + Math.random() * 0.1, 7, 6),
                        new THREE.MeshLambertMaterial({ color: 0x4a7a28 })
                    );
                    plant.position.copy(potMesh.position);
                    plant.position.y += 0.3;
                    g.add(plant);
                }
            }
        });
        return g;
    }

    scene.add(buildSide(-1));
    scene.add(buildSide(1));

    // Hanging wires + bulbs
    const wireMat = new THREE.LineBasicMaterial({ color: 0x080604 });
    const bulbGeo = new THREE.SphereGeometry(0.075, 7, 6);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe055 });

    for (let z = -6; z > -52; z -= 7) {
        const pts = [
            new THREE.Vector3(-6.5, 6.0, z),
            new THREE.Vector3(-2, 5.15, z),
            new THREE.Vector3(0, 4.95, z),
            new THREE.Vector3(2, 5.15, z),
            new THREE.Vector3(6.5, 6.0, z)
        ];
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));

        [{ x: -2, y: 5.15 }, { x: 0, y: 4.95 }, { x: 2, y: 5.15 }].forEach(({ x, y }) => {
            const b = new THREE.Mesh(bulbGeo, bulbMat);
            b.position.set(x, y, z);
            scene.add(b);
        });

        // Occasional point light under bulb
        if (z % 14 === 0 || z === -20) {
            const bl = new THREE.PointLight(0xffaa18, 0.45, 5);
            bl.position.set(0, 4.7, z);
            scene.add(bl);
        }
    }

    // Wooden crates (left entrance)
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x7a4418 });
    [
        [0.65, 0.7, 0.55, -4.5, 0.35, 0.6],
        [0.60, 0.4, 0.50, -4.2, 0.75, 0.4],
        [0.70, 0.7, 0.60, -4.0, 0.35, -0.6],
        [0.55, 0.7, 0.55, -4.6, 0.35, -1.4],
        [0.65, 0.45, 0.55, -4.3, 0.9, -0.2],
    ].forEach(([bw, bh, bd, x, y, z]) => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), crateMat);
        c.position.set(x, y, z);
        c.rotation.y = (Math.random() - 0.5) * 0.35;
        c.castShadow = true;
        scene.add(c);
    });

    // Fruit stand (right entrance)
    const standLeg = new THREE.MeshLambertMaterial({ color: 0x3c1e08 });
    const standTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.1, 0.95),
        new THREE.MeshLambertMaterial({ color: 0x5c3210 })
    );
    standTop.position.set(4.3, 1.08, 0.9);
    standTop.castShadow = true;
    scene.add(standTop);

    [[-0.85, -0.38], [-0.85, 0.38], [0.85, -0.38], [0.85, 0.38]].forEach(([ox, oz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), standLeg);
        leg.position.set(4.3 + ox, 0.5, 0.9 + oz);
        scene.add(leg);
    });

    // Fruits
    const fruitCols = [0xff3a18, 0xff9400, 0xf0d000, 0x86c800, 0xff6022, 0xcc1e3e];
    for (let i = 0; i < 16; i++) {
        const fr = new THREE.Mesh(
            new THREE.SphereGeometry(0.1 + Math.random() * 0.055, 8, 7),
            new THREE.MeshLambertMaterial({ color: fruitCols[i % fruitCols.length] })
        );
        fr.position.set(3.5 + (i % 5) * 0.3, 1.16 + Math.floor(i / 5) * 0.19, 0.7 + (Math.random() - 0.5) * 0.38);
        fr.castShadow = true;
        scene.add(fr);
    }

    // Deep street glow plane (vanishing point)
    const glowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 5),
        new THREE.MeshBasicMaterial({ color: 0xff4800, transparent: true, opacity: 0.14, fog: false })
    );
    glowPlane.position.set(0, 3, -60);
    scene.add(glowPlane);

    // ─────────────────────────────────────────────────────────
    // 5. SCROLL ANIMATION
    // ─────────────────────────────────────────────────────────

    const CAM_START = new THREE.Vector3(0, 2.5, 11);
    const CAM_END   = new THREE.Vector3(0, 1.9, -10);
    const LOOK_START = new THREE.Vector3(0, 2.2, -2);
    const LOOK_END   = new THREE.Vector3(0, 1.4, -35);
    const tmpLook    = new THREE.Vector3();

    function ease3Out(t) { return 1 - Math.pow(1 - t, 3); }
    function ease2Out(t) { return 1 - Math.pow(1 - t, 2); }

    function updateScene(p) {
        // Facades slide open: 0 → 0.48
        const fp = ease3Out(Math.min(p / 0.48, 1));
        leftFac.position.x  = -FAC_W / 2 - fp * 12;
        rightFac.position.x =  FAC_W / 2 + fp * 12;
        leftFac.rotation.y  =  fp * 0.3;
        rightFac.rotation.y = -fp * 0.3;

        // Camera enters the street: 0.14 → 1
        const cp = ease2Out(Math.max(0, (p - 0.14) / 0.86));
        camera.position.lerpVectors(CAM_START, CAM_END, cp);
        tmpLook.lerpVectors(LOOK_START, LOOK_END, cp);
        camera.lookAt(tmpLook);

        // Fog: street haze builds slightly as you go deeper between buildings
        scene.fog.density = 0.016 + cp * 0.012;

        // Deep warm glow at vanishing point
        deepGlow.intensity = 1.0 + cp * 2.0;
        deepGlow.position.z = -20 - cp * 18;

        // Sun: strong at entrance, slightly dimmer inside narrow street
        sun.intensity = 4.8 - cp * 1.4;
    }

    const heroEl = document.getElementById('street-hero');

    function getProgress() {
        if (!heroEl) return 0;
        const rect = heroEl.getBoundingClientRect();
        const total = heroEl.offsetHeight - window.innerHeight;
        return Math.max(0, Math.min(1, -rect.top / total));
    }

    // ─────────────────────────────────────────────────────────
    // 6. RENDER LOOP
    // ─────────────────────────────────────────────────────────

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Skip render when section not visible (performance)
        if (heroEl) {
            const r = heroEl.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
        }

        const t = clock.getElapsedTime();
        updateScene(getProgress());

        // Analogue film flicker
        ambient.intensity  = 0.55 + Math.sin(t * 1.08) * 0.022;
        warmFill.intensity = 0.9  + Math.sin(t * 2.3 + 1.1) * 0.06;

        renderer.render(scene, camera);
    }
    animate();

    // ─────────────────────────────────────────────────────────
    // 7. RESIZE
    // ─────────────────────────────────────────────────────────

    window.addEventListener('resize', () => {
        const W = window.innerWidth, H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    });

})();
