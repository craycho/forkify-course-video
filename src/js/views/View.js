// import icons from "../img/icons.svg"; // Parcel 1
import icons from "url:../../img/icons.svg"; // Parcel 2
// Za sve slike, videe, sounds, i non programming files treba "url:"

export default class View {
  /* Da bi u methods poput _generateMarkup(), ciji je kod napisan u ostalim view funkcijama,
  mogli koristiti data proslijedjen u render() i update(), moramo setati da je class-wide
  varijabla _data === data (koji je proslijedjen render i update metodama). Tek onda mozemo u _generateMarkup i dr. koristiti data.*/
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data  Tip podataka koji ocekujemo u data ( | znaci or)
   * @param {boolean} [render=true] [] znaci da je optional value
   * @returns {undefined | string} A markup string is returned if render=false (Sta vraca, ako ista)
   * @this {Object} Instance of view (Definise sta je this)
   * @author Bakir Kreco
   * @todo Finish bits and pieces
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // Kreirati ce listu DOM elemenata od postojeceg newMarkup stringa
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*")); // Vraca nodelist pa se mora convert u array
    const curElements = Array.from(this._parentElement.querySelectorAll("*"));
    // console.log(curElements[0]);

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl)); // isEqualNode poredi content newEl i curEl nodeova

      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        // if(curEl.textContent = newEl.textContent); // Ne moze, jer onda mijenjamo sve, a ne samo elemente koji iskljucivi sadrze tekst, cime se poremeti formatting
        curEl.textContent = newEl.textContent;
      }
      /*
      newEl.firstChild.nodeValue.trim() !== "" 
      1) newEl je elemenat (npr <div class = "recipe__quantity">1 1/4</div>) 
      2) newEl.firstChild vraca prvi child nodea, u ovom slucaju "1 1/4"
      3) .nodeValue vraca content nodea ukoliko je node = text, sto je u slucaju "1 1/4" istina
      4) .trim() radi whitespacea
      */

      // Updates changed atributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
      /*
      1) newEl.attributes vraca objekat sa svim attributes nekog elementa (npr class, data, src...)
      2) Pretvorimo ga u niz te ga loopamo
      3) U svakom iteration uzmemo ime attributea i vrijednost newEl te ih stavimo u curEl
      */
    });
  }

  _clear() {
    this._parentElement.innerHTML = "";
    // Prvo emptyamo container da se rijesimo pocetne poruke
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
            </div>
            `;
    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // Default vrijednost, ako se nista ne proslijedi output ce _errorMessage
  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._message) {
    const markup = `<div class="message">
      <div>
        <svg>
          <use href="${icons}#icon-smile"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}
