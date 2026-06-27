// Modern Portfolio Web Interactivity Script

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

    if (interactiveBg && !reduceMotion) {
        const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const follower = { x: pointer.x, y: pointer.y };
        const particles = [];
        const comets = [];
        const ripples = [];
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

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.38,
                    vy: (Math.random() - 0.5) * 0.38,
                    radius: Math.random() * 2.2 + 0.6,
                    pulse: Math.random() * Math.PI * 2,
                    hue: Math.random() > 0.45 ? 199 : 220
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

                const radius = particle.radius + Math.sin(particle.pulse) * 0.35 + influence * 1.8;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particle.hue}, 92%, ${58 + influence * 18}%, ${0.22 + influence * 0.5})`;
                ctx.shadowColor = `hsla(${particle.hue}, 92%, 62%, ${0.35 + influence * 0.3})`;
                ctx.shadowBlur = 10 + influence * 22;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

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
            updatePointer(event.clientX, event.clientY);
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
    
    if (currentTheme === 'dark' || (!currentTheme && systemPrefersDark)) {
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
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        
        // Header height transition on scroll
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll progress bar indicator
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (scrollPos / totalHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }
        
        // Scroll To Top button visibility
        if (scrollPos > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
        
        // Section active highlights
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset for sticky header
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (currentSectionId) {
            const matchingLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${currentSectionId}`);

            if (matchingLink) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                matchingLink.classList.add('active');
            }
        }
    });
    
    // Scroll to Top action
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Reveal Elements on Scroll (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing after reveal
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
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

    // --- Interactive Hero Terminal ---
    const terminalOutput = document.querySelector('.terminal-output');
    const terminalCommand = document.getElementById('terminal-command');
    const terminalResponse = document.getElementById('terminal-response');
    const terminalButtons = document.querySelectorAll('.terminal-command-btn');
    const terminalResponses = {
        whoami: 'student developer | Linux fan | C++ learner',
        skills: 'C++ fundamentals, Linux workflow, Git/GitHub, debugging, system tuning',
        projects: '3 active builds: Linux lab, C++ practice engine, interactive portfolio',
        contact: 'email: btd.thinhoffice2012@gmail.com | zalo: 0967505247'
    };
    let terminalTypingTimer;

    const runTerminalCommand = (command) => {
        if (!terminalCommand || !terminalResponse || !terminalOutput) return;

        clearInterval(terminalTypingTimer);
        terminalCommand.textContent = command;
        terminalResponse.textContent = '';
        terminalOutput.classList.add('typing');

        const response = terminalResponses[command] || terminalResponses.whoami;
        let index = 0;

        terminalTypingTimer = setInterval(() => {
            terminalResponse.textContent += response.charAt(index);
            index++;

            if (index >= response.length) {
                clearInterval(terminalTypingTimer);
                terminalOutput.classList.remove('typing');
            }
        }, 18);

        terminalButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.command === command);
        });
    };

    terminalButtons.forEach(button => {
        button.addEventListener('click', () => {
            runTerminalCommand(button.dataset.command);
        });
    });

    window.addEventListener('keydown', (event) => {
        const isTypingField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        if (event.key.toLowerCase() === 't' && !isTypingField && terminalButtons.length) {
            terminalButtons[0].focus();
            runTerminalCommand('whoami');
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
                submitBtn.textContent = 'Gửi thành công! ✓';
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
                showToast('Đã bật âm thanh video! 🔊');
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
});
