/**
 * Simple Vanilla JS Router and Component Loader
 * Handles loading header, footer, and page content via Fetch API
 */

const app = {
    // Configuration
    routes: {
        '': 'home.html',
        'home': 'home.html',
        // Add more routes here as needed (would require creating corresponding HTML files)
        // 'about': 'about.html', 
    },

    container: document.getElementById('main-content'),

    init: async function () {
        // Load Static Components (Header & Footer)
        await this.loadComponent('header.html', 'header-container');
        await this.loadComponent('footer.html', 'footer-container');

        // Handle Routing
        window.addEventListener('hashchange', () => this.handleRoute());
        await this.handleRoute(); // Initial load - Await this to ensure content is loaded

        // Initialize interactive elements after loading
        this.setupHeaderInteractions();
    },

    /**
     * Loads a generic HTML component into a target element
     */
    loadComponent: async function (file, targetId) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const html = await response.text();
            document.getElementById(targetId).innerHTML = html;
        } catch (error) {
            console.error(error);
            document.getElementById(targetId).innerHTML = `<div class="error">Error loading component: ${file}</div>`;
        }
    },

    /**
     * Handles the current hash route
     */
    handleRoute: async function () {
        // Get hash without the '#' and remove query params if any
        let hash = window.location.hash.slice(1).split('?')[0];

        // Default route
        if (!hash) hash = 'home';

        // Resolve file from route map
        const file = this.routes[hash] || 'home.html'; // Fallback to home if unknown

        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load page ${file}`);
            const html = await response.text();
            this.container.innerHTML = html;

            // Scroll to top
            window.scrollTo(0, 0);

            // Update active state in nav (if applicable)
            this.updateActiveNav(hash);

            // Initialize Hero Slider if on home page
            if (hash === 'home' || hash === '') {
                if (window.HomeLogic) {
                    window.HomeLogic.initHeroSlider();
                }
            } else {
                // Cleanup if leaving home (optional, but good practice)
                if (window.HomeLogic) {
                    window.HomeLogic.cleanup();
                }
            }

        } catch (error) {
            console.error(error);
            this.container.innerHTML = `
                <div class="container" style="padding: 100px 0; text-align: center;">
                    <h2>404 - Page Not Found</h2>
                    <p>The requested content could not be loaded.</p>
                    <a href="#" class="btn" style="margin-top: 20px;">Return Home</a>
                </div>
            `;
        }
    },

    /**
     * Adds interactivity to the header (mobile toggle, etc.)
     * Since header is loaded dynamically, we must do this after injection
     */
    setupHeaderInteractions: function () {
        // Dropdown hover logic is handled by CSS primarily

        // Search Overlay Logic
        const searchBtn = document.getElementById('searchBtn');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchClose = document.getElementById('searchClose');

        if (searchBtn && searchOverlay && searchClose) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                searchOverlay.classList.add('active');
            });

            searchClose.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                    searchOverlay.classList.remove('active');
                }
            });
        }

        // Mobile Nav Logic
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.getElementById('navOverlay');

        if (mobileToggle && navMenu && navOverlay) {
            // Toggle Menu
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navOverlay.classList.toggle('active');
            });

            // Close when clicking overlay
            navOverlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
            });

            // Mobile Menu Close Button
            const mobileClose = document.getElementById('mobileClose');
            if (mobileClose) {
                mobileClose.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navOverlay.classList.remove('active');
                });
            }

            // Accordion Logic for Mobile Big Nav
            const hasChildLinks = document.querySelectorAll('.has-child > a');
            hasChildLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Only apply on mobile (window width < 991px)
                    if (window.innerWidth <= 991) {
                        e.preventDefault();
                        const parent = link.parentElement;
                        const subMenu = parent.querySelector('.big-nav') || parent.querySelector('.dropdown');

                        if (subMenu) {
                            // Toggle current
                            if (subMenu.classList.contains('show')) {
                                subMenu.classList.remove('show');
                                subMenu.style.display = 'none';
                            } else {
                                // Close others (optional, keep false for multiple open)
                                document.querySelectorAll('.big-nav, .dropdown').forEach(el => {
                                    el.classList.remove('show');
                                    el.style.display = ''; // Reset to css default
                                });

                                subMenu.classList.add('show');
                                subMenu.style.display = 'block';
                            }
                        }
                    }
                });
            });
        }
    },

    updateActiveNav: function (hash) {
        // Remove active class from all
        document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));

        // Add to current
        // Simple matching logic
        if (hash === 'home' || hash === '') {
            const homeLink = document.querySelector('.main-nav a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
