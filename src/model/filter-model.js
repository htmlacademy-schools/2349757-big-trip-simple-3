import Observable from '../framework/observable.js';
import { FILTER_LIST } from '../const-data.js';

export default class ModelFilter extends Observable {
  #filter = FILTER_LIST.EVERYTHING;
  get filter() {
    return this.#filter;
  }

  setFilter = (updateType, filter) => {
    this.#filter = filter;
    this._notify(updateType, filter);
  };
}
