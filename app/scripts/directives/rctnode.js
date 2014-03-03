'use strict';

angular.module('angularTreeApp').directive('rctNode', function ($compile) {
    return {
        scope:    {
            node: '='
        },
        template: '<ul ng-show="isNodeShown(node)" ng-style="getMargin(node)" ng-class="getListStyle()"></ul>',
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
                                setChildrenExpanded(treeCtrl.getNodes(children[i].children),
                                    expandedFlag, shownFlag,
                                    immediateChildrenOnly);
                            }
                        }
                    }
                };

                // Collapse
                if (node.expanded) {
                    node.expanded = false;
                    setChildrenExpanded(treeCtrl.getNodes(node.children), false, false, false);
                }
                // Expand
                else {
                    node.expanded = true;
                    setChildrenExpanded(treeCtrl.getNodes(node.children), false, true, true);
                }
            };

            scope.isNodeSelected = function (node) {
                return node && node.selected;
            };

            scope.isNodeExpanded = function (node) {
                return node && node.expanded;
            };

            scope.isNodeShown = function (node) {
                return node && node.shown;
            };

            scope.getMargin = function (node) {
                var current = node;
                var count = 0;
                while (current) {
                    count++;
                    current = treeCtrl.getNodes(current.parent);
                }

                return {'margin-left': count * treeCtrl.treeMargin + 'px'};
            };

            scope.hasChildren = function(node) {
                return node && node.children && node.children.length;
            };

            scope.getNodes = treeCtrl.getNodes;
            scope.getListStyle = treeCtrl.getListStyle;

            $compile('<li ng-show="isNodeShown(node)"><span class="glyphicon glyphicon-plus" ng-click="expandNode(node)" ng-show="hasChildren(node)"></span>' +
                '<span ng-click="nodeSelect(node)">{{node.label}}</span></li>' +
                '<li ng-show="hasChildren(node)"><rct-node ng-repeat="n in node.children" node="getNodes(n)"></rct-node></li>')(scope, function (cloned) {
                scope.node.elem = cloned;
                elem.append(cloned);
                elem.on('$destroy', function() {
                    scope.node.removeNode();
                });
            });
        }
    };
});
