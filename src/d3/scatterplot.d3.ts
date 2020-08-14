import * as AFRAME from 'aframe';
import * as d3 from 'd3';
import { VRScatterPoint } from '../datasets/queries/vr.query';
import { MetaType } from '../datasets/metas/types';
import { Controls } from './scatterplot-ctrls';
import { xml } from 'd3';
const PROXY_FLAG = '__keyboard-controls-proxy';
const DATA_PT_RADIUS = .05;
// const CAM_Y_ROTATION = AFRAME.THREE.MathUtils.degToRad(135);

const speedPos: Record<string, string> = {
    ['minus']: '-.75 1.5 -4',
    ['plus']: '.25 1.5 -4',
    ['label']: '-.25 1.5 -4',
   
  };

export interface ScatterPlotStyle {
  color: string | number;
  shape: string;
}

export class Scatterplot{
    readonly AILERON_FONT = 'https://cdn.aframe.io/fonts/Aileron-Semibold.fnt';
    private XGRID_BOUND = 50;
    private YGRID_BOUND = 50;
    private ZGRID_BOUND = 50;
    private data: VRScatterPoint[];
    private shape: string;
    private container: HTMLElement | null;
    private dataPointContainer: HTMLElement;
    private dataTextContainer: HTMLElement;
    private metrics: string[];
    private cardSelection: any;
    ptSelection: any;
    DAYDREAM_NAV_SPEED;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    zScale: d3.ScaleLinear<number, number>;
    dataType: MetaType;
    loaded = false;
    loadControls = true;
    cameraRig: HTMLElement = document.createElement('a-entity');

  constructor(shape: string) {
    this.shape = shape;
  }

  init(container: HTMLElement, data: VRScatterPoint[], metrics: string[], dataType: MetaType){
    this.data = data;
    this.metrics = metrics;
    this.dataType = dataType;
    this.container = container;
    this.dataType = dataType;
    this.checkForDSChange();
    this.dataPointContainer = document.createElement('a-entity');
    this.dataPointContainer.className = 'dataPts';
    this.dataPointContainer.id = 'points';
    container.appendChild(this.dataPointContainer);
    this.createSky('lightgray');
    
   
    setTimeout(() => {
      this.createGridPlane();
      this.DAYDREAM_NAV_SPEED = .1;
      this.dataTextContainer = document.createElement('a-entity');
      this.dataTextContainer.className = 'dataTxt';
      this.dataTextContainer.id = 'cards';
      document.querySelector('[camera]').appendChild(this.dataTextContainer);
      if (this.data.length > 0){
        this.generatePts();
      }
      this.generateText();
      if (this.loadControls){
        const control = new Controls(this);
      }
    }, 2000);
  this.loaded = true;
}

  checkForDSChange(){
    if (document.getElementById('points') != null && document.getElementById('cards') != null){
      this.loadControls = false;
      const points = document.getElementById('points');
      const cards = document.getElementById('cards');
      points!.parentNode!.removeChild(points as Node);
      cards!.parentNode!.removeChild(cards as Node);
    }
  }

  setDaydreamNavSpeed(setSpeed: number){
    this.DAYDREAM_NAV_SPEED = setSpeed;
  }

  getDaydreamNavSpeed(): number{
    return this.DAYDREAM_NAV_SPEED;
  }

  getGridBound(dimension: string): number{
    if(dimension === 'x'){
      return this.XGRID_BOUND;
    } else if(dimension === 'y'){
        return this.YGRID_BOUND;
    } else if(dimension === 'z'){
        return this.ZGRID_BOUND;
    }
    return this.XGRID_BOUND;
  }


  private scalePosition(xMapping: number, yMapping: number, zMapping: number){
    let maxXValue = this.data[0].x;
    let maxYValue = this.data[0].y;
    let maxZValue = this.data[0].z;
    for (const pt of this.data){
      if (pt.x > maxXValue){
        maxXValue = pt.x;
      }
      if (pt.y > maxYValue){
        maxYValue = pt.y;
      }
      if (pt.z > maxZValue){
        maxZValue = pt.z;
      }
    }
    // scale positions based on largest value found in xyz to absVal(maxGridDimension)
    this.xScale = d3.scaleLinear().domain([0, maxXValue]).range([0, xMapping]);
    this.yScale = d3.scaleLinear().domain([0, maxYValue]).range([0, yMapping]);
    this.zScale = d3.scaleLinear().domain([0, maxZValue]).range([0, zMapping]);
  }

changeScales(xMapping: number, yMapping: number, zMapping: number){
  d3.select(this.dataPointContainer).selectAll(this.shape).data(this.data).remove();
  if (xMapping < 0){
    xMapping = 0;
  }
  if (yMapping < 0){
    yMapping = 0;
  }
  if (zMapping < 0){
    zMapping = 0;
  }
  this.XGRID_BOUND = xMapping;
  this.YGRID_BOUND = yMapping;
  this.ZGRID_BOUND = zMapping;
  this.generatePts();
  this.redrawGridPlane();
}

  private generatePts() {
    this.scalePosition(this.XGRID_BOUND, this.YGRID_BOUND, this.ZGRID_BOUND);
     // enter identifies any DOM elements to be added when # array elements doesn't match
    d3.select(this.dataPointContainer).selectAll(this.shape).data(this.data).enter().append(this.shape);
    this.ptSelection = d3.select(this.dataPointContainer).selectAll(this.shape);
    this.ptSelection
    // d is data at index, i within
    // select all shapes within given container
    .attr('radius', DATA_PT_RADIUS)
    .attr('material', 'color: #4385f4')
    .attr('position', (d: VRScatterPoint, i) => {
      const x = this.xScale(d.x);
      const y = this.yScale(d.y);
      const z = this.zScale(d.z);
      return `${x} ${y} ${z}`;
    })
    .each((d, i, g) => {
      // (g[i] as AFRAME.Entity).setAttribute('hover_cards', '');
      (g[i] as AFRAME.Entity).addEventListener('mouseenter', () => {
        const hoverIdx = i;
        this.cardSelection.filter((d, i) => { return i === hoverIdx})
        .attr('visible', true) 
        .attr('position', '0 -.15 -.5');
      });
      (g[i] as AFRAME.Entity).addEventListener('mouseleave', () => {
        const hoverIdx = i;
        this.cardSelection.filter((d, i) => { return i === hoverIdx})
        .attr('visible', false)
        .attr('position', '0 0 2');
      });
    });
  }

  private generateText(){
    // enter identifies any DOM elements to be added when # array elements doesn't match
    d3.select(this.dataTextContainer).selectAll('a-entity').data(this.data).enter().append('a-entity');
    this.cardSelection =  d3.select(this.dataTextContainer).selectAll('a-entity');
    this.cardSelection
      .attr('geometry', 'primitive: plane; height: .2; width: .5')
      .attr('material', 'color: #4385f4; opacity: .5')
      .attr('text', (d, i) => {
        const categories = (d as VRScatterPoint).categories.browser + ', ' + (d as VRScatterPoint).categories.country
          + ', ' + (d as VRScatterPoint).categories.source;
        // for (let categChild of (d as VRScatterPoint).categories)
        const x = (d as VRScatterPoint).x;
        const y = (d as VRScatterPoint).y;
        const z = (d as VRScatterPoint).z;
        return `
        value: \n${categories} Position:\n\n\t--${this.metrics[0]} (x): ${x}\n\n\t--${this.metrics[1]} (y): ${y.toFixed(2)}\n\n\t--${this.metrics[2]} (z): ${z};
        xOffset: ${DATA_PT_RADIUS / 3};
        shader: msdf; 
        font:https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/roboto/Roboto-Medium.json;`;
      })
      .attr('visible', false)
      .attr('position', '0 0 2');
  }

  private redrawGridPlane(){
    this.container!.removeChild(document.getElementById('xGrid')!);
    this.container!.removeChild(document.getElementById('yGrid')!);
    this.container!.removeChild(document.getElementById('zGrid')!);
    this.createGridPlane();
  }

  private createGridPlane()
  {
    const xGrid = document.createElement('a-entity');
    xGrid.className = 'grids';
    xGrid.id = 'xGrid';
    xGrid.className = 'grids';
    this.container!.appendChild(xGrid);
    xGrid.object3D.add(new AFRAME.THREE.GridHelper(this.XGRID_BOUND * 2, this.XGRID_BOUND * 2, 0xffffff, 0xffffff));
    d3.select(this.container).select('#xGrid').attr('position', '0 0 0');
    d3.select(this.container).select('#xGrid').attr('rotation', '0 0 0');

    const yGrid = document.createElement('a-entity');
    yGrid.className = 'grids';
    yGrid.id = 'yGrid';
    yGrid.className = 'grids';
    this.container!.appendChild(yGrid);
    yGrid.object3D.add(new AFRAME.THREE.GridHelper(this.YGRID_BOUND * 2, this.YGRID_BOUND * 2, 0xffffff, 0xffffff));
    d3.select(this.container).select('#yGrid').attr('position', '0 0 0');
    d3.select(this.container).select('#yGrid').attr('rotation', '0 0 -90');

    const zGrid = document.createElement('a-entity');
    zGrid.className = 'grids';
    zGrid.id = 'zGrid';
    zGrid.className = 'grids';
    this.container!.appendChild(zGrid);
    zGrid.object3D.add(new AFRAME.THREE.GridHelper(this.ZGRID_BOUND * 2, this.ZGRID_BOUND * 2, 0xffffff, 0xffffff));
    d3.select(this.container).select('#zGrid').attr('position', '0 0 0');
    d3.select(this.container).select('#zGrid').attr('rotation', '-90 0 0');
  }

  private createSky(color: string | number){
    const sky = document.createElement('a-sky');
    sky.id = 'sky';
    this.container?.appendChild(sky);
    d3.select(this.container).selectAll('#sky').attr('color', () => {
      return color;
    });
  }
}

AFRAME.registerComponent('rotate_cards', {
  tick() {
    // need to include rig to account for initial rotation of camera rig
    const rigRot = (document.getElementById('rig') as AFRAME.Entity).object3D.rotation;
    const camRot = (document.querySelector('[camera]') as AFRAME.Entity).object3D.rotation;
    this.el.object3D.rotation.set(
       rigRot.x + camRot.x,
       rigRot.y + camRot.y,
       rigRot.z + camRot.z,
    );
  }
});


