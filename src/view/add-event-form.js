import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view';
import TripEvent from './trips-event';
import { destinations, generateOffers, offers } from '../model/trip-event';
import { TRIP_EVENT_TYPES } from '../const-data';
import { capitalize } from '../util';

const FormMode = {
  NEW: 'NEW',
  EDIT: 'EDIT',
};

const createTripEventsFormTemplate = (tripEvent = null) => {
  let mode;
  if (tripEvent) {
    mode = FormMode.EDIT;
  } else {
    mode = FormMode.NEW;
  }
  if (!tripEvent) {
    const date = dayjs().startOf('day').toISOString();
    const defaultType = 'flight;';
    tripEvent = {
      id: 0,
      basePrice: null,
      dateFrom: date,
      dateTo: date,
      destination: Object.keys(destinations)[0],
      type: TRIP_EVENT_TYPES.includes(defaultType) ? defaultType : TRIP_EVENT_TYPES[0],
      offers: generateOffers(),
    };
  }
  const dateFrom = dayjs(tripEvent.date_from);
  const dateTo = dayjs(tripEvent.date_to);
  const destination = destinations[tripEvent.destination];

  const getTripTypeIconSrc = () => `img/icons/${tripEvent.type}.png`;
  const getDateTimeString = (date) => date.format('DD/MM/YY HH:mm');
  const getPrice = () => (tripEvent.base_price === null) ? '' : tripEvent.base_price;

  const listTripEventTypes = () => TRIP_EVENT_TYPES.map((tripEventType) => `
        <div class="event__type-item">
          <input id="event-type-${tripEventType}-1" class="event__type-input
            visually-hidden" type="radio" name="event-type" value="${tripEventType}"
          >
          <label class="event__type-label  event__type-label--${tripEventType}" for="event-type-${tripEventType}-1">
            ${capitalize(tripEventType)}
          </label>
        </div>
      `)
    .join('');
  const listDestinations = () => Object.values(destinations).map((d) => `
        <option value="${d.name}"></option>
      `)
    .join('');
  const listOffers = () => {
    const resultList = [];
    for (const [offerId, isActive] of Object.entries(tripEvent.offers)) {
      const offer = offers[offerId];
      resultList.push(`
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-1"
            type="checkbox" name="event-offer-${offer.id}" ${isActive ? 'checked' : ''}
          >
          <label class="event__offer-label" for="event-offer-${offer.id}-1">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `);
    }
    return resultList.join('');
  };
  const listDestinationPictures = () => destination.pictures.map((picture) => `
        <img class="event__photo" src="${picture.src}" alt="${picture.description}">
      `)
    .join('');

  const listControls = () => {
    if (mode === FormMode.NEW) {
      return `
        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      `;
    } else { // if (mode === FormMode.EDIT)
      return `
        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
      `;
    }
  };

  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="${getTripTypeIconSrc()}" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${listTripEventTypes()}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${capitalize(tripEvent.type)}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${listDestinations()}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1"
            type="text" name="event-start-time" value="${getDateTimeString(dateFrom)}"
          >
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1"
            type="text" name="event-end-time" value="${getDateTimeString(dateTo)}"
          >
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1"
            type="text" name="event-price" value="${getPrice()}"
          >
        </div>
        ${listControls()}
      </header>
      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${listOffers()}
        </section>

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${destination.description}</p>

          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${listDestinationPictures()}
            </div>
          </div>
        </section>
      </section>
    </form>
  `;
};

class AddEventForm extends AbstractView {
  #tripEvent = null;
  _mode = FormMode.NEW;
  constructor(tripData) {
    super();
    this.tripData = tripData;
    if (this.tripData) {
      this._mode = FormMode.EDIT;
    } else {
      this._mode = FormMode.NEW;
    }

    // set listeners
    this.setFormSubmitHandler(() => function () { return 0; });
    if (this._mode === FormMode.NEW) {
      this.setCancelButtonClickHandler(() => this.deleteForm());
    } else { // if (this._mode === FormMode.EDIT)
      this.setCancelButtonClickHandler(() => this.deleteTripEvent());
      this.setArrowClickHandler(() => this.cancelForm());
    }

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        if (this.isActive()) {
          this.cancelForm();
        }

      }
    });
  }

  get template() {
    return createTripEventsFormTemplate(this.tripData);
  }

  get saveButton() {
    return this.element.querySelector('.event__save-btn');
  }

  get tripEvent() {
    if (!this.#tripEvent) {
      this.#tripEvent = new TripEvent(this.tripData);
    }
    return this.#tripEvent;
  }

  set tripEvent(newValue) {
    this.#tripEvent = newValue;
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit();
  };

  setFormSubmitHandler = (callback) => {
    this._callback.formSubmit = callback;
    this.element.addEventListener('submit', this.#formSubmitHandler);
  };

  #cancelButtonHandler = (evt) => {
    evt.preventDefault();
    this._callback.cancelButtonClick();
  };

  setCancelButtonClickHandler = (callback) => {
    this._callback.cancelButtonClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelButtonHandler);
  };

  #arrowClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.arrowClick();
  };

  setArrowClickHandler = (callback) => {
    this._callback.arrowClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#arrowClickHandler);
  };

  _closeForm() {
    if (this.isActive()) {
      this.element.replaceWith(this.tripEvent.element);
    }
  }

  cancelForm() {
    this._closeForm();
    this.element.reset();
  }

  deleteForm() {
    this.delete();
  }

  deleteTripEvent() {
    this.#tripEvent.delete();
    this.delete();
  }
}

export default AddEventForm;
