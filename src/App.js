import React, { useState } from "react";
import "./styles.css";

import "./styles.css";

import { from, BehaviorSubject } from "rxjs";
import {
  filter,
  mergeMap,
  debounceTime,
  distinctUntilChanged
} from "rxjs/operators";

let searchSubject = new BehaviorSubject("");
let searchResultObservable = searchSubject.pipe(
  filter(val => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
);

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000"
  ).then(res => res.json());
  return allPokemons.filter(pokemon => pokemon.name.includes(name));
};

const useObservable = (observable, setter) => {
  React.useEffect(() => {
    let subscription = observable.subscribe(result => setter(result));
    return () => {
      subscription.unsubscribe();
    };
  }, [observable, setter]);
};

export default function App() {
  const [search, setSearch] = useState();
  const [results, setResults] = useState([]);

  useObservable(searchResultObservable, setResults);

  const handleSearchChange = e => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleSearchChange}
      />

      {results.map(pokemon => (
        <div key={pokemon.name}>{pokemon.name} </div>
      ))}
    </div>
  );
}
