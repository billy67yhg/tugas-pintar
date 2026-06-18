// js/config.js

// 🔗 SUPABASE CONNECTION
export const SUPABASE_URL = 'https://eocfazyvzzsmpxswmala.supabase.co'; // ← GANTI DENGAN URL KAMU
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2Zhenl2enpzbXB4c3dtYWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTk3ODksImV4cCI6MjA5NzMzNTc4OX0.R6ounPN0r9WMuW7AFOVWgrs0ldKoKN1UE9giJM-YrEU'; // ← GANTI DENGAN ANON KEY KAMU

// 📱 WHATSAPP ADMIN (Nomor kamu, pakai 62 di depan)
export const ADMIN_WHATSAPP = '6285176720067';

// 📦 ORDER STATUS CONFIG (Untuk tampilan badge warna-warni)
export const ORDER_STATUS = {
    menunggu: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '⏳' },
    proses: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: '🔄' },
    selesai: { label: 'Selesai', color: 'bg-green-100 text-green-800 border border-green-200', icon: '✅' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border border-red-200', icon: '❌' }
};

//  DAFTAR LAYANAN & HARGA DASAR
export const SERVICES = [
    { id: 'ppt', name: 'PPT Presentasi', basePrice: 15 },
    { id: 'poster', name: 'Poster Edukasi', basePrice: 35000 },
    { id: 'ringkasan', name: 'Ringkasan Materi', basePrice: 30000 },
    { id: 'makalah', name: 'Format Makalah', basePrice: 25000 },
    { id: 'cover', name: 'Desain Cover', basePrice: 10 },
    { id: 'infografis', name: 'Infografis', basePrice: 40000 }
];

// 🛠️ HELPER FUNCTIONS (Format Rupiah & Tanggal)
export const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};