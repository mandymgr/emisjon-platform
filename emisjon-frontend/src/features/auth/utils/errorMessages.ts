// Map common error scenarios to user-friendly messages
export function getErrorMessage(error: any): string {
  // Check for network errors
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.response?.data?.error;
  const errorCode = error.response?.data?.code;

  // Prioritize backend error messages if they're clear
  if (message && (errorCode === 'USER_NOT_FOUND' || errorCode === 'INVALID_PASSWORD')) {
    return message;
  }

  // Handle specific status codes
  switch (status) {
    case 400:
      // Bad request - usually validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          return errors[0].msg || 'Please check your input and try again.';
        }
      }
      return message || 'Invalid input. Please check your information and try again.';
    
    case 401:
      // Check if it's specifically a wrong password error
      if (message?.includes('Incorrect password')) {
        return 'Incorrect password. Please try again.';
      }
      return 'Invalid email or password. Please try again.';
    
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    
    case 404:
      // Check if it's specifically a user not found error
      if (message?.includes('User not found')) {
        return 'No account found with this email. Please register to create an account.';
      }
      return 'The requested resource was not found. Please try again later.';
    
    case 409:
      return message || 'This email is already registered. Please use a different email or try logging in.';
    
    case 422:
      return 'The provided information is invalid. Please check your input and try again.';
    
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    
    case 500:
      return 'Something went wrong on our end. Please try again later or contact support if the problem persists.';
    
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again in a few moments.';
    
    default:
      // If we have a custom message from the server, use it
      if (message) {
        return message;
      }
      
      // Generic fallback
      return `An unexpected error occurred (Error ${status}). Please try again later.`;
  }
}