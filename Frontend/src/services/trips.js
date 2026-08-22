const API_URL = "http://localhost:5000/api";


// ============================================================
// TRIPS
// ============================================================

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
        throw new Error(
            data.message || "Failed to create trip."
        );
    }

    return data;
}


export async function getTrips() {

    const response = await fetch(`${API_URL}/trips`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to load trips."
        );
    }

    return data;
}


export async function getTrip(id) {

    const response = await fetch(
        `${API_URL}/trips/${id}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to load trip."
        );
    }

    return data;
}


export async function updateTrip(id, tripData) {

    const response = await fetch(
        `${API_URL}/trips/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(tripData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update trip."
        );
    }

    return data;
}


export async function deleteTrip(id) {

    const response = await fetch(
        `${API_URL}/trips/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete trip."
        );
    }

    return data;
}


// ============================================================
// CITIES
// ============================================================

export async function createCity(tripId, cityData) {

    const response = await fetch(
        `${API_URL}/trips/${tripId}/cities`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(cityData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create city."
        );
    }

    return data;
}


export async function getCities(tripId) {

    const response = await fetch(
        `${API_URL}/trips/${tripId}/cities`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to load cities."
        );
    }

    return data;
}


export async function updateCity(cityId, cityData) {

    const response = await fetch(
        `${API_URL}/cities/${cityId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(cityData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update city."
        );
    }

    return data;
}


export async function deleteCity(cityId) {

    const response = await fetch(
        `${API_URL}/cities/${cityId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete city."
        );
    }

    return data;
}


// ============================================================
// ACTIVITIES
// ============================================================

export async function createActivity(
    cityId,
    activityData
) {

    const response = await fetch(
        `${API_URL}/cities/${cityId}/activities`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(activityData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create activity."
        );
    }

    return data;
}


export async function getActivities(cityId) {

    const response = await fetch(
        `${API_URL}/cities/${cityId}/activities`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to load activities."
        );
    }

    return data;
}


export async function updateActivity(
    activityId,
    activityData
) {

    const response = await fetch(
        `${API_URL}/activities/${activityId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(activityData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update activity."
        );
    }

    return data;
}


export async function deleteActivity(activityId) {

    const response = await fetch(
        `${API_URL}/activities/${activityId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete activity."
        );
    }

    return data;
}
