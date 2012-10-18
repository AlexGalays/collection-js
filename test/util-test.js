
module("util");

test("getId - primitives", function() {
   getId.reset();
   equal(getId(123), 'number-123');
   equal(getId('123'), 'string-123');
   equal(getId(true), 'boolean-true');
});

test("getId - objects", function() {
   getId.reset();
   var obj1 = {};
   var obj2 = {};

   equal(getId(new Date()), 'object-1');

   equal(getId(obj1), 'object-2');
   equal(getId(obj2), 'object-3');
   equal(getId(obj2), 'object-3');
   equal(getId(obj1), 'object-2');

   equal(getId([1, 2, 3]), 'object-4');
   equal(getId([1, 2, 3]), 'object-5');

   equal(getId(function(a) {return a;}), 'function-6');

   equal(getId(null), 'object-null');
   equal(getId(null), 'object-null');
});