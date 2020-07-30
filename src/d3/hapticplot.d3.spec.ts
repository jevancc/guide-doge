import { Hapticplot } from './hapticplot.d3';
import { Entity } from 'aframe';
import { Vector3 } from 'three';


describe('VR Haptic Plot', () => {
  const shape = 'a-sphere';
  let scene: HTMLElement;
  let hapticplot: Hapticplot;

  beforeEach( () =>  {
    scene = document.createElement('a-scene');
    hapticplot = new Hapticplot(shape);
  });

  it('places no points bc 1:1 correspondence with empty data array', () => {
    hapticplot.init(scene, []);
    const expectedPosArray = [];
    const result = getPosition(scene, shape);
    expect(result).toEqual(expectedPosArray);
  });

  it('places points for each datum in a one datum array', () => {
    hapticplot.init(scene, [10]);
    const expectedPosArray = [new Vector3(0, 10, -1)];
    const result = getPosition(scene, shape);
    expect(result).toEqual(expectedPosArray);
  });

  it('places points for each datum in a three datum array', () => {
    hapticplot.init(scene, [0, 10, 20]);
    const expectedPosArray = [new Vector3(0, 0, -1), new Vector3(0.1, 10, -1), new Vector3(0.2, 20, -1)];
    const result = getPosition(scene, shape);
    expect(result).toEqual(expectedPosArray);
  });

  it('places points for each datum and sets the correct color property on the resulting shape entities', () => {
    hapticplot.init(scene, [10, 20, 30]);
    const expectedColorArray = ['green', 'green' , 'green'];
    const result = getColor(scene, shape);
    expect(result).toEqual(expectedColorArray);
  });

  it('places points for each datum and sets the correct size property on the resulting shape entities', () => {
    hapticplot.init(scene, [10, 20, 30]);
    const expectedSizeArray = ['0.05', '0.05', '0.05'];
    const result = getRadius(scene, shape);
    expect(result).toEqual(expectedSizeArray);
  });

  it('places points for each datum and sets the correct hoverable property on the resulting shape entities', () => {
    hapticplot.init(scene, [10, 20, 30]);
    const expectedSizeArray = ['hoverable', 'hoverable', 'hoverable'];
    const result = getHoverable(scene, shape);
    expect(result).toEqual(expectedSizeArray);
  });

  it('places points for each datum and sets the correct color property on the resulting shape entities after a hover event', () => {
    hapticplot.init(scene, [10, 20, 30]);
    const expectedSizeArray = ['red', 'red', 'red'];
    const result = getHoveredColor(scene, shape);
    expect(result).toEqual(expectedSizeArray);
  });
});

// Helper Functions

// Returns an array of actual position vectors
function getPosition(scene: HTMLElement, shape: string): Vector3[]{
  const attrArray: Vector3[] = [];
  Array.from(scene.querySelectorAll(shape)).forEach((child) => {
    attrArray.push(new Vector3(
      (child as Entity).object3D.position.x,
      (child as Entity).object3D.position.y,
      (child as Entity).object3D.position.z));
  });
  return attrArray;
}

// Returns an array of each generated objects color
function getColor(scene: HTMLElement, shape: string): (string | null)[]{
  return Array.from(scene.querySelectorAll(shape)).map((point: Element) => point.getAttribute('color'));
}

// Returns an array of each generated objects radius
function getRadius(scene: HTMLElement, shape: string): (string | null)[]{
  return Array.from(scene.querySelectorAll(shape)).map((point: Element) => point.getAttribute('radius'));
}

// Returns an array of each generated objects hover property
function getHoverable(scene: HTMLElement, shape: string): (string | undefined)[]{
  return Array.from(scene.querySelectorAll(shape)).map((point: Element) => (point as Entity).components.hoverable.attrName);
}

// Returns an array of each generated objects color, after a hover event has occured
function getHoveredColor(scene: HTMLElement, shape: string): (string | null)[]{
  const shapes = scene.querySelectorAll(shape);
  for (const point of Array.from(shapes)){
    point.dispatchEvent(new Event('hover-start'));
  }
  return Array.from(scene.querySelectorAll(shape)).map((point: Element) => point.getAttribute('color'));
}
