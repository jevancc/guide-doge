import * as regression from 'regression';
import * as math from 'mathjs';
import { normalizePointsX, normalizePointsY, pointToPair, pairToPoint } from '../utils/commons';
import { MembershipFunction } from './protoform';
import { TimeSeriesPoint, NumPoint, XYPoint } from '../../../datasets/metas/types';
import { timeSeriesPointToNumPoint } from '../utils/time-series';

export interface LinearModel {
  /* The gradient of linear model, which is the coefficient m in equation y = mx + c */
  gradient: number;
  /* The angle between the 2D linear model (slope) and x-axis in radius */
  gradientAngleRad: number;
  /* The y-intercept of linear model, which is the coefficient c in equation y = mx + c */
  yIntercept: number;
  /* The coefficient of determination (R squared) value */
  r2: number;
  /* The points with x-values from input points and predicted y-values */
  prediction: NumPoint[];
  /* The mean of absolute errors between y-values of input points and predicted y-values */
  absoluteErrorMean: number;
  /* The standard deviation of errors between y-values of input points and predicted y-values */
  errorStd: number;
}

/**
 * Create a linear model that the numerical X-Y points fit with coefficients m and c in equation
 * y = mx + c with linear regression. It minimize the residual sum of squares between the y-values
 * of input points, and the predicted y-values by the linear approximation.
 *
 * @param points The numerical X-Y points to fit a linear model
 */
export function createLinearModel(points: NumPoint[]): LinearModel {
  const pairs = points.map(pointToPair);
  const model = regression.linear(pairs);
  const gradient = model.equation[0];
  const yIntercept = model.equation[1];
  const r2 = model.r2;
  const gradientAngleRad = Math.atan(gradient);
  const prediction = model.points.map(pairToPoint);

  const absoluteErrors = points.map((point, i) => {
    return Math.abs(point.y - prediction[i].y);
  });
  const errors = points.map((point, i) => {
    return point.y - prediction[i].y;
  });

  const absoluteErrorMean = math.mean(absoluteErrors);
  const errorStd = math.std(errors);

  return {
    gradient,
    gradientAngleRad,
    yIntercept,
    r2,
    prediction,
    absoluteErrorMean,
    errorStd,
  };
}


export interface Cone2D {
  startAngleRad: number;
  endAngleRad: number;
}

export interface TimeSeriesPartialTrend {
  /* The index of the trend's first point in points array */
  indexStart: number;
  /* The index of the trend's last point in points array */
  indexEnd: number;
  /* The time (x-value) of the trend's first point */
  timeStart: Date;
  /* The time (x-value) of the trend's last point */
  timeEnd: Date;
  /* The time span percentage of the trend to the total time span of points array */
  percentageSpan: number;
  /* The intersection of cones formed by the points belong to the trend */
  cone: Cone2D;
}

/**
 * Create an array of partial trend which approximate the normalized time-series points with uniform partially
 * linear eps-approximation. The x-values and y-values of points are normalized first regarding the size of
 * chart before extracting trends.
 *
 * Reference:
 *  Kacprzyk, Janusz, Anna Wilbik, and S. Zadrożny. "Linguistic summarization of time series using a fuzzy quantifier driven aggregation.",
 *    Fuzzy Sets and Systems 159.12 (2008): 1485-1499.
 *
 * @param points The time-series points to extract partial trends.
 * @param eps Radius of circle around points when finding the intersection of cones for a partial trend.
 * @param normalizeY Whether to normalize the y-values of input points or not before extracting partial trends.
 */
export function createPartialTrends(points: TimeSeriesPoint[], eps: number, normalizeY: boolean = true): TimeSeriesPartialTrend[] {
  const numPoints = points.map(timeSeriesPointToNumPoint);
  const normalizedXPoints = normalizePointsX(numPoints);
  const normalizedPoints: NumPoint[] = normalizeY ? normalizePointsY(normalizedXPoints) : normalizedXPoints;
  const normalizedXMin = Math.min(...normalizedPoints.map(({ x }) => x));
  const normalizedXMax = Math.max(...normalizedPoints.map(({ x }) => x));

  if (normalizedPoints.length <= 1) {
    return [];
  } else {
    const trends: TimeSeriesPartialTrend[] = [];
    // Modified Sklansky and Gonzalez algorithm for extracting trends
    let i = 0;
    let j = 1;
    let coneij: Cone2D;
    while (j < normalizedPoints.length) {
      let k = j;
      let coneik = createCone(normalizedPoints[i], normalizedPoints[k], eps);
      coneij = coneik;
      do {
        coneij = intersectCone(coneij, coneik) as Cone2D;
        j = k;
        k = k + 1;
        if (k === normalizedPoints.length) {
          break;
        }
        coneik = createCone(normalizedPoints[i], normalizedPoints[k], eps);
      } while (intersectCone(coneij, coneik) !== null);

      trends.push({
        indexStart: i,
        indexEnd: j,
        timeStart: points[i].x,
        timeEnd: points[j].x,
        percentageSpan: (normalizedPoints[j].x - normalizedPoints[i].x) / (normalizedXMax - normalizedXMin),
        cone: coneij,
      });

      i = j;
      j = k;
    }
    return trends;
  }
}

function createCone(p1: NumPoint, p2: NumPoint, eps: number): Cone2D {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx * dx + dy * dy <= eps * eps) {
    return {
      startAngleRad: -Math.PI / 2,
      endAngleRad: Math.PI / 2,
    };
  } else {
    const a1 = Math.atan((dx * dy - eps * Math.sqrt(dx * dx + dy * dy - eps * eps)) / (dx * dx - eps * eps));
    const a2 = Math.atan((dx * dy + eps * Math.sqrt(dx * dx + dy * dy - eps * eps)) / (dx * dx - eps * eps));
    return {
      startAngleRad: Math.min(a1, a2),
      endAngleRad: Math.max(a1, a2),
    };
  }
}

function intersectCone(c1: Cone2D, c2: Cone2D): Cone2D | null {
  const startAngleRad = Math.max(c1.startAngleRad, c2.startAngleRad);
  const endAngleRad = Math.min(c1.endAngleRad, c2.endAngleRad);
  if (startAngleRad <= endAngleRad) {
    return {
      startAngleRad,
      endAngleRad,
    };
  } else {
    return null;
  }
}

export type PartialTrendMembershipFunction = (partialTrend: TimeSeriesPartialTrend) => number;

/**
 * A function decorator that maps the cone angle of the input partial trend to the membership function.
 *
 * @param mf: The membership function that takes the cone angle as input.
 */
export function mapConeAngle(mf: MembershipFunction): PartialTrendMembershipFunction {
  return ({ cone }: TimeSeriesPartialTrend) => {
    const coneAngleRadAverage = (cone.endAngleRad + cone.startAngleRad) / 2;
    return mf(coneAngleRadAverage);
  };
}

/**
 * Create an array of time-series partial trends by merging continuous partial trends based on the
 * membership degree of given membership functions. If two continuous partial trends both have membership
 * degree from the same membership function above the threshold, they will be merged in the returned partial
 * trends array. The cone of the merged partial trend has the area being the union of cone areas of the
 * original partial trends.
 *
 * @param partialTrends The time-series partial trends to merge.
 * @param uPartialTrends The membership functions for merging continuous partial trends.
 * @param membershipDegreeThreshold The threshold for determining whether the membership degree is high or not.
 */
export function mergePartialTrends(
  partialTrends: TimeSeriesPartialTrend[],
  uPartialTrends: PartialTrendMembershipFunction[],
  membershipDegreeThreshold: number = 0.7,
  ) {

  const merge = (a: TimeSeriesPartialTrend, b: TimeSeriesPartialTrend): TimeSeriesPartialTrend[] => {
    for (const uPartialTrend of uPartialTrends) {
      if (uPartialTrend(a) >= membershipDegreeThreshold && uPartialTrend(b) >= membershipDegreeThreshold) {
        const indexStart = Math.min(a.indexStart, b.indexStart);
        const indexEnd = Math.max(a.indexEnd, b.indexEnd);
        const timeStart = a.timeStart < b.timeStart ? a.timeStart : b.timeStart;
        const timeEnd = a.timeEnd > b.timeEnd ? a.timeEnd : b.timeEnd;
        const percentageSpan = a.percentageSpan + b.percentageSpan;
        const startAngleRad = Math.min(a.cone.startAngleRad, b.cone.startAngleRad);
        const endAngleRad = Math.max(a.cone.endAngleRad, b.cone.endAngleRad);
        return [{
          indexStart,
          indexEnd,
          timeStart,
          timeEnd,
          percentageSpan,
          cone: {
            startAngleRad,
            endAngleRad,
          }
        }];
      }
    }
    return [a, b];
  };

  const mergedPartialTrends: TimeSeriesPartialTrend[] = [];
  for (const partialTrend of partialTrends) {
    if (mergedPartialTrends.length === 0) {
      mergedPartialTrends.push(partialTrend);
    } else {
      const previousPartialTrend = mergedPartialTrends.pop() as TimeSeriesPartialTrend;
      mergedPartialTrends.push(...merge(previousPartialTrend, partialTrend));
    }
  }
  return mergedPartialTrends;
}

/**
 * Create an array of points with smoothed y-values using exponential moving average.
 * The exponential moving average for a series of y-values(Y) are calculated with the following recursive formula:
 * ```
 * if (t == 0) {
 *   S[t] = Y[0]
 * } else {
 *   S[t] = alpha * Y[t] + (1 - alpha) * Y[t - 1]
 * }
 * ```
 *
 * @param points The points to apply exponential moving average.
 * @param alpha The degree of weighting decrease, should be a constant smoothing factor between 0 and 1.
 * A higher alpha discounts older observations faster.
 */
export function createExponentialMovingAveragePoints<T>(points: XYPoint<T, number>[], alpha = 0.3): XYPoint<T, number>[] {
  const N = points.length;
  const yValues = points.map(({ y }) => y);

  const smoothedYValues: number[] = new Array(N);
  for (let i = 0; i < N; i++) {
    smoothedYValues[i] = alpha * yValues[i] + (1.0 - alpha) * (smoothedYValues[i - 1] ?? yValues[i]);
  }

  const smoothedPoints = smoothedYValues.map((y, i) => ({
    x: points[i].x,
    y,
  }));
  return smoothedPoints;
}

/**
 * Create an array of points with smoothed y-values using centered moving average. The length of the
 * returned points array is equal to the length of the input array, where smaller window size is used to compute
 * left and right averages for points close to the edge of the array to get smoothed y-value.
 *
 * Reference: https://www.itl.nist.gov/div898/handbook/pmc/section4/pmc422.htm
 *
 * @param points The points to apply centered moving average.
 * @param k The half window (period) size for computing the left and right average for element
 * in the points array, should be a positive integer. The actual window (period) size is equal to 2*k.
 */
export function createCenteredMovingAveragePoints<T>(points: XYPoint<T, number>[], k: number): XYPoint<T, number>[] {
  const numOfPoints = points.length;
  const smoothedPoints: XYPoint<T, number>[] = [];
  for (let i = 0; i < points.length; i++) {
    const leftPoints = points.slice(Math.max(0, i - k), Math.min(numOfPoints, i + k));
    const rightPoints = points.slice(Math.max(0, i - k + 1), Math.min(numOfPoints, i + k + 1));

    const leftPointsSum = math.sum(leftPoints.map(({ y }) => y));
    const rightPointsSum = math.sum(rightPoints.map(({ y }) => y));

    const smoothedY = 0.5 * (leftPointsSum / leftPoints.length + rightPointsSum / rightPoints.length);
    smoothedPoints.push({
      x: points[i].x,
      y: smoothedY,
    });
  }
  return smoothedPoints;
}

export type GroupIdentifier = string | number;

export interface DecompositionResult<T> {
  detrendedPoints: XYPoint<T, number>[];
  seasonalPoints: XYPoint<T, number>[];
  residualPoints: XYPoint<T, number>[];
}

/**
 * Create the detrended, seasonal, and residual points from the input points and trend points arrays with
 * additive decomposition. The relationships between the input and output are formualted in the following
 * equations:
 * - `DetrendedPoints[i].y = Points[i].y - TrendPoints[i].y`
 * - `Points[i].y = TrendPoints[i].y + SeasonalPoints[i].y + ResidualPoints[i].y`
 *
 * Reference:
 * - https://medium.com/better-programming/a-visual-guide-to-time-series-decomposition-analysis-a1472bb9c930
 * - https://machinelearningmastery.com/decompose-time-series-data-trend-seasonality/
 *
 * @param points The time-series points to apply centered moving average.
 * @param trendPoints The trend points of the input points array. It can be created by applying smoothing
 * algorithm on the points array.
 * @param groupFn The grouping function for computing the seasonal points. It takes a point an return a
 * group identifier. Points with the same group identifier will be assigned into the same group when computing
 * the y-value of seasonal point for this group. The group identifier can be created regarding the x-value of the
 * input point.
 */
export function additiveDecomposite<T>(
  points: XYPoint<T, number>[],
  trendPoints: XYPoint<T, number>[],
  groupFn: (point: XYPoint<T, number>) => GroupIdentifier): DecompositionResult<T> {

  const detrendedPoints = points.map(({ x, y }, i) => ({
    x,
    y: y - trendPoints[i].y,
  }));

  const groups: Record<GroupIdentifier, XYPoint<T, number>[]> = {};

  for (const detrendedPoint of detrendedPoints) {
    const groupId = groupFn(detrendedPoint);
    if (!(groupId in groups)) {
      groups[groupId] = [detrendedPoint];
    } else {
      groups[groupId].push(detrendedPoint);
    }
  }

  const groupYAverages: Record<GroupIdentifier, number> = {};
  for (const [groupId, groupPoints] of Object.entries(groups)) {
    const groupYAverage = math.mean(groupPoints.map(({ y }) => y));
    groupYAverages[groupId] = groupYAverage;
  }

  const seasonalPoints = points.map(({ x, y }) => ({
    x,
    y: groupYAverages[groupFn({ x, y })],
  }));
  const residualPoints = points.map(({ x, y }, i) => ({
    x,
    y: y - trendPoints[i].y - seasonalPoints[i].y,
  }));

  return {
    detrendedPoints,
    seasonalPoints,
    residualPoints,
  };
}
