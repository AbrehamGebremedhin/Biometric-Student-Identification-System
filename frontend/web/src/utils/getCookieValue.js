// getCookieByName.js
export const getCookieValue = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    
    // Find the cookie that matches the name
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue); // Return the value after decoding
        }
    }
    
    // If the cookie is not found, return null
    return null;
};
