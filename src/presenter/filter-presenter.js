import {render, replace, remove} from '../framework/render.js';
import FilterView from '../view/filters-form.js';
import {UPDATE_LIST} from '../const-data.js';

export default class FilterPresenter {
  #eventsModel = null;
  #filterComponent = null;
  #filterContainer = null;
  #filterModel = null;

  constructor(filterContainer, filterModel, eventsModel) {
    this.#filterModel = filterModel;
    this.#eventsModel = eventsModel;
    this.#filterContainer = filterContainer;


    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init = () => {
    const prevComponentFilter = this.#filterComponent;

    this.#filterComponent = new FilterView(this.#filterModel.filter);
    this.#filterComponent.setFilterChangeListener(this.#handleFilterChange);

    if (prevComponentFilter === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevComponentFilter);
    remove(prevComponentFilter);
  };

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UPDATE_LIST.MAJOR, filterType);
  };
}
