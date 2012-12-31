# collection-js
Provides a small set of general purpose collections with implementations tailored for Javascript.  
Some inspiration comes from [Scala](http://www.scala-lang.org/) and its rich object/functional hybrid approach which fits JS well.  
It should be compatible with any JS engine, even IE6's (Although it wasn't tested against it thus far)  

collection-js weights 16KB minified and focuses solely on collections.

# Content
* [Code example](#code-example)
* [Using the library in your code](#using-the-lib)
* [Motivation](#motivation)
* [Building collection-js](#building)
* [API](#api)
* [Extending collection-js](#extending)

<a name="code-example"></a>
# Code example

## JS
```javascript
var List = Collection.List;
var Set = Collection.Set;
var ArrayMap = Collection.ArrayMap;
var Seq = Collection.Seq;

var people = Set(john, alice, robert);

var peopleArray = [john, alice, robert];
Seq(peopleArray).each(console.log);
Seq(peopleArray).count(function(person) {return person.age > 70});

var sportyPeople = ArrayMap(
   alpinism,  List(alice, john),
   rugby,     List(robert, john),
   swimming,  List(john, alice)
);

var isAthleteFor = function(sport) {
   return function(person) {return person.weeklyTrainings.get(sport) > 10};
};

var athletes = sportyPeople.map(function(sport, people) {
   return [sport, people.filter(isAthleteFor(sport))];
});

var swimmingAthletes = athletes.get(swimming);

console.log('There are ' + swimmingAthletes.size() + ' pro swimmers');
console.log('All athletes: ' + athletes.values().flatten().distinct());
```

## CS
```coffeescript
List = Collection.List
Set = Collection.Set
ArrayMap = Collection.ArrayMap
Seq = Collection.Seq

people = Set(john, alice, robert)

peopleArray = [john, alice, robert]
Seq(peopleArray).each console.log
Seq(peopleArray).count (person) -> person.age > 70

sportyPeople = ArrayMap(
   alpinism,  List(alice, john),
   rugby,     List(robert, john),
   swimming,  List(john, alice)
)

isAthleteFor = (sport) -> 
   (person) -> person.weeklyTrainings.get(sport) > 10

athletes = sportyPeople.map (sport, people) ->
   [sport, people.filter isAthleteFor(sport)]
   
swimmingAthletes = athletes.get(swimming)

console.log("There are #{ swimmingAthletes.size() } pro swimmers")
console.log("All athletes: #{ athletes.values().flatten().distinct() }")
```

<a name="using-the-lib"></a>
# Using the library in your code

**As a script tag in the browser**

Use collection-debug or collection-release in a script tag. This creates a global Collection namespace.

**In node.js**

collection-debug and collection-release can be used as node modules.

**Using an AMD loader**

collection-amd-debug is an AMD compatible module.  
The cleanest notation to use this library in your code using AMD is probably:  
```javascript
var Set = require("collection").Set;
```


This library has no dependencies.


<a name="motivation"></a>
# Motivation
Javascript is a tiny language used more and more to build big sites and apps. It's even used on the server sometimes. 
To store your data, Javascript provides out of the box:

**Array**

JS Arrays are quite decent; They're dynamic so you thankfully don't have to resize them yourself.
I consider some of the Array's API old fashioned and clunky, e.g splice which takes two integers as its first arguments; 
There is no remove() method which certainly would be used more often than splice().
Some of the API that was added over the years feel a bit more modern, like forEach although without shims they're not available in all browsers (forEach only since IE9).

Some libraries like underscore take the approach of wrapping an Array instance in a function to augment it; 
While augmenting with function wrapping can be an elegant pattern, I find the syntax for collections a bit ugly and repetitive, also chaining looks like a hack so people usually skip it.  
Some other libraries modify the Array prototype with non standard methods; I'm usually against this when it's done from a third party library.

Hence [List](#list-api), a richer, different type from Array. Like in some high level languages, using List is often the preferred approach but Arrays can still be used.


**Object used as... An object**

Nothing wrong here.  


**Object used as a Map**

Now it gets bad. You can represent associations using an Object:

```javascript
{'key1': value1, 'key2': value2}
```
The biggest limitation is that effectively, only strings can be used as keys. You could override all your objects' toString() methods to achieve this 'transparently' 
but it comes with some problems, is cumbersome (Especially when using object literals) and doesn't make sense semantically: toString() when overriden should be a nice
string representation of the object, not its identity across the runtime.

Code using maps this way typically have to juggle a lot between objects and their string representation (Usually some id or name property); 
Some data structure maintains a list of ids, another one has the objects themselves and there is code in a few places to go back and forth between the two. 
It's cumbersome and distracting for the reader.

Another issue is that Objects have no Map API or state. Something as simple as getting the size of the map is an exercice on its own: Object.keys(map).length can only be used if shimmed.
You have to use a low level loop over the keys to do pretty much any work, as Objects have no Map-like API beside `[]`, `.` and `delete`.

Hence [Map](#map-api) and its ordered sister [ArrayMap](#arraymap-api).


**Object used as a Set**

All the issues mentionned for maps apply to sets, since an Object-based set is a map with fake truthy values:

```javascript
{'key1': true, 'key2': true}
```
it's also pretty ugly and semantically weak compared to 

```javascript
Set('key1', 'key2')
```

Hence [Set](#set-api).


<a name="building"></a>
# Building collection-js

```
npm install uglify-js
node build.js
```

<a name="api"></a>
# API

* [Iterable](#iterable-api)
* [Sequence](#sequence-api)
* [Array](#array-api)
* [List](#list-api)
* [Set](#set-api)
* [Map](#map-api)
* [ArrayMap](#arraymap-api)
* [Utilities](#utilities-api)

In this documentation, `Any` means any Javascript primitive, native or custom object.

<a name="iterable-api"></a>
## Iterable

Iterable is used internally as a trait for indexed collections.  
You don't use Iterable directly.  
Whenever an Iterable method returns an Iterable, its type will be the same as the original's.  
None of the Iterable methods mutate the original collection.  
For ArrayMap, some of the method signatures are different; See [ArrayMap](#arraymap-api).  

Iterables ([Array](#array-api), [List](#list-api) and [ArrayMap](#arraymap-api)) have the following properties and methods:

### items: Array
The current Array representation of the collection.  
It should be considered read-only and never modified directly.

### size(): Number
Returns the number of items in this collection.

### isEmpty(): Boolean
Indicates whether this collection is empty.

### first(): Any
Returns the first item of this collection.

### last(): Any
Returns the last item of this collection.

### each ((item, index: Number) -> void): void
Applies a function to all items of this collection.

### map (item -> Any): Iterable
Builds a new collection by applying a function to all items of this collection.  
 
ArrayMap will require that you return [key, value] tuples to create a new ArrayMap.    

Note: If you intended to invoke filter and map in succession you can merge these operations into just one map() call
by returning Collection.NOT_MAPPED for the items that shouldn't be in the final collection. 

### pluck (property: String): List
Builds a List of the extracted properties of this collection of objects.  
This is a special case of map(). The property can be arbitrarily nested.  
Example: `var postCodes = users.pluck('address.postCode');`

### filter (item -> Boolean): Iterable
Selects all items of this collection which satisfy a predicate.

### count (item -> Boolean): Number
Counts the number of items in this collection which satisfy a predicate.

### find (item -> Boolean): Any
Finds the first item of the collection satisfying a predicate, if any.

### findBy (property: String, value: Any): Any
Finds the first item of this collection of objects that owns a property set to a given value.  
This is a special case of find(). The property can be arbitrarily nested.  
Example:  
```javascript
var users = List(...);
var hacker = users.findBy('id', 1337);

var people = ArrayMap(...);
var homer = people.findBy('value.traits.color', 'yellow');
``` 

### some (item -> Boolean): Boolean
Tests whether a predicate holds for some of the items of this collection.

### every (item -> Boolean): Boolean
Tests whether a predicate holds for all items of this collection.

### grouped (size: Number): List
Partitions items in fixed size collections.

### groupBy (item -> Any): Map[List]
Partitions this collection into a map of Lists according to a discriminator function.

### fold (initialValue, (item, currentValue) -> Any): Any
Folds the items of this collection using the specified operator.  
fold is sometimes also called reduce.

### partition (item -> Boolean): Array[Iterable]
Partitions this collection in two collections according to a predicate.  
The first element of the returned Array contains the items that satisfied the predicate.

### drop (n: Number): Iterable
Selects all items except the first n ones.

### dropRight (n: Number): Iterable
Selects all items except the last n ones.

### dropWhile (item -> Boolean): Iterable
Drops items till the predicate no longer hold.

### take (n: Number): Iterable
Selects the first n items.

### takeRight (n: Number): Iterable
Selects the last n items.

### takeWhile (item -> Boolean): Iterable
Selects items till the predicate no longer hold.

### reverse(): Iterable
Returns a new collection with the items in reversed order.

### slice (start: Number, end: Number): Iterable
Selects an interval of items, starting from the `start` index and until, but not including `end`.

### mkString (start: String, sep: String, end: String): String
Displays all items of this collection as a string.

### toList(): List
Converts this collection to a List.

### toArray(): Array
Converts this collection to an Array.  
If you do not require a new Array instance, consider using the items property instead.

### clone(): Iterable
Creates a (shallow) copy of this collection.


[Return to API](#api)


<a name="sequence-api"></a>
## Sequence

Sequence is used internally as a trait for iterable collections that are also sequences.  
Whenever a Sequence method returns a Sequence, its type will be the same as the original's.  
None of the Sequence methods mutate the original collection.  
Sequence (or Seq, an alias) can be used to wrap an Array instance: See [Array](#array-api).

Sequences ([Array](#array-api) and [List](#list-api)) have the following properties and methods:

### contains (item): Boolean
Tests whether this sequence contains a given item.

### distinct(): Sequence
Builds a new sequence without any duplicate item.

### flatten(): Sequence
Converts this sequence of collections into a sequence formed by the items of these collections.

### indexOf (item, startingIndex: Number): Number
Returns the index of the first occurence of `item` in this sequence or -1 if none exists.

### lastIndexOf (item): Number
Returns the index of the last occurence of `item` in this sequence or -1 if none exists.

### sameItems (that: Sequence): Boolean
Checks whether the specified sequence contains the same items in the same order as this sequence.

### removeItems (...items): Sequence
Builds a new sequence where all ocurrences of the specified arguments have been removed.  
Example: `var sanitized = sequence.removeItems(null, undefined);`


[Return to API](#api)


<a name="array-api"></a>
## Array

An Array instance can be temporarily augmented (A la underscore) with all methods from [Iterable](#iterable-api) and [Sequence](#sequence-api).  
The Iterable/Sequence API remains the same except that when an Iterable/Sequence would have been returned, an Array
is returned instead. This makes chaining impossible.  
Wrapping an Array can be useful as a one-off when using a List over an Array is not wanted.

Examples:
```javascript
var people = [john, alice, robert];
Seq(people).each(console.log);
var seniors = Seq(people).count(function(person) {return person.age > 70});

var oneTwoThree = Seq([1, 2, 3, 2, 1]).distinct();
```


[Return to API](#api)


<a name="list-api"></a>
## List

List is essentially a richer Array.

```javascript
var list = List(1, 2, 3);
// or
var list = new List(1, 2, 3);
// or
var list = List.fromArray([1, 2, 3]);
```

In addition to all [Iterable](#iterable-api) and [Sequence](#sequence-api) methods, List has the following mutating methods:

### add (item): this
Appends the item at the last position of this list.

### addAt (item, index: Number): this
Adds the item at a specific index.

### update (index: Number, item): this
Replaces the item at the given index with a new value.

### insert (item, sortFunction): this
Inserts an item in this sorted list using binary search according to the sortFunction 
that was used to sort the list or that matches the current item ordering.

### remove (item): this
Removes the item from this list.

### removeAt (index: Number): Any
Removes and returns the item located at the specified index.

### removeFirst(): Any
Removes the first item from this list.  
This is a mutating equivalent of Iterable's drop(1).

### removeLast(): Any
Removes the last item from this list.  
This is a mutating equivalent of Iterable's dropRight(1).

### removeAll(): this
Removes all items from this list.

### removeIf (item -> Boolean): List
Removes all items satisfying a predicate from this list.  
Returns the List of removed items.  
This is a mutating, (reversed) equivalent of Iterable's filter.

### sort (sortFunction): this
Sorts this list by using a sort function.  
The signature for the sort function is the same as for Arrays'.

### sortBy (item -> Any): this
Sorts this list by comparing the items transformed by an extractor function.  
The extractor function would typically return a property of each item or compute a value.

### toSet(): Set
Converts this list to a Set.


[Return to API](#api)


<a name="set-api"></a>
## Set

Set is an unordered collection that does not allow duplicates.  
A set can hold any primitive or object.

```javascript
var set = Set(1, 2, 3);
// or
var set = new Set(1, 2, 3);
// or
var set = Set.fromArray([1, 2, 3]);
// or
function personEmail(person) {return person.email};
// Enables user-defined equality instead of the default instance equality
var set = Set.withKey(personEmail, john, sarah, alice);
```

Set methods:

### add (item): Boolean
Adds the item to this set if it is not already present.  
Returns true if the item was added, false if it was already in this set.

### contains (item): Boolean
Tests whether this set contains the specified item.

### remove (item): Boolean
Removes the item from this set.  
Returns true if the item was removed, false if the item was not in this set.

### removeIf (item -> Boolean): this
Removes all items satisfying a predicate.

### removeAll(): this
Removes all items from this set.

### each (item -> void): void
Applies a function to all items of this set.

### size(): Number
Returns the number of items in this set.

### union (that: Set): Set
Computes the union between this set and another set.  
Returns a set consisting of the items that are in this set or in the other set.

### intersect (that: Set): Set
Computes the intersection between this set and another set.  
Returns a set consisting of the items that are both in this set and in the other set.

### diff (that: Set): Set
Computes the difference of this set and another set.  
Returns a set containing the items of this set that are not also contained in the other set.

### toList(): List
Converts this set to a List.

### toArray(): Array
Converts this set to an Array.

### clone(): Set
Creates a copy of this set.


[Return to API](#api)


<a name="map-api"></a>
## Map

Map is an unordered collection of key-value pairs.  
Any primitive or object can be used as a key or value.

```javascript
var map = Map(
	1,   10,
	2,   20,
	3,   30
);
// or
var map = Map();
map.put(1, 10);
map.put(2, 20);
map.put(3, 30);
// or
var map = Map( 
	john,    40,
	sarah, 	 50,
	alice,	 37
); 
// or
function personEmail(person) {return person.email};
// Enables user-defined equality instead of the default instance equality
var map = Map.withKey(personEmail, 
	john,    40,
	sarah, 	 50,
	alice,	 37
); 
```

Map methods:

### put (key, value): Any
Adds a value for the specified key.  
Returns the previous value mapped for this key, or undefined if the key is new.

### remove (key): Any
Removes and returns the value mapped to the specified key.

### removeIf ((key, value) -> Boolean): this
Removes all key-value mappings satisfying a predicate.

### removeAll(): this
Removes all key-value mappings from this map.

### get (key): Any
Returns the value associated with the specified key, or undefined.

### getOrPut (key, defaultValue: Any): Any
If the given key is already in this map, returns the associated value.  
Otherwise, either use the provided value as is if it's not a function or the result from that function call.  
The value is then associated with that key and returned.  
Example:  
```javascript
var list = multiMap.getOrPut(key, List);
list.add(...);

var counter = counters.getOrPut(key, 0);
counters.put(key, counter + 1);
``` 

### containsKey (key): Boolean
Tests whether this map contains a binding for this key.

### containsValue (value): Boolean
Tests whether this map contains this value at least once.

### keys(): List
Returns a List of all the keys of this map, in no particular order.

### values(): List
Returns a List of all the values of this map, in no particular order.

### each ((key, value) -> void): void
Applies a function to all key-value of this map.

### size(): Number
Returns the number of key-value pairs in this map.

### toList(): List
Converts this map to a List.

### toArray(): Array
Converts this map to an Array.

### clone(): Map
Creates a copy of this map.


[Return to API](#api)


<a name="arraymap-api"></a>
## ArrayMap

ArrayMap is an indexed collection of key-value pairs.  
The key-value pairs are stored in the order they were inserted.  
ArrayMap is used like a Map. Use it over a Map when the insertion order is important and/or when using the methods from Iterable is desirable.  

All methods from [Map](#map-api) and [Iterable](#iterable-api) are available with a few small differences:

each() also gets the current key-value index (You can skip that argument if you don't need it though):
### each ((key, value, index: Number) -> void): void

In general, any methods from Iterable that invoked a predicate or callback with the current item, now
calls the function passing both the current key and value, e.g

### filter ((key, value) -> Boolean): void  

Internally, ArrayMap stores the items as {key: A, value: B} objects so this is the kind of object you're going
to get when using methods such as first() or when you read the items property.


[Return to API](#api)


<a name="utilities-api"></a>
## Utilities

### range (start, stop, step): List[Number]
Returns a list of integers from `start` to `stop` (inclusive), incremented or decremented by `step`.  
You can also use the shortcut **range (n: Number)** which returns the list of the n first integers, starting from 0.
Example:  
```javascript
var range = Collection.range;  
range(10).each(alert); // will irritatingly alert 0, 1, 2, 3, 4, 5, 6, 7, 8, 9  
var someMultiplesOfFive = range(5, 20, 5); // List(5, 10, 15, 20)
```

[Return to API](#api)


<a name="extending"></a>
## Extending collection-js

collection-js aims to provide a few general purpose collections meeting common requirements.   
It does not provide 37 implementation alternatives of almost the same thing nor collections meeting edge case requirements.

You can add more collections as your app require them.  

As an example, below is the code for an AMD module that adds a simplistic but fully functional MultiMap type to the collection module.  
It uses require.js, the closure style (~9000 times better!) and just need to be loaded by your bootstrap/main.

```javascript
define(function(require) {


var collection = require("lib/collection");
var Map = collection.Map;
var List = collection.List;


var MultiMap = function() {
   var map = Map();
   var instance = {};

   instance.put = function(key, value) {
      var list = map.getOrPut(key, List);
      list.add(value);
   };

   instance.get = function(key) {
      return map.get(key);   
   };

   instance.remove = function(key, value) {
      var list = map.get(key);
      if (!list) return;
         
      if (value === undefined) list.removeFirst();
      else list.remove(value);

      if (list.isEmpty()) map.remove(key);
   };

   return instance;
};

collection.MultiMap = MultiMap;

});
```



