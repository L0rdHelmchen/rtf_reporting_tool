// RTF Reporting Tool - Redux Store Configuration
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import formsReducer from './slices/formsSlice';
import uiReducer from './slices/uiSlice';

// Root persist configuration
const persistConfig = {
  key: 'rtf-tool',
  version: 1,
  storage,
  whitelist: ['auth'] // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  forms: formsReducer,
  ui: uiReducer
});

// Wrap root reducer with persistReducer so PersistGate works
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER'
        ]
      }
    }),
  devTools: import.meta.env.DEV
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
