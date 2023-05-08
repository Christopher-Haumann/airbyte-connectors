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
          uid: String(Timelog.id),
          user: Timelog.user,
        },
      },
    ];
  }
}
