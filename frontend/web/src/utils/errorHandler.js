// errorHandler.js
export const errorHandler = (error, navigate) => {
    if (!error.response) {
        // If there is no response, it's likely a network error
        return "Network error, please try again later.";
    }

    const statusCode = error.response.status;

    // Handle 401 Unauthorized: Redirect to login page
    if (statusCode === 401) {
        navigate("/login"); // Redirect user to login page
        return "Unauthorized. Redirecting to login page...";
    }

    // Handle 400 and 404 with custom error messages from Django backend
    if (statusCode === 400 || statusCode === 404) {
        if (error.response.data && error.response.data.Error) {
            return error.response.data.Error; // Return custom error message from backend
        }
    }

    // Fallback for other status codes
    switch (statusCode) {
        case 400:
            return "Bad Request. Please check your input.";
        case 403:
            return "Forbidden. You don't have permission.";
        case 404:
            return "Not Found. The requested resource was not found.";
        case 500:
            return "Server error. Please try again later.";
        case 503:
            return "Service unavailable. Please try again later.";
        default:
            return "An unexpected error occurred.";
    }
};
