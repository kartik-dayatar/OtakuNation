export const getProductImage = (imageName) => {
    if (!imageName) return '/assets/placeholder.png';
    if (imageName.startsWith('http') || imageName.startsWith('/src')) return imageName;
    return `/src/assets/images/products/${imageName}`;
};
