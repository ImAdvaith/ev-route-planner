export interface Employee {
  id: number;
  x: number;
  y: number;
}

export interface Car {
  id: number;
  battery: number;
}

export interface CarResult {
  carId: number;
  assignedEmployees: number[];   // employee IDs in visit order
  route: [number, number][];     // coords in visit order (including origin at index 0)
  distanceUsed: number;
  failed: boolean;
}

export interface SolveResult {
  valid: boolean;
  carResults: CarResult[];
  failedCarIds: number[];
  steps: Step[];
}

export interface Step {
  carId: number;
  from: [number, number];
  to: [number, number];
  employeeId: number | null;
  distanceSoFar: number;
  description: string;
}
