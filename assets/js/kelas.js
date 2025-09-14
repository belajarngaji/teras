

    // --- LEADERBOARD UMUM ---
    async function getLeaderboardData() {
      const { data, error } = await supabaseClient
        .from('leaderboard')
        .select('rank, username, total_score')
        .limit(3);
      if (error) {
        console.error('Error fetching leaderboard data:', error.message);
        document.getElementById('leaderboard-body').innerHTML = `<tr><td colspan="3" class="py-4 text-center text-red-500">Error: ${error.message}</td></tr>`;
        return null;
      }
      return data;
    }

    function renderLeaderboard(users) {
      document.getElementById('leaderboard-loading').classList.add('hidden');
      const leaderboardBody = document.getElementById('leaderboard-body');
      if (leaderboardBody.innerHTML.includes('Error:')) return;
      leaderboardBody.innerHTML = '';
      if (!users || users.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-500">Belum ada skor yang tercatat.</td></tr>';
        return;
      }
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.rank}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${user.username}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.total_score || 0}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    }

    async function fetchAndRenderLeaderboard() {
      const leaderboardData = await getLeaderboardData();
      if (leaderboardData) renderLeaderboard(leaderboardData);
    }

    // --- LEADERBOARD TANTANGAN TOP 1 ---
async function loadTopDashboardUser() {
  const { data: leaderboard, error } = await supabaseClient
    .from('profiles')
    .select('username, dashboard_score_total')
    .order('dashboard_score_total', { ascending: false })
    .limit(1);

  const container = document.getElementById('leaderboard-dashboard-single');

  if (error) {
    console.error("Gagal load leaderboard Tantangan:", error);
    container.textContent = "Gagal memuat leaderboard";
    return;
  }

  if (!leaderboard || leaderboard.length === 0) {
    container.textContent = "Belum ada skor Tantangan";
    return;
  }

  // Ambil user pertama (top 1)
  const user = leaderboard[0];
  const score = user.dashboard_score_total ?? 0; // fallback ke 0 jika null

  container.innerHTML = `
    <span class="block text-2xl font-bold">${user.username}</span>
    <span class="block mt-1 text-lg font-semibold text-amber-900 dark:text-amber-200">${score} poin</span>
  `;
}
    document.addEventListener('DOMContentLoaded', () => {
      loadTopDashboardUser();  // Leaderboard Tantangan top 1
      fetchAndRenderLeaderboard(); // Leaderboard umum top 3
    });