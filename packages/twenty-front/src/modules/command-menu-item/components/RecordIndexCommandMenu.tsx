import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexCommandMenu = () => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isMobile = useIsMobile();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          {/* On mobile the tab bar's create menu covers the pinned actions, and
              the header has no room for them; they stay in the dropdown. */}
          {!isMobile && (
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.IndexPageHeader}
              isInPreviewMode={
                isLayoutCustomizationModeEnabled && !isInSidePanel
              }
            >
              <PinnedCommandMenuItemButtons />
            </CommandMenuContextProvider>
          )}
          <CommandMenuContextProvider
            displayType="dropdownItem"
            containerType={CommandMenuItemContainerType.IndexPageDropdown}
          >
            <RecordIndexCommandMenuDropdown />
          </CommandMenuContextProvider>
          {!isInSidePanel && <CommandMenuItemEditButton />}
        </>
      )}
    </>
  );
};
