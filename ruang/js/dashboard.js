async function loadDashboard() {
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const mainContent = document.getElementById('main-content');

  try {
    let { data: profiles, error } = await supabase.from('profiles').select('*');

    if (error) throw error;

    document.getElementById('total-users').textContent = profiles.length;

    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    mainContent.classList.remove('hidden');

  } catch (err) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorState.innerText = "Error: " + err.message; // Tampilkan di layar
  }
}

loadDashboard();