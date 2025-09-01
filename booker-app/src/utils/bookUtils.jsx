// Génère une image placeholder colorée basée sur le titre du livre
export const getPlaceholderImage = (title = '') => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
  const color = colors[Math.abs(title.charCodeAt(0) || 0) % colors.length];
  const letter = title.charAt(0).toUpperCase() || '?';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='120' font-family='Arial' font-weight='bold'%3E${encodeURIComponent(letter)}%3C/text%3E%3C/svg%3E`;
};