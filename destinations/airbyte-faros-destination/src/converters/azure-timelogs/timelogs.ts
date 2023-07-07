import {AirbyteRecord} from 'faros-airbyte-cdk';

import {DestinationModel, DestinationRecord} from '../converter';
import {AzureTimelogsConverter} from './common';
//import {Board} from './models';

export class Timelogs extends AzureTimelogsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_TimeLog',
  ];

  async convert(
    record: AirbyteRecord
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const Timelog = record.record.data as any//Board;
    return [
      {
        model: 'tms_TimeLog',
        record: {
          id: String(Timelog.id),
          uid: String(Timelog.id),
          user: Timelog.user,
          userId: Timelog.userId,
          workItemId: Timelog.workItemId,
          workItemName: Timelog.workItemName,
          startTime: Timelog.startTime,
          date: Timelog.date,
          time: Timelog.time,
          notes: Timelog.notes,
          __etag: Timelog.__etag,
        },
      },
    ];
  }
}
