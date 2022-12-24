import View from "./View.js";
import icons from "url:../../img/icons.svg";

class AddRecipeView extends View {
  _parentElement = document.querySelector(".upload");
  _message = "Recipe was successfully uploaded :)";

  _window = document.querySelector(".add-recipe-window");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");

  // Jer nema potrebe za interakcijom sa controllerom, ova se funkcija moze odmah pozvati
  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
  }

  _addHandlerShowWindow() {
    // This u handleru pokazuje na sam handler (btnOpen), pa moramo manually set
    this._btnOpen.addEventListener("click", this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
    this._overlay.addEventListener("click", this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();

      // API u koji proslijedimo form element, (ovdje je this, tj. _parentElement)
      // Vrati objekat koji se ne moze koristiti pa ga spreadamo
      const dataArray = [...new FormData(this)];

      // Method koji converta entries u objekat, suprotan od .entries()
      const data = Object.fromEntries(dataArray);
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
