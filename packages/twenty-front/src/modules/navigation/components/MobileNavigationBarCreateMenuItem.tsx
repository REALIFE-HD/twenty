import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useIcons } from 'twenty-ui/icon';

type MobileNavigationBarCreateMenuItemProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onClick: () => void;
};

// One component per object because useCreateNewRecord is bound to a single
// object metadata item.
export const MobileNavigationBarCreateMenuItem = ({
  objectMetadataItem,
  onClick,
}: MobileNavigationBarCreateMenuItemProps) => {
  const { getIcon } = useIcons();
  const { createNewRecord } = useCreateNewRecord({ objectMetadataItem });
  const ObjectIcon = getIcon(objectMetadataItem.icon);

  return (
    <ListItem
      startIcon={<ObjectIcon />}
      onClick={() => {
        onClick();
        createNewRecord();
      }}
    >
      {objectMetadataItem.labelSingular}
    </ListItem>
  );
};
