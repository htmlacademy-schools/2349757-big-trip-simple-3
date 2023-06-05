import { render, replace, remove } from '../framework/render.js';
import AddEventForm from '../view/add-event-form.js';
import TripEvent from '../view/trips-event.js';
import { USER_ACTION, UPDATE_LIST } from '../const-data.js';
import { isDatesEqual } from '../util.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class TripEventPresenter {
  #eventComponent = null;
  #eventEditorComponent = null;

  #container = null;
  #changeData = null;
  #changeMode = null;

  #event = null;
  #mode = Mode.DEFAULT;
  #availableDestinations = null;
  #availableOffers = null;


  constructor(container, changeData, changeMode, destinations, offers) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
    this.#availableDestinations = destinations;
    this.#availableOffers = offers;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditorComponent = this.#eventEditorComponent;

    this.#eventComponent = new TripEvent(this.#availableDestinations, this.#availableOffers, event);
    this.#eventEditorComponent = new AddEventForm(this.#availableDestinations, this.#availableOffers, event);

    this.#eventComponent.setEditClickListener(this.#replaceEventToForm);
    this.#eventEditorComponent.setFormSubmitListener(this.#handleFormSubmit);
    this.#eventEditorComponent.setCloseButtonClickListener(this.#replaceFormToEvent);
    this.#eventEditorComponent.setDeleteButtonClickListener(this.#handleDeleteClick);

    if (prevEventComponent === null || prevEventEditorComponent === null) {
      render(this.#eventComponent, this.#container.element);
      return 0;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#eventEditorComponent, prevEventEditorComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditorComponent);
  }

  #replaceFormToEvent = () => {
    this.#eventEditorComponent.reset(this.#event);
    replace(this.#eventComponent, this.#eventEditorComponent);
    this.#eventEditorComponent.removeEscKeydownListener();
    this.#mode = Mode.DEFAULT;
  };

  #replaceEventToForm = () => {
    this.#eventEditorComponent.setEscKeydownListener(this.#replaceFormToEvent);
    this.#changeMode();
    this.#mode = Mode.EDITING;

    replace(this.#eventEditorComponent, this.#eventComponent);
  };

  #handleFormSubmit = (update) => {
    const isMinorUpdate =
      !isDatesEqual(this.#event.dateTo, update.dateTo) ||
      this.#event.basePrice !== update.basePrice;

    this.#changeData(
      USER_ACTION.UPDATE_TASK,
      isMinorUpdate ? UPDATE_LIST.MINOR : UPDATE_LIST.PATCH,
      update,
    );

    this.#replaceFormToEvent();
  };

  destroy = () => {
    remove(this.#eventEditorComponent);
    remove(this.#eventComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventEditorComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };

  #handleDeleteClick = (event) => {
    this.#eventEditorComponent.removeEscKeydownListener();
    this.#changeData(
      USER_ACTION.DELETE_TASK,
      UPDATE_LIST.MINOR,
      event,
    );
  };
}
