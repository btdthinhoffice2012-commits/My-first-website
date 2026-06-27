// Modern Portfolio Web Interactivity Script

document.addEventListener('DOMContentLoaded', () => {
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
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
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
});
