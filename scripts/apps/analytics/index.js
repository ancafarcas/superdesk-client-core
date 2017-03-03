/**
 * This file is part of Superdesk.
 *
 * Copyright 2016 Sourcefabric z.u. and contributors.
 *
 * For the full copyright and license information, please see the
 * AUTHORS and LICENSE files distributed with this source code, or
 * at https://www.sourcefabric.org/superdesk/license
 */

import './styles/analytics.scss';

import * as ctrl from './controllers';
import * as svc from './services';
import * as directive from './directives';
import './analytics-widget/analyticswidget';

/**
 * @ngdoc module
 * @module superdesk.apps.analytics
 * @name superdesk.apps.analytics
 * @packageName superdesk.apps
 * @description Superdesk analytics specific application.
 */
angular.module('superdesk.apps.analytics', ['superdesk.apps.analyticswidget'])
    .service('savedActivityReports', svc.SavedActivityReports)

    .directive('sdActivityReportContainer', directive.ActivityReportContainer)
    .directive('sdActivityReportPanel', directive.ActivityReportPanel)
    .directive('sdActivityReportView', directive.ActivityReportView)
    .directive('sdSaveActivityReport', directive.SaveActivityReport)
    .directive('sdSavedActivityReports', directive.SavedActivityReports)

    .config(['superdeskProvider', function(superdesk) {
        superdesk.activity('analytics', {
            label: gettext('Analytics'),
            when: '/analytics',
            templateUrl: 'scripts/apps/analytics/views/analytics.html',
            topTemplateUrl: 'scripts/apps/dashboard/views/workspace-topnav.html',
            sideTemplateUrl: 'scripts/apps/workspace/views/workspace-sidenav.html',
            category: 'analytics',
            priority: 800
        });
    }]);
angular.module('superdesk.apps.analyticswidget', [
    'superdesk.apps.authoring.widgets',
    'superdesk.apps.analytics-widget.analyticswidget',
    'superdesk.apps.desks',
    'superdesk.apps.workspace'
])
    .controller('AnalyticsCtrl', ctrl.AnalyticsCtrl)
    .directive('sdAnalyticsSettings', directive.AnalyticsSettings);
