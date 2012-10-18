
module("ArrayMap", {setup: function() {
   this.MapType = ArrayMap;

   this.sameArrays = function(arr1, arr2) {
      if (arr1.length != arr2.length) return fail('The arrays are of different sizes: ' + arr1 + ' != ' + arr2);
      for (var i = 0; i < arr1.length; i++) {
         if (arr1[i] !== arr2[i]) return fail('The two items are different: ' + arr1[i] + ' != ' + arr2[i]);
      }
      return ok(true);
   };

   this.numberMap = ArrayMap(
      1, 10,
      2, 20,
      3, 30
   );
}});

// All basic map tests should run with an ArrayMap
runTests(mapTests);

// ArrayMap tests
test('keys and values are ordered', function() {
   var map = ArrayMap(
      1, 10,
      2, 20,
      3, 30,
      4, 40,
      5, 50);
   
   map.put(0, 100);
   map.put(-5, -50);
   map.put(7, 70);
   map.remove(3);

   deepEqual(map.keys().items, [1, 2, 4, 5, 0, -5, 7]);
   deepEqual(map.values().items, [10, 20, 40, 50, 100, -50, 70]);
});

test('The withKey setting is kept when using fromArray', function() {
   function personEmail(person) {return person.email};

   var map = ArrayMap.withKey(personEmail,
      {name: 'sarah', email: 's.connor@me.com'}, 1,
      {name: 'pedro', email: 'delpaso@titi.com'}, 2,
      {name: 'unknown', email: ''}, 3);

   var copy = map._createNew(map.items);
   equal(copy.get({email: ''}), 3);
});

test('Binary search entry removal', function() {
   var map = ArrayMap();
   for (var i = 0; i < 100; i++) {
      map.put(i, i * 2);
   }
   for (var i = 0; i < 90; i++) {
      map.remove(i);
   }

   deepEqual(map.keys().items, [90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
   equal(map.size(), 10);

   map.remove(92);
   deepEqual(map.keys().items, [90, 91, 93, 94, 95, 96, 97, 98, 99]);
   equal(map.size(), 9);

   map.remove(98);
   equalEntryArray(map.items, [
      [90, 180], [91, 182], [93, 186], [94, 188], 
      [95, 190], [96, 192], [97, 194], [99, 198]]);
});

test('toString', function() {
   var sarah = {name: 'sarah', toString: function() {return 'sarah'}};
   var map = ArrayMap(1, sarah, 3, 4);

   equal(map.toString(), 'ArrayMap(1 -> sarah, 3 -> 4)');
});

// Iterable tests, specialized for ArrayMap
test('size', function() {
   equal(this.numberMap.size(), 3);
});

test('first', function() {
   var first = this.numberMap.first();
   equalEntry(first, {key: 1, value: 10});
});

test('last', function() {
   var last = this.numberMap.last();
   equalEntry(last, {key: 3, value: 30});
});

test('each', function() {
   var counter = 0;
   this.numberMap.each(function(key, value) {
      counter++;
      ok(key);
      ok(value);
   });
   equal(counter, 3);

   var indices = [];
   this.numberMap.each(function(key, value, index) {
      indices.push(index);
   });
   deepEqual(indices, [0, 1, 2]);
});

test('map', function() {
   var mapped = this.numberMap.map(function(key, value) {
      return [key * -1, value * 10];
   });
   equalEntryArray(mapped.items, [[-1, 100], [-2, 200], [-3, 300]]);

   var anotherMapped = this.numberMap.map(function(key, value) {
      return {key: key * -1, value: value *10};
   });
   equalEntryArray(anotherMapped.items, [[-1, 100], [-2, 200], [-3, 300]]);
});

test('extractProperty', function() {
   var map = ArrayMap(
      1, {name: 'coco', address: {code: 'SW4'}},
      2, {name: 'titi', address: {code: null}},
      {keyName: 'roseKey'}, {name: 'rose', address: {code: 'NW7'}});

   var names = map.extractProperty('value.name');
   deepEqual(names.items, ['coco', 'titi', 'rose']);

   var codes = map.extractProperty('value.address.code');
   deepEqual(codes.items, ['SW4', null, 'NW7']);

   var keyNames = map.extractProperty('key.keyName');
   deepEqual(keyNames.items, [undefined, undefined, 'roseKey']);
});

test('filter', function() {
   var filtered = this.numberMap.filter(function(key, value) {
      return (key < 3) && (value > 10);
   });
   equalEntryArray(filtered.items, [[2, 20]]);
});

test('partition', function() {
   var partitions = this.numberMap.partition(function(key, value) {
      return (value > 10);
   });
   equalEntryArray(partitions[0].items, [[2, 20], [3, 30]]);
   equalEntryArray(partitions[1].items, [[1, 10]]);
});

test('count', function() {
   equal(2, this.numberMap.count(function(key, value) {return value < 30}));
});

test('some', function() {
   ok(this.numberMap.some(function(key, value) {return value == 20}));
   ok(!this.numberMap.some(function(key, value) {return value == 40}));
});

test('fold', function() {
   var result = this.numberMap.fold(100, function(key, value, acc) {
      return acc + key + value;
   });

   equal(result, 166);
});

test('find', function() {
   var result = this.numberMap.find(function(key, value) {return key == 2 && value == 20});
   equalEntry(result, {key: 2, value: 20});

   result = this.numberMap.find(function(key, value) {return key == 4});
   equal(result, undefined);
});

test('every', function() {
   var allNumbers = this.numberMap.every(function(key, value) {
      return typeof key == 'number' && typeof value == 'number';
   });
   ok(allNumbers);

   var shouldBefalse = this.numberMap.every(function(key, value) {
      return key < 5 && value < 20;
   });
   ok(!shouldBefalse);
});

test('grouped', function() {
   var result = this.numberMap.grouped(2);
   ok(result instanceof List);
   ok(result.items[0] instanceof ArrayMap);
   equalEntryArray(result.items[0].items, [[1, 10], [2, 20]]);
   equalEntryArray(result.items[1].items, [[3, 30]]);
});

test('drop', function() {
   var result = this.numberMap.drop(2);
   equalEntryArray(result.items, [[3, 30]]);
});

test('dropRight', function() {
   var result = this.numberMap.dropRight(2);
   equalEntryArray(result.items, [[1, 10]]);
});

test('dropWhile', function() {
   var result = this.numberMap.dropWhile(function(key, value) {
      return (value <= 20);   
   });
   equalEntryArray(result.items, [[3, 30]]);
});

test('groupBy', function() {
   var map = this.numberMap.groupBy(function(key, value) {
      return (value >= 20) ? 'bigValues' : 'smallValues';
   });

   ok(map instanceof Map);
   ok(map.get('smallValues') instanceof List);
   equalEntryArray(map.get('smallValues').items, [[1, 10]]);
   equalEntryArray(map.get('bigValues').items, [[2, 20], [3, 30]]);
});

test('take', function() {
   var result = this.numberMap.take(2);
   equalEntryArray(result.items, [[1, 10], [2, 20]]);
});

test('takeRight', function() {
   var result = this.numberMap.takeRight(2);
   equalEntryArray(result.items, [[2, 20], [3, 30]]);
});

test('takeWhile', function() {
   var result = this.numberMap.takeWhile(function(key, value) {
      return value < 30;
   });
   equalEntryArray(result.items, [[1, 10], [2, 20]]);
});

test('reverse', function() {
   var reversed = this.numberMap.reverse();
   equalEntryArray(reversed.items, [[3, 30], [2, 20], [1, 10]]);
   notEqual(reversed, this.numberMap);
   notEqual(reversed.items, this.numberMap.items);
});

test('slice', function() {
   var result = this.numberMap.slice(1, 3);
   equalEntryArray(result.items, [[2, 20], [3, 30]]);  
});

test('mkString', function() {
   var str = this.numberMap.mkString('[', ', ', ']');
   equal(str, '[1 -> 10, 2 -> 20, 3 -> 30]');
});

test('toArray', function() {
   var result = this.numberMap.toArray();
   equalEntryArray(result, [[1, 10], [2, 20], [3, 30]]);
   notEqual(result, this.numberMap.items);
});


var equalEntry = function(entry1, entry2) {
   var equal = (entry1.key === entry2.key && entry1.value === entry2.value);
   ok(equal);
};

var equalEntryArray = function(mapEntries, expectedEntries) {
   for (var i = 0; i < expectedEntries.length; i++) {
      var entry = mapEntries[i];
      var expected = expectedEntries[i];
      if (entry.key !== expected[0]) return fail('Expected key ' + expected[0] + ' but got ' + entry.key);
      if (entry.value !== expected[1]) return fail('Expected value ' + expected[1] + ' but got ' + entry.value);
   }
   ok(true);
};