import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { MobileNavigationBarCreateDropdown } from '@/navigation/components/MobileNavigationBarCreateDropdown';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { createElement, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconCheckbox,
  IconHome,
  IconPlus,
  IconSearch,
  IconTargetArrow,
} from 'twenty-ui/icon';

type MobileNavigationBarItemName =
  | 'home'
  | 'opportunities'
  | 'create'
  | 'tasks'
  | 'search';

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
  variant?: 'default' | 'primary';
  renderWrapper?: (item: ReactNode) => ReactNode;
};

const isPathOfObject = ({
  pathname,
  namePlural,
  nameSingular,
}: {
  pathname: string;
  namePlural: string;
  nameSingular: string;
}) =>
  pathname.startsWith(
    getAppPath(AppPath.RecordIndexPage, { objectNamePlural: namePlural }),
  ) || pathname.startsWith(`/object/${nameSingular}/`);

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName | '';
} => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const {
    activeObjectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  const readableObjectMetadataItems = filterReadableActiveObjectMetadataItems(
    activeObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
  );
  const opportunityObjectMetadataItem = readableObjectMetadataItems.find(
    (item) => item.nameSingular === CoreObjectNameSingular.Opportunity,
  );
  const taskObjectMetadataItem = readableObjectMetadataItems.find(
    (item) => item.nameSingular === CoreObjectNameSingular.Task,
  );

  // The expansion state is shared with the desktop drawer, so the guard keeps a
  // tap outside settings from collapsing it there.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  // Leaving settings replaces its entry the way desktop does, so that going
  // back does not drop the user straight into the settings they just left.
  const navigateFromBar = (path: string) => {
    closeSidePanelMenu();
    closeSettingsDrawer();
    navigate(path, { replace: isSettingsDrawer });
  };

  const getActiveItemName = (): MobileNavigationBarItemName | '' => {
    if (pathname === AppPath.Home) {
      return 'home';
    }

    if (
      isDefined(opportunityObjectMetadataItem) &&
      isPathOfObject({ pathname, ...opportunityObjectMetadataItem })
    ) {
      return 'opportunities';
    }

    if (
      isDefined(taskObjectMetadataItem) &&
      isPathOfObject({ pathname, ...taskObjectMetadataItem })
    ) {
      return 'tasks';
    }

    return '';
  };

  return {
    activeItemName: getActiveItemName(),
    items: [
      {
        name: 'home',
        label: t`Home`,
        Icon: IconHome,
        onClick: () => navigateFromBar(AppPath.Home),
      },
      ...(isDefined(opportunityObjectMetadataItem)
        ? [
            {
              name: 'opportunities' as const,
              label: opportunityObjectMetadataItem.labelPlural,
              Icon: IconTargetArrow,
              // Without a view id the index page reopens the last visited view.
              onClick: () =>
                navigateFromBar(
                  getAppPath(AppPath.RecordIndexPage, {
                    objectNamePlural: opportunityObjectMetadataItem.namePlural,
                  }),
                ),
            },
          ]
        : []),
      {
        name: 'create',
        label: t`Create`,
        Icon: IconPlus,
        variant: 'primary',
        // The dropdown owns the tap, the bar item only draws the button.
        onClick: () => {},
        renderWrapper: (item) =>
          createElement(MobileNavigationBarCreateDropdown, null, item),
      },
      ...(isDefined(taskObjectMetadataItem)
        ? [
            {
              name: 'tasks' as const,
              label: taskObjectMetadataItem.labelPlural,
              Icon: IconCheckbox,
              onClick: () =>
                navigateFromBar(
                  getAppPath(AppPath.RecordIndexPage, {
                    objectNamePlural: taskObjectMetadataItem.namePlural,
                  }),
                ),
            },
          ]
        : []),
      {
        name: 'search',
        label: t`Search`,
        Icon: IconSearch,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();

          if (isSettingsPage) {
            const firstObjectMetadataItem =
              alphaSortedActiveNonSystemObjectMetadataItems[0];
            if (isDefined(firstObjectMetadataItem)) {
              setContextStoreCurrentObjectMetadataItemId(
                firstObjectMetadataItem.id,
              );
            }
          }

          openRecordsSearchPage();
        },
      },
    ],
  };
};
