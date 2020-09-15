import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  composeEventHandlers,
  requiredProp,
  unwrapChildrenForPreact,
  subtractMonth,
  addMonth,
  isBackDisabled,
  isForwardDisabled,
  getCalendars
} from './utils';

function isOffsetControlled(propOffset) {
  return propOffset !== undefined;
}

function getOffset(prop, state) {
  return isOffsetControlled(prop) ? prop : state;
}

function getDateProps(
  onDateSelected,
  { onClick, dateObj = requiredProp('getDateProps', 'dateObj'), ...rest } = {}
) {
  return {
    onClick: composeEventHandlers(onClick, event => {
      onDateSelected(dateObj, event);
    }),
    disabled: !dateObj.selectable,
    'aria-label': dateObj.date.toDateString(),
    'aria-pressed': dateObj.selected,
    role: 'button',
    ...rest
  };
}

function getBackProps(
  { minDate, offsetMonth, handleOffsetChanged },
  {
    onClick,
    offset = 1,
    calendars = requiredProp('getBackProps', 'calendars'),
    ...rest
  } = {}
) {
  return {
    onClick: composeEventHandlers(onClick, () => {
      handleOffsetChanged(
        offsetMonth - subtractMonth({ calendars, offset, minDate })
      );
    }),
    disabled: isBackDisabled({ calendars, offset, minDate }),
    'aria-label': `Go back ${offset} month${offset === 1 ? '' : 's'}`,
    ...rest
  };
}

function getForwardProps(
  { maxDate, offsetMonth, handleOffsetChanged },
  {
    onClick,
    offset = 1,
    calendars = requiredProp('getForwardProps', 'calendars'),
    ...rest
  } = {}
) {
  return {
    onClick: composeEventHandlers(onClick, () => {
      handleOffsetChanged(
        offsetMonth + addMonth({ calendars, offset, maxDate })
      );
    }),
    disabled: isForwardDisabled({ calendars, offset, maxDate }),
    'aria-label': `Go forward ${offset} month${offset === 1 ? '' : 's'}`,
    ...rest
  };
}

export function useDayzed({
  date,
  maxDate,
  minDate,
  monthsToDisplay = 1,
  firstDayOfWeek = 0,
  showOutsideDays = false,
  offset,
  onDateSelected,
  onOffsetChanged,
  selected
} = {}) {
  const [stateOffset, setStateOffset] = useState(0);
  const offsetMonth = getOffset(offset, stateOffset);

  const handleOffsetChanged = useCallback(
    newOffset => {
      if (!isOffsetControlled(offset)) {
        setStateOffset(newOffset);
      }

      if (onOffsetChanged) {
        onOffsetChanged(newOffset);
      }
    },
    [offset, onOffsetChanged]
  );

  const calendars = useMemo(
    () =>
      getCalendars({
        date,
        selected,
        monthsToDisplay,
        minDate,
        maxDate,
        offset: offsetMonth,
        firstDayOfWeek,
        showOutsideDays
      }),
    [
      date,
      selected,
      monthsToDisplay,
      minDate,
      maxDate,
      offsetMonth,
      firstDayOfWeek,
      showOutsideDays
    ]
  );

  const _getDateProps = useCallback(
    props => getDateProps(onDateSelected, props),
    [onDateSelected]
  );

  const _getBackProps = useCallback(
    props => getBackProps({ minDate, offsetMonth, handleOffsetChanged }, props),
    [minDate, offsetMonth, handleOffsetChanged]
  );

  const _getForwardProps = useCallback(
    props =>
      getForwardProps({ maxDate, offsetMonth, handleOffsetChanged }, props),
    [maxDate, offsetMonth, handleOffsetChanged]
  );

  return {
    calendars,
    getDateProps: _getDateProps,
    getBackProps: _getBackProps,
    getForwardProps: _getForwardProps
  };
}

function Dayzed(props) {
  const dayzedCalendar = useDayzed(props);
  const children = unwrapChildrenForPreact(props.render || props.children);
  return children(dayzedCalendar);
}

Dayzed.defaultProps = {
  date: new Date(),
  monthsToDisplay: 1,
  onOffsetChanged: () => {},
  firstDayOfWeek: 0,
  showOutsideDays: false
};

Dayzed.propTypes = {
  render: PropTypes.func,
  children: PropTypes.func,
  date: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  monthsToDisplay: PropTypes.number,
  firstDayOfWeek: PropTypes.number,
  showOutsideDays: PropTypes.bool,
  offset: PropTypes.number,
  onDateSelected: PropTypes.func.isRequired,
  onOffsetChanged: PropTypes.func,
  selected: PropTypes.oneOfType([
    PropTypes.arrayOf(Date),
    PropTypes.instanceOf(Date)
  ])
};

export default Dayzed;
