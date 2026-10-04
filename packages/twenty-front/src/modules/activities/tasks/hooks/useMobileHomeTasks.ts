import { MOBILE_HOME_TASKS_LIMIT } from '@/activities/tasks/constants/MobileHomeTasksLimit';
import { type Task } from '@/activities/types/Task';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getEndOfToday = () => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return endOfToday;
};

// Open tasks that are due by today or have no due date, either assigned to the
// current member or to nobody. Tasks created by workflows usually carry no
// assignee nor due date, and leaving them out would empty the home page.
export const useMobileHomeTasks = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const endOfTodayIsoString = useMemo(() => getEndOfToday().toISOString(), []);

  const { records, totalCount, loading } = useFindManyRecords<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    skip: !isDefined(currentWorkspaceMember),
    filter: {
      and: [
        {
          or: [
            { assigneeId: { eq: currentWorkspaceMember?.id } },
            { assigneeId: { is: 'NULL' } },
          ],
        },
        {
          or: [
            { dueAt: { lte: endOfTodayIsoString } },
            { dueAt: { is: 'NULL' } },
          ],
        },
        {
          or: [{ status: { neq: 'DONE' } }, { status: { is: 'NULL' } }],
        },
      ],
    },
    orderBy: [{ dueAt: 'AscNullsLast' }, { createdAt: 'DescNullsLast' }],
    limit: MOBILE_HOME_TASKS_LIMIT,
    recordGqlFields: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      createdAt: true,
    },
  });

  return { tasks: records, totalCount: totalCount ?? records.length, loading };
};
