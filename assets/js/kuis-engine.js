import { supabase } from '/teras/assets/js/supabase.js';

export function initQuiz(quizId, quizData) {

  // --- ELEMEN UI ---
  const quizUI = document.getElementById('quiz-ui');
  const resultsUI = document.getElementById('results-ui');
  const questionText = document.getElementById('question-text');
  const optionsList = document.getElementById('options-list');
  const nextButton = document.getElementById('next-button');
  const finalScoreSpan = document.getElementById('final-score');
  const scoreMessage = document.getElementById('score-message');
  const statusMessage = document.getElementById('status-message');
  const saveStatusMessage = document.getElementById('save-status-message');

  // --- STATE KUIS & TIMER ---
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedOption = null;
  let questionTimer;

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
    startTimer();
  }

  function startTimer() {
    clearTimeout(questionTimer);
    questionTimer = setTimeout(() => {
      handleTimeOut();
    }, 30000); // 30 detik
  }

  function handleTimeOut() {
    selectedOption = null;
    showStatusMessage('❌ TIME OUT', 'text-red-800 dark:text-red-300', 'bg-red-100 dark:bg-red-900/50');
    setTimeout(() => {
      giveFeedback();
    }, 1000);
  }

  function giveFeedback() {
    clearTimeout(questionTimer);
    optionsList.classList.add('no-pointer-events');
    nextButton.disabled = true;
    const currentQuestion = quizData[currentQuestionIndex];
    const selectedLi = document.querySelector('.option-item.selected');

    if (selectedOption === currentQuestion.answer) {
      score++;
      selectedLi.classList.add('correct');
      showStatusMessage('Jawaban Benar! Bagus sekali!', 'text-green-800 dark:text-green-300', 'bg-green-100 dark:bg-green-900/50');
    } else {
      if (selectedLi) {
        selectedLi.classList.add('incorrect');
      }
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
    clearTimeout(questionTimer);
    quizUI.style.display = 'none';
    resultsUI.style.display = 'block';

    const finalScore = score * 10;
    finalScoreSpan.textContent = finalScore;

    if (finalScore === 100) {
      scoreMessage.textContent = 'Masya Allah! Anda mendapatkan skor sempurna!';
    } else if (finalScore >= 70) {
      scoreMessage.textContent = 'Kerja bagus! Anda berhasil melewati kuis ini.';
    } else {
      scoreMessage.textContent = 'Terus semangat belajar, ya! Anda bisa coba lagi.';
    }

    await saveScoreToSupabase(finalScore);
  }

  async function saveScoreToSupabase(finalScore) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showSaveStatusMessage('Anda belum masuk untuk menyimpan skor.', 'text-orange-800 dark:text-orange-300', 'bg-orange-100 dark:bg-orange-900/50');
      return;
    }
    
    const classId = quizId.split('_')[0];

    const { error } = await supabase
      .from('quiz_attempts')
      .upsert({ 
        user_id: user.id, 
        quiz_id: quizId, 
        score: finalScore,
        class_id: classId
      }, { onConflict: ['user_id', 'quiz_id'] });

    if (error) {
      console.error("Supabase Error:", error);
      showSaveStatusMessage('Gagal menyimpan skor Anda.', 'text-red-800 dark:text-red-300', 'bg-red-100 dark:bg-red-900/50');
    } else {
      showSaveStatusMessage('Skor Anda berhasil dicatat!', 'text-green-800 dark:text-green-300', 'bg-green-100 dark:bg-green-900/50');
    }
  }

  function showStatusMessage(message, textColor, bgColor) {
    statusMessage.textContent = message;
    statusMessage.className = `mt-4 p-3 rounded-lg text-sm font-semibold text-center ${textColor} ${bgColor}`;
    statusMessage.classList.remove('hidden');
  }



  function hideStatusMessage() {
    statusMessage.classList.add('hidden');
  }

  function showSaveStatusMessage(message, textColor, bgColor) {
    saveStatusMessage.textContent = message;
    saveStatusMessage.className = `mt-4 p-3 rounded-lg text-sm font-semibold text-center ${textColor} ${bgColor}`;
    saveStatusMessage.classList.remove('hidden');
  }

  // --- EVENT LISTENERS & INISIALISASI ---
  nextButton.addEventListener('click', () => {
    if (selectedOption === null) {
      showStatusMessage('Silakan pilih jawaban terlebih dahulu.', 'text-red-800 dark:text-red-300', 'bg-red-100 dark:bg-red-900/50');
      return;
    }
    giveFeedback();
  });

  loadQuestion(); // Memulai kuis
}