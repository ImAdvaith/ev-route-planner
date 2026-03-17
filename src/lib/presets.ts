import { Car, Employee } from "./types";

export interface Preset {
  label: string;
  cars: Car[];
  employees: Employee[];
}

export const PRESETS: Preset[] = [
  {
    label: "Simple Valid",
    cars: [{ id: 1, battery: 60 }, { id: 2, battery: 60 }],
    employees: [
      { id: 1, x: 2, y: 3 }, { id: 2, x: -1, y: 5 },
      { id: 3, x: 4, y: -2 }, { id: 4, x: -3, y: -4 },
      { id: 5, x: 6, y: 1 },  { id: 6, x: -5, y: 2 },
    ],
  },
  {
    label: "Battery Failure",
    cars: [{ id: 1, battery: 5 }, { id: 2, battery: 5 }],
    employees: [
      { id: 1, x: 10, y: 10 }, { id: 2, x: -10, y: 10 },
      { id: 3, x: 10, y: -10 }, { id: 4, x: -10, y: -10 },
    ],
  },
  {
    label: "Large Fleet",
    cars: [{ id: 1, battery: 80 }, { id: 2, battery: 80 }, { id: 3, battery: 80 }],
    employees: [
      { id: 1, x: 3, y: 7 },  { id: 2, x: -4, y: 6 },
      { id: 3, x: 7, y: -3 }, { id: 4, x: -6, y: -5 },
      { id: 5, x: 9, y: 2 },  { id: 6, x: -8, y: 1 },
      { id: 7, x: 2, y: -9 }, { id: 8, x: -2, y: 8 },
      { id: 9, x: 5, y: 5 },  { id: 10, x: -5, y: -7 },
    ],
  },
];
