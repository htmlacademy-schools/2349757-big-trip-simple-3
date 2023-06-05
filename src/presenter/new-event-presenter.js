import {remove, render, RenderPosition} from '../framework/render.js';
import {nanoid} from 'nanoid';
import { USER_ACTION, UPDATE_LIST } from '../const-data.js';
import AddEventForm from '../view/add-event-form.js';

export default class NewEventPresenter {
  #newEventForm = null;
  #destroyCallback = null;
  #availableDestinations = null;
  #eventListContainer = null;
  #changeData = null;
  #availableOffers = null;

  constructor(eventListContainer, changeData) {
    this.#eventListContainer = eventListContainer;
    this.#changeData = changeData;
  }

  init = (callback, destinations = null, offers = null) => {
    this.#destroyCallback = callback;
    this.#availableDestinations = destinations;
    this.#availableOffers = offers;

    if (this.#newEventForm !== null) {
      return;
    }

    this.#newEventForm = new AddEventForm(this.#availableDestinations, this.#availableOffers);
    this.#newEventForm.setFormSubmitListener(this.#handleFormSubmit);
    this.#newEventForm.setDeleteButtonClickListener(this.#handleDeleteClick);

    render(this.#newEventForm, this.#eventListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  destroy = () => {
    if (this.#newEventForm === null) {
      return;
    }

    this.#destroyCallback?.();

    remove(this.#newEventForm);
    this.#newEventForm = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormSubmit = (task) => {
    this.#changeData(
      USER_ACTION.ADD_TASK,
      UPDATE_LIST.MINOR,
      {id: nanoid(), ...task},
    );
    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
