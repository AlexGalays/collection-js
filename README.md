# collection-js
Provides a small set of general purpose collections with implementations tailored for Javascript.

# Content
* [Code example](#code-example)
* [Using the library in your code](#using-the-lib)
* [Motivation](#motivation)
* [Building collection-js](#building)
* [API](#api)


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

At present, the library can only be imported as a script tag and creates a Collection namespace in the window object.
Support for AMD and other alternatives will likely be added at some point.


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

Hence List, a richer, different type from Array. Like in some high level languages, using List is often the preferred approach but Arrays can still be used.


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
You have to use a low level loop over the keys to do pretty much any work, as Objects have no Map-like API beside []/. and delete.

Hence Map.


**Object used as a Set**

All the issues mentionned for maps apply to sets, since an Object-based set is a map with fake truthy values:

```javascript
{'key1': true, 'key2': true}
```
it's also pretty ugly and semantically weak compared to 

```javascript
Set('key1', 'key2')
```

Hence Set.


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

In this documentation, `Any` means any Javascript primitive, native or custom object.

<a name="iterable-api"></a>
## Iterable

Iterable is used internally as a trait for indexed collections.
You don't use Iterable directly.
Whenever an Iterable method returns an Iterable, the type of the result will be the same as the original.
None of the Iterable methods modify the original.
For ArrayMap, some of the methods signatures are different; See [ArrayMap](#arraymap-api).

Iterables (Array, List and ArrayMap) have the following properties and methods:

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

### each(item -> void): void
Applies a function to all items of this collection.

### map(item -> Any): Iterable
Builds a new collection by applying a function to all items of this collection.

...

[Return to API](#api)

<a name="sequence-api"></a>
## Sequence


<a name="array-api"></a>
## Array


<a name="list-api"></a>
## List


<a name="set-api"></a>
## Set


<a name="map-api"></a>
## Map


<a name="arraymap-api"></a>
## ArrayMap


