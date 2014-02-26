'use strict';

angular.module('angularTreeApp').directive('rctNode', function ($compile) {
    return {
        scope:    {
            node: '='
        },
        template: '<li ng-show="isNodeShown(node)" ng-style="getMargin(node)"></li>',
        restrict: 'EA',
        replace:  true,
        require:  '^rctTree',
        link:     function postLink(scope, elem, attrs, treeCtrl) {
            scope.nodeSelect = function (node) {
                treeCtrl.onSelect(node);
            };

            // Expand or collapse the nodes
            scope.expandNode = function (node) {
                var setChildrenExpanded = function (children, expandedFlag,
                    shownFlag, immediateChildrenOnly) {
                    if (children) {
                        for (var i = 0; i < children.length; i++) {
                            children[i].expanded = expandedFlag;
                            children[i].shown = shownFlag;
                            if (!immediateChildrenOnly) {
                                setChildrenExpanded(children[i].children,
                                    expandedFlag, shownFlag,
                                    immediateChildrenOnly);
                            }
                        }
                    }
                };

                // Collapse
                if (node.expanded) {
                    node.expanded = false;
                    setChildrenExpanded(node.children, false, false, false);
                }
                // Expand
                else {
                    node.expanded = true;
                    setChildrenExpanded(node.children, false, true, true);
                }
            };

            scope.isNodeSelected = function (node) {
                return node.selected;
            };

            scope.isNodeExpanded = function (node) {
                return node.expanded;
            };

            scope.isNodeShown = function (node) {
                return node.shown;
            };

            scope.getMargin = function (node) {
                var current = node;
                var count = 0;
                while (current) {
                    count++;
                    current = current.parent;
                }

                return {'margin-left': count * 15 + 'px'};
            };

            $compile('<li ng-show="isNodeShown(node)"><span class="glyphicon glyphicon-plus" ng-click="expandNode(node)" ng-show="node.children.length"></span>' +
                '<span ng-click="nodeSelect(node)">{{node.label}}</span></li><ul class="list-unstyled">' +
                '<rct-node ng-repeat="node in node.children" node="node"></rct-node>' +
                '</ul>')(scope, function (cloned) {
                scope.node.elem = cloned;
                elem.append(cloned);
                elem.on('$destroy', function() {
                    scope.node.removeNode();
                });
            });
        }
    };
});
