
getId = Collection.getId;
Iterable = Collection.Iterable;
Sequence = Seq = Collection.Sequence;
List = Collection.List;
Map = Collection.Map;
Set = Collection.Set;
ArrayMap = Collection.ArrayMap;
range = Collection.range;


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

var equalEntryArray = function(mapEntries, expectedEntries) {
   if (mapEntries.length != expectedEntries.length) return fail('The sizes of entry arrays are different');
   for (var i = 0; i < expectedEntries.length; i++) {
      var entry = mapEntries[i];
      var expected = expectedEntries[i];
      if (entry.key !== expected[0]) return fail('Expected key ' + expected[0] + ' but got ' + entry.key);
      if (entry.value !== expected[1]) return fail('Expected value ' + expected[1] + ' but got ' + entry.value);
   }
   ok(true);
};