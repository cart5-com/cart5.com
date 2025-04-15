/**
 * Converts a string to a slug format suitable for URLs and subdomains
 * 
 * @param text - The text to convert to a slug
 * @returns The slugified text
 */
export const slugify = (text: string): string => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/&/g, '-and-')      // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}; 