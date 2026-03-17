import time
import math
from collections import defaultdict
import matplotlib.pyplot as plt
import numpy as np

# Complete algorithm implementation (same as your ev_routing.py)
def euclidean(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def route_distance(route, origin=(0, 0)):
    if not route:
        return 0.0
    total_dist = euclidean(origin, route[0])
    for i in range(len(route) - 1):
        total_dist += euclidean(route[i], route[i + 1])
    return total_dist

def nearest_neighbor_route(coords, origin=(0, 0)):
    if not coords:
        return []
    unvisited = list(range(len(coords)))
    route = []
    current = origin
    
    while unvisited:
        next_idx = min(unvisited, key=lambda i: euclidean(current, coords[i]))
        route.append(next_idx)
        current = coords[next_idx]
        unvisited.remove(next_idx)
    
    return route

def greedy_assign(batteries, employee_coords):
    N = len(batteries)
    M = len(employee_coords)
    origin = (0, 0)
    
    emp_distances = [(i, euclidean(origin, employee_coords[i])) for i in range(M)]
    emp_distances.sort(key=lambda x: x[1], reverse=True)
    emp_order = [idx for idx, _ in emp_distances]
    
    car_assignments = defaultdict(list)
    
    for emp_id in emp_order:
        best_car = None
        best_cost = float('inf')
        
        for car_id in range(N):
            if len(car_assignments[car_id]) >= 4:
                continue
            
            tentative_coords = [employee_coords[e] for e in car_assignments[car_id]] + [employee_coords[emp_id]]
            tentative_route = nearest_neighbor_route(tentative_coords)
            tentative_ordered_coords = [tentative_coords[i] for i in tentative_route]
            distance = route_distance(tentative_ordered_coords)
            
            if distance < best_cost:
                best_cost = distance
                best_car = car_id
        
        if best_car is None:
            min_car = min(range(N), key=lambda c: len(car_assignments[c]))
            best_car = min_car
        
        car_assignments[best_car].append(emp_id)
    
    return car_assignments

def solve_ev_routing(batteries, employee_coords):
    car_assignments = greedy_assign(batteries, employee_coords)
    
    N = len(batteries)
    final_distances = {}
    failed_cars = []
    
    for car_id in range(N):
        assigned_emp_ids = car_assignments[car_id]
        if not assigned_emp_ids:
            final_distances[car_id] = 0.0
            continue
        
        coords = [employee_coords[e] for e in assigned_emp_ids]
        route_idx = nearest_neighbor_route(coords)
        ordered_coords = [coords[i] for i in route_idx]
        distance = route_distance(ordered_coords)
        final_distances[car_id] = distance
        
        if distance > batteries[car_id]:
            failed_cars.append(car_id)
    
    return {
        "valid": len(failed_cars) == 0,
        "distances": final_distances,
        "batteries": batteries,
        "failed_cars": failed_cars
    }

# Test Cases EXACTLY from your report
test_cases = [
    {"name": "Test Case 1", "batteries": [50.0, 40.0], "coords": [(3,4), (1,1), (6,8), (2,5), (7,2), (5,5)]},
    {"name": "Test Case 2", "batteries": [5.0, 100.0], "coords": [(10,10), (2,2), (15,15), (1,3)]},
    {"name": "Test Case 3", "batteries": [20.0, 20.0], "coords": [(3,4), (4,3), (6,0), (0,6)]},
    {"name": "Test Case 4", "batteries": [60.0, 55.0, 50.0], "coords": [(2,3), (5,7), (8,1), (4,4), (9,9), (1,6), (7,3), (3,8), (6,5), (10,2)]}
]

# MEASURE EXECUTION TIMES
print("=== YOUR MEASURED EXECUTION TIMES ===")
test_results = []
for case in test_cases:
    start_time = time.time()
    result = solve_ev_routing(case["batteries"], case["coords"])
    end_time = time.time()
    exec_time_ms = (end_time - start_time) * 1000
    
    print(f"{case['name']}: {exec_time_ms:.2f} ms")
    test_results.append({
        "case": case["name"],
        "time_ms": exec_time_ms,
        "distances": result["distances"],
        "batteries": result["batteries"]
    })

# SCALABILITY BENCHMARK (M=5 to 50)
print("\n=== SCALABILITY DATA (M=5 to 50) ===")
scalability_data = []
employee_counts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
batteries_fixed = [50.0, 50.0, 50.0, 50.0]  # 4 cars

np.random.seed(42)
for M in employee_counts:
    coords = [(np.random.uniform(0, 10), np.random.uniform(0, 10)) for _ in range(M)]
    
    start_time = time.time()
    result = solve_ev_routing(batteries_fixed, coords)
    end_time = time.time()
    exec_time_ms = (end_time - start_time) * 1000
    
    print(f"M={M}, N=4: {exec_time_ms:.2f} ms")
    scalability_data.append({"employees": M, "time_ms": exec_time_ms})

# BAR CHART: Battery Available vs Used (FIGURE 2)
fig1, ax1 = plt.subplots(figsize=(14, 8))
case_names = [r["case"] for r in test_results]
car_data = []
car_labels = []

for i, result in enumerate(test_results):
    batteries = result["batteries"]
    distances = result["distances"]
    
    for car_id in range(len(batteries)):
        if car_id not in distances:
            distances[car_id] = 0.0
        
        battery_used = distances[car_id]
        battery_avail = batteries[car_id]
        label = f"{case_names[i]}\nCar {car_id+1}"
        car_labels.append(label)
        car_data.append((battery_used, battery_avail))

used_vals = [d[0] for d in car_data]
avail_vals = [d[1] for d in car_data]
x = np.arange(len(car_data))
width = 0.35

ax1.bar(x - width/2, used_vals, width, label="Distance Used", alpha=0.8, color="#36A2EB")
ax1.bar(x + width/2, avail_vals, width, label="Battery Available", alpha=0.8, color="#FF6384")
ax1.set_xlabel("Test Case - Car", fontsize=12)
ax1.set_ylabel("Distance (km)", fontsize=12)
ax1.set_title("Figure 2: Battery Available vs Distance Used per Car\nAcross Test Cases", fontsize=14, fontweight='bold')
ax1.set_xticks(x)
ax1.set_xticklabels(car_labels, rotation=45, ha='right')
ax1.legend(fontsize=11)
ax1.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("battery_comparison.png", dpi=300, bbox_inches='tight')
plt.show()
print("SAVED: battery_comparison.png (Figure 2)")

# LINE GRAPH: Scalability (FIGURE 3)
fig2, ax2 = plt.subplots(figsize=(12, 7))
scal_df_times = [d["time_ms"] for d in scalability_data]
ax2.plot(employee_counts, scal_df_times, marker='o', linewidth=3, markersize=10, color='#2E8B57', label='Execution Time')
ax2.set_xlabel("Number of Employees (M)", fontsize=12)
ax2.set_ylabel("Execution Time (ms)", fontsize=12)
ax2.set_title("Figure 3: Algorithm Scalability Analysis\nExecution Time vs Number of Employees (N=4 cars fixed)", fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3)
ax2.legend(fontsize=11)

plt.tight_layout()
plt.savefig("scalability_analysis.png", dpi=300, bbox_inches='tight')
plt.show()
print(" SAVED: scalability_analysis.png (Figure 3)")

print("\n ALL FILES GENERATED!")
