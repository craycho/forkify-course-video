// Kada importamo jedan variable uvijek je {}
import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

// State objekat ce sadrzavati recept te cemo njega direktno mijenjati (sav data o aplikaciji)
export const state = {
  recipe: {},
  search: {
    query: "", // Trenutno nam ne treba, ali ce nam mozda trebati u buducnosti
    results: [],
    page: 1, // default
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data; // jer u data ima .recipe property
  // Ispod zapravo ISPOCETKA kreiramo novi objekat koji se zove recipe te mu dajemo values postojeceg recipe objekta
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
    /*Ovime kreiramo key value u objektu samo ako vec postoji recipe.key
    Desni dio && ce se izvrsiti samo ako je recipe.key true, tj kreirat ce se objekat { key:recipe.key }
    spreadanje (...) objekta ce samo izvaditi values iz objekta, kao da obrisemo zagrade */
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    // Ako ijedan od bookmarka u postojecem bookmarks nizu ima id ko loadani recept, setaj mu bookmark property u true
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`${err} JE ERROR`);
    throw err; // Opet moramo manually throw error
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    // Get ce data i istovremeno convertovati u JSON (returna promise), a returnati error ako nesto nije u redu
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log(data);

    // data.data.recipes je niz, pa ga map da iz njeg dobijemo drugi ciji ce clanovi biti objekti
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    throw err; // Da bismo ga mogli koristiti u controlleru
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page; // Setamo da znamo koji je trenutni page

  const start = (page - 1) * state.search.resultsPerPage; // 0, pomnozimo sa broj results koji zelimo (ovdje 10)
  const end = page * state.search.resultsPerPage; // 9, jer slice ne pika zadnji value

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  // setItem prima (ime, string)
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    // 1. Object.entries() da dobijemo array na koji cemo call metode
    // 2. Filter ono sto nije ingredient ili je prazno
    // 3. Map da dobijemo novi array ciji su clanovi objekti
    // 4. Pri tom destruct niz od 3 clana, sa kojima onda kreiramo objekat (Prvo replaceamo spaceove i rastavimo po zarezu)

    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map(ing => {
        // const ingArr = ing[1].replaceAll(" ", "").split(",");
        const ingArr = ing[1].split(",").map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error( // Kreira error object, umjesto obicni error string errora, osim toga moze i samo throw "Wrong ing.."
            7 + "Wrong ingredient format, please use the correct one."
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    }; // Suprotno od gornjeg recipe objekta, jer API ocekuje ovakav format

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
