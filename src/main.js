import TripPresenter from './presenter/presenter.js';
import ModelTrip from './model/trip-model.js';
import ModelFilter from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import AddEventButton from './view/add-event-button.js';
import { render } from './framework/render.js';
import EventsApi from './api.js';

const AUTHORIZ = 'Basic AAAAfS44wcl1sa2j';
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const filterSection = document.querySelector('.trip-controls__filters');
const pointSection = document.querySelector('.trip-events');
const buttonSection = document.querySelector('.trip-main');

const tripModel = new ModelTrip(new EventsApi(END_POINT, AUTHORIZ));
const filterModel = new ModelFilter();


const presenter = new TripPresenter(pointSection, tripModel, filterModel);
presenter.init();
const filterPresenter = new FilterPresenter(filterSection, filterModel, tripModel);
filterPresenter.init();

const newPointButtonComponent = new AddEventButton;

const newPointFormClose = () => {
  newPointButtonComponent.element.disabled = false;
};

const newPointButtonClick = () => {
  presenter.createTask(newPointFormClose);
  newPointButtonComponent.element.disabled = true;
};

tripModel.init()
  .finally(() => {
    render(newPointButtonComponent, buttonSection);
    newPointButtonComponent.setClickListener(newPointButtonClick);
  });
