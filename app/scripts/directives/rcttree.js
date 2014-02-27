'use strict';

angular.module('angularTreeApp').directive('rctTree', function () {
        return {
            scope:      {
                treeData:          '=',
                currentlySelected: '=',
                onTreeSelect:      '&',
                treeDefaultLevel:  '@'
            },
            template:   '<ul class="list-unstyled"><li><rct-node ng-repeat="node in tree.children track by $id(node)" node="node"></rct-node></li></ul>',
            restrict:   'EA',
            replace:    'true',
            controller: ['$scope', function ($scope) {
                this.selectedNode = null;

                /**
                 * Sets the node and its parents as selected according to flag
                 * @param node the node
                 * @param flag the flag to set as selected
                 */
                var setSelected = function (node, flag) {
                    var current = node;
                    while (current) {
                        if (!current) {
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
                    $scope.onTreeSelect({node: node});
                    this.selectedNode = node;
                };


                $scope.$on('nodeRemoved', function (event, node) {
                    node.elem.remove();
                });

                $scope.$on('nodeAdded', function (event, node) {
                    node.parent.expanded = true;
                    node.shown = true;
                });
            }],
            link:       function postLink(scope) {
                var tree;

                // Watch the tree data for changes
                scope.$watch('treeData', function (newVal) {
                    // Build the tree if needed
                    if (!tree) {
                        tree = new Tree();
                    }
                    var root = tree.getRoot();
                    addNodes(root, newVal, 1);
                    scope.tree = root;
                }, true);

                scope.tree = null;

                /**
                 * Tree Constructor
                 * @constructor
                 */
                function Tree() {
                    /**
                     * Dummy node to start off the tree
                     * @type {}
                     */
                    var root = new TreeNode(null, null, null, null);
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
                 * @param id self-assigned id
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
                     * @param label the label to give the node
                     * @param id the id to give the node
                     * @param shouldNotBroadcast broadcast a node added event
                     * @returns {*} the newly added node
                     */
                    this.addChild =
                        function (data, label, id, shouldNotBroadcast) {
                            var newNode = new TreeNode(self, data, label, id);
                            self.children.push(newNode);

                            if (!shouldNotBroadcast) {
                                scope.$broadcast('nodeAdded', newNode);
                            }

                            return newNode;
                        };

                    /**
                     * Removes this node from the tree
                     * @returns {*} the deleted tree node
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

                        scope.$broadcast('nodeRemoved', self);

                        return self;
                    };
                }

                /**
                 * Helper function to create a GUID
                 * @returns {string} the GUID
                 */
                function s4() {
                    return Math.floor((1 + Math.random()) *
                            0x10000).toString(16).substring(1);
                }

                /**
                 * Creates a GUID
                 * @returns {string} the GUID
                 */
                function guid() {
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() +
                        '-' + s4() + s4() + s4();
                }

                /**
                 * Helper function to add nodes of data form
                 * @param parent the parent node to add to
                 * @param children the children array to add to this node
                 * @param currentLevel the current level in the nodes
                 */
                function addNodes(parent, children, currentLevel) {
                    var maxTreeLevel = scope.treeDefaultLevel || 2;
                    if (!currentLevel) {
                        currentLevel = 0;
                    }
                    if (!children) {
                        return;
                    }
                    for (var i = 0; i < children.length; i++) {
                        var currentChild = children[i];
                        
                        var foundChild = null;
                        for (var j = 0; j < parent.children.length; j++) {
                            if (parent.children[j].id === currentChild.id) {
                                foundChild = parent.children[j];
                                break;
                            }
                        }

                        var childNode;
                        if (foundChild) {
                            angular.extend(foundChild, currentChild);
                            childNode = foundChild;
                        } else {
                            childNode = parent.addChild(currentChild.data,
                                currentChild.label, currentChild.id, true);

                            // TODO: May need to make sure this is only done the first time
                            if (currentLevel < maxTreeLevel) {
                                if (currentChild.children) {
                                    childNode.expanded = true;
                                }
                            }
                        }

                        if (parent.expanded) {
                            childNode.shown = true;
                        }

                        if (currentChild.children &&
                            currentChild.children.length) {
                            addNodes(childNode, currentChild.children,
                                currentLevel + 1);
                        }
                    }
                }
            }
        };
    });