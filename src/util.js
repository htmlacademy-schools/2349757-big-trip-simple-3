import dayjs from 'dayjs';
import { FILTER_LIST } from './const-data.js';

const getDate = (date) => dayjs(date).format('MMM D');
const getTime = (date) => dayjs(date).format('HH-mm');
const getFullTime = (date) => dayjs(date).format('DD/MM/YY HH:mm');

const getWeightNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
};

const dateEquals = (dateA, dateB) => (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'm');

const daySort = (taskA, taskB) => {
  const weight = getWeightNullDate(taskA.dateTo, taskB.dateTo);

  return weight ?? dayjs(taskA.dateTo).diff(dayjs(taskB.dateTo));
};

const priceSort = (taskA, taskB) => taskB.basePrice - taskA.basePrice;

const formValid = (state, availableDestinations) => {
  const allIds = Object.keys(availableDestinations);

  return (allIds.includes(`${state.destination - 1}`) && /^\d+$/.test(state.basePrice));
};

const dateFuture = (date) => {
  const currentDate = dayjs();
  const targetDate = dayjs(date);
  return targetDate.isAfter(currentDate, 'm');
};

const filter = {
  [FILTER_LIST.EVERYTHING]: (events) => events,
  [FILTER_LIST.FUTURE]: (events) => events.filter((event) => dateFuture(event.dateTo)),
};

export { formValid as isFormValid, filter, dateEquals as isDatesEqual, daySort as sortDays, priceSort as sortPrices, getDate, getTime, getFullTime as getFullDataTime };
