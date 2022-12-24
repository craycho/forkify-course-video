import * as model from "./model.js";
import { MODAL_CLOSE_SECONDS } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable"; // Oba su radi polyfillanja (backwards compatibility)
import "regenerator-runtime/runtime";

// Zelimo da handleamo eventove u controlleru, ali zelimo da ih LISTEN u view
// * View nikada ne importa iz controllera, samo obrnuto, pa zato koristimo publisher-subscriber pattern

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// } // Iz parcela, nije JS

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); // window.location = url

    if (!id) return; // Guard clause, ako npr. nema hasha

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe (loadano iz importovanog model objekta)
    await model.loadRecipe(id); // Jer je loadRecipe async funkcija i returna Promise

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // Ovdje bi mogli proslijediti "err" radi manually throwanog errora u model.js
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    // Ne returna nista, vec manipulise state, pa ne trebamo store nigdje
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results); Renderuje sve rezultate
    resultsView.render(model.getSearchResultsPage());
    model.state.search.page = 1; // Moj addition, da bi se resetovalo na page 1 svaki put kada searchamo nesto novo

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state obj)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe); Ovo ce svaki put refresh sve ispocetka
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Display success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks); // Ne koristimo update jer zelimo novi element dodati

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
      location.reload(); // Jer u protivnom ostaju podaci s kojima smo add recept
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  // Publisher-subscriber pattern
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// 1. Listening treba biti u view, tu stavljamo event listenere (load i hash)
// 2. Handling treba biti u controlleru, gdje je sama zeljena funkcija (controlRecipes)
// 3. Proslijedjena funkcija postaje handler funkcija u eventu koji je u viewu
// 4. Iako se controlRecipes proslijedjuje u view i tu stoji listener, ona se konacno izvrsava u controlleru gdje je i napisana

// --------------- JSON Reminders ---------------

// Na kraju "build" je bitno dodati --dist-dir (distribution directory) i koji folder zelimo da bude napravljen (./dist)
// Umjesto "start" je bitno staviti "default

// ------------ Git --------------

// git init
// git config --global craycho
// git status   prikaze sve untracked fileove

// git add -A   // Tracka sve fileove, moze i pojedinacno
// git commit -m "Initial commit"   // Da se commita kod, prvi commit je inace "Initial commit"

// git reset --hard HEAD    // Da se vrati na prethodni commit, u slucaju buga npr
