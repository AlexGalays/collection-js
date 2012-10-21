
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

var isArray = function(instance) {
   return Object.prototype.toString.call(instance) === '[object Array]';
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