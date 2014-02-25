'use strict';

angular.module('angularTreeApp')
    .directive('rctTree', function () {
        return {
            scope: {
                treeData: '=',
                currentlySelected: '=',
                onTreeSelect: '&'
            },
            template: '<ul class="list-unstyled"><rct-node ng-repeat="node in tree.children" node="node"></rct-node>' +
                '</ul>',
            restrict: 'EA',
            replace: 'true',
            controller: ['$scope', function ($scope) {
                this.currentLevel = 1;
                this.selectedNode = null;

                /**
                 * Sets the node and its parents as selected according to flag
                 * @param node the node
                 * @param flag the flag to set as selected
                 */
                var setSelected = function(node, flag) {
                    var current = node;
                    while(current) {
                        if(!current) {
                            return;
                        }
                        current.selected = flag;
                        current = current.parent;
                    }
                };

                // Bubble up the call for onSelect
                this.onSelect = function (node) {
                    // Unset current node and its parents
                    setSelected(this.selectedNode, false);
                    setSelected(node, true);
                    console.log('got node in onSelect tree', node);
                    $scope.onTreeSelect({node: node});
                    this.selectedNode = node;
                };
            }],
            link: function postLink(scope, elem, attrs, treeCtrl) {
                // Watch the tree data for changes
                scope.$watch('treeData', function (newVal) {
                    console.log('watching tree data?');
                    // Rebuild the tree
                    var tree = new Tree();
                    var root = tree.getRoot();
                    addNodes(root, newVal, 1);
                    scope.tree = tree.getRoot();
                    console.log(scope.tree);
                });

                scope.tree = null;

                /**
                 * Tree Constructor
                 * @constructor
                 */
                function Tree() {
                    /**
                     * Dummy node to start off the tree
                     * @type {TreeNode}
                     */
                    var root = new TreeNode(null, null);
                    root.expanded = true;

                    /**
                     * Gets the root of the tree
                     * @returns {*} the root of the tree
                     */
                    this.getRoot = function () {
                        return root;
                    };

                    return this;
                }

                /**
                 * TreeNode Constructor
                 * @param parent the parent node
                 * @param data the data to associate with the node
                 * @param label the label to show
                 * @constructor the tree node constructor
                 */
                function TreeNode(parent, data, label, id) {
                    var self = this;
                    this.children = [];
                    this.parent = parent || null;
                    this.data = data || null;
                    this.label = label || null;
                    this.id = id || guid();
                    this.level = 0;

                    if (this.parent) {
                        this.level = this.parent.level + 1;
                    }

                    /**
                     * Adds a child node to the current treenode
                     * @param data the data to be associated with the node
                     * @returns {*} the newly added node
                     */
                    this.addChild = function (data, label, id) {
                        var newNode = new TreeNode(self, data, label, id);
                        self.children.push(newNode);
                        return newNode;
                    };

                    /**
                     * Removes this node from the tree
                     */
                    this.removeNode = function () {
                        // Break the parent's reference
                        var parent = self.parent;
                        if (parent) {
                            var children = parent.children;
                            for (var i = 0; i < children; i++) {
                                if (children[i].id === self.id) {
                                    delete children.splice(i, 1)[0];
                                }
                            }
                        }

                        delete self.children;
                        delete self.parent;
                        delete self.id;
                        delete self.data;
                    };
                }

                /**
                 * Helper function to create a GUID
                 * @returns {string} the GUID
                 */
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                /**
                 * Creates a GUID
                 * @returns {string} the GUID
                 */
                function guid() {
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                }

                /**
                 * Helper function to add nodes of data form
                 * @param parent the parent node to add to
                 * @param children the children array to add to this node
                 */
                function addNodes(parent, children, maxLevel, currentLevel) {
                    if(!currentLevel) {
                        currentLevel = 0;
                    }
                    if (!children) {
                        return;
                    }
                    for (var i = 0; i < children.length; i++) {
                        var childNode = parent.addChild(children[i].data, children[i].label, children[i].id);
                        if(parent.expanded) {
                            childNode.shown = true;
                        }
                        if(currentLevel < maxLevel) {
                            if(children[i].children) {
                                childNode.expanded = true;
                            }
                        }
                        if (children[i].children) {
                            addNodes(childNode, children[i].children, maxLevel, currentLevel + 1);
                        }
                    }
                }
            }
        };
    });