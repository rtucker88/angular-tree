'use strict';

angular.module('angularTreeApp').directive('rctTree', function () {
        return {
            scope:      {
                treeData:          '=',
                currentlySelected: '=',
                onTreeSelect:      '&',
                treeDefaultLevel:  '@',
                treeListStyle: '@',
                treeMargin: '@'
            },
            template:   '<ul ng-class="getListStyle()"><li><rct-node ng-repeat="n in tree.children" node="getNodes(n)"></rct-node></li></ul>',
            restrict:   'EA',
            replace:    'true',
            controller: ['$scope', function ($scope) {
                var self = this;
                this.selectedNode = null;
                this.treeDict = {}; // Quick id map to hold nodes and get around
                // Angular circular dependency checking

                this.getListStyle = function() {
                    return $scope.treeListStyle;
                };

                this.treeMargin = $scope.treeMargin;

                this.getNodes = function(nodeIds) {
                    if(angular.isArray(nodeIds)) {

                        if(!nodeIds) {
                            return [];
                        }
                        var returnNodes = [];
                        for(var i = 0; i < nodeIds.length; i++) {
                            returnNodes.push(self.treeDict[nodeIds[i]]);
                        }

                        return returnNodes;
                    } else {
                        return self.treeDict[nodeIds];
                    }
                };
                $scope.getNodes = this.getNodes;

                /**
                 * Sets the node and its parents as selected according to flag
                 * @param node the node
                 * @param flag the flag to set as selected
                 */
                var setSelected = function (node, flag) {
                    var current = node;
                    while (current) {
                        console.log('in set selected');
                        current.selected = flag;
                        current = self.getNodes(current.parent);
                    }
                };

                // Bubble up the call for onSelect
                this.onSelect = function (node) {
                    console.log('on select in ctrl!');
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
                    self.getNodes(node.parent).expanded = true;
                    node.shown = true;
                });
            }],
            link:       function postLink(scope, elem, attrs, treeCtrl) {
                var tree;
                // Watch the tree data for changes
                scope.$watch('treeData', function (newVal) {
                    console.log('treedata changed!');
                    // Build the tree if needed
                    if (!tree) {
                        tree = new Tree();
                        scope.tree = tree.getRoot();
                    }
                    addNodes(tree.getRoot().id, newVal, 1);
                }, true);

                scope.getListStyle = treeCtrl.getListStyle;

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

                    treeCtrl.treeDict[this.id] = this;

                    if (this.parent) {
                        this.level = treeCtrl.treeDict[parent].level + 1;
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
                            //console.log('adding child');
                            var newNode = new TreeNode(self.id, data, label, id);
                            self.children.push(newNode.id);
                            self.expanded = true;

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
                        //console.log('removing node');
                        // Break the parent's reference
                        var parent = treeCtrl.getNodes(self.parent);
                        if (parent) {
                            var children = parent.children;
                            for (var i = 0; i < children; i++) {
                                if (children[i] === self.id) {
                                    delete children.splice(i, 1)[0];
                                }
                            }
                        }

                        delete treeCtrl.treeDict[self.id];
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
                function addNodes(parentId, children, currentLevel) {
                    var parent = treeCtrl.treeDict[parentId];
                    console.log('parent', parent, 'treeDict', treeCtrl.treeDict);
                    var maxTreeLevel = scope.treeDefaultLevel || 2;
                    if (!currentLevel) {
                        currentLevel = 0;
                    }
                    if (!children) {
                        return;
                    }
                    var childrenLength = children.length;
                    for (var i = 0; i < childrenLength; i++) {
                        var currentChild = children[i];
                        
                        var foundChild = null;
                        for (var j = 0; j < parent.children.length; j++) {
                            if (parent.children[j] === currentChild.id) {
                                foundChild = parent.children[j];
                                break;
                            }
                        }

                        var childNode;
                        if (foundChild && treeCtrl.treeDict[foundChild]) {
                            var childToExtend = angular.copy(currentChild);
                            var childIds = [];
                            // Get just the child ids
                            for(var k = 0; k < childToExtend.children.length; k++) {
                                childIds.push(childToExtend.children[k].id);
                            }
                            childToExtend.children = childIds;

                            angular.extend(treeCtrl.treeDict[foundChild], childToExtend);
                            childNode = treeCtrl.treeDict[foundChild];
                        } else {
                            // Check if the id already exists in parent,
                            // remove if so
                            for(var k = 0; k < parent.children.length; k++) {
                                var child = parent.children[k];
                                if(child === currentChild.id) {
                                    parent.children.splice(k, 1);
                                    break;
                                }
                            }
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
                            addNodes(childNode.id, currentChild.children,
                                currentLevel + 1);
                        }
                    }
                }
            }
        };
    });