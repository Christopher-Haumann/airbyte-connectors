import {AirbyteRecord} from 'faros-airbyte-cdk';

import {DestinationModel, DestinationRecord} from '../converter';
import {AzureTimelogsConverter} from './common';

export class Workitems extends AzureTimelogsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_TimeLogWorkitems',
  ];

  async convert(
    record: AirbyteRecord
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const WorkItem = record.record.data as any;
    return [
      {
        model: 'tms_TimeLogWorkitems',
        record: {
          uid: String(WorkItem.id),
          id: String(WorkItem.id),    
          url: WorkItem.url,
          type: String(WorkItem.fields['System.WorkItemType']),
          name: WorkItem.fields['System.Title'],
          createdAt: new Date(WorkItem.fields['System.CreatedDate']),
          parent: WorkItem.fields['System.Parent'],
          description: WorkItem.fields['System.Description'],
          status: WorkItem.fields['System.State'],
          statusChangedAt: new Date(
              WorkItem.fields['Microsoft.VSTS.Common.StateChangeDate']
          ),
          updatedAt: new Date(
            WorkItem.fields['Microsoft.VSTS.Common.StateChangeDate']
          ),
          creator: WorkItem.fields['System.CreatedBy']['uniqueName'],
        
          sprint: String(WorkItem.fields['System.IterationId']),
          tag: WorkItem.fields['System.Tags'],
          source,         
        },
      }
    ];
  }
}
