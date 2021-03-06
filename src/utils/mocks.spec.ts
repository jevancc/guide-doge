import { AudificationPreference, Preference } from '../services/preference/types';
import { TimeSeriesPoint } from '../datasets/metas/types';
import { activeUserMeasure } from '../models/data-cube/presets';
import { LineChartDatum } from '../components/line-chart/line-chart.component';
import { Summary, SummaryGroup } from '../services/summarization/types';
import { DAY } from './timeUnits';

export const mockPreference: Preference = {
  enabled: false,
};

export const mockAudificationPreference: AudificationPreference = {
  ...mockPreference,
  highestPitch: 0,
  lowestPitch: 0,
  noteDuration: 0,
  readAfter: false,
  readBefore: false,
};

function createMockPoints(length = 30, max = 50): TimeSeriesPoint[] {
  return new Array(length).fill(0).map((_, i) => ({
    x: new Date(Date.now() - (length - i - 1) * DAY),
    y: Math.random() * max,
  }));
}

export const mockPoints = createMockPoints();
export const [mockPoint] = createMockPoints(1);

function createMockData(length = 5): LineChartDatum[] {
  return new Array(length).fill(0).map((_, i) => ({
    label: `Datum ${i}`,
    points: createMockPoints(),
    querySummaries: () => createMockSummaryGroups(),
  }));
}

function createMockSummaryGroups(length = 1): SummaryGroup[] {
  return new Array(length).fill(0).map((_, i) => ({
    title: `Summary group ${i}`,
    summaries: createMockSummaries(),
  }));
}

function createMockSummaries(length = 10): Summary[] {
  return new Array(length).fill(0).map((_, i) => ({
    text: `This is summary ${i}.`,
    validity: i / length,
  }));
}

export const mockData = createMockData();
export const [mockDatum] = createMockData(1);

export const mockMeasureName = activeUserMeasure.name;

export const atlantaCityId = '1840013660';
export const southKoreaCountryId = '410';
export const easternEuropeSubcontinentId = '151';
export const oceaniaContinentId = '009';
