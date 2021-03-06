import * as math from 'mathjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { SummarizationDataSourceService } from './summarization-data-source.service';
import { SummarizationService, BaseConfig } from './summarization.service';
import { SummaryGroup, Summary } from './types';
import { TimeSeriesPoint } from '../../datasets/metas/types';
import { formatY } from '../../utils/formatters';
import { TrendWeeklyElaborationConfig, TrendWeeklyElaborationSummarizationService } from './trend-weekly-elaboration.summarization.service';
import { WeekdayWeekendRelativeConfig, WeekdayWeekendRelativeSummarizationService } from './weekday-weekend-relative.summarization.service';

export interface TrendWeeklyComparisonAverageConfig extends TrendWeeklyElaborationConfig, WeekdayWeekendRelativeConfig {
  metric: string;
}

export type TrendWeeklyComparisonAverageProperties = {
};

const defaultConfig: Partial<TrendWeeklyComparisonAverageConfig> = {
  metric: 'acrtive users',
};

@Injectable({
  providedIn: 'any',
})
export class TrendWeeklyComparisonAverageSummarizationService extends
  SummarizationService<TimeSeriesPoint, TrendWeeklyComparisonAverageProperties, TrendWeeklyComparisonAverageConfig>  {

  constructor(
    protected summarizationDataSourceService: SummarizationDataSourceService,
    protected weekdayWeekendRelativeSummarizationService: WeekdayWeekendRelativeSummarizationService,
    protected trendWeeklyElaborationSummarizationService: TrendWeeklyElaborationSummarizationService,
  ) {
    super();
  }

  prepareConfig(config: BaseConfig & Partial<TrendWeeklyComparisonAverageConfig>): TrendWeeklyComparisonAverageConfig {
    return { ...defaultConfig, ...config } as TrendWeeklyComparisonAverageConfig;
  }

  createDataProperties$(config: TrendWeeklyComparisonAverageConfig): Observable<TrendWeeklyComparisonAverageProperties> {
    return of({});
  }

  /**
   * Create summaries that describe comparison between every two consecutive weeks in average.
   *
   * Sample summaries:
   * - The average active users in the second week was 10.4% more than the first week.
   * - The average active users in the third week was 9.3% less than the second week.
   * - The average active users in the fourth week was 8.1% more than the third week.
   */
  createSummaries$(config: TrendWeeklyComparisonAverageConfig): Observable<SummaryGroup[]> {
    const { metric } = config;

    return this.trendWeeklyElaborationSummarizationService.dataProperties$(config)
      .pipe(map(({ weekPointArrays }) => {
        const numOfWeeks = weekPointArrays.length;

        const weekYAverages = weekPointArrays.map(weekPoints =>
          math.mean(weekPoints.map(({ y }) => y))
        );

        const ordinalTexts = ['first', 'second', 'third', 'fourth', 'fifth'];

        const summaries: Summary[] = [];

        for (let i = 0; i < numOfWeeks - 1; i++) {
          const percentageIncrease = (weekYAverages[i + 1] - weekYAverages[i]) / weekYAverages[i] * 100;
          const percentageChangeDescriptor = percentageIncrease >= 0 ? 'more' : 'less';
          const percentageIncreaseAbsolute = Math.abs(percentageIncrease);
          const percentageChangeText = percentageIncreaseAbsolute > 5
            ? `${formatY(percentageIncreaseAbsolute)}% ${percentageChangeDescriptor} than`
            : 'similar to';

          const text = `The average ${metric} in the <b>${ordinalTexts[i + 1]} week</b> was <b>${percentageChangeText}</b> the <b>${ordinalTexts[i]} week</b>.`;

          summaries.push({
            text,
            validity: 1.0,
          });
        }

        return [{
          title: 'Trend Weekly Comparison - Average',
          summaries,
        }];
      }));
  }
}
