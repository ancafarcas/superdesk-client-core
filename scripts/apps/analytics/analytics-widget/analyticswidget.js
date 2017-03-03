angular.module('superdesk.apps.analytics-widget.analyticswidget',
    ['superdesk.apps.analytics', 'superdesk.apps.dashboard.widgets'])
    .config(['dashboardWidgetsProvider', function(dashboardWidgets) {
        dashboardWidgets.addWidget('analyticswidget', {
            label: 'Analytics',
            multiple: true,
            icon: 'archive',
            max_sizex: 2,
            max_sizey: 3,
            sizex: 1,
            sizey: 2,
            thumbnail: 'scripts/apps/analytics/analytics-widget/thumbnail.svg',
            template: 'scripts/apps/analytics/analytics-widget/analytics-widget.html',
            configurationTemplate: 'scripts/apps/analytics/analytics-widget/configuration.html',
            description: 'This widget allows you to view the analytics reports',
            custom: true
        });
    }]);
