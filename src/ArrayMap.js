
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
* Same as Iterable's sorted but sort the map based on its keys.
*/
ArrayMap.prototype.keySorted = function(options) {
   return this._sortBy('key', options);
};

/*
* Same as Iterable's sorted but sort the map based on its values.
*/
ArrayMap.prototype.valueSorted = ArrayMap.prototype.sorted = function(options) {
   return this._sortBy('value', options);
};

ArrayMap.prototype._sortBy = function(field, options) {
   options = (options && cloneObject(options)) || {};

   if (!options.by) {
      options.by = field;
   }
   else if (isString(options.by)) {
      options.by = field + '.' + options.by;
   }
   else {
      var by = options.by;
      options.by = function(entry) {
         return by(entry[field]);
      }
   }

   return Iterable.prototype.sorted.call(this, options);
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