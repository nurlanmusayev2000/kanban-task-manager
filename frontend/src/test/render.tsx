import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { makeStore, type RootState } from '../app/store';

interface Options {
  /** URL to start at, e.g. /boards/b1. */
  route?: string;
  /** Route pattern the element is mounted at, e.g. /boards/:boardId. */
  path?: string;
  preloadedState?: Partial<RootState>;
  /** Extra routes, e.g. a stand-in for the page a form navigates to. */
  extraRoutes?: ReactElement;
}

export function renderWithProviders(ui: ReactElement, { route = '/', path = '/', preloadedState, extraRoutes }: Options = {}) {
  const store = makeStore(preloadedState);
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {extraRoutes}
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return { store, ...result };
}
