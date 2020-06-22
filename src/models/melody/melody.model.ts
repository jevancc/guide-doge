import * as Tone from 'tone';

export type OnSeek = (index: number, playing: boolean) => void;

export class Melody {
  private synth = new Tone.Synth().toDestination();
  private forwardSequence: Tone.Sequence;
  private backwardSequence: Tone.Sequence;
  private currentDatumIndex = 0;
  private inclusive = true; // if true, playing the melody starting inclusively from currentDatumIndex
  private reversed = false; // if true, playing the melody backward

  constructor(
    private values: number[],
    private frequencyRange: [number, number],
    private duration: number, // duration (in seconds) of the melody
    private onSeek?: OnSeek,
  ) {
    const reversedValues = [...values].reverse();
    this.forwardSequence = this.createSequence(values);
    this.backwardSequence = this.createSequence(reversedValues);
  }

  get noteDuration() {
    return this.duration / this.values.length;
  }

  get currentSeconds() {
    return this.reversed
      ? this.duration - Tone.Transport.seconds
      : Tone.Transport.seconds;
  }

  get isPlaying() {
    return Tone.Transport.state === 'started';
  }

  get isEnded() {
    return (
      this.reversed && this.currentDatumIndex === 0 ||
      !this.reversed && this.currentDatumIndex === this.values.length - 1
    );
  }

  get nextIndex() {
    if (this.isEnded) {
      return (this.values.length - 1) - this.currentDatumIndex; // bring playhead to the opposite end
    }
    const offset = this.inclusive ? 0 : (this.reversed ? -1 : +1);
    return this.currentDatumIndex + offset;
  }

  private static getKeyNumber(frequency: number) {
    return Math.log2(frequency / 440) * 12 + 49;
  }

  private static getFrequency(keyNumber: number) {
    return Math.pow(2, (keyNumber - 49) / 12) * 440;
  }

  async resume(reversed: boolean) {
    if (Tone.getContext().state === 'suspended') {
      await Tone.start();
    }
    if (!this.isPlaying) {
      this.reversed = reversed;
      this.currentDatumIndex = this.nextIndex;
      let nextSeconds = this.getSeconds(this.currentDatumIndex);
      if (this.reversed) {
        this.backwardSequence.start(0);
        this.forwardSequence.stop(0);
        nextSeconds += this.noteDuration / 2;
        Tone.Transport.start(undefined, this.duration - nextSeconds);
      } else {
        this.backwardSequence.stop(0);
        this.forwardSequence.start(0);
        nextSeconds -= this.noteDuration / 2;
        Tone.Transport.start(undefined, nextSeconds);
      }
    }
  }

  pause() {
    if (this.isPlaying) {
      Tone.Transport.pause();
      this.backwardSequence.stop(0);
      this.forwardSequence.stop(0);
      this.seekTo(this.currentSeconds);
    }
  }

  getCurrentDatumIndex() {
    return this.currentDatumIndex;
  }

  seekTo(seconds: number, inclusive = false) {
    this.currentDatumIndex = this.getDatumIndex(seconds);
    this.inclusive = this.isEnded || inclusive;
    this.onSeek?.(this.currentDatumIndex, this.isPlaying);
  }

  dispose() {
    this.forwardSequence.dispose();
    this.backwardSequence.dispose();
    this.synth.dispose();
  }

  private createSequence(values: number[]) {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const [minFrequency, maxFrequency] = this.frequencyRange;
    const minKeyNumber = Melody.getKeyNumber(minFrequency);
    const maxKeyNumber = Melody.getKeyNumber(maxFrequency);
    const sequence = new Tone.Sequence(
      (time, value) => {
        this.seekTo(this.currentSeconds);
        const keyNumber = (value - minValue) / (maxValue - minValue) * (maxKeyNumber - minKeyNumber) + minKeyNumber;
        const frequency = Melody.getFrequency(keyNumber);
        this.synth.triggerAttackRelease(frequency, this.noteDuration, time);
      },
      values,
      this.noteDuration,
    );
    sequence.loop = 1;
    return sequence;
  }

  private getSeconds(index: number) {
    return (index + .5) * this.noteDuration;
  }

  private getDatumIndex(seconds: number) {
    const index = Math.round(seconds / this.noteDuration - .5);
    return Math.min(Math.max(index, 0), this.values.length - 1);
  }
}
