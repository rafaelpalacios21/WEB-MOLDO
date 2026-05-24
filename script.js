/**
 * moldoLab | Joyería Experimental - Core JavaScript Logic
 * Includes Lenis Smooth Scroll, GSAP ScrollTrigger transitions, carousel mechanics,
 * and global media error fallback handlers.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Fallback: if GSAP never animates .reveal elements (CDN down, JS error), make them visible
    setTimeout(() => {
        document.querySelectorAll('.reveal, .fade-in').forEach(el => {
            if (getComputedStyle(el).opacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 2500);

    // --- 1. GLOBAL IMAGE & VIDEO FALLBACK HANDLER ---
    // If assets/images or videos fail to load (which is expected as they are empty spaces),
    // we gracefully hide them and display their CSS/HTML placeholders.
    const handleMediaError = (media) => {
        media.style.display = 'none';
        const siblingPlaceholder = media.nextElementSibling;

        if (siblingPlaceholder) {
            const validClasses = [
                'visual-placeholder',
                'product-placeholder',
                'process-img-placeholder',
                'placeholder-img',
                'stickers-fallback'
            ];

            const hasValidClass = validClasses.some(className =>
                siblingPlaceholder.classList.contains(className)
            );

            if (hasValidClass) {
                if (siblingPlaceholder.classList.contains('stickers-fallback')) {
                    siblingPlaceholder.style.display = 'flex';
                } else {
                    siblingPlaceholder.style.display = 'block';
                }
            }
        }
    };

    // Attach listener to all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => handleMediaError(img));

        // Handle images that might have already failed to load before script initialization
        if (img.complete && img.naturalWidth === 0) {
            handleMediaError(img);
        }
    });

    // Attach listener to hero background video
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.addEventListener('error', () => {
            heroVideo.style.display = 'none';
        });

        // If video fails internally/silently or source is missing
        setTimeout(() => {
            if (heroVideo.readyState === 0) { // HAVE_NOTHING
                heroVideo.style.display = 'none';
            }
        }, 1500);
    }


    // --- 2. LENIS SMOOTH SCROLL INITIALIZATION ---
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
            infinite: false,
        });

        // Sync with GSAP ticker if GSAP is available, otherwise use simple RAF
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }

        // Programmatic smooth scroll to anchors with sticky header offset
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const headerOffset = document.getElementById('header')?.offsetHeight || 80;
                    lenis.scrollTo(targetEl, {
                        offset: -headerOffset,
                        duration: 1.2
                    });
                }
            });
        });

        // Redirection sync: Stop scrolling when the side cart is active
        const sideCart = document.getElementById('side-cart');
        if (sideCart) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        const isActive = sideCart.classList.contains('active');
                        if (isActive) {
                            lenis.stop();
                        } else {
                            // Check if other modals are active before starting Lenis
                            const isLoginActive = document.getElementById('login-modal')?.classList.contains('active');
                            const isLightboxActive = document.getElementById('carousel-lightbox')?.classList.contains('active');
                            if (!isLoginActive && !isLightboxActive) {
                                lenis.start();
                            }
                        }
                    }
                });
            });
            observer.observe(sideCart, { attributes: true });
        }

    } catch (e) {
        console.warn("Lenis smooth scroll library was not loaded or failed to initialize.", e);
    }


    // --- 3. GSAP & SCROLLTRIGGER ANIMATIONS ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Tell ScrollTrigger to update whenever Lenis scrolls
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
        }

        // Hero Entrance Animations
        const heroContentItems = document.querySelectorAll('.hero-content > *');
        if (heroContentItems.length) {
            gsap.fromTo(heroContentItems,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }
            );
        }

        const heroImageWrapper = document.querySelector('.hero-image-wrapper');
        if (heroImageWrapper) {
            gsap.fromTo(heroImageWrapper,
                { opacity: 0, scale: 0.95, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 }
            );
        }

        // Header shrinking scroll effect
        const header = document.getElementById('header');
        if (header) {
            ScrollTrigger.create({
                start: 'top -50',
                onEnter: () => header.classList.add('shrink'),
                onLeaveBack: () => header.classList.remove('shrink'),
            });
        }

        // General Reveals (Fade Up on Scroll)
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach((element) => {
            // Avoid conflict with specific grids or layouts
            if (element.classList.contains('product-grid')) return;

            gsap.fromTo(element,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Stagger Products in Grid
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            const productCards = document.querySelectorAll('.product-card');
            if (productCards.length) {
                gsap.fromTo(productCards,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: productGrid,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        }

        // Stickers Section Parallax Background Text
        const stickersBgText = document.querySelector('.stickers-bg-text');
        const stickersSection = document.querySelector('.stickers-section');
        if (stickersBgText && stickersSection) {
            gsap.to(stickersBgText, {
                yPercent: -20,
                ease: 'none',
                scrollTrigger: {
                    trigger: stickersSection,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Stickers Subtle Floating Animation
        const stickers = document.querySelectorAll('.sticker');
        if (stickers.length) {
            gsap.to(stickers, {
                y: '+=12',
                rotation: '+=1.5',
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }


    // --- 4. MOBILE HAMBURGER MENU DRAWER ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn && headerNav) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerNav.classList.toggle('active');

            const isOpen = headerNav.classList.contains('active');
            if (isOpen) {
                mobileMenuBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                `;
                if (lenis) lenis.stop(); // Stop scroll when menu is open
            } else {
                mobileMenuBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
                if (lenis) lenis.start();
            }
        });

        // Close menu if user clicks outside of it
        document.addEventListener('click', (e) => {
            if (headerNav.classList.contains('active') &&
                !headerNav.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {

                headerNav.classList.remove('active');
                mobileMenuBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
                if (lenis) lenis.start();
            }
        });

        // Close menu when navigation link is clicked
        headerNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('active');
                mobileMenuBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
                if (lenis) lenis.start();
            });
        });
    }


    // --- 5. LOGIN MODAL MECHANICS ---
    const loginBtn = document.getElementById('login-btn');
    const closeModal = document.getElementById('close-modal');
    const loginModal = document.getElementById('login-modal');

    const openModal = () => {
        if (loginModal) {
            loginModal.classList.add('active');
            if (lenis) lenis.stop();
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModalFunc = () => {
        if (loginModal) {
            loginModal.classList.remove('active');
            if (lenis) lenis.start();
            document.body.style.overflow = '';
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', openModal);
    }
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModalFunc();
            }
        });
    }


    // --- 6. DRAGGABLE CAROUSEL & LIGHTBOX GALLERY ---
    const carouselTrack = document.querySelector('.carousel-track');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const lightboxOverlay = document.getElementById('carousel-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // Drag to scroll carousel logic
    if (carouselTrack) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselTrack.style.cursor = 'grabbing';
            startX = e.pageX - carouselTrack.offsetLeft;
            scrollLeft = carouselTrack.scrollLeft;
        });

        carouselTrack.addEventListener('mouseleave', () => {
            isDown = false;
            carouselTrack.style.cursor = 'grab';
        });

        carouselTrack.addEventListener('mouseup', () => {
            isDown = false;
            carouselTrack.style.cursor = 'grab';
        });

        carouselTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselTrack.offsetLeft;
            const walk = (x - startX) * 2;
            carouselTrack.scrollLeft = scrollLeft - walk;
        });

        carouselTrack.style.cursor = 'grab';
    }

    // Carousel Arrows Logic
    if (carouselTrack && leftArrow && rightArrow) {
        const getScrollAmount = () => {
            const item = carouselTrack.querySelector('.carousel-item');
            if (item) {
                const style = window.getComputedStyle(carouselTrack);
                const gap = parseInt(style.gap) || 0;
                return item.offsetWidth + gap;
            }
            return 380;
        };

        leftArrow.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        rightArrow.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        const updateArrows = () => {
            if (carouselTrack.scrollLeft <= 10) {
                leftArrow.style.opacity = '0.3';
                leftArrow.style.pointerEvents = 'none';
            } else {
                leftArrow.style.opacity = '1';
                leftArrow.style.pointerEvents = 'auto';
            }

            if (carouselTrack.scrollLeft >= carouselTrack.scrollWidth - carouselTrack.clientWidth - 10) {
                rightArrow.style.opacity = '0.3';
                rightArrow.style.pointerEvents = 'none';
            } else {
                rightArrow.style.opacity = '1';
                rightArrow.style.pointerEvents = 'auto';
            }
        };

        carouselTrack.addEventListener('scroll', updateArrows);
        setTimeout(updateArrows, 100);
        window.addEventListener('resize', updateArrows);
    }

    // Lightbox Modal Logic
    if (carouselItems && lightboxOverlay && lightboxImg) {
        carouselItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');

                if (img && img.style.display !== 'none') {
                    lightboxImg.src = img.src;
                    lightboxImg.style.background = '';
                } else {
                    lightboxImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3"/>';
                    const placeholder = item.querySelector('.placeholder-img');
                    if (placeholder) {
                        const computedStyle = window.getComputedStyle(placeholder);
                        lightboxImg.style.background = computedStyle.background;
                    }
                }
                lightboxImg.style.display = 'block';
                lightboxOverlay.classList.add('active');
                if (lenis) lenis.stop();
                document.body.style.overflow = 'hidden';
            });
        });
    }

    const closeLightbox = () => {
        if (lightboxOverlay) {
            lightboxOverlay.classList.remove('active');
            if (lenis) lenis.start();
            document.body.style.overflow = '';
        }
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
    }


    // --- 7. SCROLL PROGRESS BAR ---
    const scrollProgressBar = document.getElementById('scroll-progress');
    if (scrollProgressBar) {
        const updateScrollProgress = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            scrollProgressBar.style.transform = `scaleX(${progress})`;
        };
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        updateScrollProgress();
    }


    // --- 8. CUSTOM CURSOR ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0,  ringY = 0;
        let rafCursor;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top  = mouseY + 'px';
        }, { passive: true });

        document.addEventListener('mousedown', () => cursorDot.classList.add('is-clicking'));
        document.addEventListener('mouseup',   () => cursorDot.classList.remove('is-clicking'));

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.11;
            ringY += (mouseY - ringY) * 0.11;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top  = ringY + 'px';
            rafCursor = requestAnimationFrame(animateRing);
        };
        animateRing();

        const hoverTargets = 'a, button, .product-card, .vertical-card, .carousel-item, [data-magnetic], .icon-btn, .btn';
        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('is-hovering');
                cursorRing.classList.add('is-hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('is-hovering');
                cursorRing.classList.remove('is-hovering');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '';
            cursorRing.style.opacity = '';
        });
    }


    // --- 9. MAGNETIC BUTTONS ---
    if (typeof gsap !== 'undefined') {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width  / 2) * 0.38;
                const y = (e.clientY - rect.top  - rect.height / 2) * 0.38;
                gsap.to(el, { x, y, duration: 0.5, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
            });
        });
    }


    // --- 10. ENHANCED GSAP ANIMATIONS ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

        // Parallax: process image
        const processImg = document.querySelector('.process-image img');
        if (processImg) {
            gsap.to(processImg, {
                yPercent: -14,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.process',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Parallax: split-row images
        document.querySelectorAll('.split-image img').forEach(img => {
            gsap.to(img, {
                yPercent: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.split-row') || img,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // Parallax: hero image
        const heroImg = document.querySelector('.hero-placeholder img');
        if (heroImg) {
            gsap.to(heroImg, {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Stagger vertical cards
        const verticalGrid = document.querySelector('.vertical-grid');
        if (verticalGrid) {
            const verticalCards = document.querySelectorAll('.vertical-card');
            if (verticalCards.length) {
                gsap.fromTo(verticalCards,
                    { opacity: 0, y: 45 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.75,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: verticalGrid,
                            start: 'top 88%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        }

        // Statement headline: clip reveal
        const statementHeadline = document.querySelector('.statement-headline');
        if (statementHeadline) {
            gsap.fromTo(statementHeadline,
                { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
                {
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 1.4,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.statement-section',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Micro blocks stagger
        const microBlocks = document.querySelectorAll('.micro-block');
        const microBlocksContainer = document.querySelector('.micro-blocks');
        if (microBlocks.length && microBlocksContainer) {
            gsap.fromTo(microBlocks,
                { opacity: 0, x: -20 },
                {
                    opacity: 1, x: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: microBlocksContainer,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Manifesto h2 character split (simple word-level)
        const manifestoH2 = document.querySelector('.manifesto h2');
        if (manifestoH2) {
            const words = manifestoH2.textContent.trim().split(' ');
            manifestoH2.innerHTML = words
                .map(w => `<span style="display:inline-block; overflow:hidden; vertical-align:bottom;">` +
                           `<span class="word-inner" style="display:inline-block;">${w}&nbsp;</span></span>`)
                .join('');

            gsap.fromTo('.manifesto h2 .word-inner',
                { y: '110%' },
                {
                    y: '0%',
                    duration: 0.9,
                    stagger: 0.06,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.manifesto',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    }


    // --- 11. BRAND WORLD MARQUEE — loop JS + drag ---
    const bwMarquee = document.querySelector('.bw-marquee');
    const bwFwd     = document.querySelector('.bw-strip-fwd');
    const bwRev     = document.querySelector('.bw-strip-rev');

    if (bwMarquee && bwFwd && bwRev) {
        const SPEED_FWD = 2.6;   // px/frame tira 1 (→ izquierda)
        const SPEED_REV = 2.0;   // px/frame tira 2 (→ derecha)

        let pos1 = 0, pos2 = 0;
        let half1 = 0, half2 = 0;
        let hovered   = false;
        let dragging  = false;
        let lastX     = 0;

        function initHalves() {
            half1 = bwFwd.scrollWidth / 2;
            half2 = bwRev.scrollWidth / 2;
            pos2  = -half2;   // tira 2 arranca en la mitad (sentido contrario)
        }

        function wrap(pos, half) {
            pos = pos % half;
            if (pos > 0) pos -= half;
            return pos;
        }

        function tick() {
            if (!hovered && !dragging) {
                pos1 -= SPEED_FWD;
                pos2 += SPEED_REV;
            }
            pos1 = wrap(pos1, half1);
            pos2 = wrap(pos2, half2);
            bwFwd.style.transform = `translateX(${pos1}px)`;
            bwRev.style.transform = `translateX(${pos2}px)`;
            requestAnimationFrame(tick);
        }

        // Hover pause
        bwMarquee.addEventListener('mouseenter', () => { hovered = true; });
        bwMarquee.addEventListener('mouseleave', () => { hovered = false; dragging = false; bwMarquee.classList.remove('is-dragging'); });

        // Drag — tira 1 sigue el ratón, tira 2 va al contrario
        bwMarquee.addEventListener('mousedown', e => {
            dragging = true;
            lastX    = e.clientX;
            bwMarquee.classList.add('is-dragging');
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            lastX    = e.clientX;
            pos1 = wrap(pos1 + dx, half1);
            pos2 = wrap(pos2 - dx, half2);
        });
        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            bwMarquee.classList.remove('is-dragging');
        });

        // Touch
        let tStartX = 0;
        bwMarquee.addEventListener('touchstart', e => { tStartX = e.touches[0].clientX; hovered = true; }, { passive: true });
        bwMarquee.addEventListener('touchmove',  e => {
            const dx = e.touches[0].clientX - tStartX;
            tStartX  = e.touches[0].clientX;
            pos1 = wrap(pos1 + dx, half1);
            pos2 = wrap(pos2 - dx, half2);
        }, { passive: true });
        bwMarquee.addEventListener('touchend', () => { hovered = false; });

        window.addEventListener('resize', initHalves);
        initHalves();
        requestAnimationFrame(tick);
    }


    // --- 12. NUMBER COUNTERS ---
    const numberEls = document.querySelectorAll('.number-value[data-target]');
    if (numberEls.length && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        numberEls.forEach(el => {
            const target  = parseInt(el.dataset.target, 10);
            const suffix  = el.dataset.suffix || '';
            const counter = { val: 0 };

            gsap.to(counter, {
                val: target,
                duration: 2.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                onUpdate() {
                    el.textContent = Math.round(counter.val) + suffix;
                },
                onComplete() {
                    el.textContent = target + suffix;
                }
            });
        });
    }
});
