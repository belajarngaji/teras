async function loadData() {
  const { data: profiles } = await window.supabaseClient.from('profiles').select('*');
  const { data: attempts } = await window.supabaseClient.from('quiz_attempts').select('*');

  document.getElementById('profiles').innerHTML =
    `<h2>Profiles</h2><pre>${JSON.stringify(profiles, null, 2)}</pre>`;

  document.getElementById('quiz_attempts').innerHTML =
    `<h2>Quiz Attempts</h2><pre>${JSON.stringify(attempts, null, 2)}</pre>`;
}

loadData();