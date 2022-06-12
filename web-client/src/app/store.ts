import { configureStore, ThunkAction, Action, Middleware } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import { gameClientMiddleware } from '../features/game/gameClientMiddleware';
import gameReducer from '../features/game/gameSlice';


const loggerMiddleware: Middleware = store => next => action => {
  console.log(`ACTION: ${action.type}`, action.payload);
  try {
    // return next(action);
    console.log("before state:", store.getState());
    next(action);
    console.log("after state", store.getState());
  } catch (error) {
    console.error('Caught an exception!', error)
    throw error;
  }
}



export const store = configureStore({
  reducer: {
    counter: counterReducer,
    game: gameReducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat([
      loggerMiddleware,
      gameClientMiddleware
    ]);
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
