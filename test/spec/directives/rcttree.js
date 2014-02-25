'use strict';

describe('Directive: rctTree', function () {

  // load the directive's module
  beforeEach(module('angularTreeApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<rct-tree></rct-tree>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the rctTree directive');
  }));
});
