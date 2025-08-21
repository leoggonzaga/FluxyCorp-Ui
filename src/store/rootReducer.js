import { combineReducers } from 'redux';
import auth from './slices/auth';
import base from './slices/base';
import locale from './slices/locale/localeSlice';
import theme from './slices/theme/themeSlice';
import RtkQueryService from '@/services/RtkQueryService';

const staticReducers = {
  auth,
  base,
  locale,
  theme,
  [RtkQueryService.reducerPath]: RtkQueryService.reducer,
};

const rootReducer =
  (asyncReducers = {}) =>
  (state, action) => {
    const combinedReducer = combineReducers({
      ...staticReducers,
      ...asyncReducers,
    });
    return combinedReducer(state, action);
  };

export default rootReducer;
