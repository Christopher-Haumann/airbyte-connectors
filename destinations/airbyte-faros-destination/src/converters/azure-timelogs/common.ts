import {AirbyteRecord} from 'faros-airbyte-cdk';

import {Converter} from '../converter';

/** AzureTimelogs converter base */
export abstract class AzureTimelogsConverter extends Converter {
  source = 'Azure-Timelogs';
  /** Almost every AzureTimelogs record have id property */
  id(record: AirbyteRecord): any {
    return record?.record?.data?.id;
  }
}
