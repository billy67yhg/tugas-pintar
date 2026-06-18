// js/main.js
import { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_WHATSAPP } from './config.js';
import { sendToWhatsApp, formatOrderMessage, showNotification } from './utils.js';

// Initialize Supabase Client (via CDN global object)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {
    // 1. Init AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 100 });
    }

    // 2. Hide Loading Screen
    const loader = document.getElementById('loadingScreen');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => (loader.style.display = 'none'), 300);
        }, 600);
    }

    // 3. Setup Features
    setupOrderForm();
    setupCounters();
    setupDarkMode();
});

// ========== ORDER FORM HANDLER ==========
function setupOrderForm() {
    const form = document.getElementById('orderForm');
    const btn = document.getElementById('submitBtn');
    if (!form || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        btn.disabled = true;
        const originalBtnContent = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Memproses...`;

        try {
            // Collect Form Data
            const orderData = {
                customer_name: document.getElementById('customerName').value.trim(),
                customer_class: document.getElementById('customerClass').value.trim(),
                whatsapp_number: document.getElementById('whatsappNumber').value.trim(),
                service_type: document.getElementById('serviceType').value,
                message: document.getElementById('orderMessage').value.trim(),
                status: 'menunggu'
            };

            // Insert to Supabase
            const { data, error } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (error) throw error;

            // Success Feedback
            showNotification('Pesanan berhasil disimpan! 🎉', 'success');

            // Open WhatsApp with formatted message
            const waMessage = formatOrderMessage(data);
            setTimeout(() => {
                sendToWhatsApp(ADMIN_WHATSAPP, waMessage);
                form.reset();
            }, 1000);

        } catch (err) {
            console.error('❌ Order submission failed:', err);
            showNotification('Gagal simpan ke database. Langsung chat WA saja.', 'error');

            // Fallback: Direct to WA even if DB fails
            const fallbackData = {
                customer_name: document.getElementById('customerName').value,
                customer_class: document.getElementById('customerClass').value,
                whatsapp_number: document.getElementById('whatsappNumber').value,
                service_type: document.getElementById('serviceType').value,
                message: document.getElementById('orderMessage').value,
                order_code: 'PENDING-' + Date.now()
            };
            sendToWhatsApp(ADMIN_WHATSAPP, formatOrderMessage(fallbackData));
        } finally {
            // Reset Button
            btn.disabled = false;
            btn.innerHTML = originalBtnContent;
        }
    });
}

// ========== ANIMATED COUNTERS ==========
function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const step = Math.ceil(target / 50);

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                        el.textContent = target + (target === 98 ? '%' : '+');
                    } else {
                        el.textContent = current;
                    }
                }, 25);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ========== DARK MODE TOGGLE ==========
function setupDarkMode() {
    const icon = document.getElementById('darkModeIcon');
    if (!icon) return;

    // Load saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        icon.textContent = 'light_mode';
    }

    // Expose to global scope for HTML onclick
    window.toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
}

// ========== MOBILE MENU ==========
window.toggleMobileMenu = () => {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('hidden');
};