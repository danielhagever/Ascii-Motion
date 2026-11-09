/**
 * Color distance calculation utility functions
 */
export class ColorMatcher {
  /**
   * Calculate Euclidean distance between two RGB colors
   */
  static calculateColorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  }

  /**
   * Find closest color from palette to given RGB values
   */
  static findClosestColor(r: number, g: number, b: number, palette: string[]): string {
    let closestColor = palette[0];
    let minDistance = Infinity;
    
    for (const hexColor of palette) {
      const { r: pr, g: pg, b: pb } = this.hexToRgb(hexColor);
      const distance = this.calculateColorDistance(r, g, b, pr, pg, pb);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = hexColor;
      }
    }
    
    return closestColor;
  }

  /**
   * Convert hex color to RGB values
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Check if a color matches a key color within tolerance
   * Used for color keying/alpha transparency
   * @param r Red component of color to check
   * @param g Green component of color to check
   * @param b Blue component of color to check
   * @param keyColor Hex color to match against
   * @param tolerance RGB distance tolerance (0-255, default 0 for exact match)
   * @returns true if color matches within tolerance
   */
  static matchesColorKey(r: number, g: number, b: number, keyColor: string, tolerance: number = 0): boolean {
    const { r: kr, g: kg, b: kb } = this.hexToRgb(keyColor);
    const distance = this.calculateColorDistance(r, g, b, kr, kg, kb);
    return distance <= tolerance;
  }

  /**
   * Simple dithering algorithm for color mapping
   * @deprecated Use ditherColorNoise, ditherColorBayer2x2, or ditherColorBayer4x4 instead
   */
  static ditherColor(r: number, g: number, b: number, palette: string[], ditherStrength: number = 0.1): string {
    // Add some noise for dithering effect
    const noise = () => (Math.random() - 0.5) * ditherStrength * 255;
    const ditheredR = Math.max(0, Math.min(255, r + noise()));
    const ditheredG = Math.max(0, Math.min(255, g + noise()));
    const ditheredB = Math.max(0, Math.min(255, b + noise()));
    
    return this.findClosestColor(ditheredR, ditheredG, ditheredB, palette);
  }

  /**
   * Noise-based dithering with position-based pseudo-random for consistent results
   * Uses deterministic noise based on x,y coordinates for reproducible dithering
   */
  static ditherColorNoise(
    r: number, g: number, b: number, 
    palette: string[], 
    ditherStrength: number,
    x: number, y: number
  ): string {
    // Position-based pseudo-random noise (deterministic)
    const noise1 = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const noise2 = Math.sin(x * 93.9898 + y * 47.233) * 25643.2831;
    const noise = ((noise1 - Math.floor(noise1)) + (noise2 - Math.floor(noise2))) / 2;
    
    // Convert ditherStrength (0-1) to noise amplitude
    const amplitude = ditherStrength * 255;
    const offset = (noise - 0.5) * amplitude;
    
    const ditheredR = Math.max(0, Math.min(255, r + offset));
    const ditheredG = Math.max(0, Math.min(255, g + offset));
    const ditheredB = Math.max(0, Math.min(255, b + offset));
    
    return this.findClosestColor(ditheredR, ditheredG, ditheredB, palette);
  }

  /**
   * Bayer 2x2 ordered dithering for structured, retro aesthetic
   * Creates a classic halftone pattern using a 2x2 Bayer matrix
   */
  static ditherColorBayer2x2(
    r: number, g: number, b: number,
    palette: string[],
    ditherStrength: number,
    x: number, y: number
  ): string {
    const bayer2x2 = [
      [0, 2],
      [3, 1]
    ];
    
    const matrixX = Math.abs(x) % 2;
    const matrixY = Math.abs(y) % 2;
    const threshold = bayer2x2[matrixY][matrixX] / 4; // Normalize to 0-1
    
    // Apply threshold to each color channel
    const offset = (threshold - 0.5) * ditherStrength * 255;
    
    const ditheredR = Math.max(0, Math.min(255, r + offset));
    const ditheredG = Math.max(0, Math.min(255, g + offset));
    const ditheredB = Math.max(0, Math.min(255, b + offset));
    
    return this.findClosestColor(ditheredR, ditheredG, ditheredB, palette);
  }

  /**
   * Bayer 4x4 ordered dithering for finer, more detailed patterns
   * Creates smoother dithering with more gradation levels
   */
  static ditherColorBayer4x4(
    r: number, g: number, b: number,
    palette: string[],
    ditherStrength: number,
    x: number, y: number
  ): string {
    const bayer4x4 = [
      [0,  8,  2,  10],
      [12, 4,  14, 6],
      [3,  11, 1,  9],
      [15, 7,  13, 5]
    ];
    
    const matrixX = Math.abs(x) % 4;
    const matrixY = Math.abs(y) % 4;
    const threshold = bayer4x4[matrixY][matrixX] / 16; // Normalize to 0-1
    
    // Apply threshold to each color channel
    const offset = (threshold - 0.5) * ditherStrength * 255;
    
    const ditheredR = Math.max(0, Math.min(255, r + offset));
    const ditheredG = Math.max(0, Math.min(255, g + offset));
    const ditheredB = Math.max(0, Math.min(255, b + offset));
    
    return this.findClosestColor(ditheredR, ditheredG, ditheredB, palette);
  }

  /**
   * Map color by brightness to palette index (like character mapping)
   */
  static mapColorByIndex(r: number, g: number, b: number, palette: string[]): string {
    if (palette.length === 0) return '#000000';
    
    // Calculate brightness using the same formula as character mapping
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Fixed mapping: ensures all colors are used by mapping brightness 0-255 to indices 0-(length-1)
    const paletteIndex = Math.min(Math.floor((brightness / 256) * palette.length), palette.length - 1);
    
    return palette[paletteIndex];
  }

  /**
   * Index-based mapping with noise dithering
   * Maps brightness to palette index, then applies noise to the brightness before mapping
   * Uses fractional component to reduce dithering in smooth areas
   */
  static mapColorByIndexNoise(
    r: number, g: number, b: number,
    palette: string[],
    ditherStrength: number,
    x: number, y: number
  ): string {
    if (palette.length === 0) return '#000000';
    
    // Calculate base brightness
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate continuous palette position (0 to palette.length)
    const continuousIndex = (brightness / 256) * palette.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // Position-based noise
    const noise1 = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const noise2 = Math.sin(x * 93.9898 + y * 47.233) * 25643.2831;
    const noise = ((noise1 - Math.floor(noise1)) + (noise2 - Math.floor(noise2))) / 2;
    
    // Apply dithering threshold based on fractional part and noise
    // This creates transitions at palette boundaries rather than uniform noise
    const threshold = (noise - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + threshold > 0.5;
    
    // Choose index based on dithering decision
    let paletteIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && paletteIndex < palette.length - 1) {
      paletteIndex += 1;
    }
    
    paletteIndex = Math.max(0, Math.min(palette.length - 1, paletteIndex));
    
    return palette[paletteIndex];
  }

  /**
   * Index-based mapping with Bayer 2x2 dithering
   * Maps brightness to palette index using ordered dithering pattern
   * Uses fractional component for gradient-aware dithering
   */
  static mapColorByIndexBayer2x2(
    r: number, g: number, b: number,
    palette: string[],
    ditherStrength: number,
    x: number, y: number
  ): string {
    if (palette.length === 0) return '#000000';
    
    // Calculate base brightness
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate continuous palette position
    const continuousIndex = (brightness / 256) * palette.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // Bayer 2x2 matrix
    const bayer2x2 = [
      [0, 2],
      [3, 1]
    ];
    
    const matrixX = Math.abs(x) % 2;
    const matrixY = Math.abs(y) % 2;
    const threshold = bayer2x2[matrixY][matrixX] / 4; // Normalize to 0-1
    
    // Apply Bayer threshold to fractional part
    const adjustedThreshold = (threshold - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + adjustedThreshold > 0.5;
    
    let paletteIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && paletteIndex < palette.length - 1) {
      paletteIndex += 1;
    }
    
    paletteIndex = Math.max(0, Math.min(palette.length - 1, paletteIndex));
    
    return palette[paletteIndex];
  }

  /**
   * Index-based mapping with Bayer 4x4 dithering
   * Maps brightness to palette index using finer ordered dithering pattern
   * Uses fractional component for gradient-aware dithering
   */
  static mapColorByIndexBayer4x4(
    r: number, g: number, b: number,
    palette: string[],
    ditherStrength: number,
    x: number, y: number
  ): string {
    if (palette.length === 0) return '#000000';
    
    // Calculate base brightness
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate continuous palette position
    const continuousIndex = (brightness / 256) * palette.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // Bayer 4x4 matrix
    const bayer4x4 = [
      [0,  8,  2,  10],
      [12, 4,  14, 6],
      [3,  11, 1,  9],
      [15, 7,  13, 5]
    ];
    
    const matrixX = Math.abs(x) % 4;
    const matrixY = Math.abs(y) % 4;
    const threshold = bayer4x4[matrixY][matrixX] / 16; // Normalize to 0-1
    
    // Apply Bayer threshold to fractional part
    const adjustedThreshold = (threshold - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + adjustedThreshold > 0.5;
    
    let paletteIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && paletteIndex < palette.length - 1) {
      paletteIndex += 1;
    }
    
    paletteIndex = Math.max(0, Math.min(palette.length - 1, paletteIndex));
    
    return palette[paletteIndex];
  }
}

/**
 * CharacterMapper
 * Maps RGB values to characters with optional gradient-aware dithering
 */
export class CharacterMapper {
  /**
   * Direct character mapping by index (no dithering)
   * Uses standard brightness calculation to map to character array by index
   */
  static mapCharacterByIndex(r: number, g: number, b: number, characters: string[]): string {
    // Calculate brightness using Rec. 709 relative luminance
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Map brightness to character array
    const continuousIndex = (brightness / 256) * characters.length;
    const charIndex = Math.floor(continuousIndex);
    const clampedIndex = Math.max(0, Math.min(characters.length - 1, charIndex));
    
    return characters[clampedIndex];
  }

  /**
   * Character mapping with noise-based dithering
   * Applies position-dependent noise dithering at palette boundaries
   */
  static mapCharacterByIndexNoise(
    r: number,
    g: number,
    b: number,
    characters: string[],
    ditherStrength: number,
    x: number,
    y: number
  ): string {
    // Calculate brightness using Rec. 709 relative luminance
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Map brightness to continuous character index
    const continuousIndex = (brightness / 256) * characters.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // Position-based pseudo-random noise
    const noise = ((x * 12.9898 + y * 78.233) * 43758.5453) % 1.0;
    const threshold = (noise - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + threshold > 0.5;
    
    let charIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && charIndex < characters.length - 1) {
      charIndex += 1;
    }
    
    charIndex = Math.max(0, Math.min(characters.length - 1, charIndex));
    
    return characters[charIndex];
  }

  /**
   * Character mapping with 2x2 Bayer matrix dithering
   * Uses ordered dithering pattern for gradient-aware character selection
   */
  static mapCharacterByIndexBayer2x2(
    r: number,
    g: number,
    b: number,
    characters: string[],
    ditherStrength: number,
    x: number,
    y: number
  ): string {
    // Calculate brightness using Rec. 709 relative luminance
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Map brightness to continuous character index
    const continuousIndex = (brightness / 256) * characters.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // 2x2 Bayer matrix
    const bayerMatrix = [
      [0, 2],
      [3, 1]
    ];
    
    const threshold = (bayerMatrix[y % 2][x % 2] / 4.0 - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + threshold > 0.5;
    
    let charIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && charIndex < characters.length - 1) {
      charIndex += 1;
    }
    
    charIndex = Math.max(0, Math.min(characters.length - 1, charIndex));
    
    return characters[charIndex];
  }

  /**
   * Character mapping with 4x4 Bayer matrix dithering
   * Uses larger ordered dithering pattern for smoother gradients
   */
  static mapCharacterByIndexBayer4x4(
    r: number,
    g: number,
    b: number,
    characters: string[],
    ditherStrength: number,
    x: number,
    y: number
  ): string {
    // Calculate brightness using Rec. 709 relative luminance
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Map brightness to continuous character index
    const continuousIndex = (brightness / 256) * characters.length;
    const fractionalPart = continuousIndex - Math.floor(continuousIndex);
    
    // 4x4 Bayer matrix
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    
    const threshold = (bayerMatrix[y % 4][x % 4] / 16.0 - 0.5) * ditherStrength;
    const shouldDitherUp = fractionalPart + threshold > 0.5;
    
    let charIndex = Math.floor(continuousIndex);
    if (shouldDitherUp && charIndex < characters.length - 1) {
      charIndex += 1;
    }
    
    charIndex = Math.max(0, Math.min(characters.length - 1, charIndex));
    
    return characters[charIndex];
  }
}
