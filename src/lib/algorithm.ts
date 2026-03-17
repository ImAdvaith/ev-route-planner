import { Employee, Car, CarResult, SolveResult, Step } from "./types";

export function euclidean(p1: [number, number], p2: [number, number]): number {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

export function routeDistance(
  route: [number, number][],
  origin: [number, number] = [0, 0]
): number {
  if (route.length === 0) return 0;
  let dist = euclidean(origin, route[0]);
  for (let i = 1; i < route.length; i++) {
    dist += euclidean(route[i - 1], route[i]);
  }
  return dist;
}

export function nearestNeighborRoute(
  employeeCoords: [number, number][],
  origin: [number, number] = [0, 0]
): number[] {
  if (employeeCoords.length === 0) return [];
  const visited = new Array(employeeCoords.length).fill(false);
  const order: number[] = [];
  let current = origin;

  for (let step = 0; step < employeeCoords.length; step++) {
    let nearest = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < employeeCoords.length; i++) {
      if (!visited[i]) {
        const d = euclidean(current, employeeCoords[i]);
        if (d < nearestDist) { nearestDist = d; nearest = i; }
      }
    }
    visited[nearest] = true;
    order.push(nearest);
    current = employeeCoords[nearest];
  }
  return order;
}

export function greedyAssign(
  batteries: number[],
  employeeCoords: [number, number][]
): number[][] {
  const numCars = batteries.length;
  const assignments: number[][] = Array.from({ length: numCars }, () => []);
  const origin: [number, number] = [0, 0];

  // Sort employees by distance from origin DESCENDING (farthest first)
  const sortedIndices = employeeCoords
    .map((coord, idx) => ({ idx, dist: euclidean(origin, coord) }))
    .sort((a, b) => b.dist - a.dist)
    .map((e) => e.idx);

  for (const empIdx of sortedIndices) {
    let bestCar = -1;
    let bestDist = Infinity;

    for (let c = 0; c < numCars; c++) {
      if (assignments[c].length >= 4) continue;
      const simulatedCoords = [
        ...assignments[c].map((i) => employeeCoords[i]),
        employeeCoords[empIdx],
      ];
      const orderIndices = nearestNeighborRoute(simulatedCoords, origin);
      const orderedCoords = orderIndices.map((i) => simulatedCoords[i]);
      const d = routeDistance(orderedCoords, origin);
      if (d < bestDist) { bestDist = d; bestCar = c; }
    }

    if (bestCar === -1) {
      // All full — assign to least-full car
      bestCar = assignments.reduce(
        (minC, arr, c) => (arr.length < assignments[minC].length ? c : minC),
        0
      );
    }
    assignments[bestCar].push(empIdx);
  }

  return assignments;
}

export function solveEVRouting(cars: Car[], employees: Employee[]): SolveResult {
  const batteries = cars.map((c) => c.battery);
  const employeeCoords: [number, number][] = employees.map((e) => [e.x, e.y]);
  const origin: [number, number] = [0, 0];

  const assignments = greedyAssign(batteries, employeeCoords);
  const failedCarIds: number[] = [];
  const steps: Step[] = [];

  const carResults: CarResult[] = assignments.map((empIndices, carIdx) => {
    const coords: [number, number][] = empIndices.map((i) => employeeCoords[i]);
    const orderIndices = nearestNeighborRoute(coords, origin);
    const orderedEmpIndices = orderIndices.map((i) => empIndices[i]);
    const orderedCoords: [number, number][] = orderIndices.map((i) => coords[i]);

    const dist = routeDistance(orderedCoords, origin);
    const failed = dist > batteries[carIdx];
    if (failed) failedCarIds.push(cars[carIdx].id);

    // Build playback steps
    let soFar = 0;
    let prev = origin;
    for (let s = 0; s < orderedCoords.length; s++) {
      const to = orderedCoords[s];
      const empId = employees[orderedEmpIndices[s]].id;
      soFar += euclidean(prev, to);
      steps.push({
        carId: cars[carIdx].id,
        from: prev,
        to,
        employeeId: empId,
        distanceSoFar: soFar,
        description: `Car ${cars[carIdx].id} drops Employee ${empId} at (${to[0]}, ${to[1]}) — distance so far: ${soFar.toFixed(2)} km`,
      });
      prev = to;
    }

    return {
      carId: cars[carIdx].id,
      assignedEmployees: orderedEmpIndices.map((i) => employees[i].id),
      route: [origin, ...orderedCoords],
      distanceUsed: dist,
      failed,
    };
  });

  return { valid: failedCarIds.length === 0, carResults, failedCarIds, steps };
}
