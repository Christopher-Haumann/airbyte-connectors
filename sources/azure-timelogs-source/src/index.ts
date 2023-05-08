import {Command} from 'commander';
import {
  AirbyteConfig,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteStreamBase,
} from 'faros-airbyte-cdk';
import VError from 'verror';
import {AzureTimelog, AzureTimelogConfig} from './azure-timelog';

import {Builds} from './streams';
import {TimeLogs} from './streams';


interface SourceConfig extends AirbyteConfig {
  readonly user: string;
}

/** The main entry point. */
export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new azureTimelogSource(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

/** Example source implementation. */
export class azureTimelogSource extends AirbyteSourceBase<AzureTimelogConfig> {
  async spec(): Promise<AirbyteSpec> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return new AirbyteSpec(require('../resources/spec.json'));
  }
  async checkConnection(
    config: AzureTimelogConfig
  ): Promise<[boolean, VError]> {
    try {
      const azureActiveDirectory = await AzureTimelog.instance(config);
      await azureActiveDirectory.checkConnection();
    } catch (err: any) {
      return [false, err];
    }
    return [true, undefined];
  }
  streams(config: AzureTimelogConfig): AirbyteStreamBase[] {
    return [
      new TimeLogs(config, this.logger),
    ];
  }
}
