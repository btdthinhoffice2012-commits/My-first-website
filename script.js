// Modern Portfolio Web Interactivity Script

// Supabase Configuration - Replace with your actual Project URL and Anon Key to enable real sync
const SUPABASE_URL = 'https://aorecrgczywsbusorftb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvcmVjcmdjenl3c2J1c29yZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzIzMjcsImV4cCI6MjA5ODIwODMyN30.GyF60BIBeAMha2PToL8OxxMj9OHJSNpRa7nU31JvlCE';
let supabaseClient = null;

if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Interactive Mouse-follow Background ---
    const interactiveBg = document.querySelector('.interactive-bg');
    const backgroundCanvas = document.getElementById('background-canvas');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const heroSection = document.getElementById('hero');
    const performanceToggleBtn = document.getElementById('performance-toggle');
    const savedPerformanceMode = localStorage.getItem('performance-mode') === 'true';

    if (savedPerformanceMode || reduceMotion) {
        document.body.classList.add('performance-mode');
    }

    if (performanceToggleBtn) {
        performanceToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('performance-mode');
            localStorage.setItem('performance-mode', document.body.classList.contains('performance-mode'));
        });
    }

    if (heroSection) {
        document.body.classList.add('hero-in-view');
        const heroBackgroundObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                document.body.classList.toggle('hero-in-view', entry.isIntersecting);
            });
        }, { threshold: 0.25 });

        heroBackgroundObserver.observe(heroSection);
    }

    if (window.location.pathname === '/setup') {
        window.history.replaceState(null, '', '/#setup');
        window.requestAnimationFrame(() => {
            document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (interactiveBg && !reduceMotion) {
        const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const follower = { x: pointer.x, y: pointer.y };
        const particles = [];
        const comets = [];
        const ripples = [];
        const trailParticles = [];
        let lastSpawnX = null;
        let lastSpawnY = null;
        const ctx = backgroundCanvas ? backgroundCanvas.getContext('2d') : null;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let deviceScale = Math.min(window.devicePixelRatio || 1, 2);
        let time = 0;
        let animationFrameId;

        const createParticles = () => {
            if (!ctx) return;

            particles.length = 0;
            comets.length = 0;
            const particleDensity = width < 640 || isCoarsePointer ? 26000 : 12500;
            const particleLimit = width < 640 || isCoarsePointer ? 58 : 140;
            const particleFloor = width < 640 || isCoarsePointer ? 28 : 64;
            const particleCount = Math.min(particleLimit, Math.max(particleFloor, Math.floor((width * height) / particleDensity)));

            // A list of code symbols, heavily weighted towards {}
            const codeSymbols = ['{', '}', '{', '}', '{', '}', '[', ']', ';', '<', '>', '()', '++', '+', '-'];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.38,
                    vy: (Math.random() - 0.5) * 0.38,
                    radius: Math.random() * 2.2 + 0.6,
                    pulse: Math.random() * Math.PI * 2,
                    hue: Math.random() > 0.45 ? 199 : 220,
                    char: codeSymbols[Math.floor(Math.random() * codeSymbols.length)]
                });
            }

            for (let i = 0; i < (width < 640 || isCoarsePointer ? 2 : 5); i++) {
                comets.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: 1.2 + Math.random() * 1.8,
                    vy: -0.55 + Math.random() * 0.35,
                    length: 120 + Math.random() * 140,
                    delay: Math.random() * 260
                });
            }
        };

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            deviceScale = Math.min(window.devicePixelRatio || 1, 2);

            if (!ctx) return;

            backgroundCanvas.width = Math.floor(width * deviceScale);
            backgroundCanvas.height = Math.floor(height * deviceScale);
            backgroundCanvas.style.width = `${width}px`;
            backgroundCanvas.style.height = `${height}px`;
            ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
            createParticles();
        };

        const updatePointer = (clientX, clientY) => {
            pointer.x = clientX;
            pointer.y = clientY;

            const instantXPercent = (pointer.x / width) * 100;
            const instantYPercent = (pointer.y / height) * 100;
            document.documentElement.style.setProperty('--mouse-x', `${instantXPercent}%`);
            document.documentElement.style.setProperty('--mouse-y', `${instantYPercent}%`);
        };

        const drawAurora = () => {
            if (!ctx) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (let band = 0; band < 4; band++) {
                const yBase = height * (0.22 + band * 0.16);
                const amplitude = 30 + band * 16;
                const gradient = ctx.createLinearGradient(0, yBase - 120, width, yBase + 120);

                gradient.addColorStop(0, `hsla(${195 + band * 12}, 88%, 58%, 0)`);
                gradient.addColorStop(0.24, `hsla(${190 + band * 10}, 92%, 58%, ${0.08 + band * 0.025})`);
                gradient.addColorStop(0.5, `hsla(${220 + band * 8}, 90%, 58%, ${0.16 + band * 0.03})`);
                gradient.addColorStop(0.78, `hsla(${184 + band * 9}, 88%, 56%, ${0.09 + band * 0.02})`);
                gradient.addColorStop(1, `hsla(${204 + band * 12}, 92%, 58%, 0)`);

                ctx.beginPath();
                ctx.moveTo(-80, yBase);

                for (let x = -80; x <= width + 80; x += 28) {
                    const waveA = Math.sin((x * 0.006) + time * (0.012 + band * 0.002) + band);
                    const waveB = Math.cos((x * 0.011) - time * 0.009 + band * 1.7);
                    ctx.lineTo(x, yBase + waveA * amplitude + waveB * amplitude * 0.45);
                }

                ctx.lineTo(width + 80, yBase + 150);
                ctx.lineTo(-80, yBase + 150);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.filter = 'blur(22px)';
                ctx.fill();
                ctx.filter = 'none';
            }

            ctx.restore();
        };

        const drawComets = () => {
            if (!ctx) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (const comet of comets) {
                comet.delay -= 1;

                if (comet.delay > 0) continue;

                comet.x += comet.vx;
                comet.y += comet.vy;

                const tailX = comet.x - comet.length;
                const tailY = comet.y + comet.length * 0.28;
                const gradient = ctx.createLinearGradient(tailX, tailY, comet.x, comet.y);

                gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
                gradient.addColorStop(0.72, 'rgba(56, 189, 248, 0.22)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(comet.x, comet.y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
                ctx.shadowBlur = 16;
                ctx.stroke();

                if (comet.x > width + comet.length || comet.y < -comet.length) {
                    comet.x = -comet.length - Math.random() * width * 0.4;
                    comet.y = height * (0.25 + Math.random() * 0.75);
                    comet.vx = 1.2 + Math.random() * 1.8;
                    comet.vy = -0.55 + Math.random() * 0.35;
                    comet.length = 120 + Math.random() * 140;
                    comet.delay = 120 + Math.random() * 320;
                }
            }

            ctx.restore();
        };

        const drawRipples = () => {
            if (!ctx) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (let i = ripples.length - 1; i >= 0; i--) {
                const ripple = ripples[i];
                ripple.radius += 9;
                ripple.alpha *= 0.92;

                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(56, 189, 248, ${ripple.alpha})`;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(37, 99, 235, 0.8)';
                ctx.shadowBlur = 18;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius * 0.58, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha * 0.6})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                if (ripple.alpha < 0.02) {
                    ripples.splice(i, 1);
                }
            }

            ctx.restore();
        };

        const drawParticles = () => {
            if (!ctx) return;
            if (document.body.classList.contains('performance-mode')) {
                ctx.clearRect(0, 0, width, height);
                return;
            }

            ctx.clearRect(0, 0, width, height);
            drawAurora();
            const isHeroInView = document.body.classList.contains('hero-in-view');
            const sectionBoost = isHeroInView ? 1 : 1.34;
            const sectionShadowBoost = isHeroInView ? 1 : 1.18;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                const dx = follower.x - particle.x;
                const dy = follower.y - particle.y;
                const distance = Math.hypot(dx, dy);
                const influence = Math.max(0, 1 - distance / 320);

                particle.x += particle.vx + dx * influence * 0.009 + Math.sin(time * 0.01 + particle.pulse) * 0.08;
                particle.y += particle.vy + dy * influence * 0.009 + Math.cos(time * 0.008 + particle.pulse) * 0.08;
                particle.pulse += 0.032;

                if (particle.x < -20) particle.x = width + 20;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y < -20) particle.y = height + 20;
                if (particle.y > height + 20) particle.y = -20;

                const size = Math.max(8, (particle.radius * 6.4) + influence * 9.5);
                ctx.font = `bold ${size}px 'Plus Jakarta Sans', monospace`;
                const alpha = Math.min(0.92, (0.28 + influence * 0.56) * sectionBoost);
                const shadowAlpha = Math.min(0.88, (0.42 + influence * 0.34) * sectionShadowBoost);
                ctx.fillStyle = `hsla(${particle.hue}, 94%, ${52 + influence * 22}%, ${alpha})`;
                ctx.shadowColor = `hsla(${particle.hue}, 94%, 56%, ${shadowAlpha})`;
                ctx.shadowBlur = (12 + influence * 24) * sectionShadowBoost;

                ctx.fillText(particle.char, particle.x, particle.y);
                ctx.shadowBlur = 0;
            }
            ctx.restore();

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const distance = Math.hypot(a.x - b.x, a.y - b.y);

                    if (distance < 145) {
                        const alpha = (1 - distance / 145) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(0, 180, 216, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            const halo = ctx.createRadialGradient(follower.x, follower.y, 0, follower.x, follower.y, 180);
            halo.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
            halo.addColorStop(0.35, 'rgba(0, 180, 216, 0.1)');
            halo.addColorStop(1, 'rgba(37, 99, 235, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(follower.x, follower.y, 180, 0, Math.PI * 2);
            ctx.fill();

            // Update and draw pointer trail particles
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = trailParticles.length - 1; i >= 0; i--) {
                const p = trailParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                p.pulse += 0.05;

                if (p.alpha <= 0) {
                    trailParticles.splice(i, 1);
                    continue;
                }

                const currentSize = p.size + Math.sin(p.pulse) * 1.5;
                ctx.font = `bold ${currentSize}px 'Plus Jakarta Sans', monospace`;
                ctx.fillStyle = `hsla(${p.hue}, 94%, 58%, ${Math.min(1, p.alpha * 1.14)})`;
                ctx.shadowColor = `hsla(${p.hue}, 94%, 54%, ${p.alpha * 0.52})`;
                ctx.shadowBlur = 10;
                ctx.fillText(p.char, p.x, p.y);
            }
            ctx.restore();

            drawComets();
            drawRipples();
        };

        const animateBackground = () => {
            time += 1;
            follower.x += (pointer.x - follower.x) * 0.45;
            follower.y += (pointer.y - follower.y) * 0.45;

            const shiftX = (follower.x - width / 2) * -0.045;
            const shiftY = (follower.y - height / 2) * -0.045;

            document.documentElement.style.setProperty('--bg-shift-x', `${shiftX}px`);
            document.documentElement.style.setProperty('--bg-shift-y', `${shiftY}px`);

            drawParticles();
            animationFrameId = requestAnimationFrame(animateBackground);
        };

        window.addEventListener('pointermove', (event) => {
            const x = event.clientX;
            const y = event.clientY;
            updatePointer(x, y);

            if (lastSpawnX === null || lastSpawnY === null) {
                lastSpawnX = x;
                lastSpawnY = y;
                return;
            }

            const dist = Math.hypot(x - lastSpawnX, y - lastSpawnY);
            if (dist > 12) {
                const codeSymbols = ['{', '}', '{', '}', '[', ']', ';', '<', '>', '()', '++'];
                trailParticles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2 - 0.3,
                    char: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
                    alpha: 0.85,
                    decay: 0.015 + Math.random() * 0.015,
                    size: Math.random() * 8 + 10,
                    hue: Math.random() > 0.45 ? 199 : 220,
                    pulse: Math.random() * Math.PI * 2
                });
                lastSpawnX = x;
                lastSpawnY = y;
            }
        }, { passive: true });

        window.addEventListener('pointerdown', (event) => {
            ripples.push({
                x: event.clientX,
                y: event.clientY,
                radius: 12,
                alpha: 0.75
            });
        }, { passive: true });

        window.addEventListener('resize', () => {
            updatePointer(window.innerWidth / 2, window.innerHeight / 2);
            resizeCanvas();
        });

        resizeCanvas();
        animationFrameId = requestAnimationFrame(animateBackground);

        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrameId);
        });
    }

    // --- Dark/Light Theme Switcher ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (currentTheme === 'light') {
        document.body.classList.remove('dark');
    } else if (currentTheme === 'dark' || !currentTheme || systemPrefersDark) {
        document.body.classList.add('dark');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // --- Mobile Navigation ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileNavToggle.addEventListener('click', () => {
        mobileNavToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
    
    // Close nav on clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // --- Header Scrolled Shadow & Active Link Highlights ---
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const scrollProgress = document.getElementById('scroll-progress');
    const sectionHud = document.createElement('div');
    const sectionMeta = Array.from(sections).map((section, index) => {
        const title = section.querySelector('.section-title, .gear-title, .hero-title')?.textContent?.trim() || 'Portfolio';
        const kicker = section.querySelector('.section-subtitle, .hero-subtitle')?.textContent?.trim() || 'Tech Scene';
        const id = section.id || `scene-${index + 1}`;

        section.dataset.scene = String(index + 1).padStart(2, '0');
        section.style.setProperty('--section-progress', '0');
        section.style.setProperty('--section-shift', '42px');
        section.style.setProperty('--section-scale', '0.975');

        return { id, title, kicker, section };
    });

    sectionHud.className = 'scroll-hud';
    sectionHud.innerHTML = `
        <span class="scroll-hud-kicker">Scene 01</span>
        <strong class="scroll-hud-title">Portfolio</strong>
        <span class="scroll-hud-bar"><span></span></span>
    `;
    document.body.appendChild(sectionHud);
    const hudKicker = sectionHud.querySelector('.scroll-hud-kicker');
    const hudTitle = sectionHud.querySelector('.scroll-hud-title');
    const hudBar = sectionHud.querySelector('.scroll-hud-bar span');
    
    let lastScrollPos = window.scrollY;
    let tickingScroll = false;

    const updateScrollEffects = () => {
        const scrollPos = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (scrollPos / totalHeight) * 100 : 0;

        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
        document.documentElement.style.setProperty('--scroll-y', `${scrollPos}px`);
        document.body.classList.toggle('scrolling-down', scrollPos > lastScrollPos && scrollPos > 80);
        document.body.classList.toggle('scrolling-up', scrollPos < lastScrollPos && scrollPos > 80);

        // Header height transition on scroll
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll progress bar indicator
        scrollProgress.style.width = `${progress}%`;
        
        // Scroll To Top button visibility
        if (scrollPos > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
        
        // Section active highlights and cinematic scroll progress
        let currentSectionId = '';
        let currentScene = sectionMeta[0];
        let closestDistance = Number.POSITIVE_INFINITY;

        sectionMeta.forEach(scene => {
            const { section } = scene;
            const rect = section.getBoundingClientRect();
            const sectionTop = scrollPos + rect.top - 120; // offset for sticky header
            const sectionHeight = section.offsetHeight;
            const rawProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const sectionProgress = Math.min(1, Math.max(0, rawProgress));
            const distanceFromCenter = Math.abs((rect.top + rect.height / 2) - window.innerHeight / 2);
            const shift = (0.5 - sectionProgress) * 84;
            const scale = 0.972 + Math.sin(sectionProgress * Math.PI) * 0.028;

            section.style.setProperty('--section-progress', sectionProgress.toFixed(4));
            section.style.setProperty('--section-shift', `${shift.toFixed(2)}px`);
            section.style.setProperty('--section-scale', scale.toFixed(4));
            section.classList.toggle('section-focus', sectionProgress > 0.18 && sectionProgress < 0.86);

            if (distanceFromCenter < closestDistance) {
                closestDistance = distanceFromCenter;
                currentScene = scene;
            }

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = scene.id;
            }
        });

        if (currentScene) {
            const sceneIndex = String(sectionMeta.indexOf(currentScene) + 1).padStart(2, '0');
            document.documentElement.style.setProperty('--scene-progress', currentScene.section.style.getPropertyValue('--section-progress'));
            hudKicker.textContent = `Scene ${sceneIndex} / ${String(sectionMeta.length).padStart(2, '0')}`;
            hudTitle.textContent = currentScene.kicker;
            hudBar.style.width = `${Number(currentScene.section.style.getPropertyValue('--section-progress')) * 100}%`;
        }
        
        if (currentSectionId) {
            const matchingLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${currentSectionId}`);

            if (matchingLink) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                matchingLink.classList.add('active');
            }
        }

        lastScrollPos = scrollPos;
        tickingScroll = false;
    };

    window.addEventListener('scroll', () => {
        if (!tickingScroll) {
            window.requestAnimationFrame(updateScrollEffects);
            tickingScroll = true;
        }
    }, { passive: true });

    updateScrollEffects();
    
    // Scroll to Top action
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Reveal Elements on Scroll (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealChildren = document.querySelectorAll('.skill-card, .project-card, .gear-card, .stat-card, .timeline-item, .flow-steps div, .contact-item, .feedback-form, .rating-group');

    revealChildren.forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
        child.classList.add('reveal-child');
    });
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.classList.add('section-in-view');
            } else {
                entry.target.classList.remove('active');
                entry.target.classList.remove('section-in-view');
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '-8% 0px -12% 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // --- Premium Card Tilt Interaction ---
    const tiltCards = document.querySelectorAll('.tilt-card, .skill-card');

    if (!reduceMotion && !isCoarsePointer) {
        tiltCards.forEach(card => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const rotateY = ((x / rect.width) - 0.5) * 7;
                const rotateX = ((y / rect.height) - 0.5) * -7;

                card.style.setProperty('--tilt-x', `${(x / rect.width) * 100}%`);
                card.style.setProperty('--tilt-y', `${(y / rect.height) * 100}%`);
                card.style.setProperty('--tilt-rotate-x', `${rotateX}deg`);
                card.style.setProperty('--tilt-rotate-y', `${rotateY}deg`);
            });

            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--tilt-x', '50%');
                card.style.setProperty('--tilt-y', '0%');
                card.style.setProperty('--tilt-rotate-x', '0deg');
                card.style.setProperty('--tilt-rotate-y', '0deg');
            });
        });
    }

    // --- Interactive Hero Terminal & Retro Snake Game ---
    const terminalScreen = document.getElementById('terminal-screen');
    const terminalLog = document.getElementById('terminal-log');
    const terminalInput = document.getElementById('terminal-input');
    const terminalButtons = document.querySelectorAll('.terminal-command-btn');

    let isTerminalTyping = false;
    let isGameActive = false;
    let snake = [];
    let direction = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let gameInterval = null;
    const gridWidth = 16;
    const gridHeight = 8;

    const spawnFood = () => {
        let attempts = 0;
        while (attempts < 100) {
            const fx = Math.floor(Math.random() * gridWidth);
            const fy = Math.floor(Math.random() * gridHeight);
            let onSnake = false;
            for (let seg of snake) {
                if (seg.x === fx && seg.y === fy) {
                    onSnake = true;
                    break;
                }
            }
            if (!onSnake) {
                food = { x: fx, y: fy };
                return;
            }
            attempts++;
        }
        food = { x: 0, y: 0 };
    };

    const renderBoard = (boardEl) => {
        let boardStr = `SCORE: ${score} | Nhấn 'ESC' để thoát\n`;
        boardStr += '┌' + '─'.repeat(gridWidth) + '┐\n';
        for (let y = 0; y < gridHeight; y++) {
            boardStr += '│';
            for (let x = 0; x < gridWidth; x++) {
                let char = ' ';
                if (x === food.x && y === food.y) {
                    char = '★';
                } else {
                    let isHead = (x === snake[0].x && y === snake[0].y);
                    let isBody = false;
                    for (let i = 1; i < snake.length; i++) {
                        if (x === snake[i].x && y === snake[i].y) {
                            isBody = true;
                            break;
                        }
                    }
                    if (isHead) char = '●';
                    else if (isBody) char = '○';
                }
                boardStr += char;
            }
            boardStr += '│\n';
        }
        boardStr += '└' + '─'.repeat(gridWidth) + '┘\n';
        boardEl.textContent = boardStr;
        if (terminalScreen) {
            terminalScreen.scrollTop = terminalScreen.scrollHeight;
        }
    };

    const startSnakeGame = () => {
        if (isGameActive) return;
        isGameActive = true;

        const gameBoard = document.createElement('pre');
        gameBoard.className = 'terminal-res';
        gameBoard.style.color = '#34d399';
        gameBoard.style.fontFamily = 'monospace';
        gameBoard.style.lineHeight = '1.25';
        terminalLog.appendChild(gameBoard);

        snake = [
            { x: 4, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 3 }
        ];
        direction = { x: 1, y: 0 };
        spawnFood();
        score = 0;

        if (terminalInput) {
            terminalInput.disabled = true;
        }

        renderBoard(gameBoard);

        gameInterval = setInterval(() => {
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
                endSnakeGame(gameBoard);
                return;
            }

            for (let seg of snake) {
                if (head.x === seg.x && head.y === seg.y) {
                    endSnakeGame(gameBoard);
                    return;
                }
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                spawnFood();
            } else {
                snake.pop();
            }

            renderBoard(gameBoard);
        }, 160);
    };

    const endSnakeGame = (boardEl) => {
        clearInterval(gameInterval);
        isGameActive = false;

        const overMsg = document.createElement('p');
        overMsg.className = 'terminal-res';
        overMsg.innerHTML = `<span style="color: #fb7185; font-weight: 800;">[GAME OVER] Điểm số: ${score}</span><br>Gõ 'snake' để chơi lại hoặc gõ các lệnh khác.`;
        terminalLog.appendChild(overMsg);

        if (terminalInput) {
            terminalInput.disabled = false;
            terminalInput.focus();
        }
        if (terminalScreen) {
            terminalScreen.scrollTop = terminalScreen.scrollHeight;
        }
    };

    const executeCommand = (cmdStr) => {
        if (isTerminalTyping) return;
        const cmd = cmdStr.trim();
        if (!cmd) return;

        // Append command input line
        const cmdLine = document.createElement('p');
        cmdLine.innerHTML = `<span class="terminal-prompt">$</span> ${cmd}`;
        terminalLog.appendChild(cmdLine);

        const lowerCmd = cmd.toLowerCase();

        if (lowerCmd === 'clear') {
            terminalLog.innerHTML = '';
            terminalInput.value = '';
            if (terminalScreen) terminalScreen.scrollTop = 0;
            return;
        }

        if (lowerCmd === 'snake' || lowerCmd === 'game') {
            startSnakeGame();
            return;
        }

        let response = '';
        let isInstant = false;

        if (lowerCmd === 'help') {
            response = 'Available commands: whoami, skills, projects, contact, feedback (đánh giá), neofetch, snake (chơi game), clear, hello';
        } else if (lowerCmd === 'hello') {
            response = 'Hi there! Thanks for visiting my tech station. Have a great day!';
        } else if (lowerCmd === 'whoami') {
            response = 'tech portfolio operator | Linux fan | C++ learner';
        } else if (lowerCmd === 'skills') {
            response = 'C++ (Data Structures, Algorithms), Linux (Arch/CachyOS, Bash, System Tuning), Tools (Git, GitHub, Debugging)';
        } else if (lowerCmd === 'projects') {
            response = '3 active builds:\n- Linux Performance Lab\n- C++ Practice Engine\n- Tech Command Portfolio\nType or click them for info!';
        } else if (lowerCmd === 'contact') {
            response = 'email: btd.thinhoffice2012@gmail.com\nzalo: 0967505247\nphone: 0967505247';
        } else if (lowerCmd === 'feedback') {
            response = 'Bạn có thể để lại ý kiến đóng góp và đánh giá 5 sao ở mục Đánh Giá cuối trang!';
        } else if (lowerCmd === 'neofetch') {
            response = `      /\\        thinh@THINH-PC
     /  \\       --------------
    /\\   \\      OS: Arch Linux / CachyOS x86_64
   /      \\     Host: MSI GF63 9RCX
  /   ,,   \\    Kernel: Linux zen-cachyos
 /   |  |   \\   Uptime: 2 hours, 42 mins
/   -'''-    \\  Shell: bash 5.2.26
------------    Terminal: Alacritty + TMUX
                CPU: Intel i5-9300H (8) @ 4.1GHz
                GPU: NVIDIA GTX 1050 Ti Mobile
                Memory: 8GB / 16GB
                Palette: \u2588\u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588`;
            isInstant = true;
        } else {
            response = `bash: command not found: ${cmd}. Type 'help' for available commands.`;
        }

        const resLine = document.createElement('p');
        resLine.className = 'terminal-res';
        terminalLog.appendChild(resLine);

        if (terminalInput) {
            terminalInput.value = '';
            terminalInput.disabled = true;
        }
        isTerminalTyping = true;

        if (terminalScreen) {
            terminalScreen.scrollTop = terminalScreen.scrollHeight;
        }

        if (isInstant) {
            resLine.textContent = response;
            if (terminalInput) {
                terminalInput.disabled = false;
                terminalInput.focus();
            }
            isTerminalTyping = false;
            if (terminalScreen) {
                terminalScreen.scrollTop = terminalScreen.scrollHeight;
            }
        } else {
            resLine.classList.add('typing');
            let charIndex = 0;
            const timer = setInterval(() => {
                resLine.textContent += response.charAt(charIndex);
                charIndex++;
                if (terminalScreen) {
                    terminalScreen.scrollTop = terminalScreen.scrollHeight;
                }
                if (charIndex >= response.length) {
                    clearInterval(timer);
                    resLine.classList.remove('typing');
                    if (terminalInput) {
                        terminalInput.disabled = false;
                        terminalInput.focus();
                    }
                    isTerminalTyping = false;
                    if (terminalScreen) {
                        terminalScreen.scrollTop = terminalScreen.scrollHeight;
                    }
                }
            }, 10);
        }

        terminalButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.command === lowerCmd);
        });
    };

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeCommand(terminalInput.value);
            }
        });
    }

    if (terminalScreen && terminalInput) {
        terminalScreen.addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    terminalButtons.forEach(button => {
        button.addEventListener('click', () => {
            executeCommand(button.dataset.command);
        });
    });

    window.addEventListener('keydown', (event) => {
        const isTypingField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        if (event.key.toLowerCase() === 't' && !isTypingField && terminalInput) {
            event.preventDefault();
            terminalInput.focus();
        }
    });

    // --- Typewriter Effect for Hero Title ---
    const typewriterEl = document.querySelector('.typewriter');
    if (typewriterEl) {
        const words = JSON.parse(typewriterEl.getAttribute('data-words'));
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        const type = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typewriterEl.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // faster deleting
            } else {
                typewriterEl.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100; // standard typing
            }
            
            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at the full word
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 500; // Pause before typing the next word
            }
            
            setTimeout(type, typingSpeed);
        };
        
        // Start typewriter
        setTimeout(type, 1000);
    }

    // --- Contact Form Interactive Submission Handler ---
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            
            // Visual feedback - loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.style.opacity = '0.7';
            
            // Mock server timeout
            setTimeout(() => {
                // Success feedback
                submitBtn.textContent = 'Gửi thành công!';
                submitBtn.style.backgroundColor = '#10b981'; // green color
                submitBtn.style.color = '#ffffff';

                // Clear fields
                contactForm.reset();
                
                // Restore button state after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '';
                }, 3000);
                
                // Show floating custom toast alert
                showToast('Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công.');
            }, 1500);
        });
    }
    
    // --- Feedback Form & Persistent Storage Handler ---
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStars = document.querySelectorAll('.star-rating input[name="rating"]');
    const feedbackRatingLabel = document.getElementById('feedbackRatingLabel');
    const feedbackList = document.getElementById('feedbackList');
    const feedbackAvgScore = document.getElementById('feedbackAvgScore');
    const feedbackAvgStars = document.getElementById('feedbackAvgStars');
    const feedbackTotalCount = document.getElementById('feedbackTotalCount');

    // Default Mock Feedbacks (Set to empty for real reviews only)
    const defaultFeedbacks = [];

    function getFeedbacks() {
        let stored = localStorage.getItem('portfolio_feedbacks');
        if (!stored) {
            localStorage.setItem('portfolio_feedbacks', JSON.stringify([]));
            return [];
        }
        try {
            let list = JSON.parse(stored);
            // Clean up any old mock data from previous tests
            list = list.filter(item => item.name !== "Nguyễn Hoàng Long" && item.name !== "Trần Minh Thư");
            
            // Ensure every feedback has a unique ID
            let changed = false;
            list = list.map((item, idx) => {
                if (!item.id) {
                    item.id = 'legacy-' + idx + '-' + (item.date ? item.date.replace(/\//g, '-') : Date.now());
                    changed = true;
                }
                return item;
            });
            if (changed) {
                localStorage.setItem('portfolio_feedbacks', JSON.stringify(list));
            }
            return list;
        } catch(e) {
            return [];
        }
    }

    async function saveFeedback(newFeedback) {
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('portfolio_feedbacks')
                    .insert([newFeedback]);
                if (error) throw error;
            } catch (e) {
                console.error('Error saving feedback to Supabase:', e);
                showToast('Lỗi khi gửi đánh giá lên hệ thống!');
            }
        } else {
            const list = getFeedbacks();
            list.unshift(newFeedback);
            localStorage.setItem('portfolio_feedbacks', JSON.stringify(list));
        }
        await renderFeedbacks();
    }

    async function renderFeedbacks() {
        if (!feedbackList) return;
        
        let list = [];
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('portfolio_feedbacks')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error) {
                    list = data || [];
                }
            } catch (e) {
                console.error('Error loading feedbacks from Supabase:', e);
            }
        } else {
            list = getFeedbacks();
        }
        
        const currentUser = getCurrentUser();
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin');
        
        // Fetch all users once for sync
        let allUsers = [];
        if (supabaseClient) {
            try {
                const { data } = await supabaseClient
                    .from('portfolio_public_users')
                    .select('name, email, avatar, classSchool, username');
                allUsers = data || [];
            } catch (e) {
                console.error('Error fetching users for rendering:', e);
            }
        } else {
            allUsers = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
        }
        
        // Look up admin details dynamically to show in replies
        let adminAvatar = '';
        let adminName = 'Bùi Trần Đức Thịnh'; // default name
        const adminUser = allUsers.find(u => u.username === 'admin' || (u.email && u.email === 'btd.thinhoffice2012@gmail.com'));
        if (adminUser) {
            if (adminUser.avatar) {
                adminAvatar = adminUser.avatar;
            }
            if (adminUser.name) {
                adminName = adminUser.name;
            }
        }
        
        if (list.length === 0) {
            feedbackList.innerHTML = `
                <div class="feedback-empty-state">
                    <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                </div>
            `;
            if (feedbackAvgScore) feedbackAvgScore.textContent = '0.0';
            if (feedbackAvgStars) feedbackAvgStars.textContent = '☆☆☆☆☆';
            if (feedbackTotalCount) feedbackTotalCount.textContent = '(0 đánh giá)';
            return;
        }

        // Calculate Stats
        const total = list.length;
        const sum = list.reduce((acc, curr) => acc + Number(curr.rating), 0);
        const avg = (sum / total).toFixed(1);
        
        if (feedbackAvgScore) feedbackAvgScore.textContent = avg;
        if (feedbackTotalCount) feedbackTotalCount.textContent = `(${total} đánh giá)`;
        
        if (feedbackAvgStars) {
            const fullStars = Math.round(avg);
            feedbackAvgStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
        }

        // Render Cards
        feedbackList.innerHTML = list.map(item => {
            let displayNameVal = item.name || '';
            let displayClass = item.class || '';
            let displaySchool = item.school || '';
            let userAvatar = item.avatar || '';

            // Try to find if this is a registered user to get their latest name, class, school, and avatar dynamically
            if (item.verified && item.email) {
                const matchedUser = allUsers.find(u => u.email && u.email.toLowerCase() === item.email.toLowerCase());
                if (matchedUser) {
                    displayNameVal = matchedUser.name;
                    userAvatar = matchedUser.avatar || '';
                    
                    // Parse class and school from matchedUser.classSchool
                    if (matchedUser.classSchool) {
                        if (matchedUser.classSchool.includes(' - ')) {
                            const parts = matchedUser.classSchool.split(' - ');
                            displayClass = parts[0].trim();
                            displaySchool = parts[1].trim();
                        } else {
                            displayClass = matchedUser.classSchool;
                            displaySchool = '';
                        }
                    }
                }
            }

            const avatarChar = (displayNameVal || 'U').charAt(0).toUpperCase();
            const starsStr = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
            
            // Mask phone number for privacy: e.g. 0967505247 -> 0967***247
            let displayPhone = item.phone || '';
            if (displayPhone.length >= 7) {
                displayPhone = displayPhone.substring(0, 4) + '***' + displayPhone.substring(displayPhone.length - 3);
            }

            // Mask email for privacy: e.g. user@gmail.com -> us***@gmail.com
            let displayEmail = item.email || '';
            if (displayEmail.includes('@')) {
                const emailParts = displayEmail.split('@');
                const emailUser = emailParts[0];
                const emailDomain = emailParts[1];
                if (emailUser.length > 2) {
                    displayEmail = emailUser.substring(0, 2) + '***@' + emailDomain;
                } else if (emailUser.length > 0) {
                    displayEmail = emailUser.substring(0, 1) + '***@' + emailDomain;
                }
            }

            const classInfo = displayClass ? ` • Lớp: ${escapeHTML(displayClass)}` : '';
            const schoolInfo = displaySchool ? ` • Trường: ${escapeHTML(displaySchool)}` : '';
            const emailInfo = displayEmail ? ` • Email: ${escapeHTML(displayEmail)}` : '';

            const avatarHtml = userAvatar
                ? `<span class="feedback-card-avatar" style="background: none; border: 1px solid var(--border-color);"><img src="${userAvatar}" alt="${escapeHTML(displayNameVal)}"></span>`
                : `<span class="feedback-card-avatar" style="background: ${getAvatarGradient(avatarChar)}">${avatarChar}</span>`;

            // Verified Badge
            const verifiedBadgeHtml = item.verified 
                ? `<span class="verified-badge" title="Đã xác thực tài khoản"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã xác minh</span>` 
                : '';
            
            // Delete button for Admin
            const deleteBtnHtml = isAdmin 
                ? `<button type="button" class="feedback-delete-btn" data-id="${item.id || ''}" title="Xóa đánh giá">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                   </button>` 
                : '';

            // Admin Reply HTML if exists
            const replyAvatarHtml = adminAvatar
                ? `<span class="reply-avatar" style="background: none; border: 1px solid rgba(239, 68, 68, 0.2);"><img src="${adminAvatar}" alt="Admin"></span>`
                : `<span class="reply-avatar" style="background: linear-gradient(135deg, #ef4444, #b91c1c)">T</span>`;

            const replyHtml = item.reply
                ? `<div class="feedback-admin-reply">
                    <div class="reply-header">
                        ${replyAvatarHtml}
                        <div class="reply-meta">
                            <span class="reply-name">Phản hồi từ ${escapeHTML(adminName)} (Admin)</span>
                            <span class="reply-date">${escapeHTML(item.replyDate || '')}</span>
                        </div>
                        ${isAdmin ? `
                            <button type="button" class="reply-delete-btn" data-id="${item.id || ''}" title="Xóa phản hồi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        ` : ''}
                    </div>
                    <p class="reply-content">${escapeHTML(item.reply)}</p>
                   </div>`
                : '';

            // Reply Form for Admin if no reply exists yet
            const replyActionHtml = (isAdmin && !item.reply)
                ? `<div class="reply-action-area">
                    <button type="button" class="btn btn-secondary btn-sm reply-toggle-btn" data-id="${item.id || ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                        Phản hồi
                    </button>
                    <div class="reply-form-wrapper" id="reply-form-${item.id || ''}" style="display: none; margin-top: 1rem;">
                        <textarea class="reply-textarea" id="reply-text-${item.id || ''}" placeholder="Nhập phản hồi của bạn..." rows="2" required></textarea>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary btn-sm reply-cancel-btn" data-id="${item.id || ''}">Hủy</button>
                            <button type="button" class="btn btn-primary btn-sm reply-submit-btn" data-id="${item.id || ''}">Gửi</button>
                        </div>
                    </div>
                   </div>`
                : '';

            return `
                <div class="feedback-card" data-feedback-id="${item.id || ''}">
                    <div class="feedback-card-header">
                        <div class="feedback-card-user">
                            ${avatarHtml}
                            <div class="feedback-card-name-row">
                                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                    <span class="feedback-card-name">${escapeHTML(displayNameVal)}</span>
                                    ${verifiedBadgeHtml}
                                </div>
                                <span class="feedback-card-phone">${escapeHTML(displayPhone)}${classInfo}${schoolInfo}${emailInfo}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="feedback-card-stars">${starsStr}</div>
                            ${deleteBtnHtml}
                        </div>
                    </div>
                    <div class="feedback-card-body">
                        <p class="feedback-card-content">${escapeHTML(item.message)}</p>
                        <div class="feedback-card-date">${escapeHTML(item.date)}</div>
                    </div>
                    ${replyHtml}
                    ${replyActionHtml}
                </div>
            `;
        }).join('');
    }

    function getAvatarGradient(char) {
        const colors = [
            'linear-gradient(135deg, #2563eb, #0d9488)',
            'linear-gradient(135deg, #4f46e5, #06b6d4)',
            'linear-gradient(135deg, #7c3aed, #ec4899)',
            'linear-gradient(135deg, #b91c1c, #d97706)',
            'linear-gradient(135deg, #059669, #10b981)',
            'linear-gradient(135deg, #db2777, #7c3aed)',
            'linear-gradient(135deg, #1e3a8a, #3b82f6)'
        ];
        const index = char.charCodeAt(0) % colors.length;
        return colors[index];
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Set up star text label on change
    if (feedbackStars.length > 0 && feedbackRatingLabel) {
        const ratingTexts = {
            '1': 'Rất tệ (1/5 ★)',
            '2': 'Tệ (2/5 ★)',
            '3': 'Bình thường (3/5 ★)',
            '4': 'Tốt (4/5 ★)',
            '5': 'Tuyệt vời (5/5 ★)'
        };
        
        feedbackStars.forEach(star => {
            star.addEventListener('change', (e) => {
                const val = e.target.value;
                if (ratingTexts[val]) {
                    feedbackRatingLabel.textContent = ratingTexts[val];
                    feedbackRatingLabel.classList.add('show');
                }
            });
        });
    }

    // Event delegation for feedbacks (admin delete, replies)
    if (feedbackList) {
        feedbackList.addEventListener('click', async (e) => {
            // 1. Delete feedback
            const deleteBtn = e.target.closest('.feedback-delete-btn');
            if (deleteBtn) {
                const feedbackId = deleteBtn.dataset.id;
                if (feedbackId && confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
                    if (supabaseClient) {
                        try {
                            const { error } = await supabaseClient
                                .from('portfolio_feedbacks')
                                .delete()
                                .eq('id', feedbackId);
                            if (error) throw error;
                        } catch (err) {
                            console.error('Error deleting feedback from Supabase:', err);
                            showToast('Lỗi khi xóa đánh giá trên hệ thống!');
                            return;
                        }
                    } else {
                        let feedbacks = getFeedbacks();
                        feedbacks = feedbacks.filter(item => item.id !== feedbackId);
                        localStorage.setItem('portfolio_feedbacks', JSON.stringify(feedbacks));
                    }
                    await renderFeedbacks();
                    showToast('Đã xóa đánh giá thành công.');
                }
                return;
            }

            // 2. Toggle Reply Form
            const replyToggleBtn = e.target.closest('.reply-toggle-btn');
            if (replyToggleBtn) {
                const id = replyToggleBtn.dataset.id;
                const formWrapper = document.getElementById(`reply-form-${id}`);
                if (formWrapper) {
                    formWrapper.style.display = 'block';
                    replyToggleBtn.style.display = 'none';
                    const textarea = document.getElementById(`reply-text-${id}`);
                    if (textarea) textarea.focus();
                }
                return;
            }

            // 3. Cancel Reply Form
            const replyCancelBtn = e.target.closest('.reply-cancel-btn');
            if (replyCancelBtn) {
                const id = replyCancelBtn.dataset.id;
                const formWrapper = document.getElementById(`reply-form-${id}`);
                const toggleBtn = e.target.closest('.reply-action-area')?.querySelector('.reply-toggle-btn');
                if (formWrapper) {
                    formWrapper.style.display = 'none';
                }
                if (toggleBtn) {
                    toggleBtn.style.display = 'inline-flex';
                }
                return;
            }

            // 4. Submit Reply
            const replySubmitBtn = e.target.closest('.reply-submit-btn');
            if (replySubmitBtn) {
                const id = replySubmitBtn.dataset.id;
                const textarea = document.getElementById(`reply-text-${id}`);
                const replyText = textarea ? textarea.value.trim() : '';

                if (!replyText) {
                    showToast('Vui lòng nhập nội dung phản hồi!');
                    return;
                }

                if (supabaseClient) {
                    try {
                        const replyDate = new Date().toLocaleDateString('vi-VN');
                        const { error } = await supabaseClient
                            .from('portfolio_feedbacks')
                            .update({ reply: replyText, replyDate: replyDate })
                            .eq('id', id);
                        if (error) throw error;
                    } catch (err) {
                        console.error('Error submitting reply to Supabase:', err);
                        showToast('Lỗi khi đăng phản hồi trên hệ thống!');
                        return;
                    }
                } else {
                    let feedbacks = getFeedbacks();
                    const fbIndex = feedbacks.findIndex(item => item.id === id);
                    if (fbIndex !== -1) {
                        feedbacks[fbIndex].reply = replyText;
                        feedbacks[fbIndex].replyDate = new Date().toLocaleDateString('vi-VN');
                        localStorage.setItem('portfolio_feedbacks', JSON.stringify(feedbacks));
                    }
                }
                await renderFeedbacks();
                showToast('Đã đăng phản hồi của bạn.');
                return;
            }

            // 5. Delete Reply
            const replyDeleteBtn = e.target.closest('.reply-delete-btn');
            if (replyDeleteBtn) {
                const id = replyDeleteBtn.dataset.id;
                if (id && confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
                    if (supabaseClient) {
                        try {
                            const { error } = await supabaseClient
                                .from('portfolio_feedbacks')
                                .update({ reply: null, replyDate: null })
                                .eq('id', id);
                            if (error) throw error;
                        } catch (err) {
                            console.error('Error deleting reply from Supabase:', err);
                            showToast('Lỗi khi xóa phản hồi trên hệ thống!');
                            return;
                        }
                    } else {
                        let feedbacks = getFeedbacks();
                        const fbIndex = feedbacks.findIndex(item => item.id === id);
                        if (fbIndex !== -1) {
                            delete feedbacks[fbIndex].reply;
                            delete feedbacks[fbIndex].replyDate;
                            localStorage.setItem('portfolio_feedbacks', JSON.stringify(feedbacks));
                        }
                    }
                    await renderFeedbacks();
                    showToast('Đã xóa phản hồi.');
                }
                return;
            }
        });
    }

    // Initial render
    renderFeedbacks();

    // Form submit listener
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = feedbackForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            
            // Visual feedback - loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.style.opacity = '0.7';
            
            // Mock server timeout
            setTimeout(() => {
                // Collect values
                const nameVal = document.getElementById('feedback-name').value;
                const emailVal = document.getElementById('feedback-email').value;
                const phoneVal = document.getElementById('feedback-phone').value;
                const classVal = document.getElementById('feedback-class').value;
                const schoolVal = document.getElementById('feedback-school').value;
                const ratingVal = Number(document.querySelector('.star-rating input[name="rating"]:checked').value);
                const messageVal = document.getElementById('feedback-message').value;

                const user = getCurrentUser();

                // Save feedback to storage & reload DOM
                const newFeedbackObj = {
                    id: Date.now().toString(),
                    name: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    class: classVal,
                    school: schoolVal,
                    rating: ratingVal,
                    message: messageVal,
                    date: new Date().toLocaleDateString('vi-VN'),
                    verified: !!user
                };
                saveFeedback(newFeedbackObj);

                // Success button feedback
                submitBtn.textContent = 'Gửi thành công!';
                submitBtn.style.backgroundColor = '#10b981'; // green color
                submitBtn.style.color = '#ffffff';

                // Clear input fields
                document.getElementById('feedback-phone').value = '';
                document.getElementById('feedback-message').value = '';
                const ratingChecked = document.querySelector('.star-rating input[name="rating"]:checked');
                if (ratingChecked) ratingChecked.checked = false;

                if (!user) {
                    document.getElementById('feedback-name').value = '';
                    document.getElementById('feedback-email').value = '';
                    document.getElementById('feedback-class').value = '';
                    document.getElementById('feedback-school').value = '';
                }

                if (feedbackRatingLabel) {
                    feedbackRatingLabel.textContent = 'Chọn đánh giá';
                    feedbackRatingLabel.classList.remove('show');
                }
                
                // Restore button state after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '';
                }, 3000);
                
                // Show floating custom toast alert
                showToast('Cảm ơn phản hồi của bạn! Đánh giá đã được gửi thành công.');
            }, 1500);
        });
    }
    
    // Toast Alert Helper
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-alert';
        toast.textContent = message;
        
        // CSS Style for Toast directly
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%) translateY(20px)',
            backgroundColor: '#0f2b46',
            color: '#ffffff',
            padding: '1rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '1002',
            opacity: '0',
            transition: 'all 0.4s ease',
            fontSize: '0.95rem',
            fontWeight: '600',
            textAlign: 'center',
            minWidth: '280px',
            border: '1.5px solid #2563eb'
        });
        
        // Handle Toast Dark Mode style
        if (document.body.classList.contains('dark')) {
            toast.style.backgroundColor = '#132a4a';
            toast.style.border = '1.5px solid #38bdf8';
        }
        
        document.body.appendChild(toast);
        
        // Animate Toast In
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Animate Toast Out
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            // Remove from DOM
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }

    // --- Setup Video Controller ---
    const setupVideo = document.getElementById('setup-video');
    const videoControls = document.getElementById('setup-video-controls');
    const videoPlayBtn = document.getElementById('setup-video-play');
    const videoProgress = document.getElementById('setup-video-progress');

    if (setupVideo && videoControls && videoPlayBtn && videoProgress) {
        const togglePlay = () => {
            if (setupVideo.paused) {
                setupVideo.play().catch(err => console.log('Autoplay issue:', err));
            } else if (setupVideo.muted) {
                setupVideo.muted = false;
                showToast('Đã bật âm thanh video.');
            } else {
                setupVideo.pause();
            }
        };

        videoPlayBtn.addEventListener('click', togglePlay);
        setupVideo.addEventListener('click', togglePlay);
        
        // Listen to native events to sync UI state
        setupVideo.addEventListener('play', () => {
            videoControls.classList.add('playing');
        });

        setupVideo.addEventListener('pause', () => {
            videoControls.classList.remove('playing');
        });

        setupVideo.addEventListener('timeupdate', () => {
            if (setupVideo.duration) {
                const progress = (setupVideo.currentTime / setupVideo.duration) * 100;
                videoControls.style.setProperty('--video-progress', `${progress}%`);
            }
        });

        // Click on progress bar to seek
        videoProgress.addEventListener('click', (e) => {
            const rect = videoProgress.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setupVideo.currentTime = pos * setupVideo.duration;
        });
    }

    // --- YouTube Music Station Controllers ---
    const getYoutubeVideoId = (url) => {
        try {
            const parsedUrl = new URL(url);

            if (parsedUrl.hostname.includes('youtu.be')) {
                return parsedUrl.pathname.replace('/', '');
            }

            return parsedUrl.searchParams.get('v') || '';
        } catch (error) {
            return '';
        }
    };

    document.querySelectorAll('.mtp-station').forEach(station => {
        const currentTitle = station.querySelector('.player-title');
        const openYoutube = station.querySelector('.open-current-link');
        const playCurrent = station.querySelector('.mtp-play-overlay');
        const cover = station.querySelector('.mtp-frame img');
        const tracks = station.querySelectorAll('.mtp-track');

        if (!currentTitle || !tracks.length) return;

        const loadMtpTrack = (track, autoplay = true) => {
            const youtubeUrl = track.dataset.youtubeUrl;
            const videoId = getYoutubeVideoId(youtubeUrl);

            if (!videoId) return;

            currentTitle.textContent = track.dataset.title || track.textContent.trim();

            if (openYoutube) {
                openYoutube.href = youtubeUrl;
            }

            if (playCurrent) {
                playCurrent.href = youtubeUrl;
            }

            if (cover) {
                cover.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                cover.alt = `Thumbnail bài ${currentTitle.textContent}`;
            }

            tracks.forEach(item => {
                item.classList.toggle('active', item === track);
            });
        };

        tracks.forEach(track => {
            track.addEventListener('click', () => loadMtpTrack(track));
        });

        loadMtpTrack(station.querySelector('.mtp-track.active') || tracks[0], false);
    });



    // Intercept keys for Snake Game steering & Escape to quit
    window.addEventListener('keydown', (event) => {
        if (isGameActive) {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
            if (keys.includes(event.key)) {
                event.preventDefault();

                let newDir = { ...direction };
                switch (event.key.toLowerCase()) {
                    case 'arrowup':
                    case 'w':
                        if (direction.y !== 1) newDir = { x: 0, y: -1 };
                        break;
                    case 'arrowdown':
                    case 's':
                        if (direction.y !== -1) newDir = { x: 0, y: 1 };
                        break;
                    case 'arrowleft':
                    case 'a':
                        if (direction.x !== 1) newDir = { x: -1, y: 0 };
                        break;
                    case 'arrowright':
                    case 'd':
                        if (direction.x !== -1) newDir = { x: 1, y: 0 };
                        break;
                }
                direction = newDir;
            } else if (event.key === 'Escape') {
                event.preventDefault();
                clearInterval(gameInterval);
                isGameActive = false;
                const escMsg = document.createElement('p');
                escMsg.className = 'terminal-res';
                escMsg.innerHTML = `<span style="color: #fbbf24; font-weight: 800;">[Đã thoát game] Điểm số đạt được: ${score}</span>`;
                terminalLog.appendChild(escMsg);
                if (terminalInput) {
                    terminalInput.disabled = false;
                    terminalInput.focus();
                }
                if (terminalScreen) {
                    terminalScreen.scrollTop = terminalScreen.scrollHeight;
                }
            }
        }
    });

    // ==========================================================================
    // AUTHENTICATION SYSTEM (LOGIN / SIGNUP)
    // ==========================================================================
    
    const authBtn = document.getElementById('auth-btn');
    const userMenuWrapper = document.getElementById('user-menu-wrapper');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const authModal = document.getElementById('auth-modal');
    const authModalClose = document.getElementById('auth-modal-close');
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authFormPanels = document.querySelectorAll('.auth-form-panel');
    const switchToTabLinks = document.querySelectorAll('.switch-to-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Header user info elements
    const headerUserAvatar = document.getElementById('header-user-avatar');
    const headerUserName = document.getElementById('header-user-name');
    const dropdownUserFullname = document.getElementById('dropdown-user-fullname');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    const dropdownUserRole = document.getElementById('dropdown-user-role');

    // Initialize default admin user if not exists
    async function initDefaultUsers() {
        const defaultAdmin = {
            name: 'Bùi Trần Đức Thịnh',
            username: 'admin',
            email: 'btd.thinhoffice2012@gmail.com',
            password: 'Thinhchuyentin2012',
            classSchool: 'Admin | Owner',
            role: 'admin'
        };

        if (supabaseClient) {
            try {
                const { data: adminUser, error } = await supabaseClient
                    .from('portfolio_public_users')
                    .select('username')
                    .eq('username', 'admin')
                    .maybeSingle();
                
                if (!adminUser && !error) {
                    await supabaseClient.from('portfolio_users').insert([defaultAdmin]);
                }
            } catch (e) {
                console.error('Error initializing default admin in Supabase:', e);
            }
        } else {
            let users = localStorage.getItem('portfolio_users');
            if (!users) {
                localStorage.setItem('portfolio_users', JSON.stringify([defaultAdmin]));
            } else {
                try {
                    let userList = JSON.parse(users);
                    const adminIndex = userList.findIndex(u => u.username === 'admin');
                    if (adminIndex === -1) {
                        userList.push(defaultAdmin);
                        localStorage.setItem('portfolio_users', JSON.stringify(userList));
                    }
                } catch (e) {
                    localStorage.removeItem('portfolio_users');
                    initDefaultUsers();
                }
            }
        }
    }
    
    initDefaultUsers();

    // Get currently logged in user (retrieves the latest details from users database)
    function getCurrentUser() {
        try {
            const session = JSON.parse(localStorage.getItem('portfolio_session') || 'null');
            if (!session) return null;
            
            if (supabaseClient) {
                return session;
            }
            
            // Sync with latest data from users list
            const users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
            const latestUser = users.find(u => u.username === session.username);
            if (latestUser) {
                return {
                    ...session,
                    name: latestUser.name,
                    email: latestUser.email,
                    classSchool: latestUser.classSchool,
                    role: latestUser.role,
                    avatar: latestUser.avatar || ''
                };
            }
            return session;
        } catch (e) {
            return null;
        }
    }

    // Update Page UI based on login status
    async function updateAuthUI() {
        const user = getCurrentUser();
        
        if (user) {
            // Hide guest button, show user profile menu
            if (authBtn) authBtn.style.display = 'none';
            if (userMenuWrapper) userMenuWrapper.style.display = 'block';
            
            // Set user profile info
            const avatarChar = (user.name || 'U').charAt(0).toUpperCase();
            if (headerUserAvatar) {
                if (user.avatar) {
                    headerUserAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
                    headerUserAvatar.style.background = 'none';
                    headerUserAvatar.style.border = '1px solid var(--border-color)';
                } else {
                    headerUserAvatar.textContent = avatarChar;
                    headerUserAvatar.style.background = getAvatarGradient(avatarChar);
                    headerUserAvatar.style.border = '';
                }
            }

            // Dropdown menu avatar
            const dropdownUserAvatar = document.getElementById('dropdown-user-avatar');
            if (dropdownUserAvatar) {
                if (user.avatar) {
                    dropdownUserAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
                    dropdownUserAvatar.style.background = 'none';
                    dropdownUserAvatar.style.border = '1px solid var(--border-color)';
                } else {
                    dropdownUserAvatar.textContent = avatarChar;
                    dropdownUserAvatar.style.background = getAvatarGradient(avatarChar);
                    dropdownUserAvatar.style.border = '';
                }
            }
            
            if (headerUserName) headerUserName.textContent = user.username;
            if (dropdownUserFullname) dropdownUserFullname.textContent = user.name;
            if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;
            
            if (dropdownUserRole) {
                if (user.role === 'admin') {
                    dropdownUserRole.textContent = 'Quản trị viên';
                    dropdownUserRole.style.background = 'rgba(239, 68, 68, 0.1)';
                    dropdownUserRole.style.color = '#ef4444';
                    dropdownUserRole.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                } else {
                    dropdownUserRole.textContent = user.classSchool || 'Thành viên';
                    dropdownUserRole.style.background = '';
                    dropdownUserRole.style.color = '';
                    dropdownUserRole.style.borderColor = '';
                }
            }
            
            // Pre-fill and lock feedback inputs
            const fbName = document.getElementById('feedback-name');
            const fbEmail = document.getElementById('feedback-email');
            const fbClass = document.getElementById('feedback-class');
            const fbSchool = document.getElementById('feedback-school');
            
            if (fbName) {
                fbName.value = user.name;
                fbName.readOnly = true;
                fbName.style.opacity = '0.7';
            }
            if (fbEmail) {
                fbEmail.value = user.email;
                fbEmail.readOnly = true;
                fbEmail.style.opacity = '0.7';
            }
            if (fbClass || fbSchool) {
                if (user.classSchool && user.classSchool.includes(' - ')) {
                    const parts = user.classSchool.split(' - ');
                    if (fbClass && parts[0]) fbClass.value = parts[0];
                    if (fbSchool && parts[1]) fbSchool.value = parts[1];
                } else if (user.classSchool) {
                    if (fbClass) fbClass.value = user.classSchool;
                }
            }
        } else {
            // Show guest button, hide user profile menu
            if (authBtn) authBtn.style.display = 'flex';
            if (userMenuWrapper) userMenuWrapper.style.display = 'none';
            if (userDropdown) userDropdown.classList.remove('show');
            if (userMenuWrapper) userMenuWrapper.classList.remove('active');
            
            // Unlock feedback inputs
            const fbName = document.getElementById('feedback-name');
            const fbEmail = document.getElementById('feedback-email');
            
            if (fbName) {
                fbName.readOnly = false;
                fbName.style.opacity = '';
            }
            if (fbEmail) {
                fbEmail.readOnly = false;
                fbEmail.style.opacity = '';
            }
        }
        
        // Sync homepage main avatar, name, and footer (for Bùi Trần Đức Thịnh - admin)
        try {
            let adminUser = null;
            if (supabaseClient) {
                const { data } = await supabaseClient
                    .from('portfolio_public_users')
                    .select('name, avatar')
                    .eq('username', 'admin')
                    .maybeSingle();
                adminUser = data;
            } else {
                const allUsers = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
                adminUser = allUsers.find(u => u.username === 'admin');
            }
            
            if (adminUser) {
                // Sync Avatar
                const mainAvatarImg = document.querySelector('.profile-panel img.avatar-img');
                if (mainAvatarImg && adminUser.avatar) {
                    mainAvatarImg.src = adminUser.avatar;
                }
                
                // Sync Hero Title Name
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle && adminUser.name) {
                    heroTitle.textContent = adminUser.name;
                }
                
                // Sync Footer Copyright
                const footerCopyright = document.getElementById('footer-copyright');
                if (footerCopyright && adminUser.name) {
                    footerCopyright.innerHTML = `Thiết kế & Lập trình bởi ${adminUser.name} © 2026. Mọi quyền được bảo lưu.`;
                }
            }
        } catch (e) {
            console.log('Error syncing main avatar, name, or footer copyright', e);
        }
        
        // Re-render feedbacks to reflect verified badges and delete buttons
        await renderFeedbacks();
    }

    // Modal Open/Close handling
    if (authBtn && authModal) {
        authBtn.addEventListener('click', () => {
            authModal.classList.add('show');
            authModal.setAttribute('aria-hidden', 'false');
            switchTab('login');
        });
    }

    const adminLoginLink = document.getElementById('admin-login-link');
    if (adminLoginLink && authModal) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.add('show');
            authModal.setAttribute('aria-hidden', 'false');
            switchTab('login');
            
            // Pre-fill 'admin' username and focus password
            const loginUserField = document.getElementById('login-username');
            const loginPassField = document.getElementById('login-password');
            if (loginUserField) {
                loginUserField.value = 'admin';
            }
            if (loginPassField) {
                setTimeout(() => loginPassField.focus(), 150);
            }
        });
    }

    if (authModalClose && authModal) {
        authModalClose.addEventListener('click', () => {
            authModal.classList.remove('show');
            authModal.setAttribute('aria-hidden', 'true');
        });
    }

    // Close modal when clicking on overlay background
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('show');
                authModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal && authModal.classList.contains('show')) {
            authModal.classList.remove('show');
            authModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Switch between Login and Register tabs
    function switchTab(tabName) {
        authTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        authFormPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-form`);
        });
        
        // Reset forms when switching
        if (tabName === 'login' && registerForm) registerForm.reset();
        if (tabName === 'register' && loginForm) loginForm.reset();
    }

    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    switchToTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.target);
        });
    });

    // Toggle User Dropdown Menu
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            userMenuWrapper.classList.toggle('active');
        });
        
        // Close dropdown when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!userMenuWrapper.contains(e.target)) {
                userDropdown.classList.remove('show');
                userMenuWrapper.classList.remove('active');
            }
        });
    }

    // Logout handling
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('portfolio_session');
            updateAuthUI();
            
            // Reset feedback form values
            const fbForm = document.getElementById('feedbackForm');
            if (fbForm) fbForm.reset();
            
            showToast('Đăng xuất thành công. Hẹn gặp lại bạn!');
        });
    }

    // Register Form Submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value.trim();
            const username = document.getElementById('register-username').value.trim().toLowerCase();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const classSchool = document.getElementById('register-class-school').value.trim();
            
            // Validation
            if (password.length < 6) {
                showToast('Mật khẩu phải chứa ít nhất 6 ký tự!');
                return;
            }
            
            if (!/^[a-z0-9_.-]+$/.test(username)) {
                showToast('Tên đăng nhập chỉ được chứa chữ cái viết thường, số, dấu gạch dưới, gạch ngang hoặc dấu chấm!');
                return;
            }

            if (supabaseClient) {
                try {
                    // Check if username already exists
                    const { data: userByUsername } = await supabaseClient
                        .from('portfolio_users')
                        .select('username')
                        .eq('username', username)
                        .maybeSingle();
                    if (userByUsername) {
                        showToast('Tên đăng nhập đã được sử dụng! Vui lòng chọn tên khác.');
                        return;
                    }
                    
                    // Check if email already exists
                    const { data: userByEmail } = await supabaseClient
                        .from('portfolio_users')
                        .select('email')
                        .eq('email', email)
                        .maybeSingle();
                    if (userByEmail) {
                        showToast('Email đã được đăng ký! Vui lòng sử dụng email khác.');
                        return;
                    }
                    
                    // Save new user
                    const newUser = {
                        name,
                        username,
                        email,
                        password,
                        classSchool,
                        role: 'member'
                    };
                    const { error } = await supabaseClient.from('portfolio_users').insert([newUser]);
                    if (error) throw error;
                    
                    showToast('Đăng ký tài khoản thành công! Hãy đăng nhập.');
                    registerForm.reset();
                    switchTab('login');
                    
                    // Pre-fill login username
                    const loginUserField = document.getElementById('login-username');
                    if (loginUserField) loginUserField.value = username;
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi: ' + (err.message || err));
                    console.error(err);
                }
            } else {
                try {
                    let users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
                    
                    // Check if username already exists
                    const userExists = users.some(u => u.username === username);
                    if (userExists) {
                        showToast('Tên đăng nhập đã được sử dụng! Vui lòng chọn tên khác.');
                        return;
                    }
                    
                    // Check if email already exists
                    const emailExists = users.some(u => u.email === email);
                    if (emailExists) {
                        showToast('Email đã được đăng ký! Vui lòng sử dụng email khác.');
                        return;
                    }
                    
                    // Save new user
                    const newUser = {
                        name,
                        username,
                        email,
                        password,
                        classSchool,
                        role: 'member'
                    };
                    
                    users.push(newUser);
                    localStorage.setItem('portfolio_users', JSON.stringify(users));
                    
                    showToast('Đăng ký tài khoản thành công! Hãy đăng nhập.');
                    registerForm.reset();
                    switchTab('login');
                    
                    // Pre-fill login username
                    const loginUserField = document.getElementById('login-username');
                    if (loginUserField) loginUserField.value = username;
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi trong quá trình đăng ký!');
                    console.error(err);
                }
            }
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameOrEmail = document.getElementById('login-username').value.trim().toLowerCase();
            const passwordVal = document.getElementById('login-password').value;
            
            if (supabaseClient) {
                try {
                    // Call RPC function to safely verify credentials inside the database
                    const { data: usersList, error } = await supabaseClient
                        .rpc('login_user', { 
                            p_username_or_email: usernameOrEmail, 
                            p_password: passwordVal 
                        });
                        
                    const user = usersList && usersList[0];
                        
                    if (error || !user) {
                        showToast('Tên đăng nhập hoặc mật khẩu không chính xác!');
                        return;
                    }
                    
                    // Save session
                    localStorage.setItem('portfolio_session', JSON.stringify({
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        classSchool: user.classSchool,
                        role: user.role,
                        avatar: user.avatar || ''
                    }));
                    
                    showToast(`Chào mừng ${user.name} đã quay trở lại!`);
                    loginForm.reset();
                    
                    if (authModal) {
                        authModal.classList.remove('show');
                        authModal.setAttribute('aria-hidden', 'true');
                    }
                    
                    updateAuthUI();
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi: ' + (err.message || err));
                    console.error(err);
                }
            } else {
                try {
                    const users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
                    
                    // Look up user
                    const user = users.find(u => u.username === usernameOrEmail || (u.email && u.email.toLowerCase() === usernameOrEmail));
                    
                    if (!user || user.password !== passwordVal) {
                        showToast('Tên đăng nhập hoặc mật khẩu không chính xác!');
                        return;
                    }
                    
                    // Save session (including avatar)
                    localStorage.setItem('portfolio_session', JSON.stringify({
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        classSchool: user.classSchool,
                        role: user.role,
                        avatar: user.avatar || ''
                    }));
                    
                    showToast(`Chào mừng ${user.name} đã quay trở lại!`);
                    loginForm.reset();
                    
                    if (authModal) {
                        authModal.classList.remove('show');
                        authModal.setAttribute('aria-hidden', 'true');
                    }
                    
                    updateAuthUI();
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi trong quá trình đăng nhập!');
                    console.error(err);
                }
            }
        });
    }

    // --- Edit Profile Form handling ---
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.getElementById('profile-modal-close');
    const profileForm = document.getElementById('profile-form');
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const profileAvatarPreview = document.getElementById('profile-avatar-preview');
    let tempAvatarBase64 = '';

    // Handle avatar file selection
    if (profileAvatarInput) {
        profileAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate size (1MB max)
            if (file.size > 1024 * 1024) {
                showToast('Dung lượng ảnh vượt quá 1MB! Vui lòng chọn ảnh nhẹ hơn.');
                profileAvatarInput.value = '';
                return;
            }

            // Validate type
            if (!file.type.startsWith('image/')) {
                showToast('Vui lòng chọn định dạng ảnh hợp lệ (PNG, JPG, GIF...)!');
                profileAvatarInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                tempAvatarBase64 = event.target.result;
                if (profileAvatarPreview) {
                    profileAvatarPreview.innerHTML = `<img src="${tempAvatarBase64}" alt="Avatar Preview">`;
                    profileAvatarPreview.style.background = 'none';
                    profileAvatarPreview.style.border = '1px solid var(--border-color)';
                }
            };
            reader.readAsDataURL(file);
        });
    }

    if (editProfileBtn && profileModal) {
        editProfileBtn.addEventListener('click', () => {
            // Close dropdown first
            if (userDropdown) userDropdown.classList.remove('show');
            if (userMenuWrapper) userMenuWrapper.classList.remove('active');
            
            const user = getCurrentUser();
            if (!user) return;
            
            // Pre-fill
            const profileNameInput = document.getElementById('profile-name');
            const profileClassSchoolInput = document.getElementById('profile-class-school');
            const profilePassInput = document.getElementById('profile-password');
            
            if (profileNameInput) profileNameInput.value = user.name || '';
            if (profileClassSchoolInput) profileClassSchoolInput.value = user.classSchool || '';
            if (profilePassInput) profilePassInput.value = '';
            
            // Get user avatar
            tempAvatarBase64 = user.avatar || '';
            if (profileAvatarPreview) {
                if (tempAvatarBase64) {
                    profileAvatarPreview.innerHTML = `<img src="${tempAvatarBase64}" alt="Avatar Preview">`;
                    profileAvatarPreview.style.background = 'none';
                    profileAvatarPreview.style.border = '1px solid var(--border-color)';
                } else {
                    const initials = (user.name || 'U').charAt(0).toUpperCase();
                    profileAvatarPreview.textContent = initials;
                    profileAvatarPreview.style.background = getAvatarGradient(initials);
                    profileAvatarPreview.style.border = '';
                }
            }

            if (profileAvatarInput) profileAvatarInput.value = '';
            
            profileModal.classList.add('show');
            profileModal.setAttribute('aria-hidden', 'false');
        });
    }

    if (profileModalClose && profileModal) {
        profileModalClose.addEventListener('click', () => {
            profileModal.classList.remove('show');
            profileModal.setAttribute('aria-hidden', 'true');
        });
    }

    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.remove('show');
                profileModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal && profileModal.classList.contains('show')) {
            profileModal.classList.remove('show');
            profileModal.setAttribute('aria-hidden', 'true');
        }
    });

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('profile-name').value.trim();
            const newClassSchool = document.getElementById('profile-class-school').value.trim();
            const newPassword = document.getElementById('profile-password').value;
            
            const currentUser = getCurrentUser();
            if (!currentUser) return;
            
            if (newPassword && newPassword.length < 6) {
                showToast('Mật khẩu mới phải chứa ít nhất 6 ký tự!');
                return;
            }
            
            if (supabaseClient) {
                try {
                    const updateData = {
                        name: newName,
                        classSchool: newClassSchool,
                        avatar: tempAvatarBase64
                    };
                    if (newPassword) {
                        updateData.password = newPassword;
                    }
                    
                    const { error } = await supabaseClient
                        .from('portfolio_users')
                        .update(updateData)
                        .eq('username', currentUser.username);
                        
                    if (error) throw error;
                    
                    // Update session
                    const updatedUserSession = {
                        ...currentUser,
                        name: newName,
                        classSchool: newClassSchool,
                        avatar: tempAvatarBase64
                    };
                    localStorage.setItem('portfolio_session', JSON.stringify(updatedUserSession));
                    
                    showToast('Cập nhật thông tin cá nhân thành công!');
                    
                    if (profileModal) {
                        profileModal.classList.remove('show');
                        profileModal.setAttribute('aria-hidden', 'true');
                    }
                    
                    updateAuthUI();
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi trong quá trình cập nhật hồ sơ!');
                    console.error(err);
                }
            } else {
                try {
                    let users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
                    const userIndex = users.findIndex(u => u.username === currentUser.username);
                    
                    if (userIndex === -1) {
                        showToast('Không tìm thấy thông tin tài khoản!');
                        return;
                    }
                    
                    // Update user details
                    users[userIndex].name = newName;
                    users[userIndex].classSchool = newClassSchool;
                    users[userIndex].avatar = tempAvatarBase64;
                    if (newPassword) {
                        users[userIndex].password = newPassword;
                    }
                    
                    localStorage.setItem('portfolio_users', JSON.stringify(users));
                    
                    // Update session
                    const updatedUserSession = {
                        ...currentUser,
                        name: newName,
                        classSchool: newClassSchool,
                        avatar: tempAvatarBase64
                    };
                    localStorage.setItem('portfolio_session', JSON.stringify(updatedUserSession));
                    
                    showToast('Cập nhật thông tin cá nhân thành công!');
                    
                    if (profileModal) {
                        profileModal.classList.remove('show');
                        profileModal.setAttribute('aria-hidden', 'true');
                    }
                    
                    updateAuthUI();
                    
                } catch (err) {
                    showToast('Đã xảy ra lỗi trong quá trình cập nhật hồ sơ!');
                    console.error(err);
                }
            }
        });
    }

    // Run initial UI check
    updateAuthUI();
});
