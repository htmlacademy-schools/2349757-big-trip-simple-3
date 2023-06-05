import { render, replace, remove } from '../framework/render.js';
import AddEventForm from '../view/add-event-form.js';
import TripEvent from '../view/trips-event.js';

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

  constructor(container, changeData, changeMode) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditorComponent = this.#eventEditorComponent;

    this.#eventComponent = new TripEvent(event);
    this.#eventEditorComponent = new AddEventForm(event);

    this.#eventComponent.setEditClickListener(this.#replaceEventToForm);

    // нажатие на кнопку Save
    this.#eventEditorComponent.setFormSubmitListener(this.#replaceFormToEvent); //handleFormSubmit
    // нажатие на стрелку, чтобы закрыть форму
    this.#eventEditorComponent.setCloseButtonClickListener(this.#replaceFormToEvent);
    // нажатие на кнопку Delete
    this.#eventEditorComponent.setDeleteButtonClickListener(this.#removeElement);

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
    this.#eventEditorComponent.removeEscKeydownListener();
    this.#mode = Mode.DEFAULT;
    replace(this.#eventComponent, this.#eventEditorComponent);
  };

  #replaceEventToForm = () => {
    this.#eventEditorComponent.setEscKeydownListener(this.#replaceFormToEvent);
    this.#changeMode();
    this.#mode = Mode.EDITING;

    replace(this.#eventEditorComponent, this.#eventComponent);
  };

  #handleFormSubmit = (task) => {
    this.#changeData(task);
    this.#replaceFormToEvent();
  };

  destroy = () => {
    remove(this.#eventEditorComponent);
    remove(this.#eventComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToEvent();
    }
  };

  #removeElement = () => {
    this.#eventEditorComponent.removeEscKeydownListener();
    this.destroy();
  };
}
