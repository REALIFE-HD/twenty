import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { RECORD_LIST_MOBILE_CARD_FIELD_COUNT } from '@/object-record/record-list/constants/RecordListMobileCardFieldCount';
import { RECORD_LIST_MOBILE_CARD_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListMobileCardFieldMaxWidth';
import {
  RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_NAMES,
  RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_TYPES,
} from '@/object-record/record-list/constants/RecordListMobileCardHiddenFieldTypes';
import { RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH } from '@/object-record/record-list/constants/RecordListRowLabelIdentifierWidth';
import { RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH } from '@/object-record/record-list/constants/RecordListRowOverflowChipSlotWidth';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { recordListRowWidthComponentState } from '@/object-record/record-list/states/recordListRowWidthComponentState';
import { computeRecordListDisplayedFields } from '@/object-record/record-list/utils/computeRecordListDisplayedFields';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRowContainer = styled.div`
  cursor: pointer;
  padding-bottom: 2px;

  &:hover > div {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:active > div {
    background: ${themeCssVariables.accent.quaternary};
  }

  &[data-mobile] {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
    padding-bottom: 0;
  }
`;

const StyledRow = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  height: 32px;
  justify-content: space-between;
  padding: 0 6px;

  /* On a phone the row becomes a card: the name on top, fields below. */
  [data-mobile] > & {
    align-items: stretch;
    flex-direction: column;
    gap: ${themeCssVariables.spacing[1]};
    height: auto;
    padding: ${themeCssVariables.spacing[2]} 6px;
  }
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 1 1 ${RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH}px;
  min-width: 0;
  overflow: hidden;

  [data-mobile] & {
    flex-basis: auto;
  }
`;

const StyledFieldsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: flex-end;
  overflow: hidden;

  [data-mobile] & {
    flex-wrap: wrap;
    gap: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
    justify-content: flex-start;
  }
`;

const StyledOverflowChipContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  width: ${RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH}px;
`;

type RecordListRowProps = {
  recordId: string;
};

export const RecordListRow = ({ recordId }: RecordListRowProps) => {
  const { objectNameSingular } = useRecordListContextOrThrow();
  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const recordListRowWidth = useAtomComponentStateValue(
    recordListRowWidthComponentState,
  );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const isMobile = useIsMobile();

  if (!isDefined(recordStore)) {
    return null;
  }

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const nonEmptyRecordFields = visibleRecordFieldsExceptLabelIdentifier.flatMap(
    (recordField) => {
      const fieldDefinition =
        fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

      if (
        !isDefined(fieldDefinition) ||
        isFieldValueEmpty({
          fieldDefinition,
          fieldValue: recordStore[fieldDefinition.metadata.fieldName],
        })
      ) {
        return [];
      }

      return [{ recordField, fieldDefinition }];
    },
  );

  const displayedFieldsLayout = isMobile
    ? {
        displayedFieldCount: RECORD_LIST_MOBILE_CARD_FIELD_COUNT,
        displayedFieldMaxWidth: RECORD_LIST_MOBILE_CARD_FIELD_MAX_WIDTH,
      }
    : computeRecordListDisplayedFields({
        rowWidth: recordListRowWidth,
        populatedFieldCount: nonEmptyRecordFields.length,
      });

  const cardRecordFields = isMobile
    ? nonEmptyRecordFields.filter(
        ({ fieldDefinition }) =>
          !RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_TYPES.includes(
            fieldDefinition.type,
          ) &&
          !RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_NAMES.includes(
            fieldDefinition.metadata.fieldName,
          ),
      )
    : nonEmptyRecordFields;

  const displayedRecordFields = cardRecordFields.slice(
    0,
    displayedFieldsLayout.displayedFieldCount,
  );

  // A card has no spare line for the overflow chip; the record page shows all.
  const hiddenFieldCount = isMobile
    ? 0
    : nonEmptyRecordFields.length - displayedRecordFields.length;

  const openRecord = () => openRecordFromIndexView({ recordId });

  const linkToRecord = getLinkToShowPage(objectNameSingular, recordStore);

  const overflowChipLabel = `+${hiddenFieldCount}`;
  const overflowChipTooltipLabel = plural(hiddenFieldCount, {
    one: '# more populated field available',
    other: '# more populated fields available',
  });

  return (
    <StyledRowContainer
      data-mobile={isMobile ? '' : undefined}
      role="button"
      tabIndex={0}
      aria-label={t`Open record`}
      onClick={openRecord}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRecord();
        }
      }}
    >
      <StyledRow>
        <StyledRecordChipContainer>
          <StopPropagationContainer>
            <RecordChip
              objectNameSingular={objectNameSingular}
              record={recordStore}
              to={linkToRecord}
              variant="ghost"
              isBold
              onClick={openRecord}
              triggerEvent={'CLICK'}
            />
          </StopPropagationContainer>
        </StyledRecordChipContainer>
        <StyledFieldsContainer>
          {displayedRecordFields.map(({ recordField, fieldDefinition }) => (
            <RecordListRowField
              key={recordField.fieldMetadataItemId}
              recordId={recordId}
              recordField={recordField}
              fieldDefinition={fieldDefinition}
              maxWidth={displayedFieldsLayout.displayedFieldMaxWidth}
            />
          ))}
          {hiddenFieldCount > 0 && (
            <StyledOverflowChipContainer>
              {isNonEmptyString(linkToRecord) ? (
                <LinkChip
                  to={linkToRecord}
                  onClick={openRecord}
                  triggerEvent="CLICK"
                  tooltipLabel={overflowChipTooltipLabel}
                  tooltipPlace={'top'}
                  alwaysShowTooltip
                  variant="soft"
                >
                  {overflowChipLabel}
                </LinkChip>
              ) : (
                <Chip
                  tooltipLabel={overflowChipTooltipLabel}
                  tooltipPlace={'top'}
                  alwaysShowTooltip
                  variant="soft"
                >
                  {overflowChipLabel}
                </Chip>
              )}
            </StyledOverflowChipContainer>
          )}
        </StyledFieldsContainer>
      </StyledRow>
    </StyledRowContainer>
  );
};
