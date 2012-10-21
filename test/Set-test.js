
var setTests = {
   "construction": function() {
      var set = this.SetType(1, 2, 3);
      equal(set.size(), 3);
      ok(set instanceof this.SetType);
   },

   "add, remove, contains": function() {
      var set = this.SetType();
      var sarah = {name: 'sarah'};

      set.add(1);
      set.add(sarah);
      set.add(3);
      set.add(4);

      this.sameArrays(set.toArray(), [1, sarah, 3, 4]);
      equal(set.add(sarah), false);
      this.sameArrays(set.toArray(), [1, sarah, 3, 4]);
      ok(set.contains(sarah));
      ok(!set.contains({name: 'sarah'}), 'by default, key instance equality is used');
      ok(set.contains(3));

      set.remove(sarah);
      this.sameArrays(set.toArray(), [1, 3, 4]);
      ok(!set.contains(sarah));

      set.remove(4);
      this.sameArrays(set.toArray(), [1, 3]);
      ok(!set.contains(4));
   },

   "removeIf": function() {
      var sarah = {name: 'sarah'};
      var set = this.SetType(1, sarah, 3, 4, 5);
      
      set.removeIf(function(item) {
         return item == 3 || item == sarah || item == 5;
      });
      this.sameArrays(set.toArray(), [1, 4]);
      ok(!set.contains(sarah));
      ok(!set.contains(5));
   },

   "removeAll": function() {
      var sarah = {name: 'sarah'};
      var set = this.SetType(1, sarah, 3);

      set.removeAll();
      equal(set.size(), 0);
      ok(!set.contains(sarah));
   },

   "withKey": function() {
      function personEmail(person) {return person.email};
      var set = this.SetType.withKey(personEmail,
         {name: 'sarah', email: 's.connor@me.com'},
         {name: 'pedro', email: 'delpaso@titi.com'},
         {name: 'unknown', email: ''});
         
      ok(set.contains({email: ''}));
      ok(set.contains({name: 'sarah', email: 's.connor@me.com'}));
      ok(set.contains({name: 'the wrong sarah', email: 's.connor@me.com'}));

      set.remove({email: 's.connor@me.com'});
      ok(!set.contains({name: 'sarah', email: 's.connor@me.com'}));
      ok(!set.contains({name: 'the wrong sarah', email: 's.connor@me.com'}));
   },

   "each": function() {
      var seenItems = [];
      function remember(item) {seenItems.push(item)};
      var set = this.SetType(1, 4, 3);
      set.each(remember);

      equal(seenItems.length, 3);
      ok(seenItems.indexOf(1) != -1);
      ok(seenItems.indexOf(1) != 4);
      ok(seenItems.indexOf(1) != 3);
   },

   "union": function() {
      var set1 = this.SetType(1, 2, 3);
      var set2 = this.SetType(1, 5, 4, 6, 3);
      this.sameArrays(set1.union(set2).toArray(), [1, 2, 3, 5, 4, 6]);
      this.sameArrays(set2.union(set1).toArray(), [1, 2, 3, 5, 4, 6]);
   },

   "intersect": function() {
      var set1 = this.SetType(1, 2, 3);
      var set2 = this.SetType(1, 5, 4, 6, 3);
      this.sameArrays(set1.intersect(set2).toArray(), [1, 3]);
      this.sameArrays(set2.intersect(set1).toArray(), [1, 3]);
   },

   "diff": function() {
      var set1 = this.SetType(1, 2, 3);
      var set2 = this.SetType(1, 5, 4, 6, 3);
      this.sameArrays(set1.diff(set2).toArray(), [2]);
      this.sameArrays(set2.diff(set1).toArray(), [5, 4, 6]);
   },

   "toList": function() {
      var sarah = {name: 'sarah'};
      var set = this.SetType(1, sarah, 3);

      var list = set.toList();
      this.sameArrays(list.items, [1, sarah, 3]);
   },

   "toArray": function() {
      var sarah = {name: 'sarah'};
      var set = this.SetType(1, sarah, 3);

      var array = set.toArray();
      this.sameArrays(array, [1, sarah, 3]);
   },

   "clone": function() {
      var sarah = {name: 'sarah'};
      var original = this.SetType(1, sarah, 3);
      var clone = original.clone();
      this.sameArrays(clone.toArray(), original.toArray());
      ok(clone != original); 
   },

   "cloning keeps the withKey setting": function() {
      function personEmail(person) {return person.email};
      var set = this.SetType.withKey(personEmail,
         {name: 'sarah', email: 's.connor@me.com'},
         {name: 'pedro', email: 'delpaso@titi.com'},
         {name: 'unknown', email: ''});
      
      var clone = set.clone();
      ok(clone.contains({email: ''}));
   }
};

module("Set", {setup: function() {
   this.SetType = Set;
   this.sameArrays = sameArraysWithoutOrdering;
}});

runTests(setTests);

test('toString', function() {
   var sarah = {name: 'sarah', toString: function() {return 'sarah'}};
   var set = Set(1, sarah, 3, 4, 5);

   equal(set.toString(), 'Set(1, sarah, 3, 4, 5)');
});