// =========================================================================
// SUPABASE CLIENT INITIALIZATION
// =========================================================================
const SUPABASE_URL = 'https://bhrdqdeuafqtbkdxajpo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocmRxZGV1YWZxdGJrZHhhanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzg5NDYsImV4cCI6MjA5NzY1NDk0Nn0.oeogO0OngILPpXxJiZKbixR7auEb6xfcm7O982e58H0';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
  
  // 0. Hero Background Spotlight & KPI Counter
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const watermark = heroSection.querySelector('.hero-watermark-scale');
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroSection.style.setProperty('--mouse-x', `${x}px`);
      heroSection.style.setProperty('--mouse-y', `${y}px`);
      
      // Subtle parallax effect on the background watermark
      if (watermark) {
        const moveX = (x - rect.width / 2) * -0.04;
        const moveY = (y - rect.height / 2) * -0.04;
        watermark.style.transform = `translate(${moveX}px, ${moveY}px) rotate(-8deg)`;
      }
    });
  }

  function animateValue(obj, start, end, duration, suffix = "", prefix = "") {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = prefix + Math.floor(progress * (end - start) + start).toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const kpiElements = document.querySelectorAll('.kpi-num[data-val]');
  kpiElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-val'));
    const isPercent = el.textContent.includes('%') || el.getAttribute('data-val') === '150';
    const prefix = '+';
    const suffix = isPercent ? '%' : '';
    animateValue(el, 0, target, 2000, suffix, prefix);
  });

  const heroLikesCounter = document.getElementById('hero-likes-counter');
  if (heroLikesCounter) {
    animateValue(heroLikesCounter, 150, 12500, 2500, "");
  }

  // =========================================================================
  // Canvas Particles & Mockup Animation
  // =========================================================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const NUM_PARTICLES = 160;
    
    // States: 'flowing', 'forming', 'mockup', 'dispersing'
    let animationState = 'flowing';
    let stateTimer = 0;
    
    // Duration of states in ms
    const DURATIONS = {
      flowing: 6000,
      forming: 2500,
      mockup: 5000,
      dispersing: 2000
    };
    
    let lastTime = performance.now();
    let mouse = { x: null, y: null };
    let isCanvasVisible = true;
    
    const colors = [
      'rgba(26, 179, 255, 0.75)',  // Primary
      'rgba(0, 230, 207, 0.75)',   // Secondary
      'rgba(56, 137, 250, 0.75)'    // Accent
    ];

    // Handle mouse movement on the hero section for force fields
    const heroSec = document.querySelector('.hero');
    if (heroSec) {
      heroSec.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      heroSec.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    // Set canvas dimensions with high DPI support
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 480;
      height = rect.height || 480;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      // Re-initialize targets if in forming or mockup state
      if (animationState === 'forming' || animationState === 'mockup') {
        assignMockupTargets();
      }
    }

    // Helper to generate coordinates for mockup segments
    function getMockupSegments(canvasWidth, canvasHeight) {
      const wMockup = Math.min(380, canvasWidth * 0.85);
      const hMockup = Math.min(290, canvasHeight * 0.7);
      const xMockup = (canvasWidth - wMockup) / 2;
      const yMockup = (canvasHeight - hMockup) / 2;

      const segments = [];

      function addLine(x1, y1, x2, y2) {
        segments.push({ type: 'line', x1, y1, x2, y2 });
      }

      function addArc(cx, cy, r, startAngle, endAngle) {
        segments.push({ type: 'arc', cx, cy, r, startAngle, endAngle });
      }

      // 1. Browser Window Outer Border
      addLine(xMockup, yMockup, xMockup + wMockup, yMockup); // top
      addLine(xMockup + wMockup, yMockup, xMockup + wMockup, yMockup + hMockup); // right
      addLine(xMockup + wMockup, yMockup + hMockup, xMockup, yMockup + hMockup); // bottom
      addLine(xMockup, yMockup + hMockup, xMockup, yMockup); // left

      // 2. Window Header Divider Line
      const headerY = yMockup + 35;
      addLine(xMockup, headerY, xMockup + wMockup, headerY);

      // 3. Three window dots
      addArc(xMockup + 16, yMockup + 17, 3, 0, Math.PI * 2);
      addArc(xMockup + 26, yMockup + 17, 3, 0, Math.PI * 2);
      addArc(xMockup + 36, yMockup + 17, 3, 0, Math.PI * 2);

      // 4. Address Bar Outline
      const addrX1 = xMockup + 55;
      const addrY1 = yMockup + 9;
      const addrX2 = xMockup + wMockup - 20;
      const addrY2 = yMockup + 25;
      addLine(addrX1, addrY1, addrX2, addrY1);
      addLine(addrX2, addrY1, addrX2, addrY2);
      addLine(addrX2, addrY2, addrX1, addrY2);
      addLine(addrX1, addrY2, addrX1, addrY1);

      // 5. Sidebar Separator
      const sidebarX = xMockup + 60;
      addLine(sidebarX, headerY, sidebarX, yMockup + hMockup);

      // 6. Sidebar Menu Items
      const menuX1 = xMockup + 15;
      const menuX2 = xMockup + 45;
      addLine(menuX1, headerY + 20, menuX2, headerY + 20);
      addLine(menuX1, headerY + 35, menuX2, headerY + 35);
      addLine(menuX1, headerY + 50, menuX2, headerY + 50);

      // 7. Card 1 (Analytics card)
      const card1X1 = xMockup + 75;
      const card1Y1 = headerY + 15;
      const card1X2 = xMockup + wMockup - 15;
      const card1Y2 = headerY + 105;
      addLine(card1X1, card1Y1, card1X2, card1Y1);
      addLine(card1X2, card1Y1, card1X2, card1Y2);
      addLine(card1X2, card1Y2, card1X1, card1Y2);
      addLine(card1X1, card1Y2, card1X1, card1Y1);

      // Chart Wave inside Card 1
      const chartYBase = card1Y2 - 15;
      const chartWidth = card1X2 - card1X1 - 20;
      const chartStartX = card1X1 + 10;
      
      const waveOffsets = [0, -10, -5, -25, -15, -45, -35];
      let prevX = chartStartX;
      let prevY = chartYBase + waveOffsets[0];
      for (let i = 1; i < waveOffsets.length; i++) {
        const nextX = chartStartX + (chartWidth * i) / (waveOffsets.length - 1);
        const nextY = chartYBase + waveOffsets[i];
        addLine(prevX, prevY, nextX, nextY);
        prevX = nextX;
        prevY = nextY;
      }

      // 8. Card 2 (Bottom card)
      const card2X1 = xMockup + 75;
      const card2Y1 = headerY + 120;
      const card2X2 = xMockup + wMockup - 15;
      const card2Y2 = yMockup + hMockup - 15;
      addLine(card2X1, card2Y1, card2X2, card2Y1);
      addLine(card2X2, card2Y1, card2X2, card2Y2);
      addLine(card2X2, card2Y2, card2X1, card2Y2);
      addLine(card2X1, card2Y2, card2X1, card2Y1);

      // Text Lines inside Card 2
      const textX1 = card2X1 + 15;
      const textX2 = card2X2 - 15;
      addLine(textX1, card2Y1 + 20, textX2 - 40, card2Y1 + 20);
      addLine(textX1, card2Y1 + 35, textX2 - 10, card2Y1 + 35);
      addLine(textX1, card2Y1 + 50, textX2 - 25, card2Y1 + 50);

      // Small decorative circle inside Card 2
      addArc(card2X1 + 30, card2Y1 + 80, 8, 0, Math.PI * 2);
      addLine(card2X1 + 48, card2Y1 + 76, card2X2 - 20, card2Y1 + 76);
      addLine(card2X1 + 48, card2Y1 + 84, card2X2 - 40, card2Y1 + 84);

      return segments;
    }

    // Sample points proportionally
    function samplePointsFromSegments(segments, numPoints) {
      const sampled = [];
      let totalLength = 0;
      const lengths = [];

      segments.forEach(seg => {
        let len = 0;
        if (seg.type === 'line') {
          const dx = seg.x2 - seg.x1;
          const dy = seg.y2 - seg.y1;
          len = Math.sqrt(dx * dx + dy * dy);
        } else if (seg.type === 'arc') {
          len = seg.r * Math.abs(seg.endAngle - seg.startAngle);
        }
        lengths.push(len);
        totalLength += len;
      });

      let pointsLeft = numPoints;
      segments.forEach((seg, sIdx) => {
        const len = lengths[sIdx];
        let nPoints = Math.round((len / totalLength) * numPoints);
        if (sIdx === segments.length - 1) {
          nPoints = pointsLeft;
        } else {
          nPoints = Math.min(nPoints, pointsLeft);
        }
        pointsLeft -= nPoints;

        for (let i = 0; i < nPoints; i++) {
          const t = nPoints > 1 ? i / (nPoints - 1) : 0.5;
          let pt = { x: 0, y: 0, segmentIndex: sIdx, pointIndex: i };
          if (seg.type === 'line') {
            pt.x = seg.x1 + (seg.x2 - seg.x1) * t;
            pt.y = seg.y1 + (seg.y2 - seg.y1) * t;
          } else if (seg.type === 'arc') {
            const angle = seg.startAngle + (seg.endAngle - seg.startAngle) * t;
            pt.x = seg.cx + Math.cos(angle) * seg.r;
            pt.y = seg.cy + Math.sin(angle) * seg.r;
          }
          sampled.push(pt);
        }
      });

      return sampled;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.baseSpeed = 0.05 + Math.random() * 0.05;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 1.2 + Math.random() * 1.5;
        this.target = null;
      }

      update(state, transitionProgress) {
        if ((state === 'forming' || state === 'mockup') && this.target) {
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          const speed = this.baseSpeed + (transitionProgress * 0.05);
          this.x += dx * speed;
          this.y += dy * speed;
        } else {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0) { this.x = 0; this.vx *= -1; }
          if (this.x > width) { this.x = width; this.vx *= -1; }
          if (this.y < 0) { this.y = 0; this.vy *= -1; }
          if (this.y > height) { this.y = height; this.vy *= -1; }

          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const force = (80 - dist) / 80;
              this.x -= (dx / dist) * force * 2.0;
              this.y -= (dy / dist) * force * 2.0;
            }
          }
        }
      }

      draw(transitionProgress) {
        const alpha = (1 - transitionProgress) * 0.75;
        if (alpha <= 0.01) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Re-create fillStyle with the correct alpha
        const baseColor = this.color.substring(0, this.color.lastIndexOf(',')) + `, ${alpha})`;
        ctx.fillStyle = baseColor;
        ctx.fill();
      }
    }

    // Call resize first to define width/height before initializing particles
    resize();

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle());
    }

    function assignMockupTargets() {
      const segments = getMockupSegments(width, height);
      const targets = samplePointsFromSegments(segments, NUM_PARTICLES);
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        if (targets[i]) {
          particles[i].target = targets[i];
        }
      }
    }

    function clearMockupTargets() {
      particles.forEach(p => {
        p.target = null;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.8;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
    }

    function drawRealMockup(canvasWidth, canvasHeight, alpha) {
      if (alpha <= 0.01) return;

      const wMockup = Math.min(380, canvasWidth * 0.85);
      const hMockup = Math.min(290, canvasHeight * 0.7);
      const xMockup = (canvasWidth - wMockup) / 2;
      const yMockup = (canvasHeight - hMockup) / 2;

      function roundRect(c, x, y, width, height, radius) {
        c.beginPath();
        c.moveTo(x + radius, y);
        c.lineTo(x + width - radius, y);
        c.quadraticCurveTo(x + width, y, x + width, y + radius);
        c.lineTo(x + width, y + height - radius);
        c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        c.lineTo(x + radius, y + height);
        c.quadraticCurveTo(x, y + height, x, y + height - radius);
        c.lineTo(x, y + radius);
        c.quadraticCurveTo(x, y, x + radius, y);
        c.closePath();
      }

      // 1. Browser Window Background (Glassmorphism)
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${0.4 * alpha})`;
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      
      roundRect(ctx, xMockup, yMockup, wMockup, hMockup, 12);
      ctx.fillStyle = `rgba(13, 13, 20, ${0.65 * alpha})`;
      ctx.fill();
      ctx.restore();

      // Border
      roundRect(ctx, xMockup, yMockup, wMockup, hMockup, 12);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Window Header Background
      const headerHeight = 35;
      ctx.beginPath();
      ctx.moveTo(xMockup + 12, yMockup);
      ctx.lineTo(xMockup + wMockup - 12, yMockup);
      ctx.quadraticCurveTo(xMockup + wMockup, yMockup, xMockup + wMockup, yMockup + 12);
      ctx.lineTo(xMockup + wMockup, yMockup + headerHeight);
      ctx.lineTo(xMockup, yMockup + headerHeight);
      ctx.lineTo(xMockup, yMockup + 12);
      ctx.quadraticCurveTo(xMockup, yMockup, xMockup + 12, yMockup);
      ctx.closePath();
      ctx.fillStyle = `rgba(8, 8, 12, ${0.8 * alpha})`;
      ctx.fill();

      // Header Separator Line
      ctx.beginPath();
      ctx.moveTo(xMockup, yMockup + headerHeight);
      ctx.lineTo(xMockup + wMockup, yMockup + headerHeight);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * alpha})`;
      ctx.stroke();

      // 3. Three window control dots
      const dotColors = [
        `rgba(239, 68, 68, ${0.8 * alpha})`,  // Red
        `rgba(245, 158, 11, ${0.8 * alpha})`, // Yellow
        `rgba(16, 185, 129, ${0.8 * alpha})`  // Green
      ];
      dotColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(xMockup + 16 + i * 10, yMockup + 17, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // 4. Address Bar Outline
      const addrX = xMockup + 55;
      const addrY = yMockup + 9;
      const addrW = wMockup - 75;
      const addrH = 16;
      roundRect(ctx, addrX, addrY, addrW, addrH, 4);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.04 * alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * alpha})`;
      ctx.stroke();

      // 5. Sidebar Separator
      const sidebarX = xMockup + 60;
      ctx.beginPath();
      ctx.moveTo(sidebarX, yMockup + headerHeight);
      ctx.lineTo(sidebarX, yMockup + hMockup);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * alpha})`;
      ctx.stroke();

      // 6. Sidebar Menu Items
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * alpha})`;
      const menuX1 = xMockup + 15;
      const menuX2 = xMockup + 45;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(menuX1, yMockup + headerHeight + 20 + i * 15);
        ctx.lineTo(menuX2, yMockup + headerHeight + 20 + i * 15);
        ctx.stroke();
      }

      // 7. Card 1 (Analytics card)
      const card1X = xMockup + 75;
      const card1Y = yMockup + headerHeight + 15;
      const card1W = wMockup - 90;
      const card1H = 90;
      roundRect(ctx, card1X, card1Y, card1W, card1H, 8);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chart Wave inside Card 1
      const chartStartX = card1X + 10;
      const chartWidth = card1W - 20;
      const chartYBase = card1Y + card1H - 15;
      const waveOffsets = [0, -10, -5, -25, -15, -45, -35];
      
      const grad = ctx.createLinearGradient(0, card1Y, 0, chartYBase);
      grad.addColorStop(0, `rgba(0, 201, 167, ${0.15 * alpha})`);
      grad.addColorStop(1, 'rgba(0, 201, 167, 0)');
      
      ctx.beginPath();
      ctx.moveTo(chartStartX, chartYBase);
      for (let i = 0; i < waveOffsets.length; i++) {
        const nextX = chartStartX + (chartWidth * i) / (waveOffsets.length - 1);
        const nextY = chartYBase + waveOffsets[i];
        ctx.lineTo(nextX, nextY);
      }
      ctx.lineTo(chartStartX + chartWidth, chartYBase);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      for (let i = 0; i < waveOffsets.length; i++) {
        const nextX = chartStartX + (chartWidth * i) / (waveOffsets.length - 1);
        const nextY = chartYBase + waveOffsets[i];
        if (i === 0) {
          ctx.moveTo(nextX, nextY);
        } else {
          ctx.lineTo(nextX, nextY);
        }
      }
      ctx.strokeStyle = `rgba(0, 201, 167, ${0.8 * alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 8. Card 2 (Bottom card)
      const card2X = xMockup + 75;
      const card2Y = yMockup + headerHeight + 120;
      const card2W = wMockup - 90;
      const card2H = hMockup - headerHeight - 135;
      roundRect(ctx, card2X, card2Y, card2W, card2H, 8);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text Lines inside Card 2
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * alpha})`;
      const textX = card2X + 15;
      const textMaxW = card2W - 30;
      
      ctx.beginPath();
      ctx.moveTo(textX, card2Y + 20);
      ctx.lineTo(textX + textMaxW - 40, card2Y + 20);
      ctx.moveTo(textX, card2Y + 35);
      ctx.lineTo(textX + textMaxW - 10, card2Y + 35);
      ctx.moveTo(textX, card2Y + 50);
      ctx.lineTo(textX + textMaxW - 25, card2Y + 50);
      ctx.stroke();

      // Profile avatar and line inside Card 2
      ctx.beginPath();
      ctx.arc(card2X + 30, card2Y + 80, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(32, 154, 209, ${0.5 * alpha})`;
      ctx.fill();
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(card2X + 48, card2Y + 76);
      ctx.lineTo(card2X + card2W - 20, card2Y + 76);
      ctx.moveTo(card2X + 48, card2Y + 84);
      ctx.lineTo(card2X + card2W - 40, card2Y + 84);
      ctx.stroke();
    }

    window.addEventListener('resize', resize);

    function loop(time) {
      if (!isCanvasVisible) return;
      const dt = time - lastTime;
      lastTime = time;
      stateTimer += dt;

      let transitionProgress = 0;
      if (animationState === 'flowing') {
        if (stateTimer >= DURATIONS.flowing) {
          animationState = 'forming';
          stateTimer = 0;
          assignMockupTargets();
        }
      } else if (animationState === 'forming') {
        transitionProgress = Math.min(1, stateTimer / DURATIONS.forming);
        if (stateTimer >= DURATIONS.forming) {
          animationState = 'mockup';
          stateTimer = 0;
        }
      } else if (animationState === 'mockup') {
        transitionProgress = 1;
        if (stateTimer >= DURATIONS.mockup) {
          animationState = 'dispersing';
          stateTimer = 0;
          clearMockupTargets();
        }
      } else if (animationState === 'dispersing') {
        transitionProgress = Math.max(0, 1 - (stateTimer / DURATIONS.dispersing));
        if (stateTimer >= DURATIONS.dispersing) {
          animationState = 'flowing';
          stateTimer = 0;
        }
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => p.update(animationState, transitionProgress));

      // 1. Proximity lines (constellation network)
      const proximityAlphaFactor = 1 - transitionProgress;
      if (proximityAlphaFactor > 0.01) {
        for (let i = 0; i < NUM_PARTICLES; i++) {
          for (let j = i + 1; j < NUM_PARTICLES; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = dx * dx + dy * dy;
            if (dist < 4000) {
              const opacity = (1 - (dist / 4000)) * 0.1 * proximityAlphaFactor;
              ctx.strokeStyle = `rgba(0, 201, 167, ${opacity})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 2. Segment lines (mockup lines)
      const segmentAlphaFactor = transitionProgress;
      if (segmentAlphaFactor > 0.01) {
        ctx.strokeStyle = `rgba(32, 154, 209, ${0.35 * segmentAlphaFactor * (1 - transitionProgress)})`;
        ctx.lineWidth = 1.0;

        const sortedParticles = particles
          .filter(p => p.target !== null)
          .sort((a, b) => {
            if (a.target.segmentIndex !== b.target.segmentIndex) {
              return a.target.segmentIndex - b.target.segmentIndex;
            }
            return a.target.pointIndex - b.target.pointIndex;
          });

        ctx.beginPath();
        for (let i = 0; i < sortedParticles.length - 1; i++) {
          const p1 = sortedParticles[i];
          const p2 = sortedParticles[i+1];
          if (p1.target.segmentIndex === p2.target.segmentIndex) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
        ctx.stroke();
      }

      // 3. High-fidelity solid vector mockup drawing (fades in as transitionProgress -> 1)
      drawRealMockup(width, height, transitionProgress);

      particles.forEach(p => p.draw(transitionProgress));

      requestAnimationFrame(loop);
    }

    // Intersection Observer to pause animation when offscreen
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wasVisible = isCanvasVisible;
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible && !wasVisible) {
          lastTime = performance.now();
          requestAnimationFrame(loop);
        }
      });
    }, { threshold: 0 });
    
    canvasObserver.observe(canvas);
  }

  // 1. Navigation Scroll Tracker
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      // Rotate sandwich lines into an X
      const spans = mobileNavToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
        spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
        spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
      }
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = mobileNavToggle.querySelectorAll('span');
        if (spans.length >= 3) {
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      });
    });
  }

  // 3. Typewriter Effect
  const typewriterElement = document.getElementById('typewriter');
  const words = ["estrategias de marketing digital", "sitios web de alta conversión", "identidades de marca memorables", "embudos de venta automatizados", "campañas publicitarias rentables"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }
  
  if (typewriterElement) {
    type();
  }

  // 4. Testimonial Carousel
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.tn-dots');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  const brandItems = document.querySelectorAll('.brand-item');
  let currentSlide = 0;
  let autoPlayTimer;

  if (slides.length > 0) {
    // Create dots dynamically
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('tn-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.tn-dot');

    // Add click listener to brand navigation items
    if (brandItems.length > 0) {
      brandItems.forEach((item, index) => {
        item.addEventListener('click', () => goToSlide(index));
      });
    }

    function updateSlides() {
      slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (dots[index]) dots[index].classList.remove('active');
        if (brandItems[index]) brandItems[index].classList.remove('active');
      });
      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
      if (brandItems[currentSlide]) brandItems[currentSlide].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      goToSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(currentSlide);
    }

    function goToSlide(index) {
      currentSlide = index;
      updateSlides();
      resetAutoPlay();
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);
      startAutoPlay();
    }

    function startAutoPlay() {
      autoPlayTimer = setInterval(nextSlide, 7000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }
  }

  // 5. Reveal on Scroll (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    observer.observe(element);
  });

  // 6. Interactive Multi-Step Form
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressBar = document.querySelector('.step-progress-bar');
  const nextStepBtns = document.querySelectorAll('.next-step');
  const prevStepBtns = document.querySelectorAll('.prev-step');
  const contactForm = document.getElementById('lead-form');
  const successMessage = document.getElementById('form-success');
  const serviceOptions = document.querySelectorAll('.option-btn');
  let currentStep = 0;
  
  // Service Options multi-selection logic
  let selectedServices = [];
  
  // Phone Formatting, Input Constraints & Custom Dropdown Logic
  const phoneInput = document.getElementById('client-phone');
  const countryCodeSelect = document.getElementById('country-code');
  const dropdownWrapper = document.getElementById('country-code-dropdown');

  if (phoneInput && countryCodeSelect) {
    phoneInput.addEventListener('input', (e) => {
      // Remove non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      const selectedCode = countryCodeSelect.value.replace(/\D/g, ''); // e.g. "56"
      
      // If they pasted the country code at the beginning, strip it
      if (value.startsWith(selectedCode) && value.length > 9) {
        value = value.substring(selectedCode.length);
      }
      
      // Also strip leading '0' if they accidentally type it
      if (value.startsWith('0') && value.length > 9) {
        value = value.substring(1);
      }

      // Limit to 9 digits
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
      e.target.value = value;
    });
  }

  // Company Size Custom Dropdown Elements
  const companySizeDropdown = document.getElementById('company-size-dropdown');
  const companySizeHiddenInput = document.getElementById('company-size');

  function setupDropdownAccessibility(wrapper, hiddenInput, onSelectCallback = null) {
    if (!wrapper || !hiddenInput) return;
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const options = wrapper.querySelectorAll('.custom-option');
    let focusedIndex = -1;

    function openDropdown() {
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) {
          w.classList.remove('open');
          w.setAttribute('aria-expanded', 'false');
        }
      });
      wrapper.classList.add('open');
      wrapper.setAttribute('aria-expanded', 'true');
      focusedIndex = Array.from(options).findIndex(opt => opt.classList.contains('selected'));
      if (focusedIndex === -1) focusedIndex = 0;
      highlightOption(focusedIndex);
    }

    function closeDropdown() {
      wrapper.classList.remove('open');
      wrapper.setAttribute('aria-expanded', 'false');
      options.forEach(opt => opt.classList.remove('focused'));
      trigger.focus();
    }

    function highlightOption(index) {
      options.forEach((opt, idx) => {
        if (idx === index) {
          opt.classList.add('focused');
          opt.scrollIntoView({ block: 'nearest' });
        } else {
          opt.classList.remove('focused');
        }
      });
    }

    function selectOption(index) {
      const option = options[index];
      if (!option) return;
      
      options.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
      });
      option.classList.add('selected');
      option.setAttribute('aria-selected', 'true');

      const val = option.getAttribute('data-value');
      hiddenInput.value = val;

      if (onSelectCallback) {
        onSelectCallback(option, val);
      }

      closeDropdown();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    trigger.addEventListener('keydown', (e) => {
      const isOpen = wrapper.classList.contains('open');
      
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen) {
            if (focusedIndex >= 0) selectOption(focusedIndex);
          } else {
            openDropdown();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          } else {
            focusedIndex = (focusedIndex + 1) % options.length;
            highlightOption(focusedIndex);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          } else {
            focusedIndex = (focusedIndex - 1 + options.length) % options.length;
            highlightOption(focusedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isOpen) {
            closeDropdown();
          }
          break;
        case 'Tab':
          if (isOpen) {
            closeDropdown();
          }
          break;
      }
    });

    options.forEach((option, idx) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption(idx);
      });
      option.addEventListener('mouseenter', () => {
        focusedIndex = idx;
        highlightOption(idx);
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        wrapper.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Initialize dropdowns with accessibility helper
  if (dropdownWrapper && countryCodeSelect) {
    setupDropdownAccessibility(dropdownWrapper, countryCodeSelect, (option, val) => {
      const flag = option.getAttribute('data-flag');
      dropdownWrapper.querySelector('.selected-flag').textContent = flag;
      dropdownWrapper.querySelector('.selected-code').textContent = val;
      if (phoneInput) {
        phoneInput.dispatchEvent(new Event('input'));
      }
    });
  }

  if (companySizeDropdown && companySizeHiddenInput) {
    setupDropdownAccessibility(companySizeDropdown, companySizeHiddenInput, (option, val) => {
      const title = option.querySelector('.option-title').textContent;
      companySizeDropdown.querySelector('.selected-text').textContent = title;
      companySizeDropdown.classList.remove('input-error');
      const errorText = companySizeDropdown.parentNode.querySelector('.error-text');
      if (errorText) errorText.remove();
    });
  }

  
  // Form Logic Helper Functions (global to this block)
  function updateFormStep() {
    if (!formSteps.length) return;
    formSteps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });
    
    // Update progress steps
    progressSteps.forEach((step, index) => {
      if (index <= currentStep) {
        step.classList.add('active');
        if (index < currentStep) step.classList.add('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
    
    // Update progress bar width
    if (progressBar && progressSteps.length > 1) {
      const percentage = (currentStep / (progressSteps.length - 1)) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  // Custom Toast Notification System
  function showToast(message, type = 'error') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '⚠️';
    if (type === 'success') icon = '✓';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);

    // Update screen reader announcer for accessibility
    const announcer = document.getElementById('form-validation-announcer');
    if (announcer) {
      announcer.textContent = `Aviso: ${message}`;
    }
    
    // Trigger slide-in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remove after 3.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3500);
  }

  // Inline validation error helpers
  function markFieldError(inputElement, wrapperElement, message) {
    const target = wrapperElement || inputElement;
    target.classList.add('input-error');
    
    let errorSpan = target.parentNode.querySelector('.error-text');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-text';
      target.parentNode.appendChild(errorSpan);
    }
    errorSpan.textContent = message;

    // Update screen reader announcer for accessibility
    const announcer = document.getElementById('form-validation-announcer');
    if (announcer) {
      announcer.textContent = `Error en el formulario: ${message}`;
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-control, .custom-select-wrapper, .select-wrapper').forEach(el => {
      el.classList.remove('input-error');
    });
    document.querySelectorAll('.error-text').forEach(el => {
      el.remove();
    });
  }

  function validateStep(stepIndex) {
    clearErrors();
    const formCard = document.querySelector('.form-card');

    const triggerShake = () => {
      if (formCard) {
        formCard.classList.remove('shake-error');
        formCard.offsetHeight; // trigger reflow
        formCard.classList.add('shake-error');
        setTimeout(() => {
          formCard.classList.remove('shake-error');
        }, 500);
      }
    };

    if (stepIndex === 0) {
      // Step 1: Services Selection
      if (selectedServices.length === 0) {
        showToast('Por favor, selecciona al menos un servicio para continuar.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 1) {
      // Step 2: Client Info
      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const phoneInput = document.getElementById('client-phone');
      
      const nombre = nameInput.value.trim();
      const email = emailInput.value.trim();
      const cel = phoneInput.value.trim();
      let hasError = false;

      if (!nombre) {
        markFieldError(nameInput, null, 'Por favor, ingresa tu nombre completo.');
        hasError = true;
      }
      
      if (!email) {
        markFieldError(emailInput, null, 'Por favor, ingresa tu correo electrónico.');
        hasError = true;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          markFieldError(emailInput, null, 'Por favor, ingresa un correo electrónico válido.');
          hasError = true;
        }
      }

      if (!cel) {
        markFieldError(phoneInput, phoneInput.parentNode, 'Por favor, ingresa tu número de teléfono.');
        hasError = true;
      } else if (cel.length !== 9) {
        markFieldError(phoneInput, phoneInput.parentNode, 'Por favor, ingresa un número de teléfono de 9 dígitos.');
        hasError = true;
      }

      if (hasError) {
        showToast('Por favor, completa correctamente los campos obligatorios.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 2) {
      // Step 3: Project Details (Business Info)
      const companyNameInput = document.getElementById('company-name');
      const companyIndustryInput = document.getElementById('company-industry');
      const companySizeSelect = document.getElementById('company-size');

      let hasError = false;

      if (!companyNameInput.value.trim()) {
        markFieldError(companyNameInput, null, 'El nombre de la empresa es obligatorio.');
        hasError = true;
      }

      if (!companyIndustryInput.value.trim()) {
        markFieldError(companyIndustryInput, null, 'El rubro de la empresa es obligatorio.');
        hasError = true;
      }

      if (!companySizeSelect.value) {
        markFieldError(companySizeSelect, companySizeSelect.parentNode, 'Debes seleccionar el tamaño de la empresa.');
        hasError = true;
      }

      if (hasError) {
        showToast('Por favor, completa los campos del negocio obligatorios.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 3) {
      // Step 4: Project Details
      return true;
    }
    return true;
  }

  function fillContactForm(service, brand = '') {
    if (!formSteps.length) return;
    
    // Reset form to Step 1
    currentStep = 0;
    updateFormStep();
    if (successMessage) successMessage.style.display = 'none';
    if (contactForm) contactForm.style.display = 'block';

    // Pre-select service in form
    let targetOption = null;
    serviceOptions.forEach(opt => {
      const serviceName = opt.getAttribute('data-service');
      if (serviceName && serviceName.toLowerCase().includes(service.toLowerCase())) {
        targetOption = opt;
      }
    });

    if (targetOption) {
      serviceOptions.forEach(opt => opt.classList.remove('selected'));
      selectedServices = [];
      targetOption.classList.add('selected');
      selectedServices.push(targetOption.getAttribute('data-service'));
    }

    // Step 3: Populate textarea
    const clientMsg = document.getElementById('client-msg');
    if (clientMsg) {
      if (brand && brand !== 'servicio') {
        clientMsg.value = `¡Hola! Me interesó mucho el caso de éxito de ${brand} y me gustaría cotizar una solución similar para mi negocio.`;
      } else {
        clientMsg.value = `¡Hola! Me gustaría cotizar el servicio de ${service} para mi negocio y recibir más información.`;
      }
    }
  }

  function highlightFormCard() {
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.style.outline = '3px solid var(--secondary)';
      formCard.style.boxShadow = '0 0 30px rgba(0, 201, 167, 0.4)';
      formCard.style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        formCard.style.outline = 'none';
        formCard.style.boxShadow = '';
      }, 2000);
    }
  }

  // Helper for Cross-Page or Local CTA Click Routing
  window.handleCtaClick = function(service, brand = '') {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      fillContactForm(service, brand);
      contactSection.scrollIntoView({ behavior: 'smooth' });
      highlightFormCard();
    } else {
      let url = 'contacto.html';
      const params = [];
      if (service) params.push(`service=${encodeURIComponent(service)}`);
      if (brand) params.push(`brand=${encodeURIComponent(brand)}`);
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      window.location.href = url;
    }
  };

  if (formSteps.length > 0) {
    serviceOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Deselect other options to allow single selection behavior when auto-advancing
        serviceOptions.forEach(opt => {
          if (opt !== option) {
            opt.classList.remove('selected');
          }
        });

        option.classList.toggle('selected');
        const serviceName = option.getAttribute('data-service');
        
        if (option.classList.contains('selected')) {
          selectedServices = [serviceName];
          // Auto-advance to the next step after a short delay for visual feedback
          setTimeout(() => {
            if (validateStep(currentStep)) {
              currentStep++;
              updateFormStep();
            }
          }, 350);
        } else {
          selectedServices = [];
        }
      });
    });

    // Next step click
    nextStepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
          currentStep++;
          updateFormStep();
        }
      });
    });

    // Previous step click
    prevStepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentStep--;
        updateFormStep();
      });
    });

    // Handle Form Submit
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate Step 3 (Business Info) and Step 4 (Project Details) before submitting
        if (!validateStep(2) || !validateStep(3)) {
          return;
        }
        
        // Get all final data values
        const name = document.getElementById('client-name').value.trim();
        const email = document.getElementById('client-email').value.trim();
        const countryCode = document.getElementById('country-code').value;
        const phone = document.getElementById('client-phone').value.trim();
        const companyName = document.getElementById('company-name').value.trim();
        const companyIndustry = document.getElementById('company-industry').value.trim();
        const companySize = document.getElementById('company-size').value;
        const companyWebsite = document.getElementById('company-website').value.trim();
        const companySocial = document.getElementById('company-social').value.trim();
        const message = document.getElementById('client-msg').value.trim();
        const fullPhone = `${countryCode} ${phone}`;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        const showSuccessUI = () => {
          contactForm.style.display = 'none';
          
          const successTitle = successMessage.querySelector('h3');
          if (successTitle) {
            successTitle.innerHTML = `¡Gracias, ${name}!`;
          }
          
          if (successMessage) successMessage.style.display = 'flex';
          const stepProgress = document.querySelector('.step-progress');
          if (stepProgress) stepProgress.style.display = 'none';
          
          // Show custom success toast
          showToast('¡Solicitud enviada con éxito!', 'success');
        };

        if (!supabaseClient) {
          // Fallback simulation if supabase script failed to load (offline or CDN blocked)
          setTimeout(() => {
            showSuccessUI();
          }, 1500);
          return;
        }

        const leadData = {
          client_name: name,
          client_email: email,
          client_phone: fullPhone,
          company_name: companyName,
          company_industry: companyIndustry,
          company_size: companySize,
          company_website: companyWebsite || null,
          company_social: companySocial || null,
          client_message: message || null,
          services: selectedServices
        };

        supabaseClient.from('leads').insert([leadData])
          .then(({ error }) => {
            if (error) {
              console.error('Error saving lead to Supabase:', error);
              showToast('Hubo un error al enviar tu solicitud. Intenta de nuevo.', 'error');
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            } else {
              showSuccessUI();
            }
          })
          .catch(err => {
            console.error('Error:', err);
            showToast('Ocurrió un error de red al conectar con Supabase.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      });
    }

    // Check URL parameters on load for pre-filling
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const brandParam = urlParams.get('brand');
    if (serviceParam) {
      fillContactForm(serviceParam, brandParam || '');
    }
  }

  // ==========================================
  // 7. Bento Grid Interactive Motion Effects
  // ==========================================
  
  // 7.1. Cursor Spotlight Glare (Shine Effect)
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update spotlight position variables
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 7.2. Social Card Live-Likes Counter Animation
  const socialCard = document.querySelector('.sb-social');
  const likesSpan = document.querySelector('.likes-number');
  
  if (socialCard && likesSpan) {
    let counterInterval;
    const initialLikes = 150;
    const targetLikes = 1582;
    
    socialCard.addEventListener('mouseenter', () => {
      clearInterval(counterInterval);
      let current = initialLikes;
      const duration = 1000; // 1 second animation
      const stepTime = 15; // ms between updates
      const totalSteps = duration / stepTime;
      const increment = (targetLikes - initialLikes) / totalSteps;
      
      counterInterval = setInterval(() => {
        current += increment;
        if (current >= targetLikes) {
          current = targetLikes;
          clearInterval(counterInterval);
          const heartSvg = socialCard.querySelector('.radar-core svg');
          if (heartSvg) {
            heartSvg.classList.add('heart-pop');
          }
        }
        likesSpan.textContent = Math.floor(current).toLocaleString();
      }, stepTime);
    });
    
    socialCard.addEventListener('mouseleave', () => {
      clearInterval(counterInterval);
      // Reset back to initial likes with a slight delay for smooth visual transition
      setTimeout(() => {
        likesSpan.textContent = initialLikes.toString();
        const heartSvg = socialCard.querySelector('.radar-core svg');
        if (heartSvg) {
          heartSvg.classList.remove('heart-pop');
        }
      }, 300);
    });
  }

  // 7.3. Branding Card Palette Switcher (with Auto-rotation and Interactive Pause)
  const swatches = document.querySelectorAll('.palette-swatches .swatch');
  const brandingLetter = document.querySelector('.branding-letter');
  const brandingCard = document.querySelector('.sb-branding');
  
  if (swatches.length && brandingLetter && brandingCard) {
    const brandingThemes = [
      {
        font: "'Outfit', sans-serif",
        gradient: "linear-gradient(135deg, #00f0ff 0%, #0072ff 100%)",
        color: "#00f0ff",
        themeClass: "theme-cyber"
      },
      {
        font: "'Playfair Display', 'Georgia', serif",
        gradient: "linear-gradient(135deg, #f39c12 0%, #d4af37 100%)",
        color: "#d4af37",
        themeClass: "theme-lux"
      },
      {
        font: "'Syne', sans-serif",
        gradient: "linear-gradient(135deg, #ff007f 0%, #7b2ff7 100%)",
        color: "#ff007f",
        themeClass: "theme-retro"
      }
    ];

    let currentThemeIdx = 0;
    let autoThemeInterval = null;
    let userInteracted = false;

    function applyTheme(idx) {
      currentThemeIdx = idx;
      
      // Reset swatch styles and highlight active
      swatches.forEach((s, sIdx) => {
        if (sIdx === idx) {
          s.style.transform = 'scaleX(1.15) translateX(4px)';
          s.style.borderColor = brandingThemes[idx].color;
          s.classList.add('active');
        } else {
          s.style.transform = 'none';
          s.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          s.classList.remove('active');
        }
      });
      
      // Remove other branding themes and add the new one
      brandingThemes.forEach(t => brandingCard.classList.remove(t.themeClass));
      brandingCard.classList.add(brandingThemes[idx].themeClass);
      
      // Apply theme to branding display letter
      brandingLetter.style.fontFamily = brandingThemes[idx].font;
      brandingLetter.style.backgroundImage = brandingThemes[idx].gradient;
      
      // Trigger a cool pulse keyframe animation on the card itself
      brandingCard.style.animation = 'none';
      brandingCard.offsetHeight; // trigger reflow
      brandingCard.style.animation = 'themePulse 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    function startAutoRotation() {
      if (userInteracted) return;
      stopAutoRotation();
      autoThemeInterval = setInterval(() => {
        const nextIdx = (currentThemeIdx + 1) % brandingThemes.length;
        applyTheme(nextIdx);
      }, 4000); // Cycle every 4 seconds
    }

    function stopAutoRotation() {
      if (autoThemeInterval) {
        clearInterval(autoThemeInterval);
        autoThemeInterval = null;
      }
    }

    // Initialize auto rotation
    startAutoRotation();

    // Event listeners for manual selection
    swatches.forEach((swatch, idx) => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        userInteracted = true;
        stopAutoRotation();
        applyTheme(idx);
      });
    });

    // Pause on hover, resume on leave
    brandingCard.addEventListener('mouseenter', () => {
      stopAutoRotation();
    });

    brandingCard.addEventListener('mouseleave', () => {
      startAutoRotation();
    });
  }

  // 7.4. Web Card Interactive Mock Browser Scroll & Loading Preview
  const webCard = document.querySelector('.sb-web');
  const codeView = document.querySelector('.mock-code-view');
  const webPreview = document.querySelector('.mock-web-preview');
  const progressLine = document.querySelector('.mock-url-progress');
  
  if (webCard && codeView && webPreview && progressLine) {
    let loadingTimeout;
    let progressInterval;
    
    webCard.addEventListener('mousemove', (e) => {
      if (webPreview.classList.contains('show')) return;
      
      const rect = webCard.getBoundingClientRect();
      // Normalize Y position from 0 to 1
      const relativeY = (e.clientY - rect.top) / rect.height;
      // Scroll the container slightly based on mouse position
      const translateY = (relativeY * -30) + 5; // Translate range: +5px to -25px
      
      codeView.style.transform = `translateY(${translateY}px)`;
      codeView.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    
    webCard.addEventListener('mouseenter', () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
      
      let width = 0;
      progressLine.style.width = '0%';
      
      progressInterval = setInterval(() => {
        width += 2.5; // 40 steps total
        progressLine.style.width = `${width}%`;
        if (width >= 100) {
          clearInterval(progressInterval);
          codeView.classList.add('hide');
          webPreview.classList.add('show');
        }
      }, 20); // 20ms * 40 steps = 800ms total loading time
    });
    
    webCard.addEventListener('mouseleave', () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
      
      progressLine.style.width = '0%';
      codeView.classList.remove('hide');
      webPreview.classList.remove('show');
      
      codeView.style.transform = 'translateY(0)';
      codeView.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  }

  // 8. Interactive Case Study Terminal Logic
  const caseSelectors = document.querySelectorAll('.case-selector');
  const simScreens = document.querySelectorAll('.sim-screen');
  const detailsPanels = document.querySelectorAll('.details-panel');
  const simUrlText = document.getElementById('sim-url-text');
  const projectGlow = document.getElementById('project-glow');
  const simulatorFrame = document.querySelector('.simulator-frame');

  if (caseSelectors.length > 0) {
    const projectUrls = {
      blu: 'mavixchile.com/blu',
      vintage: 'vintagesalon.cl',
      colonos: 'colonos.cl',
      burger: 'blackburger.cl',
      parma: 'diparma.cl',
      rafting: 'happyrafting.cl'
    };

    caseSelectors.forEach(selector => {
      selector.addEventListener('click', () => {
        // 1. Remove active state from other selectors
        caseSelectors.forEach(sel => sel.classList.remove('active'));
        selector.classList.add('active');

        const project = selector.getAttribute('data-project');
        const glowColor = selector.getAttribute('data-color');

        // 2. Switch simulator screen
        simScreens.forEach(screen => {
          screen.classList.remove('active');
          if (screen.getAttribute('data-project') === project) {
            screen.classList.add('active');
          }
        });

        // 3. Switch details panel
        detailsPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.getAttribute('data-project') === project) {
            panel.classList.add('active');
          }
        });

        // 4. Update simulator URL
        if (simUrlText && projectUrls[project]) {
          simUrlText.textContent = projectUrls[project];
        }

        // 5. Update ambient glow color dynamically
        if (projectGlow && glowColor) {
          projectGlow.style.background = `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`;
        }

        // 6. Switch simulator device wrapper class
        if (simulatorFrame) {
          simulatorFrame.classList.remove('device-desktop', 'device-mobile', 'device-branding');
          if (project === 'blu' || project === 'colonos') {
            simulatorFrame.classList.add('device-desktop');
          } else if (project === 'parma') {
            simulatorFrame.classList.add('device-branding');
          } else {
            simulatorFrame.classList.add('device-mobile');
          }
        }
      });
    });
  }

  // 9. Portfolio CRO Conversion flow (Success Terminal CTA & Services CTA)
  const terminalCtaBtns = document.querySelectorAll('.btn-terminal-cta');
  if (terminalCtaBtns.length > 0) {
    terminalCtaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const brand = btn.getAttribute('data-brand');
        const service = btn.getAttribute('data-service'); // Web, Redes Sociales, Branding

        if (window.handleCtaClick) {
          window.handleCtaClick(service, brand);
        }
      });
    });
  }

  // 10. Team Member Contact Flow
  const memberCtaBtns = document.querySelectorAll('[data-member-contact]');
  if (memberCtaBtns.length > 0) {
    memberCtaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = btn.getAttribute('data-member-contact');

        if (window.handleCtaClick) {
          window.handleCtaClick('servicio', name);
        }
      });
    });
  }

  // 11. Scroll Spy for Home Page Navigation Links
  const spySections = document.querySelectorAll('section[id]');
  const navAnchorLinks = document.querySelectorAll('.nav-links a');
  
  if (spySections.length > 0 && navAnchorLinks.length > 0) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchorLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Match local anchor, full page with anchor, or home path
            if (href === `#${id}` || href === `index.html#${id}` || (id === 'inicio' && href === 'index.html')) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      threshold: 0.2, // Trigger when 20% of the section is visible
      rootMargin: '-80px 0px -30% 0px' // Offset header height and focus on middle-top of screen
    });

    spySections.forEach(section => {
      spyObserver.observe(section);
    });
  }

  // 12. Legal & Admin Modals (Privacy, Cookies & Admin Access)
  const privacyTriggers = document.querySelectorAll('.privacy-trigger');
  const cookiesTriggers = document.querySelectorAll('.cookies-trigger');
  const adminTriggers = document.querySelectorAll('.admin-login-trigger');

  if (privacyTriggers.length > 0 || cookiesTriggers.length > 0 || adminTriggers.length > 0) {
    // Modal HTML templates
    const privacyHTML = `
      <div class="legal-modal-overlay" id="privacy-modal">
        <div class="legal-modal-box">
          <div class="legal-modal-header">
            <h3>Políticas de Privacidad</h3>
            <button class="legal-modal-close" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="legal-modal-body">
            <p><strong>Última actualización: Julio 2026</strong></p>
            <p>En <strong>Mavix Chile</strong> nos tomamos muy en serio la seguridad de tu información. La presente Política de Privacidad describe el tratamiento de tus datos personales de conformidad con la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> en Chile y estándares de seguridad web modernos.</p>
            
            <h4>1. Responsable del Tratamiento</h4>
            <p>El responsable del tratamiento de los datos recolectados es <strong>Mavix Chile</strong>, correo de contacto: <a href="mailto:info@mavixchile.com">info@mavixchile.com</a>.</p>
            
            <h4>2. Datos que Recolectamos</h4>
            <p>Cuando utilizas nuestros formularios de contacto o interactúas con la web, recopilamos los siguientes datos personales:</p>
            <ul>
              <li>Nombre completo.</li>
              <li>Correo electrónico de contacto.</li>
              <li>Número de teléfono / WhatsApp.</li>
              <li>Datos de tu empresa (nombre, rubro, sitio web, redes sociales y tamaño).</li>
              <li>Detalles o requerimientos de los servicios digitales cotizados.</li>
            </ul>

            <h4>3. Finalidad del Tratamiento</h4>
            <p>Tus datos son recolectados y tratados únicamente para las siguientes finalidades legítimas y específicas:</p>
            <ul>
              <li>Responder a tus solicitudes de cotización e información.</li>
              <li>Prestar y gestionar los servicios de desarrollo web, marketing digital, redes sociales o automatizaciones contratados.</li>
              <li>Enviar información relevante sobre actualizaciones técnicas de tus servicios.</li>
              <li>Cumplir con obligaciones legales, tributarias y de facturación.</li>
            </ul>

            <h4>4. Base Legal y Consentimiento</h4>
            <p>La base legal para el tratamiento de tus datos es tu <strong>consentimiento expreso</strong>. Al rellenar y enviar nuestro formulario de contacto, autorizas voluntaria y explícitamente a Mavix Chile a tratar tus datos personales bajo los términos de esta política.</p>

            <h4>5. Seguridad de los Datos</h4>
            <p>Implementamos medidas técnicas y organizativas para asegurar tus datos contra pérdida, alteración, robo o acceso no autorizado. Los leads se almacenan de manera segura utilizando políticas de seguridad de base de datos a nivel de fila (RLS) en Supabase, impidiendo que usuarios anónimos o agentes externos puedan consultar tus datos.</p>

            <h4>6. Derechos ARCO</h4>
            <p>De acuerdo con la legislación chilena, tienes derecho a ejercer tus derechos <strong>ARCO</strong> (Acceso, Rectificación, Cancelación y Oposición) de forma gratuita. Esto te faculta a:</p>
            <ul>
              <li>Conocer qué datos personales tenemos almacenados sobre ti.</li>
              <li>Modificar o actualizar datos inexactos o erróneos.</li>
              <li>Solicitar la eliminación completa de tus registros de nuestras bases de datos.</li>
              <li>Oponerte al uso de tus datos para fines específicos.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, solo debes enviar una solicitud escrita al correo electrónico <a href="mailto:info@mavixchile.com">info@mavixchile.com</a>.</p>
          </div>
          <div class="legal-modal-footer">
            <button class="btn btn-primary close-modal-btn">Entendido</button>
          </div>
        </div>
      </div>
    `;

    const cookiesHTML = `
      <div class="legal-modal-overlay" id="cookies-modal">
        <div class="legal-modal-box">
          <div class="legal-modal-header">
            <h3>Políticas de Cookies</h3>
            <button class="legal-modal-close" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="legal-modal-body">
            <p><strong>Última actualización: Julio 2026</strong></p>
            <p>Esta política tiene como objetivo informarte de manera transparente sobre el uso de cookies en el sitio web de <strong>Mavix Chile</strong>, de conformidad con las directrices de protección de la privacidad.</p>
            
            <h4>1. ¿Qué es una Cookie?</h4>
            <p>Una cookie es un pequeño archivo de texto que un sitio web almacena en tu navegador al visitarlo. Permite que el sitio recuerde información útil sobre tu visita para mejorar tu experiencia en navegación futura.</p>

            <h4>2. ¿Qué tipos de Cookies utilizamos?</h4>
            <ul>
              <li><strong>Cookies Técnicas / Necesarias</strong>: Son esenciales para el funcionamiento de la web. Permiten navegar de forma segura, recordar el paso actual del formulario de contacto y mantener la integridad del sitio. No recopilan datos personales con fines publicitarios.</li>
              <li><strong>Cookies de Personalización</strong>: Recuerdan tus opciones de formulario (como la bandera del país seleccionada) para ahorrarte clics si vuelves a rellenar el formulario más adelante.</li>
              <li><strong>Cookies de Análisis / Rendimiento</strong>: Nos ayudan a entender el comportamiento anónimo de los visitantes (como páginas visitadas, secciones de más interés y velocidad de carga), permitiéndonos optimizar la web constantemente.</li>
            </ul>

            <h4>3. ¿Cómo puedes controlar las Cookies?</h4>
            <p>Puedes administrar, bloquear o borrar las cookies instaladas en tu computador o móvil configurando las opciones de tu navegador de internet. A continuación, tienes guías para los navegadores más utilizados:</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank">Google Chrome</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank">Apple Safari</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank">Mozilla Firefox</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63fd4a5b-144c-839c-784c-c0d732568903" target="_blank">Microsoft Edge</a></li>
            </ul>
            <p>Nota: La desactivación total de cookies puede limitar algunas funcionalidades interactivas del formulario de la landing page.</p>
          </div>
          <div class="legal-modal-footer">
            <button class="btn btn-primary close-modal-btn">Entendido</button>
          </div>
        </div>
      </div>
    `;

    const loginHTML = `
      <div class="legal-modal-overlay" id="login-modal">
        <div class="legal-modal-box">
          <div class="legal-modal-header">
            <h3>Acceso de Equipo</h3>
            <button class="legal-modal-close" aria-label="Cerrar modal">&times;</button>
          </div>
          <form id="admin-login-form">
            <div class="legal-modal-body">
              <p>Ingresa tus credenciales autorizadas para acceder al panel de administración de Mavix Chile.</p>
              
              <label for="admin-email">Correo Electrónico</label>
              <input type="email" id="admin-email" required placeholder="ejemplo@mavixchile.com">
              
              <label for="admin-password">Contraseña</label>
              <div class="password-input-wrapper">
                <input type="password" id="admin-password" required placeholder="••••••••">
                <button type="button" class="toggle-password-btn" id="toggle-password-btn" aria-label="Mostrar contraseña">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              
              <div class="login-error-msg" id="login-error"></div>
            </div>
            <div class="legal-modal-footer">
              <button type="submit" class="btn btn-primary" id="login-submit-btn">Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Inject modals to body
    const modalContainer = document.createElement('div');
    modalContainer.id = 'legal-modals-container';
    modalContainer.innerHTML = privacyHTML + cookiesHTML + loginHTML;
    document.body.appendChild(modalContainer);

    const privacyModal = document.getElementById('privacy-modal');
    const cookiesModal = document.getElementById('cookies-modal');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const adminPasswordInput = document.getElementById('admin-password');

    // Show functions
    const openModal = (modal) => {
      if (!modal) return;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden'; // Block background scroll
    };

    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('open');
      document.body.style.overflow = ''; // Restore background scroll
      // Clear login inputs and errors if closing login modal
      if (modal === loginModal) {
        if (loginForm) loginForm.reset();
        if (adminPasswordInput) adminPasswordInput.type = 'password';
        if (togglePasswordBtn) {
          togglePasswordBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          `;
          togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
        }
        if (loginError) {
          loginError.textContent = '';
          loginError.style.display = 'none';
        }
        if (loginSubmitBtn) {
          loginSubmitBtn.textContent = 'Iniciar Sesión';
          loginSubmitBtn.disabled = false;
        }
      }
    };

    // Bind triggers
    privacyTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(privacyModal);
      });
    });

    cookiesTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(cookiesModal);
      });
    });

    adminTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
      });
    });

    // Toggle password visibility
    if (togglePasswordBtn && adminPasswordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        const isPassword = adminPasswordInput.type === 'password';
        adminPasswordInput.type = isPassword ? 'text' : 'password';
        
        if (isPassword) {
          // Change to Eye Off SVG
          togglePasswordBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          `;
          togglePasswordBtn.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
          // Change to Eye SVG
          togglePasswordBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          `;
          togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
        }
      });
    }

    // Handle Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        if (loginError) {
          loginError.textContent = '';
          loginError.style.display = 'none';
        }

        if (loginSubmitBtn) {
          loginSubmitBtn.textContent = 'Autenticando...';
          loginSubmitBtn.disabled = true;
        }

        if (!supabaseClient) {
          if (loginError) {
            loginError.textContent = 'Error: No se pudo conectar con el servidor de autenticación.';
            loginError.style.display = 'block';
          }
          if (loginSubmitBtn) {
            loginSubmitBtn.textContent = 'Iniciar Sesión';
            loginSubmitBtn.disabled = false;
          }
          return;
        }

        try {
          // 1. Authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (authError) {
            console.error('Auth error:', authError);
            if (loginError) {
              loginError.textContent = 'Correo o contraseña incorrectos.';
              loginError.style.display = 'block';
            }
            if (loginSubmitBtn) {
              loginSubmitBtn.textContent = 'Iniciar Sesión';
              loginSubmitBtn.disabled = false;
            }
            return;
          }

          // 2. Validate if user is member of the team
          const { data: teamData, error: teamError } = await supabaseClient
            .from('team_members')
            .select('email')
            .eq('email', email)
            .maybeSingle();

          if (teamError || !teamData) {
            console.warn('Unauthorized login attempt:', email, teamError);
            // Sign out immediately to clear authorization session
            await supabaseClient.auth.signOut();
            
            if (loginError) {
              loginError.textContent = 'Acceso denegado: Este correo no corresponde a un miembro autorizado del equipo.';
              loginError.style.display = 'block';
            }
            if (loginSubmitBtn) {
              loginSubmitBtn.textContent = 'Iniciar Sesión';
              loginSubmitBtn.disabled = false;
            }
            return;
          }

          // 3. Success: Redirect to Local Admin Panel
          window.location.href = 'admin.html';

        } catch (err) {
          console.error('Unexpected error:', err);
          if (loginError) {
            loginError.textContent = 'Ocurrió un error inesperado al conectar con el servidor.';
            loginError.style.display = 'block';
          }
          if (loginSubmitBtn) {
            loginSubmitBtn.textContent = 'Iniciar Sesión';
            loginSubmitBtn.disabled = false;
          }
        }
      });
    }

    // Bind close buttons
    document.querySelectorAll('.legal-modal-close, .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.legal-modal-overlay');
        closeModal(modal);
      });
    });

    // Close on overlay click
    document.querySelectorAll('.legal-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay);
        }
      });
    });

    // Close on Esc keypress
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.legal-modal-overlay.open');
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });
  }

  // =========================================================================
  // 13. DYNAMIC CONTENT LOADING FROM SUPABASE (CMS)
  // =========================================================================
  if (supabaseClient) {
    // A. Dynamic Team Loading
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      supabaseClient
        .from('team_members')
        .select('*')
        .order('name', { ascending: true })
        .then(({ data: members, error }) => {
          if (error) {
            console.error('Error loading team members:', error);
            return;
          }
          if (members && members.length > 0) {
            teamGrid.innerHTML = '';
            members.forEach(member => {
              const skillsList = Array.isArray(member.skills)
                ? member.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')
                : '';

              const card = document.createElement('div');
              card.className = 'team-card tilt-card';
              card.setAttribute('data-member', member.name.toLowerCase().split(' ')[0]);
              card.innerHTML = `
                <div class="spotlight"></div>
                <div class="team-avatar">
                  <img src="${member.avatar_url || 'assets/default_avatar.png'}" alt="${member.name}" loading="lazy">
                </div>
                <div class="team-info">
                  <h3>${member.name}</h3>
                  <div class="team-role">${member.role}</div>
                  <p class="team-bio">${member.bio || ''}</p>
                </div>
                <div class="team-skills">
                  ${skillsList}
                </div>
                <div class="team-footer">
                  <div class="team-socials">
                    ${member.linkedin_url ? `<a href="${member.linkedin_url}" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>` : ''}
                    ${member.instagram_url ? `<a href="${member.instagram_url}" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
                  </div>
                  <a href="contacto.html" class="btn-card-cta" data-member-contact="${member.name.split(' ')[0]}">Contactar ↗</a>
                </div>
              `;
              teamGrid.appendChild(card);
            });

            // Re-initialize tilt effect
            if (window.VanillaTilt) {
              VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
                max: 8,
                speed: 400,
                glare: true,
                "max-glare": 0.15,
              });
            }
          }
        });
    }

    // B. Dynamic Services Loading
    const hasBentoCards = document.querySelector('.bento-card');
    const hasServiceSections = document.querySelector('.service-detail-section');

    if (hasBentoCards || hasServiceSections) {
      supabaseClient
        .from('services')
        .select('*')
        .order('created_at', { ascending: true })
        .then(({ data: services, error }) => {
          if (error) {
            console.error('Error loading services:', error);
            return;
          }
          if (services && services.length > 0) {
            const dbKeys = services.map(s => s.key);
            const hardcodedKeys = ['web', 'social', 'ads', 'branding', 'audiovisual', 'automations'];

            // 1. Hide deleted services in both pages
            hardcodedKeys.forEach(k => {
              if (!dbKeys.includes(k)) {
                // Hide bento card (index.html)
                const card = document.querySelector(`.bento-card.sb-${k}`);
                if (card) card.style.display = 'none';

                // Hide section and sidebar link (servicios.html)
                const section = document.querySelector(`.service-detail-section[data-service="${k}"]`);
                if (section) section.style.display = 'none';

                const sidebarLink = document.querySelector(`.sidebar-link[data-service="${k}"]`);
                if (sidebarLink) {
                  const li = sidebarLink.closest('li');
                  if (li) li.style.display = 'none';
                }
              } else {
                // Restore visibility if they were re-enabled/re-created
                const card = document.querySelector(`.bento-card.sb-${k}`);
                if (card) card.style.display = '';

                const section = document.querySelector(`.service-detail-section[data-service="${k}"]`);
                if (section) section.style.display = '';

                const sidebarLink = document.querySelector(`.sidebar-link[data-service="${k}"]`);
                if (sidebarLink) {
                  const li = sidebarLink.closest('li');
                  if (li) li.style.display = '';
                }
              }
            });

            services.forEach(service => {
              // A. Dynamic Bento Cards (index.html)
              if (hasBentoCards) {
                const card = document.querySelector(`.bento-card.sb-${service.key}`);
                if (card) {
                  const titleEl = card.querySelector('h3');
                  const descEl = card.querySelector('p');
                  const iconEl = card.querySelector('.bento-card-icon');
                  const ctaEl = card.querySelector('.service-cta');

                  if (titleEl) titleEl.textContent = service.title;
                  if (descEl) descEl.textContent = service.description;
                  if (iconEl && service.icon) iconEl.innerHTML = service.icon;
                  if (ctaEl) ctaEl.setAttribute('data-service', service.title);
                } else if (!hardcodedKeys.includes(service.key)) {
                  // Append new service dynamically
                  const parentGrid = document.querySelector('#servicios .services-bento');
                  if (parentGrid) {
                    const newCard = document.createElement('div');
                    newCard.className = `bento-card sb-${service.key} tilt-card`;
                    newCard.innerHTML = `
                      <div class="bento-card-info">
                        <div class="bento-card-icon text-cyan">
                          ${service.icon || '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0-7"/></svg>'}
                        </div>
                        <h3>${service.title}</h3>
                        <p>${service.description}</p>
                        <a href="contacto.html" class="service-cta btn-terminal-cta" data-brand="servicio" data-service="${service.title}">
                          Solicitar Información 
                          <span class="cta-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          </span>
                        </a>
                      </div>
                    `;
                    parentGrid.appendChild(newCard);
                  }
                }
              }

              // B. Dynamic Detailed Sections & Sidebar (servicios.html)
              if (hasServiceSections) {
                // Update sidebar link text
                const sidebarLink = document.querySelector(`.sidebar-link[data-service="${service.key}"]`);
                if (sidebarLink) {
                  const numSpan = sidebarLink.querySelector('span');
                  sidebarLink.innerHTML = '';
                  if (numSpan) sidebarLink.appendChild(numSpan);
                  sidebarLink.appendChild(document.createTextNode(' ' + service.title));
                } else if (!hardcodedKeys.includes(service.key)) {
                  // Append new sidebar link
                  const nav = document.querySelector('.services-sidebar-nav');
                  if (nav) {
                    const li = document.createElement('li');
                    const num = String(nav.children.length + 1).padStart(2, '0');
                    li.innerHTML = `<a href="#${service.key}" class="sidebar-link" data-service="${service.key}"><span>${num}.</span> ${service.title}</a>`;
                    nav.appendChild(li);

                    // Bind click listener for scrolling
                    const a = li.querySelector('a');
                    a.addEventListener('click', (e) => {
                      e.preventDefault();
                      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                      a.classList.add('active');
                      const target = document.getElementById(service.key);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    });
                  }
                }

                // Update service detail section
                const section = document.querySelector(`.service-detail-section[data-service="${service.key}"]`);
                if (section) {
                  const titleEl = section.querySelector('.service-icon-header h3');
                  const descEl = section.querySelector('.service-detail-description');
                  const iconSvg = section.querySelector('.service-icon-header svg');
                  const ctaEl = section.querySelector('.service-cta');

                  if (titleEl) titleEl.textContent = service.title;
                  if (descEl) descEl.textContent = service.description;
                  if (iconSvg && service.icon) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(service.icon, 'image/xml');
                    const newSvg = doc.querySelector('svg');
                    if (newSvg) {
                      newSvg.setAttribute('width', '32');
                      newSvg.setAttribute('height', '32');
                      iconSvg.replaceWith(newSvg);
                    }
                  }
                  if (ctaEl) ctaEl.setAttribute('data-service', service.title);
                } else if (!hardcodedKeys.includes(service.key)) {
                  // Append new detail section
                  const contentArea = document.querySelector('.services-content-area');
                  if (contentArea) {
                    const newSection = document.createElement('section');
                    newSection.id = service.key;
                    newSection.className = 'service-detail-section reveal';
                    newSection.setAttribute('data-service', service.key);
                    newSection.innerHTML = `
                      <div class="service-detail-info">
                        <div class="service-icon-header text-cyan">
                          ${service.icon || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0-7"/></svg>'}
                          <h3>${service.title}</h3>
                        </div>
                        <p class="service-detail-description">${service.description}</p>
                        
                        <div class="service-deliverables-grid">
                          <div class="deliverable-card">
                            <div class="deliverable-header">
                              <span class="deliverable-bullet text-cyan">•</span>
                              <h4>Soluciones Personalizadas</h4>
                            </div>
                            <p>Implementación adaptada a las necesidades específicas de tu negocio.</p>
                          </div>
                          <div class="deliverable-card">
                            <div class="deliverable-header">
                              <span class="deliverable-bullet text-cyan">•</span>
                              <h4>Soporte Técnico</h4>
                            </div>
                            <p>Asistencia constante para garantizar el óptimo funcionamiento del servicio.</p>
                          </div>
                          <div class="deliverable-card">
                            <div class="deliverable-header">
                              <span class="deliverable-bullet text-cyan">•</span>
                              <h4>Optimización y Análisis</h4>
                            </div>
                            <p>Seguimiento continuo de resultados y métricas clave de desempeño.</p>
                          </div>
                        </div>
                        
                        <a href="contacto.html" class="service-cta btn-terminal-cta" data-brand="servicio" data-service="${service.title}">
                          Cotizar Servicio 
                          <span class="cta-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          </span>
                        </a>
                      </div>
                    `;
                    contentArea.appendChild(newSection);
                  }
                }
              }
            });

            // Re-initialize tilt effect for dynamically added cards
            if (hasBentoCards && window.VanillaTilt) {
              VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
                max: 8,
                speed: 400,
                glare: true,
                "max-glare": 0.15,
              });
            }
          }
        });
    }

    // C. Dynamic General Page Content Loading
    if (supabaseClient) {
      let pageType = 'home';
      const path = window.location.pathname;
      if (path.includes('equipo')) pageType = 'nosotros';
      else if (path.includes('servicios')) pageType = 'servicios';
      else if (path.includes('casos')) pageType = 'casos';
      else if (path.includes('contacto')) pageType = 'contacto';

      // Auto-assign keys to text elements so all saved changes update on the public site
      const selector = 'h1, h2, h3, h4, h5, h6, p, span, a, button, li, .stat-number, .stat-label, .section-tag, .section-title, .section-desc, .likes-number, .likes-label, .testimonial-quote, .brand-name';
      const allTextEls = document.querySelectorAll(selector);
      allTextEls.forEach((el, index) => {
        if (el.id === 'typewriter' || el.closest('#typewriter') || el.closest('svg') || el.closest('script')) return;
        const text = (el.textContent || '').trim();
        if (!text) return;
        if (!el.dataset.cmsKey) {
          const textSnippet = text.substring(0, 15).toLowerCase().replace(/[^a-z0-9]/g, '_');
          el.dataset.cmsKey = `cms_${pageType}_${el.tagName.toLowerCase()}_${index}_${textSnippet}`;
        }
      });

      supabaseClient
        .from('page_contents')
        .select('*')
        .eq('page', pageType)
        .then(({ data: contents, error }) => {
          if (error) {
            console.error('Error loading page contents:', error);
            return;
          }
          if (contents && contents.length > 0) {
            contents.forEach(item => {
              const el = document.querySelector(`[data-cms-key="${item.key}"]`);
              if (el) {
                if (item.key === 'contact_info_whatsapp') {
                  el.setAttribute('href', item.content);
                } else if (item.key === 'contact_info_email' && el.tagName === 'A') {
                  el.setAttribute('href', `mailto:${item.content}`);
                  el.textContent = item.content;
                } else if (item.key === 'contact_info_phone' && el.tagName === 'A') {
                  el.setAttribute('href', `tel:${item.content}`);
                  el.textContent = item.content;
                } else {
                  el.textContent = item.content;
                }
              }
            });
          }
        });
    }
  }

});

