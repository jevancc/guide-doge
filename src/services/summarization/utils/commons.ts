import { SummaryGroup, Summary, QuerySummariesFactory } from '../types';
import { XYPoint, NumPoint } from '../../../datasets/metas/types';

export function cacheSummaries(f: () => SummaryGroup[]): () => SummaryGroup[] {
  let cache: SummaryGroup[] | null = null;
  return () => {
    if (!cache) {
      cache = f();
    }
    return cache;
  };
}

/**
 * Create a query-summary-factory which returns the concatenation of summaries returned
 * by the input query factories. The returned function does not pre-compute the returned
 * summaries from the input queryFactories, and it does not cache the concatenated
 * sumaries. The cache and lazy evaluation need to be implemented by each input
 * query-summary-factory individually.
 */
export function combineQuerySummariesFactories<PointT>(
  ...queryFactories: QuerySummariesFactory<PointT>[]): QuerySummariesFactory<PointT> {
  return (points: PointT[]) => () => {
    const summaries = queryFactories.map(f => f(points)());
    const summariesFlat = ([] as SummaryGroup[]).concat(...summaries);
    return summariesFlat;
  };
}

export function pointToPair<X, Y>(p: XYPoint<X, Y>): [X, Y] {
  return [p.x, p.y];
}

export function pairToPoint<X, Y>(p: [X, Y]): XYPoint<X, Y> {
  const [x, y] = p;
  return { x, y };
}

interface ChartAxisLimit {
  min?: number;
  max?: number;
}

export interface NormalizedXPoint<T> extends XYPoint<number, T> {
  x_: number;
}

export function normalizePointsX<T>(points: XYPoint<number, T>[], xlim: ChartAxisLimit = {}): NormalizedXPoint<T>[] {
  const eps = 1e-5;
  const xValues = points.map(({ x }) => x);
  const {
    min: xmin = Math.min(...xValues),
    max: xmax = Math.max(...xValues),
  } = xlim;

  return points.map(({ x, y }) => ({
    x: (x - xmin) / (xmax - xmin + eps) * 8 / 5,
    x_: x,
    y,
  }));
}

export interface NormalizedYPoint<T> extends XYPoint<T, number> {
  y_: number;
}

export function normalizePointsY<T>(points: XYPoint<T, number>[], ylim: ChartAxisLimit = {}): NormalizedYPoint<T>[] {
  const eps = 1e-5;
  const yValues = points.map(({ y }) => y);
  const {
    min: ymin = 0,
    max: ymax = Math.max(...yValues),
  } = ylim;

  return points.map(({ x, y }) => ({
    x,
    y: (y - ymin) / (ymax - ymin + eps),
    y_: y,
  }));
}

export type NormalizedPoint = NormalizedYPoint<number> & NormalizedYPoint<number>;

export function normalizePoints(points: NumPoint[], xlim: ChartAxisLimit = {}, ylim: ChartAxisLimit = {}): NormalizedPoint[] {
  return normalizePointsY(normalizePointsX(points, xlim), ylim);
}

export function createOrdinalText(num: number) {
  const digits = [num % 10, num % 100];
  const ordinalTexts = ['st', 'nd', 'rd'];
  const ordinalPatterns = [1, 2, 3];
  const thPatterns = [11, 12, 13, 14, 15, 16, 17, 18, 19];

  if (thPatterns.includes(digits[1])) {
    return `${num}th`;
  } else if (ordinalPatterns.includes(digits[0])) {
    return `${num}${ordinalTexts[digits[0] - 1]}`;
  } else {
    return `${num}th`;
  }
}
