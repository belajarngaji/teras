// /assets/js/skorKelas.js

// Impor client supabase dari file eksternal
import { supabase } from '/teras/assets/js/supabaseclient.js';

// Fungsi untuk mengambil dan menampilkan skor
async function updateTotalScore(classId) {
  if (!classId) {
    document.getElementById("total-score").textContent = "Skor: ID Kelas Salah";
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    document.getElementById("total-score").textContent = "Skor: 0/400";
    return;
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score")
    .eq("user_id", user.id)
    .eq("class_id", classId);

  if (error) {
    console.error("Supabase error:", error);
    document.getElementById("total-score").textContent = "Gagal Memuat Skor";
    return;
  }

  const totalSkor = data.reduce((sum, row) => sum + (row.score || 0), 0);
  document.getElementById("total-score").textContent = `Skor: ${totalSkor}/400`;
}

// Event listener untuk menjalankan fungsi saat halaman dimuat
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