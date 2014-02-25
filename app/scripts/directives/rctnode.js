'use strict';

angular.module('angularTreeApp')
    .directive('rctNode', function ($compile) {
        return {
            scope: {
                node: '='
            },
            template: '<li ng-show="showNode(node)"></li>',
            restrict: 'EA',
            replace: true,
            require: '^rctTree',
            link: function postLink(scope, elem, attrs, treeCtrl) {
                scope.showNode = function (node) {
                    if (!treeCtrl.currentLevel) {
                        return true;
                    }
                    return node.level <= treeCtrl.currentLevel;
                };

                scope.nodeSelect = function (node) {
                    treeCtrl.onSelect(node);
                };

                scope.expandNode = function (node) {
                    treeCtrl.currentLevel = node.level + 1;
                };

                if (angular.isArray(scope.node.children) && scope.node.children.length) {
                    $compile('<li ng-show="showNode(node)"><span class="glyphicon glyphicon-plus" ng-click="expandNode(node)"></span>' +
                        '<span ng-click="nodeSelect(node)">{{node.label}}</span></li><ul class="list-unstyled" ng-show="showNode(node)">' +
                        '<rct-node ng-repeat="node in node.children" node="node"></rct-node>' +
                        '</ul>')(scope, function (cloned) {
                        elem.append(cloned);
                    });
                } else {
                    $compile('<span ng-click="nodeSelect(node)" ng-show="showNode(node)">{{node.label}}</span>')(scope,
                        function (cloned) {
                            elem.append(cloned);
                        });
                }
            }
        };
    });
