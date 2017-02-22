import _ from 'lodash';

AnalyticsSettings.$inject = ['desks', 'workspaces', 'session', 'preferencesService', 'WizardHandler', '$filter'];
export function AnalyticsSettings(desks, workspaces, session, preferencesService, WizardHandler, $filter) {
    return {
        templateUrl: 'scripts/apps/analytics/views/analytics-settings-configuration.html',
        scope: {
            modalActive: '=',
            desks: '=',
            widget: '='
        },
        link: function(scope, elem) {
            scope.showGlobalSavedSearches = false;
            scope.showPrivateSavedSearches = true;
            scope.privateSavedSearches = [];
            scope.globalSavedSearches = [];

            desks.initialize()
            .then(() => {
                scope.userLookup = desks.userLookup;
                scope.setCurrentStep();
            });

            scope.$watch('step.current', (step) => {
                if (step === 'searches') {
                    workspaces.getActiveId().then((activeWorkspace) => {
                        if (activeWorkspace.type === 'workspace') {
                            scope.showPrivateSavedSearches = true;
                        } else {
                            scope.showGlobalSavedSearches = true;
                            scope.showPrivateSavedSearches = false;
                        }
                    });

                    scope.initGlobalSavedSearches();
                    scope.initPrivateSavedSearches();
                }
            });

            scope.closeModal = function() {
                scope.step.current = 'desks';
                scope.modalActive = false;
                scope.showGlobalSavedSearches = false;
                scope.onclose();
            };


            /**
             * @description Returns true if this step in wizard should need to hide, false otherwise.
             * Only current step will be shown when displayOnlyCurrentStep is defined.
             * @param {String} code name of this step in wizard, i.e: desks, searches, reorder, maxitems
             * @returns {Boolean}
             */
            scope.shouldHideStep = function(code) {
                return !_.isNil(scope.displayOnlyCurrentStep) && !(scope.displayOnlyCurrentStep
                    && scope.currentStep === code);
            };

            /**
             * @description Sets current step in wizard, default is 'desks'.
             */
            scope.setCurrentStep = function() {
                scope.step = {
                    current: scope.currentStep || 'desks'
                };
            };

            scope.cancel = function() {
                scope.closeModal();
            };


            scope.save = function() {
                var groups = [];

                if (scope.widget) {
                    workspaces.getActive()
                    .then((workspace) => {
                        var widgets = angular.copy(workspace.widgets);

                        _.each(widgets, (widget) => {
                            if (scope.widget._id === widget._id && scope.widget.multiple_id === widget.multiple_id) {
                                widget.configuration = {};
                                widget.configuration.groups = groups;
                                if (scope.widget.configuration.label) {
                                    widget.configuration.label = scope.widget.configuration.label;
                                }
                            }
                        });
                        workspaces.save(workspace, {widgets: widgets})
                        .then(() => {
                            scope.showGlobalSavedSearches = false;
                            scope.onclose();
                        });
                    });
                }
            };
        }
    };
}
