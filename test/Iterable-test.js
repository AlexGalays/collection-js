
// List-like iterable tests; Iterable applied to a Map is tested in ArrayMap-test
var iterableTests = {
   size: function() {
      equal(this.iterable.size(), 6);
   },

   first: function() {
      equal(this.iterable.first(), 1);

      var empty = this.iterable._createNew([]);
      raises(function() {empty.first()}, 'first() on an empty list is illegal');
   },

   last: function() {
      equal(this.iterable.last(), 6);

      var empty = this.iterable._createNew([]);
      raises(function() {empty.last()}, 'last() on an empty list is illegal');
   },

   each: function() {
      var counter = 0;
      this.iterable.each(function(num) {counter++});
      equal(counter, 6);
   },
   
   map: function() {
      var mapped = this.iterable.map(function(num) {
         return num * -1;
      });
      deepEqual(mapped.items, [-1, -2, -3, -4, -5, -6]);

      mapped = this.iterable.map((function() {
         var total = 0;
         return function(num) {total += num; return total;};      
      })());

      deepEqual(mapped.items, [1, 3, 6, 10, 15, 21]);
   },

   extractProperty: function() {
      var iterable = this.iterable._createNew([
         {name: 'coco', address: {code: 'SW4'}}, 
         {name: 'titi', address: {code: null}}, 
         {name: 'rose', address: {code: 'NW7'}}]);

      var names = iterable.extractProperty('name');
      deepEqual(names.items, ['coco', 'titi', 'rose']);

      var codes = iterable.extractProperty('address.code');
      deepEqual(codes.items, ['SW4', null, 'NW7']);
   },

   filter: function() {
      var filtered = this.iterable.filter(function(num) {
         return (num < 3);
      });
      deepEqual(filtered.items, [1, 2]);
   },

   partition: function() {
      var partitions = this.iterable.partition(function(num) {
         return (num % 2) == 0;
      });
      deepEqual(partitions[0].items, [2, 4, 6]);
      deepEqual(partitions[1].items, [1, 3, 5]);
   },

   contains: function() {
      ok(this.iterable.contains(1));
      ok(this.iterable.contains(4));
      ok(!this.iterable.contains('4'));
      ok(!this.iterable.contains(7)); 
   },

   count: function() {
      equal(3, this.iterable.count(function(num) {return num < 4}));
   },

   some: function() {
      ok(this.iterable.some(function(num) {return num === 2}));
      ok(!this.iterable.some(function(num) {return num === 7}));
   },

   fold: function() {
      var result = this.iterable.fold(100, function(num, acc) {
         return acc + num;
      });

      equal(result, 121);
   },

   find: function() {
      var result = this.iterable.find(function(num) {return num === 2});
      equal(result, 2);

      result = this.iterable.find(function(num) {return num === 50});
      equal(result, undefined);
   },

   every: function() {
      var allNumbers = this.iterable.every(function(item) {return typeof item == 'number'});
      ok(allNumbers);

      var allLessThanFive = this.iterable.every(function(item) {return item < 5});
      ok(!allLessThanFive);
   },

   grouped: function() {
      var result = this.iterable.grouped(4);
      ok(result instanceof List);
      deepEqual(result.items[0].items, [1, 2, 3, 4]);
      deepEqual(result.items[1].items, [5, 6]);
   },

   drop: function() {
      var result = this.iterable.drop(2);
      deepEqual(result.items, [3, 4, 5, 6]);
   },

   dropRight: function() {
      var result = this.iterable.dropRight(2);
      deepEqual(result.items, [1, 2, 3, 4]);
   },

   dropWhile: function() {
      var result = this.iterable.dropWhile(function(num) {
         return (num < 4);   
      });
      deepEqual(result.items, [4, 5, 6]);
   },

   groupBy: function() {
      var map = this.iterable.groupBy(function(num) {
         return ((num % 2) == 0) ? 'even' : 'odd';
      });

      ok(map instanceof Map);
      ok(map.get('even') instanceof List);
      deepEqual(map.get('even').items, [2, 4, 6]);
      deepEqual(map.get('odd').items, [1, 3, 5]);
   },

   take: function() {
      var result = this.iterable.take(2);
      deepEqual(result.items, [1, 2]);
   },

   takeRight: function() {
      var result = this.iterable.takeRight(2);
      deepEqual(result.items, [5, 6]);
   },

   takeWhile: function() {
      var result = this.iterable.takeWhile(function(num) {
         return (num < 4);   
      });
      deepEqual(result.items, [1, 2, 3]);
   },

   sameItems: function() {
      ok(!this.iterable.sameItems(Iterable([1, 2, 4, 3, 5, 6])));
      ok(this.iterable.sameItems(Iterable([1, 2, 3, 4, 5, 6])));
   },

   reverse: function() {
      var reversed = this.iterable.reverse();
      deepEqual(reversed.items, [6, 5, 4, 3, 2, 1]);
      notEqual(reversed, this.iterable);
      notEqual(reversed.items, this.iterable.items);
   },

   slice: function() {
      var result = this.iterable.slice(1, 4);
      deepEqual(result.items, [2, 3, 4]);  
   },

   mkString: function() {
      var str = this.iterable.mkString('[', ', ', ']');
      equal(str, '[1, 2, 3, 4, 5, 6]');
   },

   toArray: function() {
      var result = this.iterable.toArray();
      deepEqual(result, [1, 2, 3, 4, 5, 6]);
      notEqual(result, this.iterable.items);
   },

   clone: function() {
      var clone = this.iterable.clone();
      deepEqual(clone.items, [1, 2, 3, 4, 5, 6]);
      ok(clone instanceof this.iterable.constructor);
      notEqual(clone, this.iterable);
      notEqual(clone.items, this.iterable.items);
   }
};


module("Iterable - simple iterable", {
   setup: function() {
      var ArrayWrapper = function(items) {
         this.items = items;
      };

      ArrayWrapper.prototype = new Iterable();

      ArrayWrapper.prototype._createNew = function(array) {
         return new ArrayWrapper(array);
      };

      this.iterable = new ArrayWrapper([1, 2, 3, 4, 5, 6]);
   }
});

runTests(iterableTests);


module("Iterable - wrapped array", {
   setup: function() {
      this.array = [1, 2, 3, 4, 5, 6];
      this.iterable = Iterable(this.array);
   }
});

/* Can't run the full test suite as wrapping an Array creates an iterable 
that produce Arrays, not iterables. So just test the methods were attached. */
test("size", function() {
   equal(6, this.iterable.size());
});

test("filter", function() {
   var filtered = this.iterable.filter(function(num) {
      return (num > 2);
   });
   deepEqual(filtered, [3, 4, 5, 6]);
});