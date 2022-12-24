import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";

class ResultsView extends View {
  _parentElement = document.querySelector(".results");
  _errorMessage = "No recipes found for your query! Please try again.";
  _message = "";

  _generateMarkup() {
    // Necemo zapravo da .render renderuje u ovom slucaju, samo zelimo da vrati markup kao string
    // Stoga ce map vratiti niz stringova, koji ce biti joinani i returnani, tj niz html elemenata
    return this._data.map(result => previewView.render(result, false)).join("");
  }
}

export default new ResultsView();
