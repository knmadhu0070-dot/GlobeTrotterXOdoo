const API_URL = "http://localhost:5000/api";

export async function createTrip(tripData) {
    const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(tripData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create trip.");
    }

    return data;
}


export async function getTrips() {
    const response = await fetch(`${API_URL}/trips`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load trips.");
    }

    return data;
}


export async function getTrip(id) {
    const response = await fetch(`${API_URL}/trips/${id}`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load trip.");
    }

    return data;
}


export async function updateTrip(id, tripData) {
    const response = await fetch(`${API_URL}/trips/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(tripData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update trip.");
    }

    return data;
}


export async function deleteTrip(id) {
    const response = await fetch(`${API_URL}/trips/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete trip.");
    }

    return data;
}