import math
from utils.preprocessing import haversine_distance

def calculate_distance_matrix(locations):
    """
    Given a list of location dicts with 'id', 'latitude', 'longitude',
    returns an N x N distance matrix in kilometers.
    """
    n = len(locations)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = haversine_distance(
                    locations[i]["latitude"], locations[i]["longitude"],
                    locations[j]["latitude"], locations[j]["longitude"]
                )
    return matrix

def optimize_route_nearest_neighbor(attractions, start_point=None):
    """
    Order a list of attractions using the Nearest Neighbor heuristic to minimize total distance.
    If start_point is provided (e.g. hotel coordinates), begins from there.
    Returns:
      ordered_attractions: list
      total_distance_km: float
      estimated_travel_time_mins: int (assuming average city travel speed 30 km/h)
      route_polyline: list of [lat, lon] waypoints
    """
    if not attractions:
        return {
            "ordered_attractions": [],
            "total_distance_km": 0.0,
            "estimated_travel_time_mins": 0,
            "route_polyline": []
        }

    if len(attractions) == 1:
        att = attractions[0]
        return {
            "ordered_attractions": attractions,
            "total_distance_km": 0.0,
            "estimated_travel_time_mins": 10,
            "route_polyline": [[att["latitude"], att["longitude"]]]
        }

    unvisited = list(range(len(attractions)))
    ordered_indices = []

    # Pick starting node: closest to start_point if provided, else index 0
    if start_point and "latitude" in start_point and "longitude" in start_point:
        best_dist = float("inf")
        start_idx = 0
        for idx in unvisited:
            dist = haversine_distance(
                start_point["latitude"], start_point["longitude"],
                attractions[idx]["latitude"], attractions[idx]["longitude"]
            )
            if dist < best_dist:
                best_dist = dist
                start_idx = idx
        current_idx = start_idx
    else:
        current_idx = 0

    ordered_indices.append(current_idx)
    unvisited.remove(current_idx)

    total_dist = 0.0

    while unvisited:
        curr_att = attractions[current_idx]
        best_dist = float("inf")
        next_idx = None
        for cand_idx in unvisited:
            cand_att = attractions[cand_idx]
            dist = haversine_distance(
                curr_att["latitude"], curr_att["longitude"],
                cand_att["latitude"], cand_att["longitude"]
            )
            if dist < best_dist:
                best_dist = dist
                next_idx = cand_idx

        total_dist += best_dist
        current_idx = next_idx
        ordered_indices.append(current_idx)
        unvisited.remove(current_idx)

    ordered_attractions = [attractions[i] for i in ordered_indices]
    
    # Calculate travel time at avg speed of 30 km/h in tourist zones + 10 mins buffer per transition
    num_transitions = max(1, len(ordered_attractions) - 1)
    travel_time_mins = int((total_dist / 30.0) * 60) + (num_transitions * 10)

    polyline = [[att["latitude"], att["longitude"]] for att in ordered_attractions]

    return {
        "ordered_attractions": ordered_attractions,
        "total_distance_km": round(total_dist, 2),
        "estimated_travel_time_mins": travel_time_mins,
        "route_polyline": polyline
    }
