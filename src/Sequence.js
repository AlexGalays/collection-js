
/*
* Sequence is used internally to provide further methods to iterables
* that are also genuine flat sequences, i.e all iterables but maps.
*
* None of the Sequence methods mutates the collection.
*
* Sequence can also act as a temporary Array wrapper so that an Array instance
* can beneficiate from all Sequence methods, e.g var otherArray = Seq(array).dropWhile(...);
* This can be useful as a one-off when using a List over an Array is not justifiable.
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