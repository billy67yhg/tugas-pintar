// js/order-tracker.js
import { SUPABASE_URL, SUPABASE_ANON_KEY, ORDER_STATUS, formatDate } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('trackerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const codeInput = document.getElementById('orderCode');
    const btn = document.getElementById('checkBtn');
    const resultArea = document.getElementById('resultArea');
    const errorArea = document.getElementById('errorArea');
    const errorMsg = document.getElementById('errorMsg');

    const code = codeInput.value.trim().toUpperCase();

    // Reset UI
    resultArea.classList.add('hidden');
    errorArea.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Mencari...`;

    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_code', code)
            .single();

        if (error || !order) {
            throw new Error('Pesanan tidak ditemukan. Periksa kembali kode pesanan.');
        }

        // Populate Data
        document.getElementById('resCode').textContent = order.order_code;
        document.getElementById('resName').textContent = order.customer_name;
        document.getElementById('resService').textContent = order.service_type;

        // Status Badge
        const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '📦' };
        const badge = document.getElementById('resBadge');
        badge.className = `px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`;
        badge.innerHTML = `${statusInfo.icon} ${statusInfo.label}`;

        // File Result (if available)
        const fileSection = document.getElementById('resFileSection');
        if (order.result_file_url) {
            document.getElementById('resFileLink').href = order.result_file_url;
            fileSection.classList.remove('hidden');
        } else {
            fileSection.classList.add('hidden');
        }

        resultArea.classList.remove('hidden');

    } catch (err) {
        errorMsg.textContent = err.message || 'Terjadi kesalahan sistem.';
        errorArea.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined">search</span> Cek Status`;
    }
});