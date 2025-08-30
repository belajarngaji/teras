async function loadDashboard() {
  try {
    // Ambil total pengguna dari tabel profiles
    const { data: profiles, error } = await window.supabase
      .from("profiles")
      .select("*");

    if (error) throw error;

    document.getElementById("total-users").textContent = profiles.length;

    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");

  } catch (err) {
    console.error("Gagal memuat dashboard:", err.message);
    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("error-state").classList.remove("hidden");
    document.getElementById("error-state").textContent = "Gagal memuat data";
  }
}

loadDashboard();