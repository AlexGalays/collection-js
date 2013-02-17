
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
	return this.removeAt(0);
};

/*
* Removes the last item from this list.
* This is a mutating equivalent of Iterable's dropRight(1).
*/
List.prototype.removeLast = function() {
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
* Converts this list to a Set.
*/
List.prototype.toSet = function() {
	return Set.fromArray(this.items);
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