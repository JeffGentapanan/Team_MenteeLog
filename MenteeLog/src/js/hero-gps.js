/**
 * Hero GPS Geolocation & Radar Pulse Waves Animation
 * MenteeLog OJT Platform - Live GPS Verification & Placement Network Motif
 */

let animId = null;
let heroObserver = null;
let mousePos = { x: -1000, y: -1000, active: false };

export function initHeroGpsAnimation() {
    // Clean up any existing loop or observer
    if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
    if (heroObserver) {
        heroObserver.disconnect();
        heroObserver = null;
    }

    const canvas = document.getElementById('hero-gps-canvas');
    if (!canvas) return;

    const hero = canvas.closest('.reference-hero');
    if (!hero) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let isVisible = true;

    // Handle high DPI displays
    function resize() {
        const rect = hero.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    }
    resize();
    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);

    // Mouse movement interaction on hero
    const onMouseMove = (e) => {
        const rect = hero.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        mousePos.active = true;
    };
    const onMouseLeave = () => {
        mousePos.active = false;
    };
    hero.removeEventListener('mousemove', onMouseMove);
    hero.removeEventListener('mouseleave', onMouseLeave);
    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);

    // GPS Nodes representing verified university & HTE placement clusters
    // Coordinates are normalized [0..1]
    const nodes = [
        {
            id: 'batstate',
            nx: 0.18,
            ny: 0.38,
            label: 'BATSTATE-U [HQ]',
            coord: '13.75° N, 121.05° E',
            color: '#EFDFBB',
            hasRadarSweep: true,
            pulseOffset: 0
        },
        {
            id: 'bgc',
            nx: 0.82,
            ny: 0.34,
            label: 'BGC HUB [HTE]',
            coord: '14.55° N, 121.05° E',
            color: '#34D399',
            hasRadarSweep: false,
            pulseOffset: 0.25
        },
        {
            id: 'makati',
            nx: 0.84,
            ny: 0.72,
            label: 'MAKATI CBD [HTE]',
            coord: '14.56° N, 121.02° E',
            color: '#D85A63',
            hasRadarSweep: false,
            pulseOffset: 0.5
        },
        {
            id: 'ortigas',
            nx: 0.16,
            ny: 0.76,
            label: 'ORTIGAS [HTE]',
            coord: '14.58° N, 121.06° E',
            color: '#FBBF24',
            hasRadarSweep: false,
            pulseOffset: 0.75
        },
        {
            id: 'intern',
            nx: 0.50,
            ny: 0.88,
            label: 'DTR LIVE GEOFENCE',
            coord: '14.53° N, 120.98° E · VERIFIED',
            color: '#6EE7B7',
            hasRadarSweep: false,
            pulseOffset: 0.4
        }
    ];

    // Data streams (connections between hubs)
    const links = [
        [0, 1], // BatStateU -> BGC
        [1, 2], // BGC -> Makati
        [0, 3], // BatStateU -> Ortigas
        [3, 4], // Ortigas -> Live Geofence
        [2, 4]  // Makati -> Live Geofence
    ];

    // Data packets flowing along links
    const packets = links.map(([fromIdx, toIdx], i) => ({
        from: fromIdx,
        to: toIdx,
        progress: (i * 0.2) % 1,
        speed: 0.0035 + (i % 3) * 0.0015
    }));

    // Pause when off-screen to conserve CPU
    heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animId) {
                lastTime = performance.now();
                loop(lastTime);
            }
        });
    }, { threshold: 0.05 });
    heroObserver.observe(hero);

    let lastTime = performance.now();
    let sweepAngle = 0;

    function loop(currentTime) {
        if (!isVisible) {
            animId = null;
            return;
        }

        const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        ctx.clearRect(0, 0, width, height);

        const now = currentTime * 0.001;
        sweepAngle = (sweepAngle + delta * 1.2) % (Math.PI * 2);

        // 1. Draw Connecting Vectors (Geodesic Links)
        ctx.lineWidth = 1;
        links.forEach(([fromIdx, toIdx]) => {
            const f = nodes[fromIdx];
            const t = nodes[toIdx];
            const x1 = f.nx * width;
            const y1 = f.ny * height;
            const x2 = t.nx * width;
            const y2 = t.ny * height;

            ctx.beginPath();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = 'rgba(239, 223, 187, 0.12)';
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // 2. Animate Data Packets (Verified Timekeeping Logs)
        packets.forEach(p => {
            p.progress = (p.progress + p.speed) % 1;
            const f = nodes[p.from];
            const t = nodes[p.to];
            const x = f.nx * width + (t.nx * width - f.nx * width) * p.progress;
            const y = f.ny * height + (t.ny * height - f.ny * height) * p.progress;

            // Packet glow
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 6);
            grad.addColorStop(0, 'rgba(239, 223, 187, 0.9)');
            grad.addColorStop(1, 'rgba(239, 223, 187, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Draw GPS Hub Nodes & Radar Pulse Waves
        nodes.forEach((node, idx) => {
            const cx = node.nx * width;
            const cy = node.ny * height;

            // Concentric expanding radar pulse rings (3 rings per hub)
            for (let r = 0; r < 3; r++) {
                const ringProgress = (now * 0.35 + node.pulseOffset + r * 0.33) % 1;
                const ringRadius = 4 + ringProgress * 70;
                const alpha = Math.sin((1 - ringProgress) * Math.PI * 0.5) * 0.45;

                ctx.beginPath();
                ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = node.id === 'bgc' 
                    ? `rgba(52, 211, 153, ${alpha})` 
                    : node.id === 'makati' 
                    ? `rgba(216, 89, 104, ${alpha})` 
                    : `rgba(239, 223, 187, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Radar Sweep on Central Hub
            if (node.hasRadarSweep) {
                const sweepRadius = 80;
                const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sweepRadius);
                sweepGrad.addColorStop(0, 'rgba(239, 223, 187, 0.18)');
                sweepGrad.addColorStop(1, 'rgba(239, 223, 187, 0)');

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, sweepRadius, sweepAngle, sweepAngle + 0.5);
                ctx.closePath();
                ctx.fillStyle = sweepGrad;
                ctx.fill();
                ctx.restore();
            }

            // Center beacon glow
            const beaconGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
            beaconGrad.addColorStop(0, node.color);
            beaconGrad.addColorStop(0.4, 'rgba(239, 223, 187, 0.25)');
            beaconGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = beaconGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.fill();

            // Center Pinpoint Dot
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();

            // Precision Crosshair (+)
            ctx.strokeStyle = 'rgba(239, 223, 187, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
            ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
            ctx.stroke();

            // Faint Micro-Coordinates & Hub Tag (Desktop only)
            if (width > 680) {
                ctx.font = '500 10px "Courier New", monospace';
                ctx.fillStyle = 'rgba(239, 223, 187, 0.55)';
                ctx.fillText(node.label, cx + 10, cy - 6);
                ctx.fillStyle = 'rgba(239, 223, 187, 0.35)';
                ctx.fillText(node.coord, cx + 10, cy + 8);
            }
        });

        // 4. Interactive Cursor Radar Waves (When user moves mouse)
        if (mousePos.active && mousePos.x >= 0 && mousePos.x <= width && mousePos.y >= 0 && mousePos.y <= height) {
            for (let i = 0; i < 2; i++) {
                const curProgress = (now * 0.6 + i * 0.5) % 1;
                const curRadius = 10 + curProgress * 45;
                const curAlpha = (1 - curProgress) * 0.35;

                ctx.beginPath();
                ctx.arc(mousePos.x, mousePos.y, curRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(52, 211, 153, ${curAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Cursor crosshair
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mousePos.x - 8, mousePos.y); ctx.lineTo(mousePos.x + 8, mousePos.y);
            ctx.moveTo(mousePos.x, mousePos.y - 8); ctx.lineTo(mousePos.x, mousePos.y + 8);
            ctx.stroke();

            ctx.font = '600 9px "Courier New", monospace';
            ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
            ctx.fillText('GPS: SCANNING', mousePos.x + 12, mousePos.y - 4);
        }

        animId = requestAnimationFrame(loop);
    }

    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
}
