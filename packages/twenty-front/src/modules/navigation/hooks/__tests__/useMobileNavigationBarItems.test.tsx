import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

jest.mock('@/navigation/components/MobileNavigationBarCreateDropdown', () => ({
  MobileNavigationBarCreateDropdown: () => null,
}));

jest.mock('@/object-record/hooks/useObjectPermissions');

const OPPORTUNITY_OBJECT_METADATA_ITEM = {
  id: 'opportunity-id',
  isActive: true,
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  labelPlural: 'Opportunities',
};

const TASK_OBJECT_METADATA_ITEM = {
  id: 'task-id',
  isActive: true,
  nameSingular: 'task',
  namePlural: 'tasks',
  labelPlural: 'Tasks',
};

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeObjectMetadataItems: [
      OPPORTUNITY_OBJECT_METADATA_ITEM,
      TASK_OBJECT_METADATA_ITEM,
    ],
    alphaSortedActiveNonSystemObjectMetadataItems: [],
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const renderMobileNavigationBarItems = (
  pathname: string,
  previousPathnames: string[] = [],
) => {
  const store = createStore();

  const { result } = renderHook(
    () => ({
      ...useMobileNavigationBarItems(),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <MemoryRouter initialEntries={[...previousPathnames, pathname]}>
              {children}
            </MemoryRouter>
          </Provider>
        </I18nProvider>
      ),
    },
  );

  return { result, store };
};

const tapItem = (
  result: { current: { items: { name: string; onClick: () => void }[] } },
  name: string,
) => result.current.items.find((item) => item.name === name)?.onClick();

describe('useMobileNavigationBarItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    jest.mocked(useObjectPermissions).mockReturnValue({
      objectPermissionsByObjectMetadataId: {},
    } as unknown as ReturnType<typeof useObjectPermissions>);
  });

  it('offers home, opportunities, create, tasks and search', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'opportunities',
      'create',
      'tasks',
      'search',
    ]);
  });

  it('drops the object tabs the member cannot read', () => {
    jest.mocked(useObjectPermissions).mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        [OPPORTUNITY_OBJECT_METADATA_ITEM.id]: { canReadObjectRecords: false },
        [TASK_OBJECT_METADATA_ITEM.id]: { canReadObjectRecords: false },
      },
    } as unknown as ReturnType<typeof useObjectPermissions>);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      'home',
      'create',
      'search',
    ]);
  });

  it('marks the tab of the current page as active', () => {
    expect(
      renderMobileNavigationBarItems('/home').result.current.activeItemName,
    ).toBe('home');
    expect(
      renderMobileNavigationBarItems('/objects/opportunities').result.current
        .activeItemName,
    ).toBe('opportunities');
    expect(
      renderMobileNavigationBarItems('/object/task/20202020-0687').result
        .current.activeItemName,
    ).toBe('tasks');
    expect(
      renderMobileNavigationBarItems('/objects/people').result.current
        .activeItemName,
    ).toBe('');
  });

  it('opens the opportunities index from its tab', () => {
    const { result } = renderMobileNavigationBarItems('/home');

    act(() => tapItem(result, 'opportunities'));

    expect(result.current.location.pathname).toBe('/objects/opportunities');
  });

  it('replaces the settings entry it leaves so back does not return to it', () => {
    const { result } = renderMobileNavigationBarItems('/settings/profile', [
      '/objects/people',
    ]);

    act(() => tapItem(result, 'home'));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('keeps the page it leaves in history outside of settings', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    act(() => tapItem(result, 'home'));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });
});
