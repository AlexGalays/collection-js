// collection-js [NO VERSION]; Documentation: https://github.com/AlexGalays/collection-js
define(function() {

var Collection = {};

var noop = function() {};

var bind = function(func, context) {
   return function() {
      return func.apply(context, arguments);
   };
}

var not = function(func) {
   return function() {return !func.apply(null, arguments)};
};

var isFunction = function(object) {
   return (typeof object === 'function');
};

var isNumber = function(object) {
   return Object.prototype.toString.call(object) == '[object Number]';
};

var isArray = function(instance) {
   return Object.prototype.toString.call(instance) == '[object Array]';
};

var slice = Array.prototype.slice;

var cloneArray = function(array) {
   return slice.apply(array);
};

/**
* An id generator for primitives and objects. This is used to help reproduce
* the behavior of the Identity Set and Map available in many other languages.
* The generated string can be used to uniquely represent an instance in a associative collection.
* The idea of an ever-increasing integer may seem scary but
* at 1000 object id generations per seconds, this will do a good job 
* for a comfortable period of 285,600 years.
*/
var getId = Collection.getId = (function() {
   var currentInstanceId = 0;
   var property = '__instanceId__';

   var result = function(instance) {
      return (typeof instance) + '-' + (instance instanceof Object
         ? instance[property] || (instance[property] = ++currentInstanceId)
         : instance);
   };
   result.reset = function() {currentInstanceId = 0;};
   return result;
})();

/**
* Creates a constructor function that can be used either with or without the new keyword.
*/
var createType = function(typeName, inheritFrom) {
   var Type = function(args) {
      if (this instanceof Type) {
         if (typeof this._init == "function")
            this._init.apply(this, (args && args.selfCall) ? args : arguments);
      }
      else {
         var newArgs = cloneArray(arguments);
         newArgs.selfCall = true;
         return new Type(newArgs);
      }
   };

   // Re-evaluate the anonymous function so that it gets a name 
   // which is useful when introspecting the collection using dev tools such as the console.
   eval('Type = ' + Type.toString().replace('function', 'function ' + typeName) + ';');

   // Also set a custom property as function.name is not standard and can't be relied on.
   Type.typeName = typeName;

   if (inheritFrom) {
      Type.prototype = new inheritFrom();
      Type.prototype.constructor = Type;
   }

   return Type;
};

// Map and Set utils

/**
* Returns a marker argument object used internally by Sets and Maps 
* when a key function is provided, to differentiate it from user-provided args.
*/
var keyArgs = function(keyFunction, args) {
   return {
      isKeyArgs: true,
      keyFunction: keyFunction,
      args: args
   };
};
var getKeyFunction = function(args) {
   return (args.length && args[0] && args[0].isKeyArgs) ? args[0].keyFunction : getId; 
};
var getArgs = function(args) {
   return (args.length && args[0] && args[0].isKeyArgs) ? args[0].args : args; 
};

var initPairs = function(map, pairs) {
   if ((pairs.length % 2) != 0) {
      throw new Error('A Map constructor requires an even number of arguments');
   }
   for (var i = 0, l = pairs.length; i < l - 1; i+=2) {
      map.put(pairs[i], pairs[i+1]);
   }
};

/*
* Iterable is used internally to provide functional style methods to indexed collections.
* The contract a collection must follow to inherit from Iterable is:
* - Exposing a property named items, the Array representation of the collection.
* - Either specify a fromArray method or override _createNew so that new collections 
* can be built from an existing instance.
* 
* None of the Iterable methods mutates the collection.
*
* For any method accepting a callback or predicate as a parameter, you need to ensure
* the value of 'this' inside the method is either bound or not used.
*/
var Iterable = function() {};

/*
* The current Array representation of the collection.
* It should be considered read-only and never modified directly.
*/
Iterable.prototype.items = null;

/*
* Returns the number of items in this collection. 
*/
Iterable.prototype.size = function() {
   return this.items.length;
};

/*
* Indicates whether this collection is empty.
*/
Iterable.prototype.isEmpty = function() {
   return this.size() == 0;
};

/*
* Returns the first item of this collection.
*/
Iterable.prototype.first = function() {
   this._assertNotEmpty('first');
   return this.items[0];
};

/*
* Returns the last item of this collection.
*/
Iterable.prototype.last = function() {
   this._assertNotEmpty('last');
   return this.items[this.items.length - 1];
};

/*
* Applies a function to all items of this collection.
*/
Iterable.prototype.each = function(callback) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      this._invoke(callback, i, i);
   }
};

/*
* Builds a new collection by applying a function to all items of this collection.
*
* ArrayMap will require that you return [key, value] tuples to create a new ArrayMap.
*
* Note: If you intended to invoke filter and map in succession 
* you can merge these operations into just one map() call
* by returning Collection.NOT_MAPPED for the items that shouldn't be in the final collection.
*/
Iterable.prototype.map = function(callback) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      var mapped = this._invoke(callback, i);
      if (mapped != Collection.NOT_MAPPED) result.push(mapped);
   }
   return this._createNew(result);
};

Collection.NOT_MAPPED = {};

/*
* Builds a List of the extracted properties of this collection of objects.
* This is a special case of map(). The property can be arbitrarily nested.
*/
Iterable.prototype.pluck = function(property) {
   var propertyChain = property.split('.');
   var doPluck = getPluckFunction(propertyChain);
         
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      result.push(doPluck(this.items[i], propertyChain));
   }
   return List.fromArray(result);
}

/*
* Selects all items of this collection which satisfy a predicate.
*/
Iterable.prototype.filter = function(predicate) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) result.push(this.items[i]);
   }
   return this._createNew(result);
};

/*
* Counts the number of items in this collection which satisfy a predicate.
*/
Iterable.prototype.count = function(predicate) {
   var count = 0;
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) count++;
   }
   return count;
};

/*
* Finds the first item of the collection satisfying a predicate, if any.
*/
Iterable.prototype.find = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) return this.items[i];
   }
   return undefined;
};

/*
* Finds the first item of this collection of objects that owns a property set to a given value.
* This is a special case of find(). The property can be arbitrarily nested.
*/
Iterable.prototype.findBy = function(property, value) {
   var propertyChain = property.split('.');
   var doPluck = getPluckFunction(propertyChain);
         
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (doPluck(this.items[i], propertyChain) === value) return this.items[i];
   }
   return undefined;
};

/*
* Tests whether a predicate holds for some of the items of this collection.
*/
Iterable.prototype.some = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) return true;
   }
   return false;
};

/*
* Tests whether a predicate holds for all items of this collection.
*/
Iterable.prototype.every = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (!this._invoke(predicate, i)) return false;
   }
   return true;
};

/*
* Partitions items in fixed size collections.
*/
Iterable.prototype.grouped = function(size) {
   var groups = [];
   var current = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      current.push(this.items[i]);

      if ((current.length === size) || (i === length - 1)) {
         groups[groups.length] = this._createNew(current);
         current = [];
      }
   }
   return List.fromArray(groups);
};

/*
* Partitions this collection into a map of Lists according to a discriminator function.
*/
Iterable.prototype.groupBy = function(discriminator) {
   var groups = Map();
   for (var i = 0, length = this.items.length; i < length; i++) {
      var item = this.items[i];
      var itemGroup = this._invoke(discriminator, i);
      var group = groups.get(itemGroup);
      if (!group) groups.put(itemGroup, List());
      groups.get(itemGroup).add(item);
   }
   return groups;
};

/*
* Folds the items of this collection using the specified operator.
*/
Iterable.prototype.fold = function(initialValue, operator) {
   var result = initialValue;
   for (var i = 0, length = this.items.length; i < length; i++) {
      result = this._invoke(operator, i, result);
   }
   return result;
};

/*
* Partitions this collection in two collections according to a predicate.
* The first element of the returned Array contains the items that satisfied the predicate.
*/
Iterable.prototype.partition = function(predicate) {
   var yes = [], no = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      (this._invoke(predicate, i) ? yes : no).push(this.items[i]);
   }
   return [this._createNew(yes), this._createNew(no)];
};

/*
* Selects all items except the first n ones.
*/
Iterable.prototype.drop = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(n));
};

/*
* Selects all items except the last n ones.
*/
Iterable.prototype.dropRight = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(0, this.items.length - n));
};

/*
* Drops items till the predicate no longer hold.
*/
Iterable.prototype.dropWhile = function(predicate) {
   var result = this.items.slice();
   var index = 0;
   while (result.length && this._invoke(predicate, index)) {
      result.shift();
      index++;
   }
   return this._createNew(result);
};

/*
* Selects the first n items.
*/
Iterable.prototype.take = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(0, n));
};

/*
* Selects the last n items.
*/
Iterable.prototype.takeRight = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(-n));
};

/*
* Selects items till the predicate no longer hold.
*/
Iterable.prototype.takeWhile = function(predicate) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) result.push(this.items[i]);
      else break;
   }
   return this._createNew(result);
};

/*
* Returns a new collection with the items in reversed order.
*/
Iterable.prototype.reverse = function() {
   return this._createNew(this.items.slice().reverse());
};

/*
* Selects an interval of items.
*/
Iterable.prototype.slice = function(start, end) {
   return this._createNew(this.items.slice(start, end));
};

/*
* Displays all items of this collection as a string.
*/
Iterable.prototype.mkString = function(start, sep, end) {
   return start + this.items.join(sep) + end;
};

/*
* Converts this collection to a List.
*/
Iterable.prototype.toList = function() {
   return List.fromArray(this.items);
};

/*
* Converts this collection to an Array.
* If you do not require a new Array instance, consider using the items property instead.
*/
Iterable.prototype.toArray = function() {
   return cloneArray(this.items);
};

/*
* Creates a (shallow) copy of this collection.
*/
Iterable.prototype.clone = function() {
   return this._createNew(this.items.slice());
};

Iterable.prototype.toString = function() {
   return this.constructor.typeName + '(' + this.items.join(', ') + ')';
};

/**
* Creates a new Iterable of the same kind but with a specific set of items.
* The default implementation simply delegates to the type constructor's fromArray factory method.
* Some iterables may override this method to better prepare the newly created instance.
*/
Iterable.prototype._createNew = function(array) {
   return this.constructor.fromArray(array);
};

/**
* Invokes a function for a particular item index.
* This indirection is required as different clients of Iterable may require
* the callbacks and predicates to be called with a specific signature. For instance,
* an associative collection would invoke the function with a key and a value as parameters.
* This default implementation simply call the function with the current item.
*/
Iterable.prototype._invoke = function(func, forIndex, extraParam) {
   return func(this.items[forIndex], extraParam);
};

/**
* Assertion used by methods that cannot produce a result when called on an empty collection.
*/
Iterable.prototype._assertNotEmpty = function(methodName) {
   if (this.items.length == 0) {
      throw new Error(methodName + '() cannot be called on an empty collection');
   }
};


var getPluckFunction = function(propertyChain) {
   return (propertyChain.length == 1) ? getSimpleProperty : getNestedProperty; 
};

var getSimpleProperty = function(item, propertyChain) {
   return item[propertyChain[0]];
}

var getNestedProperty = function(item, propertyChain) {
   var i = 0, currentContext = item, length = propertyChain.length;
   while (i < length) {
     if (currentContext === undefined) return null;
     currentContext = currentContext[propertyChain[i]];
     i++;
   }
   return currentContext;
};


Collection.Iterable = Iterable;   

/*
* Sequence is used internally to provide further methods to iterables
* that are also genuine flat sequences, i.e all iterables but maps.
*
* None of the Sequence methods mutates the collection.
*
* Sequence can also act as a temporary Array wrapper so that an Array instance
* can beneficiate from all Sequence methods, e.g var otherArray = Seq(array).dropWhile(...);
* This can be useful as a one-off when using a List over an Array is not wanted.
*/
var Sequence = function(array) {
   if (this instanceof Sequence) return;
   return ArraySeq(array);
};

Sequence.prototype = new Iterable();

/*
* Tests whether this sequence contains a given item.
*/
Sequence.prototype.contains = function(item) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this.items[i] === item) return true;
   }
   return false;
};

/*
* Builds a new sequence without any duplicate item.
*/
Sequence.prototype.distinct = function() {
   var set = Set(), result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      var item = this.items[i];
      if (!set.add(item)) continue;
      result.push(item);
   }
   return this._createNew(result);
};

/*
* Converts this sequence of collections
* into a sequence formed by the items of these collections.
*/
Sequence.prototype.flatten = function() {
   var result = [], item;
   for (var i = 0, length = this.items.length; i < length; i++) {
      item = this.items[i];
      var seq = asSequence(item);
      if (seq) result.push.apply(result, seq.items);
      else result.push(item);
   }
   return this._createNew(result);
};

/*
* Returns the index of the first occurence of item 
* in this sequence or -1 if none exists.
*/
Sequence.prototype.indexOf = function(item, startingIndex) {
   startingIndex = startingIndex || 0;
   for (var i = startingIndex, length = this.items.length; i < length; i++) {
      if (this.items[i] === item) return i;
   }
   return -1;
};

/*
* Returns the index of the last occurence of item 
* in this sequence or -1 if none exists.
*/
Sequence.prototype.lastIndexOf = function(item) {
   for (var i = this.items.length - 1; i >= 0 ; i--) {
      if (this.items[i] === item) return i;
   }
   return -1;
};

/*
* Builds a new sequence where all ocurrences 
* of the specified arguments have been removed.
*/
Sequence.prototype.removeItems = function() {
   var blackList = Set.fromArray(arguments);
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      var item = this.items[i];
      if (!blackList.contains(item)) result.push(item);
   }
   return this._createNew(result);
};

/*
* Checks whether the specified sequence contains
* the same items in the same order as this sequence.
*/
Sequence.prototype.sameItems = function(collection) {
   collection = asSequence(collection);
   if (this.size() != collection.size()) return false;

   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this.items[i] !== collection.items[i]) return false;
   } 
   return true;
};


var asSequence = function(instance) {
   if (instance instanceof Seq) return instance;
   if (isArray(instance)) return Seq(instance);
   return null;
};


/*
* ArraySeq is used internally as a temporary wrapper to augment 
* an Array instance with Sequence methods. 
*/
var ArraySeq = createType('ArraySeq', Sequence);

ArraySeq.prototype._init = function(items) {
   this.items = items;
};

ArraySeq.fromArray = function(array) {
   return array;
};


var Seq = Collection.Seq = Collection.Sequence = Sequence;

/*
* An ordered collection backed by an Array.
* List has access to all Sequence and Iterable methods.
* List can be seen as a richer Array.
*/
var List = createType('List', Sequence);

List.fromArray = function(array) {
	return List.apply(null, array);
};

List.prototype._init = function() {
	this.items = cloneArray(arguments);
};

/*
* Appends the item at the last position of this list.
*/
List.prototype.add = function(item) {
	this.items.push(item);
	return this;
};

/*
* Adds the item at a specific index.
*/
List.prototype.addAt = function(item, index) {
	this._assertRange(index);
	this.items.splice(index, 0, item);
	return this;
};

/*
* Replaces the item at the given index with a new value.
*/
List.prototype.update = function(index, item) {
	this._assertRange(index);
	var previousItem = this.items[index];
	if (previousItem !== item) {
		this.items[index] = item;
	}
	return this;
};

/*
* Inserts an item in this sorted list using binary search according
* to the sortFunction that was used to sort the list
* or that matches the current item ordering.
*/
List.prototype.insert = function(item, sortFunction) {
	sortFunction = sortFunction || this._defaultSortFunction;
	var low = 0, high = this.size();
	while (low < high) {
   	var mid = (low + high) >> 1;
      sortFunction(item, this.items[mid]) > 0 
      	? low = mid + 1
      	: high = mid;
   }
   this.addAt(item, low);
   return this;
};

/*
* Removes the item from this list.
*/
List.prototype.remove = function(item) {
	var index = this.indexOf(item);
	if (index > -1) {
		return this.items.splice(index, 1)[0];
	}
	return false;
};

/*
* Removes and returns the item located at the specified index.
*/
List.prototype.removeAt = function(index) {
	var item = this.items.splice(index, 1)[0];
	return item;
};

/*
* Removes the first item from this list.
* This is a mutating equivalent of Iterable's drop(1).
*/
List.prototype.removeFirst = function() {
	this._assertNotEmpty('removeFirst');
	return this.removeAt(0);
};

/*
* Removes the last item from this list.
* This is a mutating equivalent of Iterable's dropRight(1).
*/
List.prototype.removeLast = function() {
	this._assertNotEmpty('removeLast');
	return this.removeAt(this.items.length - 1);
};

/*
* Removes all items from this list.
*/
List.prototype.removeAll = function() {
	var size = this.size();
	if (size > 0) {
		this.items.splice(0, size);
	}
	return this;
};

/*
* Removes all items satisfying a predicate from this list.
* Returns the List of removed items.
* This is a mutating, reversed equivalent of Iterable's filter.
*/
List.prototype.removeIf = function(predicate) {
	var removed = [];
	for (var i=0, length=this.items.length; i < length; i++) {
		if (predicate(this.items[i])) {
			removed.push(this.items[i]);
			this.items.splice(i, 1);
			i--;
		}
	}
	return List.fromArray(removed);
};

/*
* Sorts this list by using a sort function.
* The signature for the sort function is the same as for Arrays'.
*/
List.prototype.sort = function(sortFunction) {
	this.items.sort(sortFunction);
	return this;
};

/*
* Sorts this list by comparing the items transformed by an extractor function.
* The extractor function would typically return a property of each item or compute a value.
*/
List.prototype.sortBy = function(extractor) {
	var self = this;
	this.items.sort(function(a, b) {
		var A = extractor(a), B = extractor(b);
		return (A < B) ? -1 : (A > B) ? +1 : 0;
	});
	return this;
};

/*
* Converts this list to a Set.
*/
List.prototype.toSet = function() {
	return Set.fromArray(this.items);
};

List.prototype._defaultSortFunction = function(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
};

List.prototype._assertRange = function(index) {
	if (index < 0 || index > this.size()) {
		throw new Error('Illegal insertion at index ' + index + ' in List with size ' + (this.size() - 1));
	}
};


/*
* Returns a list of integers from start to stop (inclusive), 
* incremented or decremented by step.
*
* You can also use the shortcut range(n) which returns the list 
* of the n first integers, starting from 0.
*/
var range = function(start, stop, step) {
   if (arguments.length == 1) {
   	stop = arguments[0] - 1;
   	start = 0;
   }
   step = step || 1;

   var items = []; 
   var next = start;
   var increasing = (step > 0);

   while ((increasing && next <= stop) || (!increasing && next >= stop)) {
      items.push(next);
      next = next + step;
   }

   var range = List.fromArray(items);

   // Override Sequence's contains with a O(1) alternative
   // when using 'continuous' int ranges.
   if (step == 1)
   	range.contains = function(item) {
   		return isNumber(item) && item >= start && item <= stop;
   	};

   return range;
};


Collection.range = range;
Collection.List = List;

/*
* An unordered collection of key-value pairs.
*
* Unlike with plain JS objects used as maps, any JS primitive or object can
* be used as a key.
*
* The default behavior of a Map containing object keys is to use reference equality;
* This behavior can be changed to user-defined equality by creating the Map using Map.withKey().
*/
var Map = createType('Map');

/*
* Creates a new Map which uses a key function to determine whether
* it contains a binding for a key, as opposed to using reference equality.
*/
Map.withKey = function(keyFunction) {
   var pairs = slice.call(arguments, 1);
   return Map(keyArgs(keyFunction, pairs));
};

Map.prototype._init = function() {
   var keyFunction = getKeyFunction(arguments);
   var pairs = getArgs(arguments);

   this.getId = keyFunction;
   this.keyIdToEntry = {};

   initPairs(this, pairs);
};

Map.prototype.keyIdToEntry = null;
Map.prototype.getId = null;

/* Private convenience hooks used by ArrayMap */
Map.prototype.addedEntry = null;
Map.prototype.removedEntry = null;

/*
* Adds a value for the specified key.
* Returns the previous value mapped for this key, or undefined if the key is new.
*/
Map.prototype.put = function(key, value) {
   var id = this.getId(key);
   var previousValue = this.keyIdToEntry[id]
      ? this.keyIdToEntry[id].value
      : undefined;
   var entry;

   if (previousValue === undefined) {
      entry = Entry(key, value);
      this.keyIdToEntry[id] = entry;
      this._size++;
   }
   else {
      entry = this.keyIdToEntry[id];
      entry.value = value;
   }

   this.addedEntry = entry;

   return previousValue;
};

/*
* Removes and returns the value mapped to the specified key.
*/
Map.prototype.remove = function(key) {
   var id = this.getId(key);
   var entry = this.keyIdToEntry[id];
   var value = entry ? entry.value : undefined;
      
   if (value !== undefined) {
      this.removedEntry = entry;
      delete this.keyIdToEntry[id];
      this._size--;
   } 
   return value;
};

/*
* Removes all key-value mappings satisfying a predicate.
*/
Map.prototype.removeIf = function(predicate) {
   var ids = this.keyIdToEntry;
   for (var id in ids) {
      if (predicate(ids[id].key, ids[id].value)) {
         delete ids[id];
         this._size--;
      }       
   }
   return this;
};

/*
* Removes all key-value mappings from this map.
*/
Map.prototype.removeAll = function() {
   this.keyIdToEntry = {};
   this._size = 0;
   return this;
};

/*
* Returns the value associated with the specified key, or undefined.
*/
Map.prototype.get = function(key) {
   var entry = this.keyIdToEntry[this.getId(key)];
   return entry ? entry.value : undefined;
};

/*
* If the given key is already in this map, returns the associated value.
* Otherwise, either use the provided value as is if it's not a function or the result from that function call.
* The value is then stored with that key and returned.
*/
Map.prototype.getOrPut = function(key, defaultValue) {
   var currentValue = this.get(key);
   if (currentValue !== undefined) return currentValue;

   var value = isFunction(defaultValue) ? defaultValue() : defaultValue;
   this.put(key, value);
   return value;
};

/*
* Tests whether this map contains a binding for this key.
*/
Map.prototype.containsKey = function(key) {
   return (this.get(key) !== undefined);
};

/*
* Tests whether this map contains this value at least once.
*/
Map.prototype.containsValue = function(value) {
   var ids = this.keyIdToEntry;
   for (var id in ids) {
      if (ids[id].value === value) return true;
   }
   return false;
};

/*
* Returns a List of all the keys of this map, in no particular order.
*/
Map.prototype.keys = function() {
   var keys = [];
   for (var id in this.keyIdToEntry) {
      keys.push(this.keyIdToEntry[id].key);
   }
   return List.fromArray(keys);
};

/*
* Returns a List of all the values of this map, in no particular order.
*/
Map.prototype.values = function() {
   var values = [];
   for (var id in this.keyIdToEntry) {
      values.push(this.keyIdToEntry[id].value);
   }
   return List.fromArray(values);
};

/*
* Applies a function to all key-value of this map.
*/
Map.prototype.each = function(callback) {
   for (var id in this.keyIdToEntry) {
      callback(
         this.keyIdToEntry[id].key, 
         this.keyIdToEntry[id].value);
   }
};

Map.prototype._size = 0;
/*
* Returns the number of key-value pairs in this map.
*/
Map.prototype.size = function() {return this._size};

/*
* Converts this map to a List.
*/
Map.prototype.toList = function() {
   var entries = [];
   for (var id in this.keyIdToEntry) {
      entries.push(this.keyIdToEntry[id]);
   }
   return List.fromArray(entries);
};

/*
* Converts this map to an Array.
*/
Map.prototype.toArray = function() {
   return this.toList().items;   
};

/*
* Creates a copy of this map.
*/
Map.prototype.clone = function() {
   var clone = Map();
   clone.getId = this.getId;
   this.each(function(key, value) {clone.put(key, value)});
   return clone;
};

Map.prototype.toString = function() {
   return 'Map(' + this.toArray().join(', ') + ')';
};

/*
* Entry is used internally to store the key-value pairs.
*/
var Entry = createType('Entry');
   
Entry.prototype._init = function(key, value) {
   this.key = key;
   this.value = value;
};

Entry.prototype.key = null;
Entry.prototype.value = null;

Entry.prototype.toString = function() {
   return (this.key + ' -> ' + this.value);
};


var isArrayOfTuples = function(array) {
   return (array.length && isArray(array[0]) && array[0].length == 2);
};


Collection.Map = Map;

/*
* An unordered collection that does not allow duplicates.
*
* Unlike with plain JS objects used as sets, any JS primitive or object can
* be added to a Set.
*
* The default behavior of a Set containing objects is to use reference equality;
* This behavior can be changed to user-defined equality by creating the Set using Set.withKey().
*/
var Set = createType('Set');

/*
* Creates a new Set containing all the specified array items.
*/
Set.fromArray = function(array) {
   return Set.apply(null, array);
};

/*
* Creates a new Set which uses a key function to determine whether
* it contains an item, as opposed to using reference equality.
*/
Set.withKey = function(keyFunction) {
   var items = slice.call(arguments, 1);
   return Set(keyArgs(keyFunction, items));
};

Set.prototype.map = null;

Set.prototype._init = function() {
   var keyFunction = getKeyFunction(arguments);
   var items = getArgs(arguments);
   this.map = Map.withKey(keyFunction);
   
   for (var i = 0, length = items.length; i < length; i++) {
      this.add(items[i]);
   }
};

/*
* Adds the item to this set if it is not already present.
* Returns true if the item was added, false if it was already in this set.
*/
Set.prototype.add = function(item) {
   if (this.contains(item)) return false;
   this.map.put(item, 1); 
   return true;
};

/*
* Tests whether this set contains the specified item.
*/
Set.prototype.contains = function(item) {
   return this.map.containsKey(item);
};

/*
* Removes the item from this set.
* Returns true if the item was removed, false if the item was not in this set.
*/
Set.prototype.remove = function(item) {
   return (this.map.remove(item) == 1);
};

/*
* Removes all items satisfying a predicate.
*/
Set.prototype.removeIf = function(predicate) {
   this.map.removeIf(predicate);
   return this;
};

/*
* Removes all items from this set.
*/
Set.prototype.removeAll = function() {
   this.map.removeAll();
   return this;
};

/*
* Applies a function to all items of this set.
*/
Set.prototype.each = function(callback) {
   this.map.each(callback)
};

/*
* Returns the number of items in this set. 
*/
Set.prototype.size = function() {
   return this.map.size();
};

/*
* Computes the union between this set and another set.
* Returns a set consisting of the items that are in this set or in the other set.
*/
Set.prototype.union = function(that) {
   var result = Set();
   this.each(function(item) {result.add(item)});
   that.each(function(item) {result.add(item)});
   return result;
};

/*
* Computes the intersection between this set and another set.
* Returns a set consisting of the items that are both in this set and in the other set.
*/
Set.prototype.intersect = function(that) {
   var contains = bind(that.contains, that); // Never going to use prototypes again...
   return this._filter(contains);
};

/*
* Computes the difference of this set and another set.
* Returns a set containing the items of this set that are not also contained in the other set.
*/  
Set.prototype.diff = function(that) {
   var contains = bind(that.contains, that);
   return this._filter(not(contains));
};

Set.prototype._filter = function(predicate) {
   var result = Set();
   this.each(function(item) {
      if (predicate(item)) result.add(item);
   });
   return result;
};

/*
* Converts this set to a List.
*/
Set.prototype.toList = function() {
   return this.map.keys();
};

/*
* Converts this set to an Array.
*/
Set.prototype.toArray = function() {
   return this.toList().items;
};

/*
* Creates a copy of this set.
*/
Set.prototype.clone = function() {
   return Set.withKey.apply(null,
      [this.map.getId].concat(this.map.keys().items));
};

Set.prototype.toString = function() {
   return 'Set(' + this.toArray().join(', ') + ')';
};


Collection.Set = Set;

/*
* An ordered collection of key-value pairs.
* The key-value pairs are stored in the order they were inserted.
* All methods from Map and Iterable are available.
*
* The default behavior of an ArrayMap containing objects is to use reference equality;
* This behavior can be changed to user-defined equality by creating the map using ArrayMap.withKey().
*
* An Array is used to maintain the insertion order instead of the more traditional
* linked list to better fit Javascript and its ubiquitous Array.
* Using an Array provides the advantage of having a ready Array at all time instead of having to repeatedly build it from scratch.
* Numerous frameworks/libs take an Array as input to do their work; An Array is also JSON friendly, unlike a linked list.
* The disadvantage is that key removals become O(log n) instead of O(1).
*/
var ArrayMap = createType('ArrayMap', Iterable);

/*
* Creates a new Identity ArrayMap using the specified tuple Array.
*/
ArrayMap.fromArray = function(array) {
   var map = ArrayMap();
   addAll(map, array);
   return map;
};

/*
* Creates a new ArrayMap which uses a key function to determine whether
* it contains a binding for a key, as opposed to using reference equality.
*/
ArrayMap.withKey = function(keyFunction) {
   var pairs = slice.call(arguments, 1);
   return ArrayMap(keyArgs(keyFunction, pairs));
};

ArrayMap.prototype._init = function() {
   var keyFunction = getKeyFunction(arguments);
   var pairs = getArgs(arguments);

   this._map = Map.withKey(keyFunction);
   this.items = [];

   initPairs(this, pairs);
};

ArrayMap.prototype._map = null;

/*
* Adds a value for the specified key.
* Returns the previous value mapped for this key, or undefined if the key is new.
* If the value replaces an existing one, the position remains the insertion index of the previous value.
*/
ArrayMap.prototype.put = function(key, value) {
   var previousValue = this._map.put(key, value);
   var entry = this._map.addedEntry;

   if (previousValue === undefined) this._addEntryItem(entry);
   else entry.value = value;
   
   return previousValue;
};

/*
* Removes and returns the value mapped to the specified key.
*/
ArrayMap.prototype.remove = function(key) {
   var value = this._map.remove(key);

   if (value !== undefined)
      this._removeEntryItem(this._map.removedEntry);
   
   return value;
};

/*
* Removes all key-value mappings satisfying a predicate.
*/
ArrayMap.prototype.removeIf = function(predicate) {
   for (var i = 0; i < this.items.length; i++) {
      var entry = this.items[i];
      if (predicate(entry.key, entry.value)) {
         this.remove(entry.key);
         i--;
      }
   }
   return this;
};

/*
* Removes all key-value mappings from this map.
*/
ArrayMap.prototype.removeAll = function() {
   this._map.removeAll();
   this.items = [];
   return this;
};

/*
* Returns the value associated with the specified key, or undefined.
*/
ArrayMap.prototype.get = function(key) {
   return this._map.get(key);
};

/*
* If the given key is already in this map, returns the associated value.
* Otherwise, either use the provided value as is if it's not a function or the result from that function call.
* The value is then associated with that key and returned.
*/
ArrayMap.prototype.getOrPut = function(key, defaultValue) {
   var previousValue = this.get(key);
   var newValue = this._map.getOrPut(key, defaultValue);

   if (previousValue !== newValue)
      this._addEntryItem(this._map.addedEntry);
   
   return newValue;
};

/*
* Tests whether this map contains a binding for this key.
*/
ArrayMap.prototype.containsKey = function(key) {
   return this._map.containsKey(key);
};

/*
* Tests whether this map contains this value at least once.
*/
ArrayMap.prototype.containsValue = function(value) {
   return this._map.containsValue(value);
};

/*
* Returns a List of all the keys of this map, in the order they were inserted.
* If you need to iterate over the keys, consider iterating over the map itself 
* as it's faster.
*/
ArrayMap.prototype.keys = function() {
   var keys = Seq(this.items).map(function(entry) {
      return entry.key;
   });
   return List.fromArray(keys);
};

/*
* Returns a List of all the values of this map, in the order their keys were inserted.
* If you need to iterate over the values, consider iterating over the map itself 
* as it's faster.
*/
ArrayMap.prototype.values = function() {
   var values = Seq(this.items).map(function(entry) {
      return entry.value;
   });
   return List.fromArray(values);
};


/*
* Adds the specified entry to the items Array.
*/
ArrayMap.prototype._addEntryItem = function(entry) {
   this.items.push(entry);
   this._setMeta(entry);
};

/*
* Removes the specified entry from the items Array.
*/
ArrayMap.prototype._removeEntryItem = function(entry) {
   var maxIndex = Math.min(entry.meta.insertionIndex, this.items.length - 1);

   var entryIndex = (maxIndex < 10)
      ? this._entryIndexLinearSearch(entry, maxIndex)
      : this._entryIndexBinarySearch(entry, maxIndex);

   this.items.splice(entryIndex, 1);
};

ArrayMap.prototype._entryIndexLinearSearch = function(entry, maxIndex) {
   var index = maxIndex;
   while (index >= 0) {
      if (this.items[index] == entry) return index;
      index--;
   }
};

ArrayMap.prototype._entryIndexBinarySearch = function(entry, maxIndex) {
   var low = 0, high = maxIndex, x = entry.meta.insertionIndex;
   while (low < high) {
      var mid = (low + high) >> 1;
      (x > this.items[mid].meta.insertionIndex)
         ? low = mid + 1
         : high = mid;
   }
   return low;
};

/*
* Associates some information with the entry to later help remove it more efficiently.
* The actual metadatas are stored in a function so that it's ignored during JSON serialization.
*/
ArrayMap.prototype._setMeta = function(entry) {
   entry.meta = function() {};
   entry.meta.insertionIndex = this.items.length - 1;
};

// Iterable overrides
  
ArrayMap.prototype._invoke = function(func, forIndex, extraParam) {
   var entry = this.items[forIndex];
   return func(entry.key, entry.value, extraParam);
};

ArrayMap.prototype._createNew = function(array) {
   var map = ArrayMap.withKey(this._map.getId);
   addAll(map, array);
   return map;
};


var addAll = function(map, array) {
   if (isArrayOfTuples(array)) {
      for (var i = 0, length = array.length; i < length; i++) {
         map.put(array[i][0], array[i][1]);
      }
   }
   else {
      for (var i = 0, length = array.length; i < length; i++) {
         map.put(array[i].key, array[i].value);
      }
   }
};


Collection.ArrayMap = ArrayMap;


return Collection;

});