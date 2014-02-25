'use strict';

angular.module('angularTreeApp').directive('rctNode', function ($compile) {
        return {
            scope:    {
                node: '='
            },
            template: '<li ng-show="isNodeShown(node)"></li>',
            restrict: 'EA',
            replace:  true,
            require:  '^rctTree',
            link:     function postLink(scope, elem, attrs, treeCtrl) {
                scope.nodeSelect = function (node) {
                    treeCtrl.onSelect(node);
                };

                // Expand or collapse the nodes
                scope.expandNode = function (node) {
                    var setChildrenExpanded = function (children, expandedFlag, shownFlag, immediateChildrenOnly) {
                        if (children) {
                            for (var i = 0; i < children.length; i++) {
                                children[i].expanded = expandedFlag;
                                children[i].shown = shownFlag;
                                if(!immediateChildrenOnly) {
                                    setChildrenExpanded(children[i].children, expandedFlag, shownFlag, immediateChildrenOnly);
                                }
                            }
                        }
                    };

                    // Collapse
                    if (node.expanded) {
                        node.expanded = false;
                        console.log('collpasing...');
                        setChildrenExpanded(node.children, false, false, false);
                    }
                    // Expand
                    else {
                        node.expanded = true;
                        console.log('expanding');
                        setChildrenExpanded(node.children, false, true, true);
                    }
                };

                scope.isNodeSelected = function (node) {
                    return node.selected;
                };

                scope.isNodeExpanded = function (node) {
                    console.log('node expanded?', node.expanded);
                    return node.expanded;
                };

                scope.isNodeShown = function(node) {
                    return node.shown;
                };

                if (angular.isArray(scope.node.children) &&
                    scope.node.children.length) {
                    $compile('<li ng-show="isNodeShown(node)"><span class="glyphicon glyphicon-plus" ng-click="expandNode(node)"></span>' +
                        '<span ng-click="nodeSelect(node)">{{node.label}}</span><h3 ng-if="isNodeSelected(node)">SELECTED</h3></li><ul class="list-unstyled">' +
                        '<rct-node ng-repeat="node in node.children" node="node"></rct-node>' +
                        '</ul>')(scope, function (cloned) {
                        elem.append(cloned);
                    });
                } else {
                    $compile('<span ng-click="nodeSelect(node)">{{node.label}}</span><h3 ng-if="isNodeSelected(node)">SELECTED</h3>')(scope,
                        function (cloned) {
                            elem.append(cloned);
                        });
                }
            }
        };
    });
