document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const mainContent = document.getElementById("main-content");

  try {
    // Total Pengguna
    const { data: users, error: userError } = await supabase.from("profiles").select("*");
    if (userError) throw userError;
    document.getElementById("total-users").textContent = users.length;

    // Kuis Hari Ini
    const today = new Date().toISOString().split("T")[0];
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .gte("created_at", today);
    if (attemptsError) throw attemptsError;
    document.getElementById("quiz-attempts-today").textContent = attempts.length;

    // Leaderboard
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

    // Popular Quizzes Chart
    const { data: popularQuizzes, error: pqError } = await supabase
      .from("quiz_attempts")
      .select("quiz_name");
    if (pqError) throw pqError;

    const quizCounts = {};
    popularQuizzes.forEach(q => {
      quizCounts[q.quiz_name] = (quizCounts[q.quiz_name] || 0) + 1;
    });

    const ctx = document.getElementById("popular-quizzes-chart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(quizCounts),
        datasets: [{
          label: "Jumlah Percobaan",
          data: Object.values(quizCounts),
          backgroundColor: "rgba(75, 192, 192, 0.7)"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Recent Activity
    const { data: recent, error: recentError } = await supabase
      .from("quiz_attempts")
      .select("user_id, quiz_name, score, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (recentError) throw recentError;

    const recentBody = document.getElementById("recent-activity-body");
    recent.forEach(item => {
      const tr = document.createElement("tr");
      const waktu = new Date(item.created_at).toLocaleString("id-ID");
      tr.innerHTML = `
        <td class="py-2 px-6">${item.user_id}</td>
        <td class="py-2 px-6">${item.quiz_name}</td>
        <td class="py-2 px-6">${item.score}</td>
        <td class="py-2 px-6">${waktu}</td>
      `;
      recentBody.appendChild(tr);
    });

    loadingState.classList.add("hidden");
    mainContent.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
});