export function getPlaceholderImage(width: number, height: number, text?: string): string {
  const bgColor = '#e2e8f0';
  const textColor = '#64748b';
  const fontSize = Math.floor(Math.min(width, height) / 5);
  const label = text || `${width}x${height}`;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dy=".3em">${label}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
