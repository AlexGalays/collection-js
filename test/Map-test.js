
var mapTests = {
   "construction": function() {
      var map = this.MapType(
         3, {name: 'coco'},
         7, {name: 'lala'},
         4, {name: 'toto'});
      
      equal(map.size(), 3);
      ok(map instanceof this.MapType);

      raises(function() {
         this.MapType(3, {name: 'coco'}, 7)}, 
         'A Map has to be constructed with an even number of args');
   },

   "put, get, contains": function() {
      var map = this.MapType();
      var map2 = this.MapType();
      var sarah = {name: 'sarah'};
      var blue = {color: 'blue'};
      var red = {color: 'red'};

      map.put(1, blue);
      map.put(sarah, red);
      map.put(red, 5);
      map.put(4, null);
      map2.put(sarah, blue);

      this.sameArrays(map.keys().items, [1, sarah, red, 4]);
      this.sameArrays(map.values().items, [blue, red, 5, null]);
      this.sameArrays(map2.keys().items, [sarah]);
      this.sameArrays(map2.values().items, [blue]);
      this.sameArrays(map.toList().map(
         function(entry) {return entry.key}).items, 
         [1, sarah, red, 4]);
      this.sameArrays(map.toList().map(
         function(entry) {return entry.value}).items, 
         [blue, red, 5, null]);
      
      equal(map.put(sarah, blue), red);
      equal(map.size(), 4);
      equal(map.get(blue), undefined);

      ok(map.containsKey(sarah));
      ok(map.containsValue(blue));
      ok(!map.containsKey(blue));
      ok(!map.containsValue(sarah));
      ok(!map.containsKey({name: 'sarah'}), 'by default, key instance equality is used');
      ok(!map.containsKey(5));

      var value = map.remove(sarah);
      this.sameArrays(map.keys().items, [1, red, 4]);
      this.sameArrays(map.values().items, [blue, 5, null]);
      ok(!map.containsKey(sarah));
      equal(value, blue);

      map.remove(4);
      this.sameArrays(map.keys().items, [1, red]);
      ok(!map.containsKey(4));
   },

   "remove": function() {
      var sarah = {name: 'sarah'};
      var map = this.MapType(
         1, sarah, 
         sarah, 4, 
         5, 6);
      
      var value = map.remove(5);
      this.sameArrays(map.keys().items, [1, sarah]);
      equal(value, 6);
      equal(map.size(), 2);

      var value = map.remove('madeUp');
      this.sameArrays(map.keys().items, [1, sarah]);
      equal(value, undefined);
      equal(map.size(), 2);

      value = map.remove(1);
      this.sameArrays(map.keys().items, [sarah]);
      equal(value, sarah);

      value = map.remove(sarah);
      this.sameArrays(map.keys().items, []);
      equal(value, 4);
      equal(map.size(), 0);
   },

   "removeIf": function() {
      var sarah = {name: 'sarah'};
      var map = this.MapType(
         1, sarah, 
         3, 4, 
         5, 6);
      
      map.removeIf(function(key, value) {
         return key == 3 || value == sarah;
      });
      this.sameArrays(map.keys().items, [5]);
   },

   "removeAll": function() {
      var sarah = {name: 'sarah'};
      var map = this.MapType(
         1, sarah, 
         3, 4,
         5, 6);

      map.removeAll();
      equal(map.size(), 0);
      ok(!map.containsKey(sarah));
      this.sameArrays(map.keys().items, []);
   },

   "each": function() {
      var seenItems = [];
      function remember(key, value) {seenItems.push([key, value])};
      var map = this.MapType(
         1, {name: 'one'},
         {name: 'two'}, 2);
      map.each(remember);

      equal(seenItems.length, 2);
      
      while (seenItems.length > 0) {
         var pair = seenItems.pop();
         ok((pair[0] == 1 && pair[1].name == 'one') ||
            (pair[0].name == 'two' && pair[1] == 2));
      }
   },

   "withKey": function() {
      function personEmail(person) {return person.email};
      var map = this.MapType.withKey(personEmail,
         {name: 'sarah', email: 's.connor@me.com'}, 1,
         {name: 'pedro', email: 'delpaso@titi.com'}, 2,
         {name: 'unknown', email: ''}, 3);

      ok(map.containsKey({email: ''}));
      equal(map.get({email: ''}), 3);
      ok(map.containsKey({name: 'sarah', email: 's.connor@me.com'}));
      ok(map.containsKey({name: 'the wrong sarah', email: 's.connor@me.com'}));

      map.remove({email: 's.connor@me.com'});
      ok(!map.containsKey({name: 'sarah', email: 's.connor@me.com'}));
      ok(!map.containsKey({name: 'the wrong sarah', email: 's.connor@me.com'}));
   },

   "toList": function() {
      var sarah = {name: 'sarah'};
      var map = this.MapType(
         1, sarah, 
         3, 4,
         5, 6);

      var list = map.toList();
      
      list.each(function(entry) {
         ok((entry.key == 1 && entry.value == sarah) ||
            (entry.key == 3 && entry.value == 4) ||
            (entry.key == 5 && entry.value == 6));
      });
   },

   "clone": function() {
      var sarah = {name: 'sarah'};
      var original = this.MapType(
         1, sarah, 
         3, 4,
         5, 6);
      var clone = original.clone();

      this.sameArrays(original.keys().items, clone.keys().items);
      this.sameArrays(original.values().items, clone.values().items);
      ok(original != clone);
   },

   "cloning keeps the withKey setting": function() {
      var sarah = {name: 'sarah'};
      function personEmail(person) {return person.email};
      var map = this.MapType.withKey(personEmail,
         {name: 'sarah', email: 's.connor@me.com'}, 1,
         {name: 'pedro', email: 'delpaso@titi.com'}, 2,
         {name: 'unknown', email: ''}, 3);

      var clone = map.clone();
      equal(clone.get({email: ''}), 3);
   }
};

module("Map", {setup: function() {
   this.MapType = Map;
   this.sameArrays = sameArraysWithoutOrdering;
}});

runTests(mapTests);

test('toString', function() {
   var sarah = {name: 'sarah', toString: function() {return 'sarah'}};
   var map = Map(1, sarah, 3, 4);

   equal(map.toString(), 'Map(1 -> sarah, 3 -> 4)');
});