import { getFullDataTime } from '../util.js';
import { eventOffers, destinationNames, DESTINATIONS } from '../model/trip-event.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const createDestinationTemplate = (destination) => {
  const {description, pictures} = DESTINATIONS[destination];

  let picturesSection = '';
  pictures.forEach(({src, description: photoDescription}) => {
    picturesSection += `<img class="event__photo" src="${src}" alt="${photoDescription}">`;
  });

  return (destination) ? `
    <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${description}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${picturesSection}
          </div>
        </div>
      </section>
  ` : '';
};

const createOffersTemplate = (offers) => {
  let template = '';
  const allOffers = eventOffers;
  Object.values(allOffers).forEach(({id, title, price}) => {
    if (offers.includes(id)) {
      template += `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox  visually-hidden" id="${id}" type="checkbox" name="${title}" checked>
              <label class="event__offer-label" for="${id}">
                <span class="event__offer-title">${title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${price}</span>
              </label>
            </div>
    `;
    } else {
      template += `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox  visually-hidden" id="${id}" type="checkbox" name="${title}">
              <label class="event__offer-label" for="${id}">
                <span class="event__offer-title">${title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${price}</span>
              </label>
            </div>
    `;
    }
  });
  return (template) ? `
  <section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${template}
    </div>
  </section>
    ` : '';
};

const createTypeImageTemplate = (currentType) => {
  let template = '';
  const allTypes = Object.keys(eventOffers);
  allTypes.forEach((type) => {
    const checkedValue = (type === currentType) ? 'checked' : '';
    template += `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${checkedValue}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
    </div>
    `;
  });
  return template;
};

const createDestinationListTemplate = () => {
  let template = '';
  destinationNames.forEach((name) => {
    template += `<option value="${name}"></option>`;
  });
  return template;
};

const createEventEditorTemplate = (data) => {
  const {dateFrom, dateTo, offers, type, destination, basePrice, isDestination} = data;

  const tripDateFrom = dateFrom !== null
    ? getFullDataTime(dateFrom)
    : 'No data';

  const tripDateTo = dateTo !== null
    ? getFullDataTime(dateTo)
    : 'No data';

  const destinationName = isDestination
    ? destination.name
    : '';

  const destinationTemplate = isDestination
    ? createDestinationTemplate(destination)
    : '';

  const offersTemplate = createOffersTemplate(type, offers);

  return `
<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${createTypeImageTemplate(type)}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
        <datalist id="destination-list-1">
          ${createDestinationListTemplate()}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${tripDateFrom}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${tripDateTo}"">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
      ${offersTemplate}
      ${destinationTemplate}
    </section>
  </form>
</li>
`;
};

class AddEventForm extends AbstractStatefulView {
  _state = null;
  #datepicker = null;

  constructor(event) {
    super();
    this._state = AddEventForm.parseEventToState(event);
    this.#setInnerHandlers();
    this.#setDateToPicker();
    this.#setDateFromPicker();
  }

  static parseEventToState = (event) => ({...event,
    isDestination: event.destination !== null
  });

  static parseStateToEvent = (state) => {
    const event = {...state};

    if (!event.isDestination) {
      event.destination = null;
    }

    delete event.isDestination;

    return event;
  };

  get template() {
    return createEventEditorTemplate(this._state);
  }

  #setInnerHandlers = () => {
    this.element.querySelector('.event__type-list')
      .addEventListener('change', this.#changeType);
    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#changeDestination);
    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#changePrice);
    this.element.querySelector('.event__available-offers')
      ?.addEventListener('change', this.#changeOffers);
  };

  _restoreHandlers = () => {
    this.#setInnerHandlers();
    this.setFormSubmitListener(this._callback.formSubmit);
    this.setCloseButtonClickListener(this._callback.closeForm);
    this.setDeleteButtonClickListener(this._callback.delete);
    this.#setDateToPicker();
    this.#setDateFromPicker();
  };

  #changeDateTo = ([userDate]) => {
    this._setState({
      dateTo: userDate,
    });
  };

  #setDateToPicker = () => {
    this.#datepicker = flatpickr(
      this.element.querySelector('[name="event-start-time"]'),
      {
        enableTime: true,
        dateFormat: 'Y/m/d H:i',
        defaultDate: this._state.dateTo,
        onChange: this.#changeDateTo,
      },
    );
  };

  #changeDateFrom = ([userDate]) => {
    this._setState({
      dateFrom: userDate,
    });
  };

  #setDateFromPicker = () => {
    this.#datepicker = flatpickr(
      this.element.querySelector('[name="event-end-time"]'),
      {
        enableTime: true,
        dateFormat: 'Y/m/d H:i',
        defaultDate: this._state.dateFrom,
        onChange: this.#changeDateFrom,
      },
    );
  };

  #changeType = (evt) => {
    evt.preventDefault();
    const fieldset = this.element.querySelector('.event__type-list');
    const newType = fieldset.querySelector('input:checked').value;
    this.updateElement({
      type: newType,
      offers: new Array(),
    });
  };

  #changePrice = (evt) => {
    evt.preventDefault();
    const newPrice = event.target.value;
    this._setState({
      basePrice: newPrice,
    });
  };

  #changeOffers = (evt) => {
    evt.preventDefault();
    const offersField = this.element.querySelector('.event__available-offers');
    const checkboxes = offersField.querySelectorAll('.event__offer-checkbox:checked');

    const checkedIds = new Array();

    checkboxes.forEach((checkbox) => {
      checkedIds.push(checkbox.id);
    });

    this._setState({
      offers: checkedIds,
    });
  };

  #changeDestination = (evt) => {
    evt.preventDefault();
    const newDestinationName = event.target.value;
    let newDestination = null;
    Object.values(DESTINATIONS).forEach((destination) => {
      if (newDestinationName === destination.name) {
        newDestination = destination;
        this.updateElement({
          destination: newDestination,
          isDestination: true,
        });
      }
    });

    this._setState({
      destination: {name: newDestinationName},
      isDestination: false,
    });
  };

  setCloseButtonClickListener = (callback) => {
    this._callback.closeForm = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeButtonClickHandler);
  };

  #closeButtonClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.closeForm();
  };

  setFormSubmitListener = (callback) => {
    this._callback.formSubmit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(AddEventForm.parseStateToEvent(this._state));
  };

  setDeleteButtonClickListener = (callback) => {
    this._callback.delete = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteButtonClickHandler);
  };

  #deleteButtonClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.delete();
  };

  setEscKeydownListener = (callback) => {
    this._callback.escClose = callback;
    document.addEventListener('keydown', this.#escKeydownHandler);
  };

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._callback.escClose();
    }
  };

  removeEscKeydownListener = () => {
    document.removeEventListener('keydown', this.#escKeydownHandler);
  };

  reset = (event) => {
    this.updateElement(
      AddEventForm.parseEventToState(event),
    );
  };

  removeElement = () => {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  };
}

export default AddEventForm;
