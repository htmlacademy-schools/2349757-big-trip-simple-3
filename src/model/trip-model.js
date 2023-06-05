import Observable from '../framework/observable.js';
import { UPDATE_LIST } from '../const-data.js';

export default class ModelTrip extends Observable {
  #offers = null;
  #eventsApiService = null;
  #events = [];
  #destinations = null;


  constructor(tasksApiService) {
    super();
    this.#eventsApiService = tasksApiService;
  }

  async init() {
    try {
      const events = await this.#eventsApiService.events;
      this.#destinations = await this.#eventsApiService.destinations;
      this.#offers = await this.#eventsApiService.offers;
      this.#events = events.map(this.#adaptToClient);

    } catch(err) {
      this.#events = [];
      this.#destinations = null;
      this.#offers = null;
    }

    this._notify(UPDATE_LIST.INIT);
  }

  get destinations () {
    return this.#destinations;
  }

  get offers () {
    return this.#offers;
  }

  get events () {
    return this.#events;
  }

  addEvent = (type, update) => {
    this.#events = [
      update,
      ...this.#events,
    ];

    this._notify(type, update);
  };

  updateEvent = async (type, update) => {
    const index = this.#events.findIndex((event) => event.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    const response = await this.#eventsApiService.updateEvent(update);
    const updatedEvent = this.#adaptToClient(response);
    this.#events = [
      ...this.#events.slice(0, index),
      updatedEvent,
      ...this.#events.slice(index + 1),
    ];
    this._notify(type, updatedEvent);
  };

  deleteEvent = (type, update) => {
    const index = this.#events.findIndex((task) => task.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      ...this.#events.slice(index + 1),
    ];

    this._notify(type);
  };

  #adaptToClient = (event) => {
    const adaptedEvent = {
      ...event,
      basePrice: event['base_price'],
      dateFrom: event['date_from'] !== null ? new Date(event['date_from']) : event['date_from'],
      dateTo: event['date_to'] !== null ? new Date(event['date_to']) : event['date_to']
    };

    delete adaptedEvent['base_price'];
    delete adaptedEvent['date_from'];
    delete adaptedEvent['date_to'];

    return adaptedEvent;
  };
}
