// ============================================================
// Bubble "Run JavaScript" reference — Insight Feature
// ============================================================
// Copy-paste into Bubble's "Run JavaScript" actions.
// Dynamic Bubble expressions go at the top as `var` declarations.
// ============================================================

// ── Send Questions to JS (after fetch_questions action) ─────
// Trigger: When output1 is "fetch_questions"
// Place in: Bubble workflow → Run JavaScript

var question1Id = `BUBBLE_EXPRESSION_question1_id`;
var question1Text = `BUBBLE_EXPRESSION_question1_text`;
var question1VideoUrl = `BUBBLE_EXPRESSION_question1_video_url`;
var question2Id = `BUBBLE_EXPRESSION_question2_id`;
var question2Text = `BUBBLE_EXPRESSION_question2_text`;
var question2VideoUrl = `BUBBLE_EXPRESSION_question2_video_url`;
var question3Id = `BUBBLE_EXPRESSION_question3_id`;
var question3Text = `BUBBLE_EXPRESSION_question3_text`;
var question3VideoUrl = `BUBBLE_EXPRESSION_question3_video_url`;
var ttsApiKey = `BUBBLE_EXPRESSION_tts_api_key`;

window.appUI.onInsightQuestions({
  questions: [
    { id: question1Id, text: question1Text, videoUrl: question1VideoUrl },
    { id: question2Id, text: question2Text, videoUrl: question2VideoUrl },
    { id: question3Id, text: question3Text, videoUrl: question3VideoUrl },
  ],
  ttsApiKey: ttsApiKey,
});


// ── Send Generated Insight to JS ────────────────────────────
// Trigger: When insight generation is complete
// Place in: Bubble workflow → Run JavaScript

var insightId = `BUBBLE_EXPRESSION_insight_id`;
var insightTitle = `BUBBLE_EXPRESSION_insight_title`;
var insightText = `BUBBLE_EXPRESSION_insight_text`;
var insightVideoUrl = `BUBBLE_EXPRESSION_insight_video_url`;
var insightAudioUrl = `BUBBLE_EXPRESSION_insight_audio_url`;

window.appUI.onInsightData({
  insightId: insightId,
  title: insightTitle,
  text: insightText,
  videoUrl: insightVideoUrl,
  audioUrl: insightAudioUrl || null,
});


// ── Parse answer payload (from "answer" action) ─────────────
// Trigger: When output1 is "answer"
// Place in: Bubble workflow → Run JavaScript

var payload = `BUBBLE_EXPRESSION_output2`;
var parsed = JSON.parse(payload);
// parsed.questionIndex — 0, 1, or 2
// parsed.questionId — the question's unique ID
// parsed.answer — "yes", "no", or "other"
// parsed.otherText — free text (only when answer is "other")


// ── Parse generate payload ──────────────────────────────────
// Trigger: When output1 is "generate"
// Place in: Bubble workflow → Run JavaScript

var payload = `BUBBLE_EXPRESSION_output2`;
var parsed = JSON.parse(payload);
// parsed.type — "learn" or "activity"
// parsed.activityId — only for activity type
// parsed.answers — array of answer objects (only for learn type)
