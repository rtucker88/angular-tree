'use strict';

angular.module('angularTreeApp').controller('MainCtrl', function ($scope) {
        $scope.selectedNode = null;

        $scope.treeData = [
            {children: [
                {children: [
                    {children: null,
                        label: 'test7',
                        data:  'test7'},
                    {children: null,
                        label: 'test8',
                        data:  'test8'}
                ],
                    label: 'test4',
                    data:  'test4'},
                {children: null,
                    label: 'test5',
                    data:  'test5'}
            ],
                label: 'test',
                data:  'test'},
            {children: null,
                label: 'test2',
                data:  'test2'},
            {children: null,
                label: 'test3',
                data:  'test3'}
        ];

        $scope.onSelect = function (entry) {
            console.log('got entry', entry);
            $scope.selectedNode = entry;
        };

        $scope.deleteNode = function(entry) {
            console.log('deleting node', entry);
            entry.removeNode();
        };

        $scope.addNode = function(entry) {
            console.log('adding node', entry);
            $scope.selectedNode.addChild({}, entry.label);
        };

        $scope.awesomeThings = [
            'HTML5 Boilerplate', 'AngularJS', 'Karma'
        ];
    });
