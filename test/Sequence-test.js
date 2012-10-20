
var sequenceTests = {
   contains: function() {
      ok(this.seq.contains(1));
      ok(this.seq.contains(4));
      ok(!this.seq.contains('4'));
      ok(!this.seq.contains(7)); 
   },

   distinct: function() {
      var seq = this.seq._createNew([1, 2, 2, 3, 1, 4, 2, 3]);
      deepEqual(seq.distinct().items, [1, 2, 3, 4]);

      var sarah = {};
      var john = {};
      seq = this.seq._createNew([sarah, sarah, john, sarah, john]);
      deepEqual(seq.distinct().items, [sarah, john]);
   },

   flatten: function() {
      var seq = this.seq._createNew([1, [2, 3], Seq([4, 5]), 6, List(7, 8), 9]);
      deepEqual(seq.flatten().items, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
   },

   indexOf: function() {
      var seq = this.seq._createNew([1, 2, 3]);
      equal(seq.indexOf(2), 1);
      equal(seq.indexOf(4), -1);
      equal(seq.indexOf(3, 1), 2);
      equal(seq.indexOf(2, 2), -1);
   },

   lastIndexOf: function() {
      var seq = this.seq._createNew([1, 2, 2, 3, 1, 3, 1, 2, 1, 1, 3]);
      equal(seq.lastIndexOf(1), 9);
      equal(seq.lastIndexOf(2), 7);
      equal(seq.lastIndexOf(3), 10);
      equal(seq.lastIndexOf(4), -1);
   },

   sameItems: function() {
      ok(!this.seq.sameItems(Seq([1, 2, 4, 3, 5, 6])));
      ok(this.seq.sameItems(Seq([1, 2, 3, 4, 5, 6])));
      ok(this.seq.sameItems([1, 2, 3, 4, 5, 6]));
   },

   map: function() {
      // Mapping a Seq to ArrayMap by returning tuples
      var mapped = this.seq.map(function(num) {
         return [num, num * 10];
      });
      ok(mapped instanceof ArrayMap);
      equalEntryArray(mapped.items, 
         [[1, 10], [2, 20], [3, 30], [4, 40], [5, 50], [6, 60]]);
   }
};


module("Sequence - simple sequence", {
   setup: function() {
      var SimpleSequence = function(items) {
         this.items = items;
      };

      SimpleSequence.prototype = new Sequence();

      SimpleSequence.prototype._createNew = function(array) {
         return new SimpleSequence(array);
      };

      this.seq = this.iterable = new SimpleSequence([1, 2, 3, 4, 5, 6]);
   }
});

runTests(iterableTests);
runTests(sequenceTests);

module("Sequence - wrapped array", {
   setup: function() {
      this.array = [1, 2, 3, 4, 5, 6];
      this.seq = Seq(this.array);
   }
});

/* Can't run the full test suite for wrapped arrays as wrapping an Array creates a Seq 
that produce Arrays, not Seqs; So just test the methods were attached. */
test("size", function() {
   equal(6, this.seq.size());
});

test("filter", function() {
   var filtered = this.seq.filter(function(num) {
      return (num > 2);
   });
   deepEqual(filtered, [3, 4, 5, 6]);
});

test("flatten", function() {
   var seq = Seq([1, [2, 3], Seq([4, 5]), 6, List(7, 8), 9]);
   deepEqual(seq.flatten(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("mapping to an ArrayMap", function() {
   var mapped = this.seq.map(function(num) {return [num, num * 10]});
   ok(mapped instanceof ArrayMap);
});