# collection-js
A collection framework tailored for Javascript.

## Usage example

### JS
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

### CS
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

## Building collection-js

```
npm install uglify-js
node build.js
```