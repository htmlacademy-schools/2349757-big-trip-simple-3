import dayjs from 'dayjs';
import DefaultView from './default-view.js';
import { capitalize } from '../util.js';
import { destinations, offers } from '../model/trip-event';

const createTripEventTemplate = (tripEvent) => {
  const dateFrom = dayjs(tripEvent.date_from);
  const dateTo = dayjs(tripEvent.date_to);
  const destination = destinations[tripEvent.destination];

  const getDateString = (date) => date.format('YYYY-MM-DD'); // Format to 'YYYY-MM-DD'
  const humanizeDayOfMonth = (date) => date.format('MMM D').toUpperCase(); // Format like 'MAR 3'
  const getDateTimeString = (date) => date.format('YYYY-MM-DDTHH:mm'); // Format to 'YYYY-MM-DDTHH:mm'
  const humanizeTime = (date) => date.format('HH:mm'); // Format to 'HH:mm'

  const getTripTypeIconSrc = () => `img/icons/${tripEvent.type}.png`;
  const getTripEventTitle = () => `${capitalize(tripEvent.type)} ${destination.name}`;

  const listActiveOffers = () => {
    let haveActive = false;
    const resultList = [];
    for (const [offerId, isActive] of Object.entries(tripEvent.offers)) {
      if (isActive) {
        const offer = offers[offerId];
        resultList.push(`
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `);
        haveActive = true;
      }
    }
    if (haveActive) {
      return resultList.join('');
    }
    return `
      <li class="event__offer">
        <span class="event__offer-title">No additional offers</span>
      </li>
    `;
  };

  return `
    <div class="event">
      <time class="event__date" datetime="${getDateString(dateFrom)}">${humanizeDayOfMonth(dateFrom)}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="${getTripTypeIconSrc()}" alt="Event type icon">
      </div>
      <h3 class="event__title">${getTripEventTitle()}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${getDateTimeString(dateFrom)}">${humanizeTime(dateFrom)}</time>
          &mdash;
          <time class="event__end-time" datetime="${getDateTimeString(dateTo)}">${humanizeTime(dateTo)}</time>
        </p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${tripEvent.base_price}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${listActiveOffers()}
      </ul>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  `;
};

class TripEvent extends DefaultView {
  constructor(tripEvent) {
    super();
    this.tripEvent = tripEvent;
  }

  getTemplate() {
    return createTripEventTemplate(this.tripEvent);
  }

  get editingButton() {
    return this.getElement().querySelector('.event__rollup-btn');
  }
}

export default TripEvent;
