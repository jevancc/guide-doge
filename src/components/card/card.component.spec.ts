import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { MatCardModule } from '@angular/material/card';
import { LineChartMeta, TabbedChartsMeta } from '../../datasets/types';

describe('CardComponent', () => {
  let tabbedFixture: ComponentFixture<CardComponent<TabbedChartsMeta>>;
  let tabbedComponent: CardComponent<TabbedChartsMeta>;
  let lineFixture: ComponentFixture<CardComponent<LineChartMeta>>;
  let lineComponent: CardComponent<LineChartMeta>;

  const testChartMeta1: LineChartMeta = {
    type: 'line',
    title: 'testChart1',
    query: () => [],
  };
  const testChartMeta2: LineChartMeta = {
    type: 'line',
    title: 'testChart2',
    query: () => [],
  };
  const testTabbedChartsMeta: TabbedChartsMeta = {
    type: 'tabbed',
    title: 'testTabbedCharts',
    metas: [testChartMeta1, testChartMeta2],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CardComponent,
      ],
      imports: [
        MatCardModule
      ]
    });
    tabbedFixture = TestBed.createComponent<CardComponent<TabbedChartsMeta>>(CardComponent);
    tabbedComponent = tabbedFixture.componentInstance;
    lineFixture = TestBed.createComponent<CardComponent<LineChartMeta>>(CardComponent);
    lineComponent = lineFixture.componentInstance;
  });

  it('should instantiate.', () => {
    expect(tabbedComponent).toBeInstanceOf(CardComponent);
    expect(lineComponent).toBeInstanceOf(CardComponent);
  });

  it('should set current chart title when init.', () => {
    lineComponent.meta = testChartMeta1;
    lineComponent.ngOnInit();
    expect(lineComponent.currentChart.title).toBe(testChartMeta1.title);

    tabbedComponent.meta = testTabbedChartsMeta;
    tabbedComponent.ngOnInit();
    expect(tabbedComponent.currentChart.title).toBe(testChartMeta1.title);
  });

  it('should return whether input meta is tabbed charts or not.', () => {
    lineComponent.meta = testChartMeta1;
    expect(lineComponent.isTabbed()).toBeFalse();
    tabbedComponent.meta = testTabbedChartsMeta;
    expect(tabbedComponent.isTabbed()).toBeTrue();
  });

  it('should return input meta titles.', () => {
    lineComponent.meta = testChartMeta1;
    expect(lineComponent.titles).toEqual([testChartMeta1.title]);
    tabbedComponent.meta = testTabbedChartsMeta;
    expect(tabbedComponent.titles).toEqual([testChartMeta1.title, testChartMeta2.title]);
  });

  it('should set current chart.', () => {
    lineComponent.meta = testChartMeta1;
    expect(lineComponent.currentChart.title).toBe(testChartMeta1.title);
    lineComponent.setCurrentTabTitle('REDUNDANT SET TITLE');
    expect(lineComponent.currentChart.title).toBe(testChartMeta1.title);

    tabbedComponent.meta = testTabbedChartsMeta;
    expect(tabbedComponent.currentChart.title).toBe(testChartMeta1.title);
    tabbedComponent.setCurrentTabTitle(testChartMeta2.title);
    expect(tabbedComponent.currentChart.title).toBe(testChartMeta2.title);
  });
});
