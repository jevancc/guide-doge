import * as GeoDataset from './geo.dataset';
import { Dataset } from './types';
import { createDefault } from '../utils/preferences';
import { MetaType } from './metas/types';

describe('GeoDataset', () => {
  let dataset: Dataset;

  beforeEach(async () => {
    const config = createDefault(GeoDataset.configMeta);
    dataset = await GeoDataset.create(config);
  });

  it('should contain at least one geo-map meta.', () => {
    expect(dataset.metas.some(meta => meta.type === MetaType.GEO_MAP)).toBeTrue();
  });
});
