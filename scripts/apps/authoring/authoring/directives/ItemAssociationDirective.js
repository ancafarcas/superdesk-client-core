/**
 * @ngdoc directive
 * @module superdesk.apps.authoring
 * @name sdItemAssociation
 *
 * @requires superdesk
 * @requires renditions
 * @requires config
 * @requires authoring
 * @requires $q
 *
 * @description
 *   This directive is responsible for rendering media associated with the item.
 */

ItemAssociationDirective.$inject = ['superdesk', 'renditions', 'config', 'authoring', '$q'];
export function ItemAssociationDirective(superdesk, renditions, config, authoring, $q) {
    return {
        scope: {
            rel: '=',
            item: '=',
            editable: '=',
            allowVideo: '@',
            onchange: '&',
            save: '&'
        },
        templateUrl: 'scripts/apps/authoring/views/item-association.html',
        link: function(scope, elem) {
            var MEDIA_TYPES = ['application/superdesk.item.picture', 'application/superdesk.item.graphic'];

            if (scope.allowVideo === 'true') {
                MEDIA_TYPES.push('application/superdesk.item.video');
            }

            /**
             * @ngdoc method
             * @name sdItemAssociation#getItem
             * @private
             * @description Get superdesk item from event.
             * @param {Event} event
             * @param {string} dataType
             * @return {Object}
             */
            function getItem(event, dataType) {
                return angular.fromJson(event.originalEvent.dataTransfer.getData(dataType));
            }

            // it should prevent default as long as this is valid image
            elem.on('dragover', (event) => {
                if (MEDIA_TYPES.indexOf(event.originalEvent.dataTransfer.types[0]) > -1) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });

            // update item associations on drop
            elem.on('drop dragdrop', (event) => {
                event.preventDefault();
                event.stopPropagation();
                let item = getItem(event, event.originalEvent.dataTransfer.types[0]);

                if (!scope.editable) {
                    return;
                }

                if (scope.isMediaEditable()) {
                    scope.loading = true;
                    renditions.ingest(item)
                    .then(scope.edit)
                    .finally(() => {
                        scope.loading = false;
                    });
                } else {
                    scope.$apply(() => {
                        updateItemAssociation(item);
                    });
                }
            });


            /**
             * @ngdoc method
             * @name sdItemAssociation#updateItemAssociation
             * @private
             * @description If the item is not published then it saves the changes otherwise calls autosave.
             * @param {Object} updated Item to be edited
             */
            function updateItemAssociation(updated) {
                let data = {};

                data[scope.rel] = updated;
                scope.item.associations = angular.extend({}, scope.item.associations, data);
                if (!authoring.isPublished(scope.item) && updated) {
                    return scope.save();
                }

                scope.onchange({item: scope.item, data: data});
            }

            // init associated item for preview
            scope.$watch('item.associations[rel]', (related) => {
                scope.related = related;
            });

            renditions.get();

            /**
             * @ngdoc method
             * @name sdItemAssociation#edit
             * @public
             * @description Opens the item for edit.
             * @param {Object} item Item to be edited
             */
            scope.edit = function(item) {
                if (!scope.isMediaEditable()) {
                    return;
                }

                if (item.renditions && item.renditions.original && scope.isImage(item.renditions.original)) {
                    scope.loading = true;
                    return renditions.crop(item)
                    .then(updateItemAssociation)
                    .finally(() => {
                        scope.loading = false;
                    });
                }

                updateItemAssociation(item);
            };

            /**
             * @ngdoc method
             * @name sdItemAssociation#isVideo
             * @public
             * @description Check if the rendition is video or not.
             * @param {Object} rendition Rendition of the item.
             */
            scope.isVideo = function(rendition) {
                if (_.startsWith(rendition.mimetype, 'video')) {
                    return true;
                }

                return _.some(['.mp4', '.webm', '.ogv', '.ogg'], (ext) => _.endsWith(rendition.href, ext));
            };

            /**
             * @ngdoc method
             * @name sdItemAssociation#isImage
             * @public
             * @description Check if the rendition is image or not.
             * @param {Object} rendition Rendition of the item.
             */
            scope.isImage = function(rendition) {
                return _.startsWith(rendition.mimetype, 'image');
            };

            /**
             * @ngdoc method
             * @name sdItemAssociation#isMediaEditable
             * @public
             * @description Check if featured media can be edited or not.
             */
            scope.isMediaEditable = function() {
                return !(config.features && 'editFeaturedImage' in config.features
                    && !config.features.editFeaturedImage);
            };

            /**
             * @ngdoc method
             * @name sdItemAssociation#remove
             * @public
             * @description Remove the associations
             */
            scope.remove = function(item) {
                updateItemAssociation(null);
            };

            /**
             * @ngdoc method
             * @name sdItemAssociation#upload
             * @public
             * @description Upload media.
             */
            scope.upload = function() {
                if (scope.editable) {
                    superdesk.intent('upload', 'media', {uniqueUpload: true}).then((images) => {
                        // open the view to edit the PoI and the cropping areas
                        if (images) {
                            scope.$applyAsync(() => {
                                scope.edit(images[0]);
                            });
                        }
                    });
                }
            };
        }
    };
}
