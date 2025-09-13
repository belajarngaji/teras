// --- assets/js/profil.js ---

// UBAH NAMA VARIABEL DI SINI
import { supabase } from "./supabase.js";

const profileInitial = document.getElementById("profile-initial");
const profilePhoto = document.getElementById("profile-photo");
const usernameDisplay = document.getElementById("username-display");
const totalScoreDisplay = document.getElementById("total-score-display");
const dashboardScoreDisplay = document.getElementById("dashboard-score-display");
const historyTableBody = document.getElementById("history-table-body");
const authButtons = document.getElementById("auth-buttons");
const loadingContainer = document.getElementById("loading-container");

const modal = document.getElementById("avatar-modal");
const closeModalBtn = document.getElementById("close-modal");
const preview = document.getElementById("preview");
const avatarInput = document.getElementById("avatarInput");
const uploadBtn = document.getElementById("uploadBtn");

let currentUser = null;

// --- Profil Initialization ---
async function initializeProfilePage() {
  // Baris ini sekarang sudah benar karena kita mengimpor 'supabase'
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    loadingContainer.style.display = "block";
    historyTableBody.innerHTML = "";
    await Promise.all([
      loadUserProfile(user.id),
      loadQuizHistory(user.id)
    ]);
    setupLogoutButton();
  } else {
    showLoginPrompt();
  }
}

async function loadUserProfile(userId) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, dashboard_score_total, avatar_url")
    .eq("id", userId)
    .single();

  if (profile) {
    usernameDisplay.textContent = profile.username;
    dashboardScoreDisplay.textContent = profile.dashboard_score_total || 0;

    if (profile.avatar_url) {
      profilePhoto.src = profile.avatar_url;
      preview.src = profile.avatar_url;
      profilePhoto.classList.remove("hidden");
      profileInitial.classList.add("hidden");
    } else {
      profileInitial.textContent = profile.username.charAt(0).toUpperCase();
      profilePhoto.classList.add("hidden");
      profileInitial.classList.remove("hidden");
    }
  } else {
    console.error("Gagal memuat profil:", error);
    usernameDisplay.textContent = "Gagal Memuat";
  }
}

async function loadQuizHistory(userId) {
  const { data: history, error } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, submitted_at")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  loadingContainer.style.display = "none";
  if (history && history.length > 0) {
    let totalScore = 0;
    const historyHtml = history.map((attempt, index) => {
      totalScore += attempt.score;
      const date = new Date(attempt.submitted_at).toLocaleDateString("id-ID");
      return `
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <td class="py-3 px-2 text-center">${index + 1}</td>
          <td class="py-3 px-2 capitalize">${attempt.quiz_id.replace(/_/g, " ")}</td>
          <td class="py-3 px-2 text-center font-semibold">${attempt.score}</td>
          <td class="py-3 px-2 text-center">${date}</td>
        </tr>
      `;
    }).join("");
    historyTableBody.innerHTML = historyHtml;
    totalScoreDisplay.textContent = totalScore;
  } else {
    historyTableBody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">Belum ada riwayat kuis.</td></tr>`;
  }
  if (error) {
    console.error("Gagal memuat riwayat kuis:", error);
  }
}

function setupLogoutButton() {
  authButtons.innerHTML = `<button id="logout-button" class="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">Keluar</button>`;
  document.getElementById("logout-button").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/teras/masuk/";
  });
}

function showLoginPrompt() {
  loadingContainer.style.display = "none";
  usernameDisplay.textContent = "Anda Belum Masuk";
  profileInitial.textContent = "?";
  historyTableBody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">Masuk untuk melihat riwayat.</td></tr>`;
  authButtons.innerHTML = `
    <a href="/teras/daftar/" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition text-center">Daftar</a>
    <a href="/teras/masuk/" class="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition text-center">Masuk</a>
  `;
}

// --- Upload Avatar dengan kompres ---
async function uploadAvatar(file, userId) {
  if (!file) {
    alert("Pilih file dulu!");
    return;
  }

  // kompres dulu sebelum upload
  new Compressor(file, {
    width: 200,   // maksimal lebar px
    height: 200,  // maksimal tinggi px
    quality: 0.8, // kualitas (0-1)
    success: async (compressedFile) => {
      const fileName = `${userId}_${Date.now()}.${compressedFile.name.split(".").pop()}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, compressedFile, { upsert: true });

      if (error) {
        console.error(error);
        alert("Upload gagal: " + error.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error(updateError);
        alert("Gagal simpan avatar.");
      } else {
        profilePhoto.src = publicUrl;
        preview.src = publicUrl;
        profilePhoto.classList.remove("hidden");
        profileInitial.classList.add("hidden");
        modal.classList.add("hidden");
        alert("Foto profil berhasil diperbarui!");
      }
    },
    error(err) {
      console.error(err);
      alert("Gagal kompres gambar: " + err.message);
    },
  });
}

// --- Modal Events ---
document.getElementById("profile-photo-wrapper").addEventListener("click", () => {
  if (!currentUser) return;
  modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

uploadBtn.addEventListener("click", async () => {
  const file = avatarInput.files[0];
  if (currentUser) {
    await uploadAvatar(file, currentUser.id);
  }
});

document.addEventListener("DOMContentLoaded", initializeProfilePage);