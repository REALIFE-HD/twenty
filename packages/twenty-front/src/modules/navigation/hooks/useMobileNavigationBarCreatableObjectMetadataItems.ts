import { MOBILE_NAVIGATION_BAR_CREATABLE_OBJECT_NAME_SINGULARS } from '@/navigation/constants/MobileNavigationBarCreatableObjectNameSingulars';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useMobileNavigationBarCreatableObjectMetadataItems =
  (): EnrichedObjectMetadataItem[] => {
    const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
    const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

    return useMemo(
      () =>
        MOBILE_NAVIGATION_BAR_CREATABLE_OBJECT_NAME_SINGULARS.flatMap(
          (nameSingular) => {
            const objectMetadataItem = activeObjectMetadataItems.find(
              (item) => item.nameSingular === nameSingular,
            );

            if (!isDefined(objectMetadataItem)) {
              return [];
            }

            const objectPermissions =
              objectPermissionsByObjectMetadataId[objectMetadataItem.id];

            if (
              isDefined(objectPermissions) &&
              !objectPermissions.canUpdateObjectRecords
            ) {
              return [];
            }

            return [objectMetadataItem];
          },
        ),
      [activeObjectMetadataItems, objectPermissionsByObjectMetadataId],
    );
  };
