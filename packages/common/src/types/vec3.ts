import { Vector3 } from './vector';

const isVec3Symbol = Symbol('isVec3');

export interface Vec3 extends Vector3 {
   /**@internal */
   __proto__: Vec3;
   /** Add another vector to this vector (mutates). */
   add(vec: ReadOnlyVector3): Vec3;
   /** Subtract another vector from this vector (mutates). */
   subtract(vec: ReadOnlyVector3): Vec3;
   /** Component-wise multiply by another vector (mutates). */
   multiply(vec: ReadOnlyVector3): Vec3;
   /** Scale this vector by a scalar (mutates). */
   scale(n: number): Vec3;
   /** Floor components (mutates). */
   floor(): Vec3;
   /** Project this vector onto another (mutates). */
   projection(vec: ReadOnlyVector3): Vec3;
   /** Rejection of this vector from another (mutates). */
   rejection(vec: ReadOnlyVector3): Vec3;
   /** Reflect this vector across normal (mutates). */
   reflect(vec: ReadOnlyVector3): Vec3;
   /** Linear interpolation towards another vector by t (mutates). */
   lerp(vec: ReadOnlyVector3, t: number): Vec3;
   /** Cross product (mutates). */
   cross(vec: ReadOnlyVector3): Vec3;
   /** Dot product (non-mutating). */
   dot(vec: ReadOnlyVector3): number;
   /** Distance to another vector/point (non-mutating). */
   distance(vec: ReadOnlyVector3): number;
   normalize(): Vec3;
   readonly length: number;
   toString(): string;
   clone(): Vec3;

   /**@internal */
   [isVec3Symbol]: boolean;
}

export type ReadOnlyVector3 = Readonly<Vector3>;

export interface Vec3Function {
   /** Construct a new Vec3 (with `new`) */
   new (x?: number, y?: number, z?: number): Vec3;
   /** Call as function to create a plain Vec3 object */
   (x?: number, y?: number, z?: number): Vec3;
   /** Adds two vectors. */
   add(a: ReadOnlyVector3, b: ReadOnlyVector3): Vec3;
   /** Subtracts the second vector from the first. */
   subtract(a: ReadOnlyVector3, b: ReadOnlyVector3): Vec3;
   /** Component-wise multiply two vectors. */
   multiply(v: ReadOnlyVector3, other: ReadOnlyVector3): Vec3;
   /** Scale a vector by a scalar. */
   scale(v: ReadOnlyVector3, n: number): Vec3;
   /** Calculates magnitude (length) of a vector. */
   magnitude(vec: ReadOnlyVector3): number;
   /** Normalizes the given vector to length 1. */
   normalize(vec: ReadOnlyVector3): Vec3;
   /** Cross product of two vectors. */
   cross(a: ReadOnlyVector3, b: ReadOnlyVector3): Vec3;
   /** Dot product of two vectors. */
   dot(a: ReadOnlyVector3, b: ReadOnlyVector3): number;
   /** Angle between two vectors in radians. */
   angleBetween(a: ReadOnlyVector3, b: ReadOnlyVector3): number;
   /** Projects vector a onto b. */
   projection(a: ReadOnlyVector3, b: ReadOnlyVector3): Vec3;
   /** Rejection of a from b (a - projection). */
   rejection(a: ReadOnlyVector3, b: ReadOnlyVector3): Vec3;
   /** Reflects vector v across normal n. */
   reflect(v: ReadOnlyVector3, n: ReadOnlyVector3): Vec3;
   /** Linear interpolation between a and b by t. */
   lerp(a: ReadOnlyVector3, b: ReadOnlyVector3, t: number): Vec3;
   /** Distance between two vectors/points. */
   distance(a: ReadOnlyVector3, b: ReadOnlyVector3): number;
   /** Creates a Vec3 from array, object or Vec3. */
   from(object: object): Vec3;
   /** Returns two vectors representing sorted components between vec1 and vec2. */
   sort(vec1: ReadOnlyVector3, vec2: ReadOnlyVector3): { min: Vec3; max: Vec3 };
   /** Tests whether the value is a Vec3 created by this constructor. */
   isVec3(vec: unknown): vec is Vec3;
   /** Floors components. */
   floor(vec: ReadOnlyVector3): Vec3;
   readonly up: Vec3;
   readonly down: Vec3;
   readonly right: Vec3;
   readonly left: Vec3;
   readonly forward: Vec3;
   readonly backward: Vec3;
   readonly zero: Vec3;
   readonly prototype: Vec3;
}

// Create function/constructor. Use a permissive any type for assignments below.
// Consumers will get proper typings from the declaration file (`index.d.ts`).
//@ts-expect-error
export const Vec3: Vec3Function = function Vec3(this: Vector3, x = 0, y = 0, z = 0) {
   if (new.target) {
      this.x = Number(x);
      this.y = Number(y);
      this.z = Number(z);
   } else return { x: Number(x), y: Number(y), z: Number(z), __proto__: Vec3.prototype };
};

// Static methods assigned to constructor
Vec3.magnitude = function magnitude(vec: Vector3): number {
   return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
};

// All functions fully inlined, no calls to other Vec3 methods.
// Every return value is an object with __proto__: Vec3.prototype
Vec3.normalize = function normalize(vec: Vector3): Vec3 {
   const l = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
   return { x: vec.x / l, y: vec.y / l, z: vec.z / l, __proto__: Vec3.prototype } as Vec3;
};

Vec3.cross = function crossProduct(a: Vector3, b: Vector3): Vec3 {
   return {
      x: a.y * b.z - a.z * b.y,
      y: a.x * b.z - a.z * b.x,
      z: a.x * b.y - a.y * b.x,
      __proto__: Vec3.prototype,
   } as Vec3;
};

Vec3.dot = function dot(a: Vector3, b: Vector3): number {
   return a.x * b.x + a.y * b.y + a.z * b.z;
};

Vec3.angleBetween = function angleBetween(a: Vector3, b: Vector3): number {
   const dot = a.x * b.x + a.y * b.y + a.z * b.z;
   const magA = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
   const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
   return Math.acos(dot / (magA * magB));
};

Vec3.subtract = function subtract(a: Vector3, b: Vector3): Vec3 {
   return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, __proto__: Vec3.prototype } as Vec3;
};

Vec3.add = function add(a: Vector3, b: Vector3): Vec3 {
   return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, __proto__: Vec3.prototype } as Vec3;
};

Vec3.multiply = function multiply(vec: Vector3, other: Vector3): Vec3 {
   return { x: vec.x * other.x, y: vec.y * other.y, z: vec.z * other.z, __proto__: Vec3.prototype } as Vec3;
};

Vec3.scale = function scale(vec: Vector3, n: number): Vec3 {
   return { x: vec.x * n, y: vec.y * n, z: vec.z * n, __proto__: Vec3.prototype } as Vec3;
};

Vec3.isVec3 = function isVec3(vec: unknown): vec is Vec3 {
   return (vec as Vec3)?.[isVec3Symbol] === true;
};

Vec3.floor = function floor(vec: Vector3): Vec3 {
   return {
      x: Math.floor(vec.x),
      y: Math.floor(vec.y),
      z: Math.floor(vec.z),
      __proto__: Vec3.prototype,
   } as Vec3;
};

Vec3.projection = function projection(a: Vector3, b: Vector3): Vec3 {
   const denom = b.x * b.x + b.y * b.y + b.z * b.z;
   if (denom === 0) return { x: 0, y: 0, z: 0, __proto__: Vec3.prototype } as Vec3;

   const dot = a.x * b.x + a.y * b.y + a.z * b.z;
   const scalar = dot / denom;

   return { x: b.x * scalar, y: b.y * scalar, z: b.z * scalar, __proto__: Vec3.prototype } as Vec3;
};

Vec3.rejection = function rejection(a: Vector3, b: Vector3): Vec3 {
   const denom = b.x * b.x + b.y * b.y + b.z * b.z;
   if (denom === 0) return { x: a.x, y: a.y, z: a.z, __proto__: Vec3.prototype } as Vec3;

   const dot = a.x * b.x + a.y * b.y + a.z * b.z;
   const scalar = dot / denom;

   const px = b.x * scalar;
   const py = b.y * scalar;
   const pz = b.z * scalar;

   return { x: a.x - px, y: a.y - py, z: a.z - pz, __proto__: Vec3.prototype } as Vec3;
};

Vec3.reflect = function reflect(v: Vector3, n: Vector3): Vec3 {
   const dot = v.x * n.x + v.y * n.y + v.z * n.z;
   const s = 2 * dot;

   return { x: v.x - n.x * s, y: v.y - n.y * s, z: v.z - n.z * s, __proto__: Vec3.prototype } as Vec3;
};

Vec3.lerp = function lerp(a: Vector3, b: Vector3, t: number): Vec3 {
   return {
      x: a.x * (1 - t) + b.x * t,
      y: a.y * (1 - t) + b.y * t,
      z: a.z * (1 - t) + b.z * t,
      __proto__: Vec3.prototype,
   } as Vec3;
};

Vec3.distance = function distance(a: Vector3, b: Vector3): number {
   const dx = a.x - b.x;
   const dy = a.y - b.y;
   const dz = a.z - b.z;
   return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

Vec3.sort = function sort(vec1: Vector3, vec2: Vector3): { min: Vec3; max: Vec3 } {
   const x1 = Math.min(vec1.x, vec2.x);
   const x2 = Math.max(vec1.x, vec2.x);
   const y1 = Math.min(vec1.y, vec2.y);
   const y2 = Math.max(vec1.y, vec2.y);
   const z1 = Math.min(vec1.z, vec2.z);
   const z2 = Math.max(vec1.z, vec2.z);

   return {
      min: { x: x1, y: y1, z: z1, __proto__: Vec3.prototype } as Vec3,
      max: { x: x2, y: y2, z: z2, __proto__: Vec3.prototype } as Vec3,
   };
};

Vec3.from = function from(object: object): Vec3 {
   if (Vec3.isVec3(object)) return object;
   if (Array.isArray(object)) return Vec3(object[0], object[1], object[2]);
   const { x = 0, y = 0, z = 0 } = (object as Vector3) ?? {};
   return Vec3(Number(x), Number(y), Number(z));
};
Object.defineProperty(Vec3, 'up', {
   configurable: true,
   get() {
      return { x: 0, y: 1, z: 0, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'down', {
   configurable: true,
   get() {
      return { x: 0, y: -1, z: 0, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'right', {
   configurable: true,
   get() {
      return { x: 1, y: 0, z: 0, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'left', {
   configurable: true,
   get() {
      return { x: -1, y: 0, z: 0, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'forward', {
   configurable: true,
   get() {
      return { x: 0, y: 0, z: 1, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'backward', {
   configurable: true,
   get() {
      return { x: 0, y: 0, z: -1, __proto__: Vec3.prototype };
   },
});

Object.defineProperty(Vec3, 'zero', {
   configurable: true,
   get() {
      return { x: 0, y: 0, z: 0, __proto__: Vec3.prototype };
   },
});

// Prototype methods
(Vec3 as { prototype: Vec3 }).prototype = {
   distance(vec: ReadOnlyVector3): number {
      return Vec3.distance(this, vec);
   },
   lerp(vec: ReadOnlyVector3, t: number): Vec3 {
      this.x = this.x * (1 - t) + vec.x * t;
      this.y = this.y * (1 - t) + vec.y * t;
      this.z = this.z * (1 - t) + vec.z * t;
      return this;
   },
   projection(vec: ReadOnlyVector3): Vec3 {
      const dot = this.x * vec.x + this.y * vec.y + this.z * vec.z;
      const mag2 = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
      const s = dot / mag2;

      this.x = vec.x * s;
      this.y = vec.y * s;
      this.z = vec.z * s;
      return this;
   },
   reflect(vec: ReadOnlyVector3): Vec3 {
      const dot = this.x * vec.x + this.y * vec.y + this.z * vec.z;
      const mag2 = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
      const s = 2 * (dot / mag2);

      this.x = this.x - vec.x * s;
      this.y = this.y - vec.y * s;
      this.z = this.z - vec.z * s;
      return this;
   },
   rejection(vec: ReadOnlyVector3): Vec3 {
      const dot = this.x * vec.x + this.y * vec.y + this.z * vec.z;
      const mag2 = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
      const s = dot / mag2;

      const px = vec.x * s;
      const py = vec.y * s;
      const pz = vec.z * s;

      this.x = this.x - px;
      this.y = this.y - py;
      this.z = this.z - pz;
      return this;
   },
   cross(vec: ReadOnlyVector3): Vec3 {
      const x = this.y * vec.z - this.z * vec.y;
      const y = this.z * vec.x - this.x * vec.z;
      const z = this.x * vec.y - this.y * vec.x;

      this.x = x;
      this.y = y;
      this.z = z;
      return this;
   },
   dot(vec: ReadOnlyVector3): number {
      return Vec3.dot(this, vec);
   },
   floor(): Vec3 {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
   },
   add(vec: ReadOnlyVector3): Vec3 {
      this.x += vec.x;
      this.y += vec.y;
      this.z += vec.z;
      return this;
   },
   subtract(vec: ReadOnlyVector3): Vec3 {
      this.x -= vec.x;
      this.y -= vec.y;
      this.z -= vec.z;
      return this;
   },
   // component-wise multiply (instance)
   multiply(num: ReadOnlyVector3): Vec3 {
      this.x *= num.x;
      this.y *= num.y;
      this.z *= num.z;
      return this;
   },
   // scale (instance) - multiplies by scalar
   scale(n: number): Vec3 {
      this.x *= n;
      this.y *= n;
      this.z *= n;
      return this;
   },
   normalize(): Vec3 {
      const l = Vec3.magnitude(this);
      if (l !== 0) {
         this.x /= l;
         this.y /= l;
         this.z /= l;
      }
      return this;
   },
   get length(): number {
      return Vec3.magnitude(this);
   },
   x: 0,
   y: 0,
   z: 0,
   [isVec3Symbol]: true,
   toString(): string {
      return `<${this.x}, ${this.y}, ${this.z}>`;
   },
   clone(): Vec3 {
      return { x: this.x, y: this.y, z: this.z, __proto__: Vec3.prototype } as Vec3;
   },
} as Vec3;
