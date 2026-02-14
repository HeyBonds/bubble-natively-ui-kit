// Component Registry
// Add new components here by specifying the path to the component file
window.COMPONENTS = {
    'welcome-screen': {
        name: 'Welcome Screen',
        render: () => window.appUI.welcome.render({})
    },
    'main-app': {
        name: 'Main App',
        mount: (container) => {
             // Use the new mount function exposed by index.jsx
             if (window.appUI && window.appUI.mountMainApp) {
                 return window.appUI.mountMainApp(container);
             } else {
                 container.innerHTML = '<p class="text-red-500 p-4">Error: appUI.mountMainApp not found</p>';
             }
        }
    },
    'daily-question': {
        name: 'Daily Question',
        render: () => window.appUI.dailyQuestion.render({
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
    }
};
