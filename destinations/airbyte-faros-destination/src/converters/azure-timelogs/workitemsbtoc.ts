import {AirbyteRecord} from 'faros-airbyte-cdk';

import {DestinationModel, DestinationRecord} from '../converter';
import {AzureTimelogsConverter} from './common';

export class Workitemsbtoc extends AzureTimelogsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_B2Cworkitems',
  ];

  async convert(
    record: AirbyteRecord
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const WorkItembtoc = record.record.data as any;
    return [
      {
        model: 'tms_B2Cworkitems',
        record: {
          uid: String(WorkItembtoc.id),
          id: String(WorkItembtoc.id),    
          url: WorkItembtoc.url,
          type: String(WorkItembtoc.fields['System.WorkItemType']),
          name: WorkItembtoc.fields['System.Title'],
          createdAt: new Date(WorkItembtoc.fields['System.CreatedDate']),
          parent: WorkItembtoc.fields['System.Parent'],
          description: WorkItembtoc.fields['System.Description'],
          status: WorkItembtoc.fields['System.State'],
          statusChangedAt: new Date(
              WorkItembtoc.fields['Microsoft.VSTS.Common.StateChangeDate']
          ),
          updatedAt: new Date(
            WorkItembtoc.fields['Microsoft.VSTS.Common.StateChangeDate']
          ),
          creator: WorkItembtoc.fields['System.CreatedBy']['uniqueName'],
        
          sprint: String(WorkItembtoc.fields['System.IterationId']),
          tag: WorkItembtoc.fields['System.Tags'],
          source,         
        },
      }
    ];
  }
}
