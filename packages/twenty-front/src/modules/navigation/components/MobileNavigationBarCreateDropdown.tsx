import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MobileNavigationBarCreateMenuItem } from '@/navigation/components/MobileNavigationBarCreateMenuItem';
import { MOBILE_NAVIGATION_BAR_CREATE_DROPDOWN_ID } from '@/navigation/constants/MobileNavigationBarCreateDropdownId';
import { useMobileNavigationBarCreatableObjectMetadataItems } from '@/navigation/hooks/useMobileNavigationBarCreatableObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconMessageCirclePlus } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type MobileNavigationBarCreateDropdownProps = {
  children: ReactNode;
};

export const MobileNavigationBarCreateDropdown = ({
  children,
}: MobileNavigationBarCreateDropdownProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const creatableObjectMetadataItems =
    useMobileNavigationBarCreatableObjectMetadataItems();

  const handleItemClick = () => {
    closeDropdown(MOBILE_NAVIGATION_BAR_CREATE_DROPDOWN_ID);
    closeSidePanelMenu();
  };

  return (
    <Dropdown
      dropdownId={MOBILE_NAVIGATION_BAR_CREATE_DROPDOWN_ID}
      dropdownPlacement="top"
      clickableComponent={children}
      dropdownComponents={
        <LegacyDropdownContent
          widthInPixels={GenericDropdownContentWidth.Large}
        >
          <DropdownMenuItemsContainer>
            {creatableObjectMetadataItems.map((objectMetadataItem) => (
              <MobileNavigationBarCreateMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onClick={handleItemClick}
              />
            ))}
          </DropdownMenuItemsContainer>
          {hasAiPermission && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <ListItem
                  startIcon={<IconMessageCirclePlus />}
                  onClick={() => {
                    handleItemClick();
                    switchToNewChat();
                  }}
                >{t`New AI chat`}</ListItem>
              </DropdownMenuItemsContainer>
            </>
          )}
        </LegacyDropdownContent>
      }
    />
  );
};
