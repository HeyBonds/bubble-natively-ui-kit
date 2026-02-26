const mockJourneyData = {
    chapters: [
        // ── Chapter 1: Communication (completed) ────────────────────────
        {
            title: 'Communication',
            index: 1,
            nodes: [
                { id: 1, type: 'learn', title: 'Learn', status: 'completed' },
                { id: 2, type: 'practice', title: 'Practice', status: 'completed' },
                { id: 3, type: 'insight', title: 'Insight', status: 'completed' },
                { id: 4, type: 'act', title: 'Act', status: 'completed' },
                { id: 5, type: 'milestone', title: 'Milestone', status: 'completed' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/communication-lesson.mp4',
                lessonScript: 'Communication is the foundation of every strong relationship. In this lesson, you\'ll learn the difference between hearing and truly listening — and how small shifts in how you speak and respond can transform your connection with your partner.',
                lessonQuestions: [
                    {
                        question: 'What is active listening?',
                        answers: [
                            'Waiting for your turn to speak',
                            'Fully focusing on and understanding the speaker',
                            'Repeating everything back word for word',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'Which response shows empathetic communication?',
                        answers: [
                            '"I understand why that would be frustrating for you"',
                            '"You shouldn\'t feel that way"',
                            '"Just calm down and think logically"',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'What is a "you" statement vs an "I" statement?',
                        answers: [
                            '"You" statements express ownership, "I" statements assign blame',
                            'They mean the same thing',
                            '"You" statements assign blame, "I" statements express ownership',
                        ],
                        correctAnswer: 2,
                    },
                ],
                practiceSkills: [
                    'Reflective listening during a disagreement',
                    'Asking open-ended questions instead of yes/no',
                    'Paraphrasing your partner\'s feelings before responding',
                ],
                insightQuestions: [
                    'Do you feel truly heard in your relationship?',
                    'Can you identify your communication triggers?',
                    'Do you tend to shut down or escalate during conflict?',
                ],
                insightVideo: 'https://example.com/videos/communication-insight.mp4',
                actDescription: 'Have a 10-minute conversation with your partner where you only ask open-ended questions and reflect back what they say.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 2: Emotional Safety (completed) ─────────────────────
        {
            title: 'Emotional Safety',
            index: 2,
            nodes: [
                { id: 6, type: 'learn', title: 'Learn', status: 'completed' },
                { id: 7, type: 'practice', title: 'Practice', status: 'completed' },
                { id: 8, type: 'insight', title: 'Insight', status: 'completed' },
                { id: 9, type: 'act', title: 'Act', status: 'completed' },
                { id: 10, type: 'milestone', title: 'Milestone', status: 'completed' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/emotional-safety-lesson.mp4',
                lessonScript: 'Emotional safety is the invisible foundation of a healthy relationship. When both partners feel safe to be vulnerable, honest, and imperfect, real intimacy can grow. This lesson explores what emotional safety looks like and how to nurture it daily.',
                lessonQuestions: [
                    {
                        question: 'What is emotional safety in a relationship?',
                        answers: [
                            'Feeling secure enough to be vulnerable without fear of judgment',
                            'Never disagreeing with your partner',
                            'Avoiding difficult conversations',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'Which behavior undermines emotional safety?',
                        answers: [
                            'Validating your partner\'s feelings even when you disagree',
                            'Asking clarifying questions during disagreements',
                            'Dismissing your partner\'s concerns as overreacting',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'How can you rebuild emotional safety after a breach?',
                        answers: [
                            'Pretend nothing happened',
                            'Acknowledge the hurt, take responsibility, and show changed behavior',
                            'Give your partner space indefinitely',
                        ],
                        correctAnswer: 1,
                    },
                ],
                practiceSkills: [
                    'Naming your emotions out loud to your partner',
                    'Responding to vulnerability with curiosity instead of advice',
                    'Creating a daily check-in ritual (2 minutes each)',
                ],
                insightQuestions: [
                    'When was the last time you felt truly safe being vulnerable?',
                    'What makes you pull away emotionally?',
                    'Do you trust your partner to hold your feelings gently?',
                ],
                insightVideo: 'https://example.com/videos/emotional-safety-insight.mp4',
                actDescription: 'Share one thing you\'ve been afraid to tell your partner. Start with "I feel..." and let them respond without interruption.',
                actDaysToPerform: 1,
            },
        },

        // ── Chapter 3: Intimacy (completed) ─────────────────────────────
        {
            title: 'Intimacy',
            index: 3,
            nodes: [
                { id: 11, type: 'learn', title: 'Learn', status: 'completed' },
                { id: 12, type: 'practice', title: 'Practice', status: 'completed' },
                { id: 13, type: 'insight', title: 'Insight', status: 'completed' },
                { id: 14, type: 'act', title: 'Act', status: 'completed' },
                { id: 15, type: 'milestone', title: 'Milestone', status: 'completed' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/intimacy-lesson.mp4',
                lessonScript: 'Intimacy goes far beyond physical closeness. Emotional, intellectual, and experiential intimacy are the threads that weave two lives together. Learn the five types of intimacy and how to cultivate each one.',
                lessonQuestions: [
                    {
                        question: 'Which is NOT one of the five types of intimacy?',
                        answers: [
                            'Emotional intimacy',
                            'Intellectual intimacy',
                            'Financial intimacy',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'What often causes intimacy to fade over time?',
                        answers: [
                            'Spending too much time together',
                            'Taking each other for granted and stopping intentional connection',
                            'Having different hobbies',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'How can you deepen emotional intimacy?',
                        answers: [
                            'Share your fears and dreams regularly',
                            'Only talk about practical matters',
                            'Wait for your partner to open up first',
                        ],
                        correctAnswer: 0,
                    },
                ],
                practiceSkills: [
                    'Sharing a childhood memory you\'ve never told your partner',
                    'Planning a surprise experience based on your partner\'s love language',
                    'Spending 15 minutes together with no screens, just talking',
                ],
                insightQuestions: [
                    'Which type of intimacy feels strongest in your relationship?',
                    'Which type of intimacy do you crave more of?',
                    'When do you feel closest to your partner?',
                ],
                insightVideo: 'https://example.com/videos/intimacy-insight.mp4',
                actDescription: 'Plan and execute a "connection date" — no phones, no distractions. Spend one hour doing something your partner loves, fully present.',
                actDaysToPerform: 3,
            },
        },

        // ── Chapter 4: Conflict Resolution (paused — waiting for tomorrow) ──
        {
            title: 'Conflict Resolution',
            index: 4,
            nodes: [
                { id: 16, type: 'learn', title: 'Learn', status: 'paused' },
                { id: 17, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 18, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 19, type: 'act', title: 'Act', status: 'locked' },
                { id: 20, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/conflict-resolution-lesson.mp4',
                lessonScript: 'Every couple fights — but how you fight determines whether conflict strengthens or weakens your bond. This lesson covers the four horsemen of relationship conflict, de-escalation techniques, and how to repair after a rupture.',
                lessonQuestions: [
                    {
                        question: 'Which is one of Gottman\'s "Four Horsemen" of conflict?',
                        answers: [
                            'Active listening',
                            'Contempt',
                            'Compromise',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'What is a "repair attempt" during conflict?',
                        answers: [
                            'Apologizing even when you\'re right',
                            'Changing the subject to avoid the argument',
                            'Any effort to de-escalate tension and reconnect',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'When is the best time to discuss a recurring conflict?',
                        answers: [
                            'When both partners are calm and have agreed to talk',
                            'Never — just let it go',
                            'In the heat of the moment',
                        ],
                        correctAnswer: 0,
                    },
                ],
                practiceSkills: [
                    'Using a "soft start-up" instead of a harsh opener',
                    'Taking a 20-minute break when flooded, then returning',
                    'Expressing needs without blaming ("I need..." not "You always...")',
                ],
                insightQuestions: [
                    'What is your default conflict style — fight, flight, or freeze?',
                    'Can you think of a fight that actually brought you closer?',
                    'What does your partner do that helps you calm down during conflict?',
                ],
                insightVideo: 'https://example.com/videos/conflict-resolution-insight.mp4',
                actDescription: 'Choose one recurring minor conflict. Sit down with your partner and use the soft start-up technique to discuss it. Focus on understanding, not winning.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 5: Attachment Styles (locked) ───────────────────────
        {
            title: 'Attachment Styles',
            index: 5,
            nodes: [
                { id: 21, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 22, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 23, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 24, type: 'act', title: 'Act', status: 'locked' },
                { id: 25, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/attachment-styles-lesson.mp4',
                lessonScript: 'Your attachment style — formed in childhood — shapes how you love, fight, and connect as an adult. Understanding your own and your partner\'s attachment patterns is the key to breaking unhelpful cycles.',
                lessonQuestions: [
                    {
                        question: 'How many primary attachment styles are there?',
                        answers: [
                            'Four',
                            'Two',
                            'Six',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'What characterizes an anxious attachment style?',
                        answers: [
                            'Preferring independence and avoiding vulnerability',
                            'Craving closeness and fearing abandonment',
                            'Feeling comfortable with both closeness and independence',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'Can attachment styles change over time?',
                        answers: [
                            'No, they are fixed for life',
                            'Only with medication',
                            'Yes, through awareness, therapy, and secure relationships',
                        ],
                        correctAnswer: 2,
                    },
                ],
                practiceSkills: [
                    'Identifying your attachment triggers in real time',
                    'Communicating your needs without testing your partner',
                    'Self-soothing when your attachment alarm goes off',
                ],
                insightQuestions: [
                    'Which attachment style do you most identify with?',
                    'How does your attachment style show up when you feel threatened?',
                    'What did love look like in your childhood home?',
                ],
                insightVideo: 'https://example.com/videos/attachment-styles-insight.mp4',
                actDescription: 'Take an attachment style quiz together with your partner. Discuss your results openly — what surprised you and what felt familiar.',
                actDaysToPerform: 1,
            },
        },

        // ── Chapter 6: Shared Values (locked) ──────────────────────────
        {
            title: 'Shared Values',
            index: 6,
            nodes: [
                { id: 26, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 27, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 28, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 29, type: 'act', title: 'Act', status: 'locked' },
                { id: 30, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/shared-values-lesson.mp4',
                lessonScript: 'Shared values are the compass of your relationship. They guide big decisions — where to live, how to raise kids, what to prioritize. This lesson helps you uncover your core values and find alignment with your partner.',
                lessonQuestions: [
                    {
                        question: 'Why are shared values important in a relationship?',
                        answers: [
                            'Partners should agree on everything',
                            'They eliminate all disagreements',
                            'They provide a foundation for major life decisions together',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'What should you do when core values differ?',
                        answers: [
                            'Have honest conversations about non-negotiables and find compromises',
                            'Ignore the differences and hope they resolve',
                            'One partner should give in completely',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'Which is an example of a core value?',
                        answers: [
                            'Preferring Italian food over Mexican',
                            'Commitment to family and community',
                            'Liking the same TV shows',
                        ],
                        correctAnswer: 1,
                    },
                ],
                practiceSkills: [
                    'Listing your top 5 non-negotiable values independently',
                    'Comparing value lists with your partner without judgment',
                    'Creating a shared "relationship mission statement"',
                ],
                insightQuestions: [
                    'What values did you grow up with that you still hold?',
                    'Are there values you and your partner disagree on?',
                    'What does your ideal life together look like in 5 years?',
                ],
                insightVideo: 'https://example.com/videos/shared-values-insight.mp4',
                actDescription: 'Each write down your top 5 values independently, then compare. Discuss where you align and where you differ — without trying to change each other.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 7: Trust Building (locked) ─────────────────────────
        {
            title: 'Trust Building',
            index: 7,
            nodes: [
                { id: 31, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 32, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 33, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 34, type: 'act', title: 'Act', status: 'locked' },
                { id: 35, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/trust-building-lesson.mp4',
                lessonScript: 'Trust isn\'t built in grand gestures — it\'s built in hundreds of small moments. Every time you show up, keep a promise, or choose honesty, you\'re depositing into your relationship\'s trust bank. Learn how trust works and how to rebuild it when broken.',
                lessonQuestions: [
                    {
                        question: 'How is trust primarily built in a relationship?',
                        answers: [
                            'Through one big romantic gesture',
                            'Through consistent small actions over time',
                            'By never making mistakes',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'What is the first step in rebuilding broken trust?',
                        answers: [
                            'The person who broke trust taking full accountability',
                            'Forgetting what happened',
                            'Setting strict rules for the other person',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'What destroys trust the fastest?',
                        answers: [
                            'Honest disagreements',
                            'Spending time apart',
                            'Deception and hidden information',
                        ],
                        correctAnswer: 2,
                    },
                ],
                practiceSkills: [
                    'Following through on one small promise today',
                    'Being transparent about something you\'d normally keep to yourself',
                    'Acknowledging when your partner trusts you with something difficult',
                ],
                insightQuestions: [
                    'On a scale of 1-10, how much do you trust your partner?',
                    'Has trust ever been broken in your relationship?',
                    'What does your partner do that makes you trust them more?',
                ],
                insightVideo: 'https://example.com/videos/trust-building-insight.mp4',
                actDescription: 'Make three small promises to your partner this week and keep every one. At the end of the week, talk about how it felt.',
                actDaysToPerform: 3,
            },
        },

        // ── Chapter 8: Emotional Intelligence (locked) ──────────────────
        {
            title: 'Emotional Intelligence',
            index: 8,
            nodes: [
                { id: 36, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 37, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 38, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 39, type: 'act', title: 'Act', status: 'locked' },
                { id: 40, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/emotional-intelligence-lesson.mp4',
                lessonScript: 'Emotional intelligence (EQ) is your ability to recognize, understand, and manage your own emotions — and to recognize and influence the emotions of others. In relationships, high EQ means fewer misunderstandings and deeper connection.',
                lessonQuestions: [
                    {
                        question: 'What are the four pillars of emotional intelligence?',
                        answers: [
                            'Self-awareness, self-management, social awareness, relationship management',
                            'Happiness, sadness, anger, fear',
                            'Thinking, feeling, acting, reflecting',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'How does emotional intelligence help in relationships?',
                        answers: [
                            'It helps you win arguments',
                            'It makes you feel less emotion overall',
                            'It helps you understand and regulate both your own and your partner\'s emotions',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'What is emotional regulation?',
                        answers: [
                            'Suppressing your emotions',
                            'The ability to manage your emotional responses appropriately',
                            'Always staying calm no matter what',
                        ],
                        correctAnswer: 1,
                    },
                ],
                practiceSkills: [
                    'Labeling your emotion before reacting ("I notice I\'m feeling...")',
                    'Pausing for 5 seconds before responding when triggered',
                    'Asking your partner "What are you feeling right now?" with genuine curiosity',
                ],
                insightQuestions: [
                    'Which emotions are hardest for you to sit with?',
                    'Do you tend to intellectualize feelings instead of feeling them?',
                    'How did your family handle emotions when you were growing up?',
                ],
                insightVideo: 'https://example.com/videos/emotional-intelligence-insight.mp4',
                actDescription: 'For two days, practice the "pause and label" technique: before reacting to any emotional trigger, pause, name the emotion out loud, then choose your response.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 9: Independence (locked) ───────────────────────────
        {
            title: 'Independence',
            index: 9,
            nodes: [
                { id: 41, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 42, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 43, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 44, type: 'act', title: 'Act', status: 'locked' },
                { id: 45, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/independence-lesson.mp4',
                lessonScript: 'Healthy relationships need two whole individuals, not two halves making a whole. Maintaining your own identity, friendships, and passions doesn\'t weaken your bond — it strengthens it. Learn how to balance togetherness with individuality.',
                lessonQuestions: [
                    {
                        question: 'Why is maintaining independence important in a relationship?',
                        answers: [
                            'To keep your partner guessing',
                            'So you can leave at any time',
                            'Because codependency leads to resentment and loss of self',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'What is a sign of unhealthy codependency?',
                        answers: [
                            'Enjoying alone time',
                            'Feeling anxious when your partner has their own plans',
                            'Having separate friend groups',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'How can you support your partner\'s independence?',
                        answers: [
                            'Encourage their hobbies and friendships outside the relationship',
                            'Make sure they include you in everything',
                            'Feel hurt when they want alone time',
                        ],
                        correctAnswer: 0,
                    },
                ],
                practiceSkills: [
                    'Spending an evening doing your own thing without guilt',
                    'Encouraging your partner to go out with friends',
                    'Identifying one personal goal that\'s just for you',
                ],
                insightQuestions: [
                    'Do you feel like you\'ve lost parts of yourself in this relationship?',
                    'What hobbies or interests have you given up since being together?',
                    'Does your partner\'s independence feel threatening or reassuring?',
                ],
                insightVideo: 'https://example.com/videos/independence-insight.mp4',
                actDescription: 'Each partner spends a full evening pursuing a solo interest — a hobby, seeing friends, or a personal project. Share what you did afterward.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 10: Romance (locked) ────────────────────────────────
        {
            title: 'Romance',
            index: 10,
            nodes: [
                { id: 46, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 47, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 48, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 49, type: 'act', title: 'Act', status: 'locked' },
                { id: 50, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/romance-lesson.mp4',
                lessonScript: 'Romance isn\'t just for new relationships — it\'s a practice that keeps love alive. The butterflies may fade, but intentional romance creates a different, deeper kind of magic. Learn how to keep the spark alive through everyday actions.',
                lessonQuestions: [
                    {
                        question: 'What is the biggest myth about romance?',
                        answers: [
                            'Romance requires effort',
                            'Romance should be effortless and spontaneous if you truly love someone',
                            'Romance looks different for everyone',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'What are "bids for connection" (Gottman)?',
                        answers: [
                            'Formal requests for dates',
                            'Arguments that need resolution',
                            'Small everyday moments where one partner reaches out for attention or affection',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'How do love languages relate to romance?',
                        answers: [
                            'Understanding your partner\'s love language helps you be romantic in ways they actually feel',
                            'Everyone should express love the same way',
                            'Love languages are not scientifically valid',
                        ],
                        correctAnswer: 0,
                    },
                ],
                practiceSkills: [
                    'Leaving a handwritten note for your partner to find',
                    'Responding to a "bid for connection" with full attention',
                    'Planning a date night based on your partner\'s love language',
                ],
                insightQuestions: [
                    'When did you last feel truly romanced by your partner?',
                    'What small gestures mean the most to you?',
                    'Do you feel like romance has faded, or is it just different?',
                ],
                insightVideo: 'https://example.com/videos/romance-insight.mp4',
                actDescription: 'Plan a surprise for your partner using their love language. It doesn\'t need to be expensive — just thoughtful and personal.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 11: Life Transitions (locked) ──────────────────────
        {
            title: 'Life Transitions',
            index: 11,
            nodes: [
                { id: 51, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 52, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 53, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 54, type: 'act', title: 'Act', status: 'locked' },
                { id: 55, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/life-transitions-lesson.mp4',
                lessonScript: 'Moving, changing jobs, becoming parents, dealing with loss — life transitions test even the strongest relationships. This lesson teaches you how to navigate major changes as a team, not as two individuals struggling separately.',
                lessonQuestions: [
                    {
                        question: 'Why are life transitions especially hard on relationships?',
                        answers: [
                            'They create stress that disrupts established routines and roles',
                            'They\'re boring and mundane',
                            'They don\'t affect relationships much',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'What is the most important thing during a transition?',
                        answers: [
                            'Making decisions quickly',
                            'Maintaining open communication and checking in often',
                            'Handling everything independently to reduce burden',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'How should couples approach major decisions during transitions?',
                        answers: [
                            'The more decisive partner should lead',
                            'Avoid decisions until the transition is over',
                            'Make decisions together with both perspectives valued',
                        ],
                        correctAnswer: 2,
                    },
                ],
                practiceSkills: [
                    'Creating a "transition plan" together for an upcoming change',
                    'Checking in daily during stressful periods with a simple "How are you really?"',
                    'Dividing new responsibilities fairly and revisiting the split weekly',
                ],
                insightQuestions: [
                    'What was the hardest transition you\'ve faced as a couple?',
                    'Did a life change bring you closer or push you apart?',
                    'What upcoming transition are you most nervous about?',
                ],
                insightVideo: 'https://example.com/videos/life-transitions-insight.mp4',
                actDescription: 'Discuss an upcoming change or challenge together. Create a simple plan: who handles what, how you\'ll check in, and what support each person needs.',
                actDaysToPerform: 2,
            },
        },

        // ── Chapter 12: Partnership (locked) ───────────────────────────
        {
            title: 'Partnership',
            index: 12,
            nodes: [
                { id: 56, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 57, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 58, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 59, type: 'act', title: 'Act', status: 'locked' },
                { id: 60, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/partnership-lesson.mp4',
                lessonScript: 'Partnership is where love meets logistics. It\'s about building a life together — managing finances, dividing labor, making decisions, and supporting each other\'s growth. True partnership means both people feel like equals.',
                lessonQuestions: [
                    {
                        question: 'What does "equal partnership" mean?',
                        answers: [
                            'Splitting everything exactly 50/50',
                            'One partner handling all responsibilities',
                            'Both partners feeling valued and heard, contributing in ways that play to their strengths',
                        ],
                        correctAnswer: 2,
                    },
                    {
                        question: 'What is "mental load" in a relationship?',
                        answers: [
                            'The invisible work of planning, organizing, and remembering things for the household',
                            'The stress of work deadlines',
                            'Thinking too much about the relationship',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'How should financial decisions be handled?',
                        answers: [
                            'The higher earner decides',
                            'Transparently, with shared goals and regular money conversations',
                            'Separately — what\'s mine is mine',
                        ],
                        correctAnswer: 1,
                    },
                ],
                practiceSkills: [
                    'Doing an audit of who handles which household tasks',
                    'Having a money date — reviewing finances together without blame',
                    'Creating a shared goals list for the next year',
                ],
                insightQuestions: [
                    'Does one partner carry more of the "mental load"?',
                    'Do you feel like equal partners or is one person leading?',
                    'What would a more balanced partnership look like for you?',
                ],
                insightVideo: 'https://example.com/videos/partnership-insight.mp4',
                actDescription: 'Sit down and list every recurring household task. Discuss who currently owns each one and rebalance together. Check in after one week.',
                actDaysToPerform: 3,
            },
        },

        // ── Chapter 13: Mastery (locked) ────────────────────────────────
        {
            title: 'Mastery',
            index: 13,
            nodes: [
                { id: 61, type: 'learn', title: 'Learn', status: 'locked' },
                { id: 62, type: 'practice', title: 'Practice', status: 'locked' },
                { id: 63, type: 'insight', title: 'Insight', status: 'locked' },
                { id: 64, type: 'act', title: 'Act', status: 'locked' },
                { id: 65, type: 'milestone', title: 'Milestone', status: 'locked' },
            ],
            content: {
                lessonVideo: 'https://example.com/videos/mastery-lesson.mp4',
                lessonScript: 'You\'ve built the skills. Now it\'s time to bring them all together. Mastery isn\'t perfection — it\'s the ability to catch yourself, repair quickly, and keep growing together. This final lesson is about sustaining the relationship you\'ve worked so hard to build.',
                lessonQuestions: [
                    {
                        question: 'What does "relationship mastery" mean?',
                        answers: [
                            'Never having problems',
                            'Having the skills to navigate challenges and continuously grow together',
                            'Being the perfect partner',
                        ],
                        correctAnswer: 1,
                    },
                    {
                        question: 'What is the most important relationship skill from this journey?',
                        answers: [
                            'Consistent, intentional effort to understand and support each other',
                            'Winning arguments',
                            'Avoiding conflict at all costs',
                        ],
                        correctAnswer: 0,
                    },
                    {
                        question: 'How do you maintain relationship growth long-term?',
                        answers: [
                            'Set it and forget it — you\'ve done the work',
                            'Only work on it when things go wrong',
                            'Regular check-ins, continued learning, and never taking each other for granted',
                        ],
                        correctAnswer: 2,
                    },
                ],
                practiceSkills: [
                    'Creating a monthly "state of the relationship" check-in ritual',
                    'Writing a letter of appreciation to your partner',
                    'Identifying one area to keep growing in together',
                ],
                insightQuestions: [
                    'What has changed the most in your relationship during this journey?',
                    'What are you most proud of as a couple?',
                    'What is one thing you want to keep working on?',
                ],
                insightVideo: 'https://example.com/videos/mastery-insight.mp4',
                actDescription: 'Write each other a letter about what you\'ve learned during this journey and what you appreciate most about your partner. Read them to each other.',
                actDaysToPerform: 1,
            },
        },
    ],
};

export default mockJourneyData;
