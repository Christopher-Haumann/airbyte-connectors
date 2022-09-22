import {AirbyteLogger, StreamKey, SyncMode} from 'faros-airbyte-cdk';
import {Dictionary} from 'ts-essentials';

import {BitbucketServerConfig, Commit} from '../bitbucket-server/types';
import {StreamBase} from './common';

type StreamSlice = {project: string; repo: {slug: string; fullName: string}};
type CommitState = {
  [repoFullName: string]: {lastDate: number; lastHash: string};
};

export class Commits extends StreamBase {
  constructor(
    readonly config: BitbucketServerConfig,
    readonly logger: AirbyteLogger
  ) {
    super(logger);
  }

  getJsonSchema(): Dictionary<any> {
    return require('../../resources/schemas/commits.json');
  }

  get primaryKey(): StreamKey {
    return 'hash';
  }

  get cursorField(): string | string[] {
    return 'date';
  }

  async *streamSlices(): AsyncGenerator<StreamSlice> {
    for (const project of this.config.projects) {
      for (const repo of await this.server.repositories(
        project,
        this.config.repositories
      )) {
        yield {project, repo: {slug: repo.slug, fullName: repo.fullName}};
      }
    }
  }

  async *readRecords(
    syncMode: SyncMode,
    cursorField: string[],
    streamSlice: StreamSlice,
    streamState?: CommitState
  ): AsyncGenerator<Commit> {
    const {project, repo} = streamSlice;
    const lastCommitId =
      syncMode === SyncMode.INCREMENTAL
        ? streamState?.[repo.fullName]?.lastHash
        : undefined;
    yield* this.server.commits(project, repo.slug, lastCommitId);
  }

  getUpdatedState(
    currentStreamState: CommitState,
    latestRecord: Commit
  ): CommitState {
    const repo = latestRecord.repository.fullName;
    const repoState = currentStreamState[repo] ?? null;
    if (latestRecord.date > (repoState?.lastDate ?? 0)) {
      return {
        ...currentStreamState,
        [repo]: {lastDate: latestRecord.date, lastHash: latestRecord.hash},
      };
    }
    return currentStreamState;
  }
}
