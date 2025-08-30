document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const mainContent = document.getElementById("main-content");

  try {
    // Ambil data pengguna
    const { data: users, error: userError } = await supabase.from("profiles").select("*");
    if (userError) throw userError;
    document.getElementById("total-users").textContent = users.length;

    // Ambil kuis hari ini
    const today = new Date().toISOString().split("T")[0];
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .gte("created_at", today);
    if (attemptsError) throw attemptsError;
    document.getElementById("quiz-attempts-today").textContent = attempts.length;

    // Leaderboard (contoh hanya limit 10)
    const { data: leaderboard, error: lbError } = await supabase
      .from("quiz_attempts")
      .select("user_id, score")
      .order("score", { ascending: false })
      .limit(10);
    if (lbError) throw lbError;

    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboard.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-2 px-6">${index + 1}</td>
        <td class="py-2 px-6">${row.user_id}</td>
        <td class="py-2 px-6">${row.score}</td>
      `;
      leaderboardBody.appendChild(tr);
    });

    // Tampilkan konten
    loadingState.classList.add("hidden");
    mainContent.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
});