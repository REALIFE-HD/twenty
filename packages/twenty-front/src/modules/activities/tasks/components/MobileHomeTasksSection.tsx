import { MobileHomeTaskRow } from '@/activities/tasks/components/MobileHomeTaskRow';
import { useMobileHomeTasks } from '@/activities/tasks/hooks/useMobileHomeTasks';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledSeeAllButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

export const MobileHomeTasksSection = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { tasks, loading } = useMobileHomeTasks();
  const { objectMetadataItem: taskObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  return (
    <StyledSection>
      <StyledHeader>
        <StyledTitle>
          {t`Open tasks`}
          {!loading && tasks.length > 0 && (
            <StyledCount>{tasks.length}</StyledCount>
          )}
        </StyledTitle>
        <StyledSeeAllButton
          type="button"
          onClick={() =>
            navigate(
              getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: taskObjectMetadataItem.namePlural,
              }),
            )
          }
        >
          {t`See all`}
        </StyledSeeAllButton>
      </StyledHeader>
      <StyledCard>
        {!loading && tasks.length === 0 && (
          <StyledEmptyState>{t`No open tasks`}</StyledEmptyState>
        )}
        {tasks.map((task) => (
          <MobileHomeTaskRow key={task.id} task={task} />
        ))}
      </StyledCard>
    </StyledSection>
  );
};
