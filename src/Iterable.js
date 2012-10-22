
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
* Additionally, you can map a Seq to an ArrayMap by returning [key, value] tuples.
* An ArrayMap can be mapped to a List by returning anything but 2-tuples.
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
   return this._createNewFromMapping(result);
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
* Creates a new Iterable from a mapping result.
*/
Iterable.prototype._createNewFromMapping = function(array) {
   if ((this instanceof Seq) && isArrayOfTuples(array))
      return ArrayMap.fromArray(array);
   else if ((this instanceof ArrayMap) && array.length && !isArrayOfTuples(array))
      return List.fromArray(array);
   else
      return this._createNew(array);
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