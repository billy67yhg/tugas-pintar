// js/utils.js
import { ORDER_STATUS, formatRupiah, formatDate } from './config.js';

// ==========  WHATSAPP INTEGRATION ==========
export const sendToWhatsApp = (phone, message) => {
    const encoded = encodeURIComponent(message);
    // Format nomor: ganti 08 jadi 628, atau biarkan jika sudah 62
    const cleanPhone = phone.startsWith('62') ? phone : phone.replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
};

// Format pesan saat pesanan BARU masuk
export const formatOrderMessage = (order) => {
    return `
*🎓 PESANAN BARU - ${order.order_code || 'PENDING'}*

📋 *Detail Customer:*
• Nama: ${order.customer_name}
• Kelas: ${order.customer_class}
• WhatsApp: ${order.whatsapp_number}
• Layanan: ${order.service_type}

💬 *Pesan:*
${order.message || '-'}

💰 *Harga:* ${order.price ? formatRupiah(order.price) : 'Negosiasi'}
📅 *Waktu:* ${formatDate(order.created_at || new Date())}

─────────────────
Mohon konfirmasi & info pembayaran. Terima kasih! 
    `.trim();
};

// Format pesan saat STATUS pesanan berubah
export const formatStatusUpdateMessage = (order, newStatus) => {
    const statusInfo = ORDER_STATUS[newStatus] || { label: newStatus, icon: '📦' };
    return `
*📦 Update Pesanan ${order.order_code}*

Halo ${order.customer_name}! 👋

Pesanan kamu untuk *${order.service_type}* sekarang statusnya:
*${statusInfo.label}* ${statusInfo.icon}

${newStatus === 'selesai' && order.result_file_url
            ? `📎 Hasil bisa diunduh di: ${order.result_file_url}`
            : newStatus === 'proses'
                ? `🎨 Tim kami sedang mengerjakan tugas kamu. Tunggu kabar selanjutnya ya!`
                : 'Ada yang bisa kami bantu? Balas chat ini ya! 😊'}
    `.trim();
};

// ========== 🔔 NOTIFICATION SYSTEM ==========
export const showNotification = (message, type = 'info', duration = 3000) => {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-primary'
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const notification = document.createElement('div');
    notification.className = `notification fixed top-24 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-[1000] flex items-center gap-3 transition-all duration-300 transform translate-x-full opacity-0`;
    notification.innerHTML = `
        <span class="material-symbols-outlined">${icons[type]}</span>
        <span class="font-medium">${message}</span>
    `;

    document.body.appendChild(notification);

    // Trigger slide-in animation
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });

    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, duration);
};

// ========== 💾 LOCAL STORAGE HELPER ==========
export const storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: (key) => localStorage.removeItem(key)
};

// ========== 🔐 SIMPLE AUTH HELPER (Client-Side) ==========
// Catatan: Untuk production, gunakan Supabase Auth atau backend terpisah!
export const auth = {
    login: (username, password) => {
        // Simpan session sederhana
        const session = { username, loginAt: Date.now() };
        storage.set('admin_session', session);
        return true;
    },
    check: () => {
        const session = storage.get('admin_session');
        if (!session) return false;
        // Session expired setelah 24 jam
        return Date.now() - session.loginAt < 24 * 60 * 60 * 1000;
    },
    logout: () => storage.remove('admin_session'),
    get: () => storage.get('admin_session')
};