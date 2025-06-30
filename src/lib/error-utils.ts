// Utility function to extract error messages from API responses
export const extractErrorMessage = (error: any, defaultMessage: string): string => {
    // Check for backend error response structure
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        return error.response.data.errors[0].message;
    }
    
    // Check for direct message in response
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    
    // Check for axios error message
    if (error.message) {
        return error.message;
    }
    
    // Return default message if no specific error found
    return defaultMessage;
}; 