
var iterableTests = {
   size: function() {
      equal(this.iterable.size(), 6);
   },

   first: function() {
      equal(this.iterable.first(), 1);

      var empty = this.iterable._createNew([]);
      equal(empty.first(), undefined);
   },

   last: function() {
      equal(this.iterable.last(), 6);

      var empty = this.iterable._createNew([]);
      equal(empty.last(), undefined);
   },

   each: function() {
      var counter = 0;
      this.iterable.each(function(num) {counter++});
      equal(counter, 6);

      var indices = [];
      this.iterable.each(function(num, index) {
         indices.push(index);
      });
      deepEqual(indices, [0, 1, 2, 3, 4, 5]);
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

      mapped = this.iterable.map(function(num) {
         return (num % 2) == 0 
            ? num * -1 
            : Collection.NOT_MAPPED;
      });
      deepEqual(mapped.items, [-2, -4, -6]);

      // An empty mapping should maintain the original type
      mapped = this.iterable.map(function(num) {
         return Collection.NOT_MAPPED;
      });
      ok(mapped instanceof this.iterable.constructor);
      deepEqual(mapped.items, []);
   },

   pluck: function() {
      var iterable = this.iterable._createNew([
         {name: 'coco', address: {code: 'SW4'}}, 
         {name: 'titi', address: {code: null}}, 
         {name: 'rose', address: {code: 'NW7'}}]);

      var names = iterable.pluck('name');
      deepEqual(names.items, ['coco', 'titi', 'rose']);

      var codes = iterable.pluck('address.code');
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

   findBy: function() {
      var iterable = this.iterable._createNew([
         {name: 'coco', address: {code: 'SW4'}}, 
         {name: 'titi', address: {code: null}}, 
         {name: 'rose', address: {code: 'NW7'}}]);

      var maybeTiti = iterable.findBy('name', 'titi');
      equal(maybeTiti, iterable.items[1]);

      var maybeJohn = iterable.findBy('name', 'john');
      equal(maybeJohn, undefined);

      var nwPerson = iterable.findBy('address.code', 'NW7');
      equal(nwPerson, iterable.items[2]);
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
      var SimpleIterable = function(items) {
         this.items = items;
      };

      SimpleIterable.prototype = new Iterable();

      SimpleIterable.prototype._createNew = function(array) {
         return new SimpleIterable(array);
      };

      this.iterable = new SimpleIterable([1, 2, 3, 4, 5, 6]);
   }
});

runTests(iterableTests);