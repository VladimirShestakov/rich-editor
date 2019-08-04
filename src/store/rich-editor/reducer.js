import reducer from '../../utils/reducer';
import {types} from './actions.js';

const initState = {
  data: [],
  wait: false,
  errors: null
};

export default reducer(initState, {
  [types.LOAD]: (state, action) => {
    return {
      ...state,
      data: action.payload
    };
  },

  [types.CHANGE]: (state, action) => {
    // @todo изменение по key
    return {
      ...state,
      data: action.payload
    };
  }
});
