import {AirbyteLogger, AirbyteStreamBase, StreamKey} from 'faros-airbyte-cdk';
import {Dictionary} from 'ts-essentials';

import {AzureTimelog, AzureTimelogConfig} from '../azure-timelog';
//import {WorkItem} from '../models';

export class Workitemsbtoc extends AirbyteStreamBase {
  constructor(
    private readonly config: AzureTimelogConfig,
    protected readonly logger: AirbyteLogger
  ) {
    super(logger);
  }

  getJsonSchema(): Dictionary<any, string> {
    return require('../../resources/schemas/workitems.json');
  }
  get primaryKey(): StreamKey {
    return 'id';
  }

  async *readRecords(): AsyncGenerator<any> {
    const azureTimelog = await AzureTimelog.instance(this.config);
    yield* azureTimelog.getB2CworkitemsFromQuery();
  }
}
