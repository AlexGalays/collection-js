
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


Collection.Map = Map;