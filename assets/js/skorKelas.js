// /assets/js/skorKelas.js
import { supabase } from '/teras/assets/js/supabase.js';

// Ambil classId dari URL (contoh: /kelas/2/ -> kelas02)
function getClassIdFromUrl() {
  const path = window.location.pathname;
  const segments = path.split('/');

  const kelasIndex = segments.indexOf('kelas');
  if (kelasIndex !== -1 && segments.length > kelasIndex + 1) {
    const numberId = segments[kelasIndex + 1]; // contoh "2"
    if (numberId && !isNaN(numberId)) {
      return `kelas${numberId.padStart(2, '0')}`; // hasil: kelas02
    }
  }
  return null;
}

async function updateTotalScore() {
  const totalScoreElement = document.getElementById("total-score");
  const classId = getClassIdFromUrl();

  if (!classId) {
    totalScoreElement.textContent = "Skor Kelas: ID Salah";
    return;
  }

  // Ambil hanya angka untuk ditampilkan
  const classNumber = parseInt(classId.replace("kelas", ""), 10);

  // Tampilkan placeholder loading
  totalScoreElement.textContent = `Skor Kelas ${classNumber}: Memuat...`;

  // Ambil user login
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    totalScoreElement.textContent = `Skor Kelas ${classNumber}: 0`;
    return;
  }

  // Ambil skor berdasarkan user + classId
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score")
    .eq("user_id", user.id)
    .eq("class_id", classId);

  if (error) {
    console.error("Supabase error:", error);
    totalScoreElement.textContent = `Skor Kelas ${classNumber}: Gagal Muat`;
    return;
  }

  // Hitung total skor
  const totalSkor = (data || []).reduce((sum, row) => sum + (row.score || 0), 0);

  totalScoreElement.textContent = `Skor Kelas ${classNumber}: ${totalSkor}`;
}

// Jalankan setelah halaman siap
document.addEventListener("DOMContentLoaded", updateTotalScore);