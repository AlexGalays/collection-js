
module("List", {setup: function() {
	this.iterable = this.seq = List(1, 2, 3, 4, 5, 6);
}});

runTests(iterableTests);
runTests(sequenceTests);

test("construction shorthand", function() {
	var list = List(1, 2, 3);
	equal(list.size(), 3);
	ok(list instanceof List);
});

test("construction from Array", function() {
	var list = List.fromArray([1, 2, 3]);
	ok(list instanceof List);
	deepEqual(list.items, [1, 2, 3]);
});

test("construction with the new keyword", function() {
	var list = new List(1, 2, 3);
	ok(list instanceof List);
	deepEqual(list.items, [1, 2, 3]);

	list = new List();
	ok(list instanceof List);
	deepEqual(list.items, []);
});

test("construction of an empty list", function() {
	var list = List();
	equal(list.size(), 0);
	deepEqual(list.items, []);
});

test("add", function() {
	var list = List(1, 2, 3);
	list.add(4);
	deepEqual(list.items, [1, 2, 3, 4]);
});

test("addAt", function() {
	var list = List(1, 2, 3);
	var newObject = {};

	list.addAt(newObject, 2);
	deepEqual(list.items, [1, 2, newObject, 3]);

	raises(function() {list.addAt({}, -3);}, 'cannot add at a negative index');
	raises(function() {list.addAt({}, 7);}, 'sparse lists are not supported');
});

test("update", function() {
	var list = List(1, 2, 3);
	list.update(1, 10);
	deepEqual(list.items, [1, 10, 3]);
});

test("remove", function() {
	var list = List(1, 2, 3);

	var removed = list.remove(2);
	equal(removed, 2)
	deepEqual(list.items, [1, 3]);

	removed = list.remove(4);
	equal(false, removed);
});

test("removeAt", function() {
	var list = List("01", "02", "03");

	var removed = list.removeAt(1);
	equal(removed, "02");
	deepEqual(list.items, ["01", "03"]);
	equal(list.size(), 2);
});

test("removeIf", function() {
	var list = List(1, -2, 3, -4, -5, 6);

	var removed = list.removeIf(function(num) {return num < 0});
	deepEqual(removed.items, [-2, -4, -5]);
	equal(removed.size(), 3);
	deepEqual(list.items, [1, 3, 6]);
	equal(list.size(), 3);

	removed = list.removeIf(function(num) {return num > 50});
	deepEqual(removed.items, []);
	equal(removed.size(), 0);
	deepEqual(list.items, [1, 3, 6]);
	equal(list.size(), 3);
});

test("removeFirst", function() {
	var list = List(1, 2, 3);
	list.removeFirst();
	deepEqual(list.items, [2, 3]);
});

test("removeLast", function() {
	var list = List(1, 2, 3);
	list.removeLast();
	deepEqual(list.items, [1, 2]);
});

test("removeAll", function() {
	var list = List(1, 2, 3);
	list.removeAll();
	deepEqual(list.items, []);
});

test("contains", function() {
	var list = List(1, 2, 3);
	ok(list.contains(2));
	ok(!list.contains(4));
});

test("toSet", function() {
	var sarah = {name: 'sarah'};
	var list = List(1, sarah, 3);

	var set = list.toSet();
	sameArraysWithoutOrdering(set.toArray(), [1, sarah, 3]);
	ok(set.contains(sarah));
	ok(set.contains(3));
});

test("toString", function() {
	var sarah = {name: 'sarah', toString: function() {return 'sarah'}};
	var list = List(1, sarah, 3);
	equal(list.toString(), 'List(1, sarah, 3)');
});


module("range", {
   setup: function() {
      this.seq = this.iterable = range(1, 6);   
   }
});

runTests(iterableTests);
runTests(sequenceTests);

test("range without args", function() {
   var emptyRange = range();
   deepEqual(emptyRange.items, []);
});

test("range with just one arg", function() {
   var r = range(5);
   deepEqual(r.items, [0, 1, 2, 3, 4]);
});

test("Simple range without step", function() {
	var r = range(1, 4);
   deepEqual(r.items, [1, 2, 3, 4]);
   ok(r.contains(1));
   ok(r.contains(3));
   ok(r.contains(4));
   ok(!r.contains(0));
   ok(!r.contains(5));
});

test("Simple range with step of 1", function() {
   deepEqual(range(1, 4, 1).items, [1, 2, 3, 4]);
});

test("range with bigger step", function() {
   deepEqual(range(0, 15, 5).items, [0, 5, 10, 15]);
});

test("range with bigger step - II", function() {
   deepEqual(range(1, 15, 5).items, [1, 6, 11]);
});

test("range with negative step", function() {
   deepEqual(range(2, -4, -1).items, [2, 1, 0, -1, -2, -3, -4]);
});