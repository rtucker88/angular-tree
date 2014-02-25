'use strict';

describe('Directive: rctNode', function () {

    // load the directive's module
    beforeEach(module('angularTreeApp'));

    var element,
        scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
        element = angular.element('<rct-node></rct-node>');
        element = $compile(element)(scope);
        expect(element.text()).toBe('this is the rctNode directive');
    }));
});
