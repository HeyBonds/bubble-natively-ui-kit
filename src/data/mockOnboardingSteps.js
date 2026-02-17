const mockOnboardingSteps = [
    // Q1 — Gender (single-select, no refresh)
    {
        type: 'single-select',
        questionId: 'gender',
        question: "What's your gender?",
        refreshable: false,
        options: [
            { text: 'Male', variable: 'male' },
            { text: 'Female', variable: 'female' },
            { text: 'Non-binary', variable: 'non_binary' },
            { text: 'Prefer not to say', variable: 'prefer_not_to_say' },
        ],
    },

    // Q2 — Relationship duration (slider)
    {
        type: 'slider',
        questionId: 'relationship_duration',
        question: 'How long have you been together?',
        stops: [
            { label: 'Less than 6 months', variable: 'lt_6mo', emoji: '🥰' },
            { label: '6 months – 1 year', variable: '6mo_1yr', emoji: '💌' },
            { label: '1 – 3 years', variable: '1_3yr', emoji: '🤝' },
            { label: '3 – 5 years', variable: '3_5yr', emoji: '🔥' },
            { label: '5 – 10 years', variable: '5_10yr', emoji: '💎' },
            { label: '10+ years', variable: '10plus_yr', emoji: '🏆' },
        ],
    },

    // Q3 — Areas to strengthen (multi-select, pick 3)
    {
        type: 'multi-select',
        questionId: 'strengthen_areas',
        question: 'Choose 3 Areas to Strengthen Your Bond',
        maxSelections: 3,
        options: [
            { text: 'Communication', variable: 'communication' },
            { text: 'Trust', variable: 'trust' },
            { text: 'Intimacy', variable: 'intimacy' },
            { text: 'Quality Time', variable: 'quality_time' },
            { text: 'Conflict Resolution', variable: 'conflict_resolution' },
            { text: 'Emotional Support', variable: 'emotional_support' },
            { text: 'Shared Goals', variable: 'shared_goals' },
            { text: 'Fun & Adventure', variable: 'fun_adventure' },
        ],
    },

    // Q4 — Last argument (single-select, refreshable, pool of 8)
    {
        type: 'single-select',
        questionId: 'last_argument',
        question: 'Think about your last argument... what was it about?',
        refreshable: true,
        visibleCount: 4,
        optionPool: [
            { text: 'Household chores', variable: 'chores' },
            { text: 'Money or finances', variable: 'finances' },
            { text: 'Quality time together', variable: 'quality_time' },
            { text: 'Parenting decisions', variable: 'parenting' },
            { text: 'Communication style', variable: 'communication' },
            { text: 'Social plans or friends', variable: 'social' },
            { text: 'Work-life balance', variable: 'work_life' },
            { text: 'Personal habits', variable: 'habits' },
        ],
    },

    // Q5 — Partner doing more (single-select, refreshable, pool of 9)
    {
        type: 'single-select',
        questionId: 'partner_do_more',
        question: 'What do you wish your partner would do more of?',
        refreshable: true,
        visibleCount: 4,
        optionPool: [
            { text: 'Listen without fixing', variable: 'listen' },
            { text: 'Plan surprise dates', variable: 'surprise_dates' },
            { text: 'Help around the house', variable: 'house_help' },
            { text: 'Say "I love you" more', variable: 'say_love' },
            { text: 'Give compliments', variable: 'compliments' },
            { text: 'Initiate physical affection', variable: 'affection' },
            { text: 'Ask about my day', variable: 'ask_day' },
            { text: 'Put the phone down', variable: 'phone_down' },
            { text: 'Share their feelings', variable: 'share_feelings' },
        ],
    },

    // Q6 — What matters to partner (single-select, refreshable, pool of 10)
    {
        type: 'single-select',
        questionId: 'partner_matters',
        question: 'What do you think matters most to your partner?',
        refreshable: true,
        visibleCount: 4,
        optionPool: [
            { text: 'Feeling respected', variable: 'respected' },
            { text: 'Quality time together', variable: 'quality_time' },
            { text: 'Physical affection', variable: 'physical_affection' },
            { text: 'Words of encouragement', variable: 'encouragement' },
            { text: 'Financial security', variable: 'financial' },
            { text: 'Acts of service', variable: 'service' },
            { text: 'Having fun together', variable: 'fun' },
            { text: 'Being listened to', variable: 'listened' },
            { text: 'Personal space', variable: 'space' },
            { text: 'Shared goals and dreams', variable: 'shared_goals' },
        ],
    },

    // Q7 — Most loving gesture (single-select, refreshable, pool of 8)
    {
        type: 'single-select',
        questionId: 'loving_gesture',
        question: 'Which would feel most loving from your partner?',
        refreshable: true,
        visibleCount: 4,
        optionPool: [
            { text: 'A handwritten note', variable: 'note' },
            { text: 'A long hug after a tough day', variable: 'hug' },
            { text: 'Cooking my favorite meal', variable: 'cooking' },
            { text: 'Planning a weekend getaway', variable: 'getaway' },
            { text: 'Saying they\'re proud of me', variable: 'proud' },
            { text: 'Taking over my responsibilities', variable: 'responsibilities' },
            { text: 'A thoughtful gift', variable: 'gift' },
            { text: 'An undistracted evening together', variable: 'evening' },
        ],
    },

    // Q8 — Instant smile (single-select, refreshable, pool of 8)
    {
        type: 'single-select',
        questionId: 'instant_smile',
        question: 'Which would instantly make you smile?',
        refreshable: true,
        visibleCount: 4,
        optionPool: [
            { text: 'A random "thinking of you" text', variable: 'text_msg' },
            { text: 'Flowers for no reason', variable: 'flowers' },
            { text: 'My favorite snack waiting at home', variable: 'snack' },
            { text: 'A playlist made just for me', variable: 'playlist' },
            { text: 'A spontaneous dance in the kitchen', variable: 'dance' },
            { text: 'A compliment in front of friends', variable: 'public_compliment' },
            { text: 'Breakfast in bed', variable: 'breakfast' },
            { text: 'A silly inside joke callback', variable: 'inside_joke' },
        ],
    },

    // Q9 — Open question: truly loved
    {
        type: 'open-question',
        questionId: 'truly_loved',
        question: 'What makes you feel truly loved?',
        placeholder: 'Take your time, there\'s no wrong answer...',
        charGuidance: 150,
    },

    // Q10 — Open question: communication change
    {
        type: 'open-question',
        questionId: 'communication_change',
        question: 'If you could change one thing about how you and your partner communicate, what would it be?',
        placeholder: 'Be as honest as you\'d like...',
        charGuidance: 200,
    },
];

export default mockOnboardingSteps;
