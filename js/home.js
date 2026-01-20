/**
 * Home Page Logic
 * Handles interactions specific to the home page (Slider, etc.)
 */

const HomeLogic = {
    heroInterval: null, // Track interval to prevent leaks

    /**
     * Initializes the Hero Slider (Auto-play & Controls)
     */
    initHeroSlider: function () {
        // Clear any existing interval first to prevent leaks
        this.cleanup();

        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.querySelector('.slider-nav.prev');
        const nextBtn = document.querySelector('.slider-nav.next');

        if (!slides.length) return;

        let currentSlide = 0;
        let isAnimating = false; // Prevent rapid clicking issues
        const totalSlides = slides.length;

        // Initialize first slide (force active class without animation triggers)
        slides[0].classList.add('active');

        const showSlide = (index, direction = 'next') => {
            if (isAnimating || index === currentSlide) return;
            isAnimating = true;

            const outgoingSlide = slides[currentSlide];

            // Handle wrapping
            let nextIndex = index;
            if (index >= totalSlides) nextIndex = 0;
            else if (index < 0) nextIndex = totalSlides - 1;

            const incomingSlide = slides[nextIndex];

            // Setup classes for animation
            outgoingSlide.classList.add('prev-active'); // Keep it visible behind
            outgoingSlide.classList.remove('active');

            incomingSlide.style.zIndex = '10'; // Ensure it's on top

            // Set initial clip-path state based on direction (Diagonal wipe)
            // Using a simple class toggle that CSS transition handles
            // Reset transition first
            incomingSlide.style.transition = 'none';
            incomingSlide.style.clipPath = direction === 'next'
                ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' // Start from Right
                : 'polygon(0 0, 0 0, 0 100%, 0 100%)'; // Start from Left

            // Force Reflow
            void incomingSlide.offsetWidth;

            // Apply Transition
            incomingSlide.style.transition = 'clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1), transform 8s ease';
            incomingSlide.classList.add('active');

            // Animate Clip Path to Full
            requestAnimationFrame(() => {
                incomingSlide.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
            });

            // Cleanup after animation
            setTimeout(() => {
                outgoingSlide.classList.remove('prev-active');
                incomingSlide.style.zIndex = ''; // Reset z-index
                isAnimating = false;
            }, 1200); // Match CSS transition duration

            currentSlide = nextIndex;
        };

        // Next Slide
        const nextSlide = () => {
            showSlide(currentSlide + 1, 'next');
        };

        // Prev Slide
        const prevSlide = () => {
            showSlide(currentSlide - 1, 'prev');
        };

        // Event Listeners
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault(); // Prevent jump behavior
                nextSlide();
                this.resetTimer(nextSlide);
            };
        }

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                prevSlide();
                this.resetTimer(nextSlide);
            };
        }

        // Auto Play
        this.heroInterval = setInterval(nextSlide, 3500); // 3.5s interval

        // Initialize Announcement Ticker as well
        this.initAnnouncementTicker();

        // Initialize Floating Modal
        this.initFloatingAnno();

        // Initialize Notice Board
        this.initNoticeBoard();

        // Initialize Video Modal
        this.initVideoModal();

        // Initialize Blog Carousel
        this.initBlogCarousel();

        // Initialize Feedback Carousel
        this.initFeedbackCarousel();

        // Initialize Quick Info Auto Scroll
        this.initQuickInfoScroller();

        // Initialize Events Auto Scroll
        this.initEventsAutoScroll();
    },

    /**
     * Initialize Events Horizontal Auto Scroll
     */
    initEventsAutoScroll: function () {
        const container = document.querySelector('.events-scroll-container');
        const track = document.querySelector('.events-scroll-track');

        if (!container || !track) return;

        // Clone content for seamless loop
        if (!container.getAttribute('data-cloned')) {
            track.innerHTML += track.innerHTML;
            container.setAttribute('data-cloned', 'true');
        }

        let scrollSpeed = 0.8; // pixels per frame
        let isPaused = false;

        const autoScroll = () => {
            if (!isPaused) {
                container.scrollLeft += scrollSpeed;

                // Reset when we've scrolled past the first set of items (half total width)
                if (container.scrollLeft >= (container.scrollWidth / 2)) {
                    container.scrollLeft = 0;
                }
            }
            requestAnimationFrame(autoScroll);
        };

        autoScroll();

        // Pause/Resume
        container.addEventListener('mouseenter', () => isPaused = true);
        container.addEventListener('mouseleave', () => isPaused = false);
        container.addEventListener('touchstart', () => isPaused = true);
        container.addEventListener('touchend', () => setTimeout(() => isPaused = false, 1000));
    },

    /**
     * Initialize Blog Carousel (Stepper + Auto)
     */
    initBlogCarousel: function () {
        const track = document.getElementById('blogTrack');
        const nextBtn = document.getElementById('blogNext');
        const prevBtn = document.getElementById('blogPrev');

        if (!track || !nextBtn || !prevBtn) return;

        // Configuration
        const cardWidth = 380; // Card width from CSS
        const gap = 30;        // Gap from CSS
        const slideDistance = cardWidth + gap;
        const totalItems = track.children.length;

        // State
        let currentIndex = 0;
        let autoPlayInterval;

        // Auto Play Function
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                moveSlide('next');
            }, 3000); // 3 Seconds
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        // Move Slide Function
        const moveSlide = (direction) => {
            const maxIndex = totalItems - 3; // Show 3 items at once usually (adjust based on screen)

            // Simple seamless loop logic (rewind/forward)
            // Ideally should clone, but strict rewinding is acceptable for this request "slide hota rahe"
            if (direction === 'next') {
                currentIndex++;
                if (currentIndex > maxIndex) currentIndex = 0; // Loop back to start
            } else {
                currentIndex--;
                if (currentIndex < 0) currentIndex = maxIndex; // Loop to end
            }

            const translateX = -(currentIndex * slideDistance);
            track.style.transform = `translateX(${translateX}px)`;
        };

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            moveSlide('next');
            startAutoPlay(); // Reset timer
        });

        prevBtn.addEventListener('click', () => {
            moveSlide('prev');
            startAutoPlay(); // Reset timer
        });

        // Pause on Hover
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        // Start
        startAutoPlay();
    },

    /**
     * Initialize Feedback Carousel (Click + Auto)
     */
    /**
     * Initialize Feedback Carousel (Click + Auto)
     */
    initFeedbackCarousel: function () {
        const track = document.getElementById('feedbackTrack');
        const nextBtn = document.getElementById('fbNext');
        const prevBtn = document.getElementById('fbPrev');
        const dots = document.querySelectorAll('.feedback-dots .dot');

        if (!track || !nextBtn || !prevBtn) return;

        // Configuration (Matches CSS)
        const cardWidth = 380;
        const gap = 30;
        const slideDistance = cardWidth + gap;
        const totalItems = track.children.length;

        let currentIndex = 0;
        let autoPlayInterval;
        const autoDelay = 3000;

        // Helper: Max Index depending on screen size
        // Blog slider uses totalItems - 3. We'll attempt similar or calculate visible.
        // For robustness, let's calculate visible count strictly.
        const getVisibleCount = () => {
            const wrapper = document.querySelector('.feedback-carousel-wrapper');
            if (wrapper) {
                return Math.floor(wrapper.offsetWidth / cardWidth) || 1;
            }
            return 3; // Default fall back
        };

        const updateDots = () => {
            if (dots.length > 0) {
                dots.forEach(d => d.classList.remove('active'));
                const dotIndex = currentIndex % dots.length;
                if (dots[dotIndex]) dots[dotIndex].classList.add('active');
            }
        };

        const moveSlide = (direction) => {
            const visibleCount = getVisibleCount();
            const maxIndex = Math.max(0, totalItems - visibleCount);

            if (direction === 'next') {
                currentIndex++;
                if (currentIndex > maxIndex) currentIndex = 0; // Loop to start
            } else {
                currentIndex--;
                if (currentIndex < 0) currentIndex = maxIndex; // Loop to end
            }

            const translateX = -(currentIndex * slideDistance);
            track.style.transform = `translateX(${translateX}px)`;
            updateDots();
        };

        // Auto Play
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                moveSlide('next');
            }, autoDelay);
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            moveSlide('next');
            startAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            moveSlide('prev');
            startAutoPlay();
        });

        // Dot Listeners
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                // Safety check
                const visibleCount = getVisibleCount();
                const max = Math.max(0, totalItems - visibleCount);
                if (currentIndex > max) currentIndex = max;

                const translateX = -(currentIndex * slideDistance);
                track.style.transform = `translateX(${translateX}px)`;
                updateDots();
                startAutoPlay();
            });
        });

        // Pause on Hover
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        // Handle Resize
        window.addEventListener('resize', () => {
            // Re-clamp if needed
            const visibleCount = getVisibleCount();
            const max = Math.max(0, totalItems - visibleCount);
            if (currentIndex > max) {
                currentIndex = max;
                const translateX = -(currentIndex * slideDistance);
                track.style.transform = `translateX(${translateX}px)`;
            }
        });

        // Start
        updateDots();
        startAutoPlay();
    },

    /**
     * Initialize Auto Scroll for Quick Info Lists (JS-based with Scrollbar)
     */
    initQuickInfoScroller: function () {
        const bodies = document.querySelectorAll('.dash-body');

        bodies.forEach(body => {
            const list = body.querySelector('.dash-list');
            if (!list) return;

            // Check if scrolling is needed
            if (list.scrollHeight <= body.clientHeight) return;

            // Clone content for seamless look (optional but good for loops)
            // But for simple "auto scroll", just scrolling down is enough. 
            // If user wants infinite, we need to clone. Let's clone once.
            if (!body.getAttribute('data-cloned')) {
                list.innerHTML += list.innerHTML;
                body.setAttribute('data-cloned', 'true');
            }

            let scrollSpeed = 0.5; // Pixels per frame
            let isPaused = false;
            let lastScrollTop = 0;

            const autoScroll = () => {
                if (!isPaused) {
                    body.scrollTop += scrollSpeed;

                    // Reset if we reached the loop point (halfway approx)
                    // The cloned content starts at original scrollHeight
                    if (body.scrollTop >= (body.scrollHeight / 2)) {
                        body.scrollTop = 0;
                    }
                }
                requestAnimationFrame(autoScroll);
            };

            // Start
            autoScroll();

            // Pause on Hover
            body.addEventListener('mouseenter', () => isPaused = true);
            body.addEventListener('mouseleave', () => isPaused = false);

            // Touch support
            body.addEventListener('touchstart', () => isPaused = true);
            body.addEventListener('touchend', () => setTimeout(() => isPaused = false, 1000));
        });
    },

    /**
     * Initialize Video Modal for Events
     */
    initVideoModal: function () {
        const playBtn = document.getElementById('eventPlayBtn');
        const modal = document.getElementById('videoModal');
        const closeBtn = document.getElementById('videoModalClose');
        const videoPlayer = document.getElementById('eventVideoPlayer');
        const captionText = document.getElementById('videoCaptionText');

        if (playBtn && modal && videoPlayer) {
            playBtn.addEventListener('click', () => {
                const videoSrc = playBtn.getAttribute('data-video-src');
                const caption = playBtn.getAttribute('data-caption');

                if (videoSrc) {
                    videoPlayer.src = videoSrc;
                    captionText.textContent = caption || '';
                    modal.classList.add('active');
                    videoPlayer.play().catch(e => console.log('Auto-play prevented:', e));
                }
            });

            const closeModal = () => {
                modal.classList.remove('active');
                videoPlayer.pause();
                videoPlayer.src = ""; // Stop buffering
            };

            if (closeBtn) closeBtn.addEventListener('click', closeModal);

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    },

    /**
     * Initialize Notice Board (Scroll & Toggle)
     */
    initNoticeBoard: function () {
        const noticeList = document.querySelector('.notice-list');
        const playBtn = document.getElementById('noticeControlBtn');
        const icon = document.getElementById('noticeIcon');

        if (noticeList) {
            // Clone items for seamless loop if not already cloned (simple check)
            if (!noticeList.getAttribute('data-cloned')) {
                const listItems = noticeList.innerHTML;
                noticeList.innerHTML = listItems + listItems;
                noticeList.setAttribute('data-cloned', 'true');
            }
        }

        if (playBtn && noticeList && icon) {
            // Remove old onclick attribute to avoid dual triggers if any
            playBtn.removeAttribute('onclick');

            // Clean up old listeners (clone node trick or just re-assign)
            const newBtn = playBtn.cloneNode(true);
            playBtn.parentNode.replaceChild(newBtn, playBtn);

            newBtn.addEventListener('click', () => {
                if (noticeList.classList.contains('paused')) {
                    noticeList.classList.remove('paused');
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                } else {
                    noticeList.classList.add('paused');
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            });
        }
    },

    /**
     * Floating Announcement Modal Logic
     */
    initFloatingAnno: function () {
        const modal = document.getElementById('floatingModal');
        const btn = document.getElementById('floatingBtn');
        const closeBtn = document.getElementById('modalClose');

        if (!modal || !btn) return;

        // Auto Open after 2 seconds
        setTimeout(() => {
            modal.classList.add('active');
        }, 2000);

        // Toggle on button click
        btn.addEventListener('click', () => {
            modal.classList.toggle('active');
            btn.classList.toggle('active');
        });

        // Close on X click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Start Countdown
        this.startCountdown();
    },

    startCountdown: function () {
        // Target Date: Jan 15, 2026 (Per user image)
        const targetDate = new Date("Jan 15, 2026 00:00:00").getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Expired
                return;
            }

            // Calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Update DOM
            const elDays = document.getElementById('cd-days');
            const elHours = document.getElementById('cd-hours');
            const elMin = document.getElementById('cd-min');
            const elSec = document.getElementById('cd-sec');

            if (elDays) elDays.innerText = String(days).padStart(2, '0');
            if (elHours) elHours.innerText = String(hours).padStart(2, '0');
            if (elMin) elMin.innerText = String(minutes).padStart(2, '0');
            if (elSec) elSec.innerText = String(seconds).padStart(2, '0');
        };

        setInterval(updateTimer, 1000);
        updateTimer(); // Run once immediately
    },

    /**
     * Switch Tabs in About Section
     * @param {string} tabId - 'mission', 'vision', or 'values'
     */
    switchTab: function (tabId) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Remove active class from all content
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));

        // Add active to clicked button (Need to find it, or use event.target if passed, but here we can just find by text or index. 
        // Simpler: find the button that calls this? Or just match index. 
        // Actually, let's select based on the onclick attribute or just add IDs to buttons. 
        // Re-approach: Loop and check text content or just select by order?
        // Let's assume the buttons distinct enough. 
        // Better: Select the button that triggered this. But wait, I put onclick in HTML.
        // Let's find the button by the argument matching? No.
        // Let's just allow the button itself to toggle if we passed `this`.
        // FIX: I will use `event.currentTarget` in safe way or just finding by child index.

        // Let's use a mapping for simplicity if needed, OR:
        // Add logic to highlight the button that was clicked.
        // Since I can't easily pass `this` in the inline string without `call`, I will select based on index.
        // Mission=0, Vision=1, Values=2.

        let index = 0;
        if (tabId === 'vision') index = 1;
        if (tabId === 'values') index = 2;

        if (buttons[index]) buttons[index].classList.add('active');

        // Show Content
        const activeContent = document.getElementById('tab-' + tabId);
        if (activeContent) activeContent.classList.add('active');
    },

    /**
     * Initializes the Announcement Ticker (Pause/Play)
     */
    initAnnouncementTicker: function () {
        const pauseBtn = document.getElementById('annoPauseBtn');
        const marquee = document.getElementById('annoMarquee');

        if (pauseBtn && marquee) {
            pauseBtn.addEventListener('click', () => {
                const isPaused = marquee.classList.toggle('paused');
                const icon = pauseBtn.querySelector('i');

                // Toggle Icon
                if (isPaused) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                } else {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                }
            });
        }
    },

    /**
     * Resets the auto-play timer
     */
    resetTimer: function (callback) {
        if (this.heroInterval) clearInterval(this.heroInterval);
        this.heroInterval = setInterval(callback, 3500);
    },

    /**
     * Clean up intervals (called when leaving page or re-init)
     */
    cleanup: function () {
        if (this.heroInterval) {
            clearInterval(this.heroInterval);
            this.heroInterval = null;
        }
    }
};

// Make sure it's available globally
window.HomeLogic = HomeLogic;
