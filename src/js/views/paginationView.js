import View from "./View.js";
import icons from "url:../../img/icons.svg";

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    // Event delegation, dodajemo listener na zajednicki parent element
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline"); // .closest je suprotno od querySelector
      console.log(btn);
      if (!btn) return;

      const goToPage = +btn.dataset.goto; // Pristupanje data attributes
      handler(goToPage);
    });
  }

  // View.js u render() poziva _generateMarkup() method, pa svaki view treba ovaj method
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1 and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `<button data-goto = "${curPage + 1}" 
      class="btn--inline pagination__btn--next">
      <span>Page ${curPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `<button data-goto = "${curPage - 1}" 
      class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${curPage - 1}</span>
    </button>`;
    }
    // Any other page
    if (curPage < numPages) {
      return `<button data-goto = "${curPage - 1}"
      class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${curPage - 1}</span>
      </button>
      <button data-goto = "${curPage + 1}" 
      class="btn--inline pagination__btn--next">
      <span>Page ${curPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;
    }
    // Page 1 and there are NO other pages
    return "";
  }
}

export default new PaginationView();
