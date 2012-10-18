# collection-js
A collection framework tailored for Javascript.

## Usage example

```javascript
var List = Collection.List;
var Set = Collection.Set;
var ArrayMap = Collection.ArrayMap;

var people = Set(john, alice, robert);

var sportyPeople = ArrayMap(
   alpinism, List(alice, john),
   rugby, List(robert, john),
   swimming, List(john, alice),
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

## Building collection-js

```
npm install uglify-js
node build.js
```