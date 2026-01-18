/**
 * Removes all properties with undefined values from an object.
 * Useful for preparing payloads for Firebase RTDB which throws on undefined.
 */
export const cleanObject = <T extends Record<string, any>>(obj: T): T => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
        if (newObj[key] === undefined) {
            delete newObj[key];
        } else if (newObj[key] !== null && typeof newObj[key] === 'object' && !Array.isArray(newObj[key])) {
            newObj[key] = cleanObject(newObj[key]);
        }
    });
    return newObj;
};
