import * as math from 'mathjs';
import { Summary, SummaryVariableOptionPair } from './types';
import { TimeSeriesPoint } from '../metas/types';
import { cacheSummaries } from './utils/commons';
import {
  PointMembershipFunction,
  MembershipFunction,
  trapmf,
  trapmfL,
  trapmfR,
} from './libs/protoform';
import {
  mapConeAngle,
  createExponentialMovingAveragePoints,
  createPartialTrends,
  mergePartialTrends,
  TimeSeriesPartialTrend,
} from './libs/trend';
import { formatX, formatY } from '../../utils/formatters';
import { chartDiagonalAngle } from './utils/constants';

export function queryFactory(points: TimeSeriesPoint[]) {
  return cacheSummaries(() => {
    const smoothedPoints = createExponentialMovingAveragePoints(points);
    const partialTrends = createPartialTrends(smoothedPoints, 0.01);

    const uIncreasingDynamic = mapConeAngle(trapmfL(chartDiagonalAngle / 8, chartDiagonalAngle / 4));
    const uConstantDynamic = mapConeAngle(
      trapmf(-chartDiagonalAngle / 4, -chartDiagonalAngle / 8, chartDiagonalAngle / 8, chartDiagonalAngle / 4));
    const uDecreasingDynamic = mapConeAngle(trapmfR(-chartDiagonalAngle / 4, -chartDiagonalAngle / 8));

    const uDynamics: SummaryVariableOptionPair<PointMembershipFunction<TimeSeriesPartialTrend>>[] = [
      ['increased', uIncreasingDynamic],
      ['similar', uConstantDynamic],
      ['decreased', uDecreasingDynamic],
    ];

    const mergedPartialTrends = mergePartialTrends(
      partialTrends,
      [uIncreasingDynamic, uConstantDynamic, uDecreasingDynamic],
    );

    const paragraph: Summary = { text: '', validity: 1.0 };
    const summaries: Summary[] = [];
    for (const partialTrend of mergedPartialTrends) {
      for (const [dynamic, uDynamic] of uDynamics) {
        const timeStart = formatX(partialTrend.timeStart);
        const timeEnd = formatX(partialTrend.timeEnd);
        if (dynamic === 'increased' || dynamic === 'decreased') {
          const yAbsoluteDiff = Math.abs(points[partialTrend.indexEnd].y - points[partialTrend.indexStart].y);
          const text = `The active users from <b>${timeStart}</b> to <b>${timeEnd}</b>  <b>${dynamic} by ${formatY(yAbsoluteDiff)}</b>.`;
          const validity = uDynamic(partialTrend);
          summaries.push({ text, validity });

          if (validity > 0.7) {
            if (paragraph.text.length === 0) {
              paragraph.text = `The active users <b>${dynamic} by ${formatY(yAbsoluteDiff)}</b> from <b> ${timeStart} </b> to <b>${timeEnd}</b>`;
              paragraph.validity = Math.min(paragraph.validity, validity);
            } else {
              paragraph.text += `, <b>${dynamic} by ${formatY(yAbsoluteDiff)}</b> from <b> ${timeStart} </b> to <b>${timeEnd}</b>`;
              paragraph.validity = Math.min(paragraph.validity, validity);
            }
          }
        } else {
          // y-values are similar
          const ySum = math.sum(math.range(partialTrend.indexStart, partialTrend.indexEnd + 1).map(i => points[i].y));
          const yAverage = ySum / (partialTrend.indexEnd - partialTrend.indexStart + 1);

          const text = `The active users from <b>${timeStart}</b> to <b>${timeEnd}</b> is <b>${dynamic} around ${formatY(yAverage)}</b>.`;
          const validity = uDynamic(partialTrend);
          summaries.push({ text, validity });

          if (validity > 0.7) {
            if (paragraph.text.length === 0) {
              paragraph.text = `The active users is <b>${dynamic} around ${formatY(yAverage)}</b> from <b>${timeStart}</b> to <b>${timeEnd}</b>`;
              paragraph.validity = Math.min(paragraph.validity, validity);
            } else {
              paragraph.text += `, <b>${dynamic} around ${formatY(yAverage)}</b> from <b>${timeStart}</b> to <b>${timeEnd}</b>`;
              paragraph.validity = Math.min(paragraph.validity, validity);
            }
          }
        }
      }
    }

    paragraph.text += '.';

    return [{
      title: 'Trend Partial Elaboration',
      summaries,
      paragraph,
    }];
  });
}