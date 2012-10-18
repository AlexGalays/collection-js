
getId = Collection.getId;
Iterable = Collection.Iterable;
Sequence = Seq = Collection.Sequence;
List = Collection.List;
Map = Collection.Map;
Set = Collection.Set;
ArrayMap = Collection.ArrayMap;

function runTests(tests) {
   for (var name in tests) {
      test(name, tests[name]);
   }
};

function fail(withMessage) {ok(false, withMessage)};

function sameArraysWithoutOrdering(arr1, arr2) {
   if (arr1.length != arr2.length) return fail('The sizes of the arrays are different: ' + arr1.length + ' != ' + arr2.length);
   for (var i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) == -1) return fail('arr2 does not contain this item from arr1: ' + arr1[i]);
   }
   return ok(true); 
};