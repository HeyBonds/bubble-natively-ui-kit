// Component Registry
// Add new components here by specifying the path to the component file
window.COMPONENTS = {
    'main-app': {
        name: 'Main App',
        renderReact: (container) => window.appUI.mountMainApp(container)
    },
    'welcome': {
        name: 'Welcome Screen',
        renderReact: (container) => window.appUI.mountWelcome(container)
    },
    'daily-question': {
        name: 'Daily Question',
        renderReact: (container) => window.appUI.mountDailyQuestion(container, {
            credits: 7,
            category: 'Emotional Responsibility',
            question: 'When your partner is in a bad mood, how responsible do you feel for fixing it?',
            userName: 'Isha',
            options: [
                { text: 'Quite a bit', percent: 16, index: 1 },
                { text: 'Not at all', percent: 15, index: 2 },
                { text: 'A lot', percent: 48, index: 3 },
                { text: 'A little', percent: 21, index: 4 }
            ]
        })
    },
    'onboarding': {
        name: 'Onboarding Flow',
        renderReact: (container) => window.appUI.mountOnboarding(container)
    },
    'journey': {
        name: 'Journey Path',
        renderReact: (container) => window.appUI.mountJourney(container)
    }
};
