export type Vector<T> = {
  x: T;
  y: T;
};

export type SizeVector<T> = {
  width: T;
  height: T;
};

export type BoundsFuction = (scale: number) => Vector<number>;

export enum PanMode {
  CLAMP = 'clamp',
  FREE = 'free',
  FRICTION = 'friction',
}

export enum ScaleMode {
  CLAMP = 'clamp',
  BOUNCE = 'bounce',
}

export type CommonResumableProps = {
  minScale?: number;
  maxScale?: number;
  panMode?: PanMode;
  scaleMode?: ScaleMode;
  panWithPinch?: boolean;
};
