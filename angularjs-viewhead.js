
(function (angular) {

     var mod = angular.module('viewhead', []);

     var title;

     mod.directive(
         'viewTitle',
         ['$rootScope', '$timeout', function ($rootScope, $timeout) {
             return {
                 restrict: 'EA',
                 link: function (scope, iElement, iAttrs, controller, transcludeFn) {
                     // If we've been inserted as an element then we detach from the DOM because the caller
                     // doesn't want us to have any visual impact in the document.
                     // Otherwise, we're piggy-backing on an existing element so we'll just leave it alone.
                     var tagName = iElement[0].tagName.toLowerCase();
                     if (tagName === 'view-title' || tagName === 'viewtitle') {
                         iElement.remove();
                     }

                     scope.$watch(
                         function () {
                             return iElement.text();
                         },
                         function (newTitle) {
                             $rootScope.viewTitle = title = newTitle;
                         }
                     );
                     scope.$on(
                         '$destroy',
                         function () {
                             title = undefined;
                             // Wait until next digest cycle do delete viewTitle
                             $timeout(function() {
                                 if(!title) {
                                     // No other view-title has reassigned title.
                                     delete $rootScope.viewTitle;
                                 }
                             });
                         }
                     );
                 }
             };
         }]
     );

     mod.directive(
         'viewHead',
         ['$document', function ($document) {
             var head = angular.element($document[0].head);
             return {
                 restrict: 'A',
                 link: function (scope, iElement, iAttrs, controller, transcludeFn) {
                     // Move the element into the head of the document.
                     // Although the physical location of the document changes, the element remains
                     // bound to the scope in which it was declared, so it can refer to variables from
                     // the view scope if necessary.
                     
                     // check if this is meta description we're working with
                     // try to update content if element exists or move if not
                     if (!iAttrs.content) {
                         head.append(iElement);
                     } else {
                         var existingFound = false;
                         var content = iAttrs.content;
                         angular.forEach(head.find('meta'), function(meta) {
                           if (angular.element(meta).attr('name') === 'description') {
                             angular.element(meta).attr('content', content);
                             iElement.remove();
                             existingFound = true;
                           }
                         });

                         if(!existingFound) {
                            // we didn't update the content of existing tag, move it to head
                            head.append(iElement);
                         }
                     }

                     // When the scope is destroyed, remove the element.
                     // This is on the assumption that we're being used in some sort of view scope.
                     // It doesn't make sense to use this directive outside of the view, and nor does it
                     // make sense to use it inside other scope-creating directives like ng-repeat.
                     scope.$on(
                         '$destroy',
                         function () {
                             iElement.remove();
                         }
                     );
                 }
             };
         }]
     );

})(angular);
