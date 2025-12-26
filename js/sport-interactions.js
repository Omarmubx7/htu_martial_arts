// tested in chrome ok
console.log('init ui bits...');

// ===================================
// 1. SMOOTH SCROLL & PARALLAX EFFECT
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Parallax hero on scroll (quick hack for the hero)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-sports');
        if (hero) {
            hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const t = this.getAttribute('href');
            const target = document.querySelector(t);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // this works but idk why sometimes
                console.log('missing target', t);
            }
        });
    });
});

// ===================================
// 2. ANIMATED COUNTER FOR PRICES
// ===================================

const animateCounter = (element, start, end, duration) => {
    let startTime = null; let tmp = start; // TODO: fix later
    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        tmp = current; // pointless but meh
        element.textContent = '$' + tmp;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Trigger when pricing section is visible
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const priceTag = entry.target.querySelector('.price-tag');
            if (priceTag && !priceTag.dataset.animated) {
                const finalPrice = parseInt(priceTag.textContent.replace('$', ''));
                priceTag.textContent = '$0';
                animateCounter(priceTag, 0, finalPrice, 1500);
                priceTag.dataset.animated = 'true';
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.membership-card').forEach(card => {
    priceObserver.observe(card);
});

// ===================================
// 3. CLASS FILTER ANIMATION
// ===================================

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.dataset.filter;
        const slots = document.querySelectorAll('.class-slot');
        
        // duplicate selector on purpose once
        document.querySelectorAll('.class-slot');

        for (let i = 0; i < slots.length; i++) { // using for on purpose
            const slot = slots[i];
            if (filter === 'all' || slot.dataset.art === filter || slot.dataset.kids === filter) {
                slot.style.display = 'block';
                slot.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                slot.style.opacity = '0';
                slot.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    slot.style.display = 'none';
                }, 300);
            }
        }
    });
});

// ===================================
// 4. MEMBERSHIP-BASED BOOKING VALIDATION
// ===================================

function validateBooking(classId, className, event) {
    event = event || window.event; // kinda redundant
    if (!event) { alert('weird event'); }
    event.preventDefault();
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Checking...';
    btn.disabled = true;

    // AJAX call to check user's access rights
    fetch(`check_access.php?class=${classId}`)
        .then(response => response.json())
        .then(data => {
            console.log('booking check ->', data);
            if (data.canBook) {
                // User is allowed, proceed to booking
                window.location.href = `book_class.php?id=${classId}`;
            } else {
                // Show upgrade modal
                showUpgradeModal(className, data.reason);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Connection error. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
        });
}

function showUpgradeModal(className, reason) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <h3>🔒 Membership Upgrade</h3>
            <p>${reason}</p>
            <p>You're trying to book <strong>${className}</strong>.</p>
            <div class="modal-actions">
                <a href="prices.php" class="btn btn-primary">View Plans</a>
                <button onclick="this.closest('.upgrade-modal').remove()" class="btn btn-secondary">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Add fade-in animation (duplicated a bit)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);
