import { supabase } from '/teras/assets/js/supabase.js';

export function initQuiz(quizId, quizData) {
  
  // --- ELEMEN UI ---
  const quizUI = document.getElementById('quiz-ui');
  // ... sisa elemen UI ...

  // --- STATE KUIS & TIMER ---
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedOption = null;
  let questionTimer; // 1. Variabel untuk menyimpan timer

  // --- FUNGSI-FUNGSI ---
  function loadQuestion() {
    selectedOption = null;
    hideStatusMessage();

    if (currentQuestionIndex >= quizData.length) {
      showResults();
      return;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
    optionsList.innerHTML = '';
    optionsList.classList.remove('no-pointer-events');
    nextButton.disabled = false;

    currentQuestion.options.forEach(option => {
      const li = document.createElement('li');
      li.textContent = option;
      li.className = 'option-item border-2 border-gray-200 dark:border-slate-600 font-semibold py-3 px-4 rounded-lg cursor-pointer transition hover:bg-blue-100 dark:hover:bg-slate-700';
      li.addEventListener('click', () => {
        document.querySelectorAll('.option-item').forEach(item => item.classList.remove('selected'));
        li.classList.add('selected');
        selectedOption = option;
      });
      optionsList.appendChild(li);
    });

    nextButton.textContent = currentQuestionIndex === quizData.length - 1 ? 'Selesai' : 'Selanjutnya';
    
    startTimer(); // 3. Mulai timer untuk pertanyaan baru
  }

  // 2. FUNGSI BARU UNTUK TIMER
  function startTimer() {
    clearTimeout(questionTimer); // Hapus timer sebelumnya jika ada
    questionTimer = setTimeout(() => {
      handleTimeOut();
    }, 30000); // 30000 milidetik = 30 detik
  }

  function handleTimeOut() {
    selectedOption = null; // Pastikan tidak ada jawaban yang terpilih
    showStatusMessage('❌ TIME OUT', 'text-red-800 dark:text-red-300', 'bg-red-100 dark:bg-red-900/50');
    
    // Tunda sebentar sebelum lanjut agar pesan timeout terbaca
    setTimeout(() => {
      giveFeedback(); 
    }, 1000);
  }

  function giveFeedback() {
    clearTimeout(questionTimer); // 4. Hentikan timer karena sudah dijawab
    optionsList.classList.add('no-pointer-events');
    nextButton.disabled = true;
    const currentQuestion = quizData[currentQuestionIndex];
    const selectedLi = document.querySelector('.option-item.selected');

    if (selectedOption === currentQuestion.answer) {
      score++;
      selectedLi.classList.add('correct');
      showStatusMessage('Jawaban Benar! Bagus sekali!', 'text-green-800 dark:text-green-300', 'bg-green-100 dark:bg-green-900/50');
    } else {
      // Jika ada jawaban terpilih tapi salah
      if (selectedLi) {
        selectedLi.classList.add('incorrect');
      }
      // Jika tidak ada jawaban terpilih (karena timeout), status message sudah diatur oleh handleTimeOut()
      if (selectedOption !== null) {
        showStatusMessage('Jawaban kurang tepat.', 'text-orange-800 dark:text-orange-300', 'bg-orange-100 dark:bg-orange-900/50');
      }
    }

    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion();
    }, 1500);
  }

  async function showResults() {
    clearTimeout(questionTimer); // Pastikan timer berhenti saat kuis selesai
    quizUI.style.display = 'none';
    // ... sisa fungsi showResults ...
  }

  async function saveScoreToSupabase(finalScore) {
    // ... sisa fungsi saveScoreToSupabase ...
  }
  
  // ... sisa fungsi-fungsi lainnya ...

  // --- EVENT LISTENERS & INISIALISASI ---
  nextButton.addEventListener('click', () => {
    if (selectedOption === null) {
      showStatusMessage('Silakan pilih jawaban terlebih dahulu.', 'text-red-800 dark:text-red-300', 'bg-red-100 dark:bg-red-900/50');
      return;
    }
    giveFeedback();
  });

  loadQuestion();
}