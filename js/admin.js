// js/admin.js
import { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_WHATSAPP, ORDER_STATUS, formatRupiah, formatDate } from './config.js';
import { sendToWhatsApp, formatStatusUpdateMessage, showNotification, storage } from './utils.js';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentOrderId = null;

// ========== AUTH & INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    if (storage.get('admin_logged_in')) {
        showDashboard();
        loadOrders();
        loadStats();
    } else {
        showLogin();
    }

    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('statusFilter')?.addEventListener('change', loadOrders);
    document.getElementById('searchInput')?.addEventListener('input', filterTable);
});

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value.trim();
    const pass = document.getElementById('adminPassword').value.trim();
    const errEl = document.getElementById('loginError');

    // 🔒 Simple Auth (Ganti password di sini atau pakai Supabase Auth untuk production)
    if (user === 'admin' && pass === 'admin123') {
        storage.set('admin_logged_in', true);
        storage.set('admin_name', user);
        showDashboard();
        loadOrders();
        loadStats();
    } else {
        errEl.textContent = 'Username atau password salah!';
        errEl.classList.remove('hidden');
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('adminName').textContent = storage.get('admin_name') || 'Admin';
}

window.handleLogout = () => {
    storage.remove('admin_logged_in');
    storage.remove('admin_name');
    showLogin();
};

// ========== LOAD DATA ==========
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const loading = document.getElementById('loadingState');
    const empty = document.getElementById('emptyState');
    const status = document.getElementById('statusFilter').value;

    tbody.innerHTML = '';
    loading.classList.remove('hidden');
    empty.classList.add('hidden');

    try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (status !== 'all') query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;

        loading.classList.add('hidden');
        if (data.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        tbody.innerHTML = data.map(order => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-mono text-xs font-bold text-gray-600">${order.order_code}</td>
                <td class="px-4 py-3">
                    <div class="font-semibold">${order.customer_name}</div>
                    <div class="text-xs text-gray-500">${order.whatsapp_number}</div>
                </td>
                <td class="px-4 py-3 hidden md:table-cell">${order.service_type}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold border ${ORDER_STATUS[order.status]?.color || 'bg-gray-100 text-gray-600'}">
                        ${ORDER_STATUS[order.status]?.icon || '📦'} ${ORDER_STATUS[order.status]?.label || order.status}
                    </span>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">${formatDate(order.created_at).split(',')[0]}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="openModal('${order.id}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Detail">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        showNotification('Gagal memuat data', 'error');
        loading.classList.add('hidden');
    }
}

async function loadStats() {
    try {
        const { data } = await supabase.from('orders').select('status');
        if (!data) return;

        const counts = { menunggu: 0, proses: 0, selesai: 0, total: data.length };
        data.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

        document.getElementById('statMenunggu').textContent = counts.menunggu;
        document.getElementById('statProses').textContent = counts.proses;
        document.getElementById('statSelesai').textContent = counts.selesai;
        document.getElementById('statTotal').textContent = counts.total;
    } catch (e) { console.error(e); }
}

function filterTable() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#ordersTableBody tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}

// ========== MODAL & UPDATE ==========
async function openModal(id) {
    currentOrderId = id;
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    if (!order) return;

    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
                <span class="font-mono font-bold text-lg">${order.order_code}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold border ${ORDER_STATUS[order.status]?.color}">${ORDER_STATUS[order.status]?.icon} ${ORDER_STATUS[order.status]?.label}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-500">Nama</span><p class="font-semibold">${order.customer_name}</p></div>
                <div><span class="text-gray-500">Kelas</span><p class="font-semibold">${order.customer_class || '-'}</p></div>
                <div><span class="text-gray-500">WhatsApp</span><p class="font-semibold">${order.whatsapp_number}</p></div>
                <div><span class="text-gray-500">Layanan</span><p class="font-semibold">${order.service_type}</p></div>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg text-sm">
                <span class="text-gray-500 block mb-1">Pesan Customer:</span>
                <p class="whitespace-pre-wrap">${order.message || '-'}</p>
            </div>

            <div>
                <label class="text-sm font-semibold block mb-1">Update Status</label>
                <select id="modalStatus" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                    ${Object.entries(ORDER_STATUS).map(([k, v]) => `<option value="${k}" ${order.status === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`).join('')}
                </select>
            </div>

            <div>
                <label class="text-sm font-semibold block mb-1">Link Hasil (Google Drive/Dropbox)</label>
                <input id="modalResult" type="url" placeholder="https://..." class="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" value="${order.result_file_url || ''}">
            </div>

            <div>
                <label class="text-sm font-semibold block mb-1">Catatan Admin</label>
                <textarea id="modalNotes" rows="2" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Internal notes...">${order.admin_notes || ''}</textarea>
            </div>
        </div>
    `;

    document.getElementById('orderModal').classList.remove('hidden');
}

window.closeModal = () => {
    document.getElementById('orderModal').classList.add('hidden');
    currentOrderId = null;
};

window.updateOrder = async () => {
    if (!currentOrderId) return;
    const btn = document.getElementById('updateBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Menyimpan...`;

    try {
        const newStatus = document.getElementById('modalStatus').value;
        const resultUrl = document.getElementById('modalResult').value.trim();
        const notes = document.getElementById('modalNotes').value.trim();

        const { error } = await supabase.from('orders').update({
            status: newStatus,
            result_file_url: resultUrl || null,
            admin_notes: notes
        }).eq('id', currentOrderId);

        if (error) throw error;

        // Fetch updated data for WA notification
        const { data: updated } = await supabase.from('orders').select('*').eq('id', currentOrderId).single();

        // Send WA if status changed
        if (newStatus !== updated.status) {
            const waMsg = formatStatusUpdateMessage(updated, newStatus);
            sendToWhatsApp(updated.whatsapp_number, waMsg);
            showNotification('Status diupdate & notif WA terkirim! ✅', 'success');
        } else {
            showNotification('Data berhasil disimpan! 💾', 'success');
        }

        closeModal();
        loadOrders();
        loadStats();
    } catch (err) {
        console.error(err);
        showNotification('Gagal update data', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
};

// Expose to global for HTML onclick
window.openModal = openModal;