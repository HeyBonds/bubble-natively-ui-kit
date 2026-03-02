// ============================================================
// FETCH DAILY QUESTION
// Trigger: Custom Event "Fetch Daily Question"
// Pre-steps: Set states on Daily Question group (search + options)
// ============================================================

// --- Bubble fields ---
var questionId = `Daily Question's daily_question's unique id`;
var category = `Daily Question's daily_question's topic`;
var question = `Daily Question's daily_question's question`;
var options = `Daily Question's daily_question_options:format as text`;
var selectedAnswer = `Daily Question's daily_question_user_answer's selectedIndex`;

// --- JS ---
window.appUI.setDailyQuestion({
    questionId: questionId,
    category: category,
    question: question,
    options: options,
    selectedAnswer: selectedAnswer
});


// ============================================================
// VOTE — Push updates back to React (partial)
// Trigger: Custom Event "Vote" — after DB writes
// Pre-steps: Create UserDailyQuestionAnswer, Update user credits +1
// ============================================================

// --- Bubble fields ---
var credits = `Current User's credits`;
var options = `Daily Question's daily_question_options:format as text`;
var selectedIndex = `JSONReader - Daily Question's field2`;

// --- JS ---
window.appUI.setUserData({ credits: credits });
window.appUI.setDailyQuestion({
    options: options,
    selectedAnswer: selectedIndex
});
