// Component Registry
// Add new components here by specifying the path to the component file
window.COMPONENTS = {
    'welcome-screen': {
        name: 'Welcome Screen',
        render: () => window.appUI.welcome.render({})
    },
    'main-app': {
        name: 'Main App',
        render: () => {
             return window.appUI.mainApp.render({
                userName: 'Jonathan',
                userAvatar: 'https://i.pravatar.cc/150?img=12', // Placeholder image
                credits: 23,
                activeSection: 'home',
                currentJourney: {
                    title: 'Intimacy',
                    description: 'Exploring how being wanted and desired intersects with sexual fulfilment together'
                }
            });
        }
    },
    'daily-question': {
        name: 'Daily Question',
        path: '../bubble-html-component/daily-question.html'
    }
};
