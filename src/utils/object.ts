/**
 * Removes all properties with undefined values from an object.
 * Useful for preparing payloads for Firebase RTDB which throws on undefined.
 */
export const cleanObject = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item)) as unknown as T;
    }

    const newObj = { ...obj } as Record<string, unknown>;
    Object.keys(newObj).forEach(key => {
        const value = newObj[key];
        if (value === undefined) {
            delete newObj[key];
        } else if (value !== null && typeof value === 'object') {
            // Avoid cleaning Firebase special objects (e.g., serverTimestamp())
            // These typically contain a '.sv' key
            if (Object.keys(value).includes('.sv')) {
                return;
            }
            if (Object.keys(value).length > 0) {
                newObj[key] = cleanObject(value);
            }
        }
    });
    return (newObj as unknown) as T;
};
