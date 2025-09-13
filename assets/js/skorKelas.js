// /assets/js/skorKelas.js

import { supabase } from '/teras/assets/js/supabase.js';

async function updateTotalScore(classId) {
  const totalScoreElement = document.getElementById("total-score");

  if (!classId) {
    totalScoreElement.textContent = "Skor Kelas: ID Salah";
    return;
  }

  // Ambil hanya angka dari classId (contoh: "kelas01" -> "1")
  const classNumber = parseInt(classId.replace("kelas", ""), 10);

  // Tampilkan judul skor saat sedang memuat
  totalScoreElement.textContent = `Skor Kelas ${classNumber}: Memuat...`;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // REVISI: Tampilkan skor 0 dengan format baru jika user tidak login
    totalScoreElement.textContent = `Skor Kelas ${classNumber}: 0/400`;
    return;
  }

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

  const totalSkor = data.reduce((sum, row) => sum + (row.score || 0), 0);
  
  // REVISI: Tampilkan skor total dengan format baru
  totalScoreElement.textContent = `Skor Kelas ${classNumber}: ${totalSkor}/400`;
}

// Event listener (tidak ada perubahan)
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const segments = path.split('/');
  const classIndex = segments.indexOf('kelas');
  let classId = null;

  if (classIndex !== -1 && segments.length > classIndex + 1) {
    const numberId = segments[classIndex + 1];
    if (numberId) {
      classId = `kelas${numberId.padStart(2, '0')}`;
    }
  }
  updateTotalScore(classId);
});