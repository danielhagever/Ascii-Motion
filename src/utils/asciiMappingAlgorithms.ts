import type { CharacterMappingSettings } from '../types/palette';

/**
 * Mapping algorithm interface for extensibility
 */
export interface MappingAlgorithmOptions {
  neighborValues?: number[];
  gradientMagnitude?: number;
  sobelX?: number;
  sobelY?: number;
  ditherStrength?: number;  // For dithering algorithms
  x?: number;               // Pixel x coordinate for dithering
  y?: number;               // Pixel y coordinate for dithering
}

export interface MappingAlgorithm {
  name: string;
  description: string;
  mapPixelToCharacter: (
    r: number,
    g: number,
    b: number,
    characters: string[],
    options?: MappingAlgorithmOptions
  ) => string;
}

/**
 * Brightness-based mapping algorithm
 */
export const brightnessAlgorithm: MappingAlgorithm = {
  name: 'brightness',
  description: 'Maps characters based on pixel brightness/luminance',
  mapPixelToCharacter: (r: number, g: number, b: number, characters: string[]) => {
    // Using relative luminance formula (Rec. 709)
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Fixed mapping: ensures all characters are used by mapping brightness 0-255 to indices 0-(length-1)
    const charIndex = Math.min(Math.floor((brightness / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Luminance-based mapping algorithm (alternative weighting)
 */
export const luminanceAlgorithm: MappingAlgorithm = {
  name: 'luminance',
  description: 'Maps characters based on perceptual luminance',
  mapPixelToCharacter: (r: number, g: number, b: number, characters: string[]) => {
    // Perceptual luminance with gamma correction
    const luminance = Math.pow(0.299 * Math.pow(r/255, 2.2) + 0.587 * Math.pow(g/255, 2.2) + 0.114 * Math.pow(b/255, 2.2), 1/2.2) * 255;
    // Fixed mapping: ensures all characters are used by mapping luminance 0-255 to indices 0-(length-1)
    const charIndex = Math.min(Math.floor((luminance / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Contrast-based mapping algorithm
 */
export const contrastAlgorithm: MappingAlgorithm = {
  name: 'contrast',
  description: 'Maps characters based on local contrast detection',
  mapPixelToCharacter: (
    r: number,
    g: number,
    b: number,
    characters: string[],
    options?: MappingAlgorithmOptions
  ) => {
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // If neighbor values are provided, calculate local contrast
    if (options?.neighborValues && options.neighborValues.length > 0) {
      const avgNeighbor = options.neighborValues.reduce((sum, val) => sum + val, 0) / options.neighborValues.length;
      const localContrast = Math.abs(brightness - avgNeighbor) / 255;
      
      // Calculate standard deviation for better contrast measurement
      const variance = options.neighborValues.reduce((sum, val) => {
        const diff = val - avgNeighbor;
        return sum + (diff * diff);
      }, 0) / options.neighborValues.length;
      const stdDev = Math.sqrt(variance) / 255;
      
      // Combine local contrast with neighborhood variance for better contrast detection
      const contrastScore = (localContrast * 0.7) + (stdDev * 0.3);
      
      // Map contrast score to character index - higher contrast gets denser characters
      const contrastBasedIndex = Math.min(
        Math.floor(contrastScore * characters.length * 1.5), 
        characters.length - 1
      );
      
      // Blend contrast-based selection with brightness-based selection
      const brightnessIndex = Math.min(Math.floor((brightness / 256) * characters.length), characters.length - 1);
      const blendedIndex = Math.floor((contrastBasedIndex * 0.6) + (brightnessIndex * 0.4));
      
      return characters[Math.min(blendedIndex, characters.length - 1)];
    }
    
    // Fallback to brightness if no neighbors - fixed mapping
    const charIndex = Math.min(Math.floor((brightness / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Edge detection mapping algorithm
 */
export const edgeDetectionAlgorithm: MappingAlgorithm = {
  name: 'edge-detection',
  description: 'Maps characters based on edge detection for line art',
  mapPixelToCharacter: (
    r: number,
    g: number,
    b: number,
    characters: string[],
    options?: MappingAlgorithmOptions
  ) => {
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // If Sobel gradient values are provided, calculate proper edge strength
    if (options?.sobelX !== undefined && options?.sobelY !== undefined) {
      const gradientMagnitude = Math.sqrt(options.sobelX * options.sobelX + options.sobelY * options.sobelY);
      const edgeStrength = Math.min(gradientMagnitude / 765, 1); // Normalize to 0-1 (765 = max possible gradient)
      
      // For strong edges, prefer characters with more visual density
      if (edgeStrength > 0.2) {
        // Map edge strength to higher-density characters
        const edgeCharIndex = Math.floor(edgeStrength * characters.length);
        const minIndex = Math.floor(characters.length * 0.4); // Prefer at least medium-density chars for edges
        return characters[Math.min(Math.max(edgeCharIndex, minIndex), characters.length - 1)];
      }
      
      // For weak edges, blend with brightness
      const brightnessIndex = Math.min(Math.floor((brightness / 256) * characters.length), characters.length - 1);
      const edgeInfluence = edgeStrength * 0.5; // Moderate influence for weak edges
      const blendedIndex = Math.floor((brightnessIndex * (1 - edgeInfluence)) + (characters.length * 0.6 * edgeInfluence));
      return characters[Math.min(blendedIndex, characters.length - 1)];
    }
    
    // Fallback using gradient magnitude (legacy support)
    if (options?.gradientMagnitude !== undefined) {
      const edgeStrength = options.gradientMagnitude / 255;
      
      if (edgeStrength > 0.3) {
        const edgeCharIndex = Math.min(Math.floor((edgeStrength / 256) * characters.length), characters.length - 1);
        return characters[Math.max(Math.floor(characters.length * 0.5), edgeCharIndex)];
      }
    }
    
    // For non-edges, use brightness-based selection - fixed mapping
    const charIndex = Math.min(Math.floor((brightness / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Saturation-based mapping algorithm
 */
export const saturationAlgorithm: MappingAlgorithm = {
  name: 'saturation',
  description: 'Maps characters based on color saturation intensity',
  mapPixelToCharacter: (r: number, g: number, b: number, characters: string[]) => {
    // Calculate HSV saturation
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    // Map saturation (0-1) to character index - higher saturation gets denser characters
    const charIndex = Math.min(Math.floor(saturation * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Red channel mapping algorithm
 */
export const redChannelAlgorithm: MappingAlgorithm = {
  name: 'red-channel',
  description: 'Maps characters based on red color channel intensity',
  mapPixelToCharacter: (r: number, _g: number, _b: number, characters: string[]) => {
    // Use red channel value directly
    const charIndex = Math.min(Math.floor((r / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Green channel mapping algorithm
 */
export const greenChannelAlgorithm: MappingAlgorithm = {
  name: 'green-channel',
  description: 'Maps characters based on green color channel intensity',
  mapPixelToCharacter: (_r: number, g: number, _b: number, characters: string[]) => {
    // Use green channel value directly
    const charIndex = Math.min(Math.floor((g / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Blue channel mapping algorithm
 */
export const blueChannelAlgorithm: MappingAlgorithm = {
  name: 'blue-channel',
  description: 'Maps characters based on blue color channel intensity',
  mapPixelToCharacter: (_r: number, _g: number, b: number, characters: string[]) => {
    // Use blue channel value directly
    const charIndex = Math.min(Math.floor((b / 256) * characters.length), characters.length - 1);
    return characters[charIndex];
  }
};

/**
 * Registry of available mapping algorithms
 */
export const MAPPING_ALGORITHMS: Record<CharacterMappingSettings['mappingMethod'], MappingAlgorithm> = {
  'brightness': brightnessAlgorithm,
  'luminance': luminanceAlgorithm,
  'contrast': contrastAlgorithm,
  'edge-detection': edgeDetectionAlgorithm,
  'saturation': saturationAlgorithm,
  'red-channel': redChannelAlgorithm,
  'green-channel': greenChannelAlgorithm,
  'blue-channel': blueChannelAlgorithm
};
