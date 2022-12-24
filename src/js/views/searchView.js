class SearchView {
  _parentEl = document.querySelector(".search");

  getQuery() {
    const query = this._parentEl.querySelector(".search__field").value;
    this._clearInput();
    return query;
  }

  // Private (_) je jer se nece koristiti van ove klase
  _clearInput() {
    this._parentEl.querySelector(".search__field").value = "";
  }

  addHandlerSearch(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault(); // Jer ce u protivnom page reloadati
      handler();
    });
  }
}

// Exportamo objekat napravljen pomocu klase
export default new SearchView();
