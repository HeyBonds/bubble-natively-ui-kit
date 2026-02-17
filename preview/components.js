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
            credits: 13,
            category: 'Time Together',
            question: 'How much intentional one-on-one time do you have in a typical week?',
            userName: 'Danny',
            options: [
                { text: 'Less than 1 hour', percent: 10, index: 1 },
                { text: '1-3 hours', percent: 45, index: 2 },
                { text: '4-7 hours', percent: 30, index: 3 },
                { text: 'More than 7 hours', percent: 15, index: 4 }
            ]
        })
    },
    'onboarding': {
        name: 'Onboarding Flow',
        renderReact: (container) => window.appUI.mountOnboarding(container)
    }
};
