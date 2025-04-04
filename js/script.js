/**
 * Portfolio Website Script
 *
 * Handles:
 * - Preloader hiding
 * - Theme (Dark/Light Mode) Toggling & Persistence
 * - Responsive Sidebar Logic (Mobile Toggle, Icon/Full States) & Overlay
 * - Active Navigation Link Highlighting on Scroll
 * - Customizable Typing Effect Animation
 * - Timeline Details Toggle
 * - Contact Form Submission Feedback
 * - Scroll Animation Initialization (AOS)
 * - Screen Size Checks for Layout Adjustments
 */

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const allNavLinks = document.querySelectorAll('.nav-link'); // Sidebar and potentially Bottom Nav links
    const sections = document.querySelectorAll('section[id]'); // Sections for scroll spying
    const typingElement = document.querySelector('.typing-effect');
    const detailToggleButtons = document.querySelectorAll('.details-toggle');
    const contactForm = document.getElementById('contact-form');
    const contactSubmitButton = document.getElementById('contact-submit');
    const formStatus = document.getElementById('form-status');
    const bottomNav = document.getElementById('bottom-nav'); // Get bottom nav

    // --- 1. Preloader ---
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            preloader.style.pointerEvents = 'none'; // Prevent interaction after hiding
        }
        body.classList.remove('preload'); // Allow transitions after load
    }
    window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 3000); // Fallback timeout


    // --- 2. Theme Toggle (Dark/Light Mode) ---
    function applyTheme(isDark) {
        const darkModeIcon = darkModeToggle ? darkModeToggle.querySelector('i') : null;
        if (isDark) {
            body.classList.add('dark-mode');
            if (darkModeIcon) darkModeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.remove('dark-mode');
            if (darkModeIcon) darkModeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    function setupTheme() {
        const savedTheme = localStorage.getItem('portfolioTheme');
        let isDarkMode = savedTheme !== null
            ? savedTheme === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;

        applyTheme(isDarkMode);

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                const currentlyDark = body.classList.contains('dark-mode');
                applyTheme(!currentlyDark);
                localStorage.setItem('portfolioTheme', !currentlyDark ? 'dark' : 'light');
            });
        }
    }
    setupTheme();


    // --- 3. Mobile Sidebar & Overlay ---
    function openMenu() {
        if (!sidebar || !overlay || !menuToggle) return;
        sidebar.classList.add('open');
        overlay.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        body.classList.add('body-no-scroll');
    }

    function closeMenu() {
        if (!sidebar || !overlay || !menuToggle) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        body.classList.remove('body-no-scroll');
    }

    function setupMobileMenu() {
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.contains('open') ? closeMenu() : openMenu();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }
        allNavLinks.forEach(link => {
            if (sidebar && sidebar.contains(link)) {
                link.addEventListener('click', () => {
                    if (sidebar.classList.contains('open')) {
                        closeMenu();
                    }
                });
            }
        });
    }
    setupMobileMenu();


    // --- 4. Active Navigation Link Highlighting ---
    function activateLink() {
        if (!sections.length || !allNavLinks.length) return;

        let currentSectionId = '';
        const scrollPosition = window.scrollY;
        const activationOffset = window.innerHeight * 0.4;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop - activationOffset && scrollPosition < sectionTop + sectionHeight - activationOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Fallback for hero section if near top
        if (scrollPosition < window.innerHeight * 0.6 && sections[0]?.id === 'hero') {
             currentSectionId = 'hero';
        }

         // Handle edge case for reaching the bottom (highlight Contact)
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) { // Increased buffer
             const contactSection = document.getElementById('contact');
             if (contactSection) currentSectionId = 'contact';
        }

        allNavLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            // Check both sidebar and bottom nav links
            if (linkHref === `#${currentSectionId}` || (linkHref === 'blog.html' && window.location.pathname.includes('blog.html'))) {
                link.classList.add('active');
            }
        });
         // Special handling for blog page link activation
        if (window.location.pathname.includes('blog.html')) {
            const blogLinks = document.querySelectorAll('.nav-link[href="blog.html"]');
            blogLinks.forEach(link => link.classList.add('active'));
        }
    }
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(activateLink, 50);
    });
    activateLink(); // Initial check


   // --- 5. Typing Effect ---
    function setupTypingEffect() {
        if (!typingElement) return;

        // --- Customization Parameters ---
        const config = {
            words: JSON.parse(typingElement.getAttribute('data-words') || '[]'),
            typeSpeed: 120,         // Milliseconds per character typed
            deleteSpeed: 70,        // Milliseconds per character deleted
            delayAfterType: 1500,   // Pause after word is typed (ms)
            delayBeforeType: 500,   // Pause after word is deleted (ms)
            cursorBlinkRate: 0.7,   // Blink rate in seconds
            colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444'], // Add your desired colors
            smoothColorTransition: true // Enable/disable smooth transition
        };

        if (!config.words || config.words.length === 0) return;

        let wordIndex = 0;
        let letterIndex = 0;
        let currentWord = '';
        let isDeleting = false;
        let colorIndex = 0;

        // Apply initial styles and cursor blink rate
        typingElement.style.setProperty('--cursor-blink-rate', `${config.cursorBlinkRate}s`);
        typingElement.style.borderColor = config.colors[colorIndex % config.colors.length]; // Initial cursor color
        if (config.smoothColorTransition) {
            typingElement.style.transition = 'color 0.3s ease'; // Add transition for text color
        }

        function type() {
            const word = config.words[wordIndex];
            const currentColor = config.colors[colorIndex % config.colors.length];

            // Update color for the current word/operation
            typingElement.style.color = currentColor;
            typingElement.style.borderColor = currentColor; // Match cursor to text color

            if (isDeleting) { // Deleting characters
                currentWord = word.substring(0, letterIndex - 1);
                letterIndex--;
            } else { // Typing characters
                currentWord = word.substring(0, letterIndex + 1);
                letterIndex++;
            }

            typingElement.textContent = currentWord;

            let typeSpeed = isDeleting ? config.deleteSpeed : config.typeSpeed;

            // If word is completely typed
            if (!isDeleting && letterIndex === word.length) {
                typeSpeed = config.delayAfterType;
                isDeleting = true;
            }
            // If word is completely deleted
            else if (isDeleting && letterIndex === 0) {
                typeSpeed = config.delayBeforeType;
                isDeleting = false;
                wordIndex = (wordIndex + 1) % config.words.length; // Cycle through words
                colorIndex++; // Change color for the next word
                // Update color immediately for the next word's start
                const nextColor = config.colors[colorIndex % config.colors.length];
                typingElement.style.color = nextColor;
                typingElement.style.borderColor = nextColor;
            }

            setTimeout(type, typeSpeed);
        }
        setTimeout(type, 1000); // Start the effect
    }
    setupTypingEffect();


    // --- 6. Timeline Details Toggle ---
    function setupTimelineToggle() {
        detailToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                const detailsId = button.getAttribute('aria-controls');
                const detailsElement = document.getElementById(detailsId);

                if (detailsElement) {
                    button.setAttribute('aria-expanded', !isExpanded);
                    detailsElement.classList.toggle('open');
                }
            });
        });
    }
    setupTimelineToggle();



    // --- 8. Scroll Animation Initialization (AOS) ---
    function initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 700,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50,
                // disable: 'phone', // Consider uncommenting if animations are laggy on mobile
            });
        } else {
            console.warn("AOS library not loaded.");
        }
    }
    initializeAOS();


    // --- 9. Screen Size Check & Layout Adjustment ---
    function checkScreenSizeAndApplyLayout() {
        let sidebarWidthPx = 0; // Default padding in pixels

        if (window.innerWidth >= 1200) { // Full Sidebar
            sidebarWidthPx = sidebar ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-lg'), 10) : 250;
            body.classList.add('sidebar-visible');
            body.classList.remove('sidebar-icon-only');
            if (sidebar) sidebar.classList.remove('icon-mode');
        } else if (window.innerWidth >= 993) { // Icon-Only Sidebar
            sidebarWidthPx = sidebar ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-icon'), 10) : 80;
            body.classList.add('sidebar-visible');
            body.classList.add('sidebar-icon-only');
            if (sidebar) sidebar.classList.add('icon-mode');
        } else { // Hamburger Menu (No fixed sidebar)
            sidebarWidthPx = 0;
            body.classList.remove('sidebar-visible');
            body.classList.remove('sidebar-icon-only');
            if (sidebar) sidebar.classList.remove('icon-mode');
             // Ensure menu is closed if resizing down from larger screen
             if (sidebar && sidebar.classList.contains('open')) {
                closeMenu();
            }
        }

        // Apply padding to body - CSS handles transitions
        body.style.paddingLeft = `${sidebarWidthPx}px`;

        // Adjust bottom nav position
        if (bottomNav) {
            if (sidebarWidthPx > 0) {
                // Calculate offset based on viewport width and sidebar width
                // Position relative to the main content area
                 bottomNav.style.left = `calc(50% + ${sidebarWidthPx / 2}px)`;
                 bottomNav.style.transform = 'translateX(-50%)';
            } else {
                // Center normally when no sidebar padding
                bottomNav.style.left = '50%';
                bottomNav.style.transform = 'translateX(-50%)';
            }
        }
    }

    // Initial Check & Resize Listener
    checkScreenSizeAndApplyLayout();
    let resizeDebounceTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounceTimeout);
        resizeDebounceTimeout = setTimeout(checkScreenSizeAndApplyLayout, 150); // Debounce resize checks
    });

    // --- 10. Footer Year Update ---
    document.getElementById('copyright-year').textContent = new Date().getFullYear();


}); // End DOMContentLoaded