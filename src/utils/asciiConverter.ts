/**
 * ASCII Converter - Converts processed image data to ASCII art
 * 
 * Features:
 * - Brightness-to-character mapping
 * - Color extraction and quantization
 * - Cell data generation for canvas
 * - Multiple conversion algorithms
 */

import type { Cell } from '../types';
import type { ProcessedFrame } from './mediaProcessor';
import type { CharacterPalette, CharacterMappingSettings } from '../types/palette';
import { ShapeBasedConverter, type ShapeMappingMethod } from './shapeBasedConverter';
import { LineArtConverter } from './lineArtConverter';
import { MAPPING_ALGORITHMS } from './asciiMappingAlgorithms';
import type { MappingAlgorithmOptions } from './asciiMappingAlgorithms';
import { ColorMatcher, CharacterMapper } from './asciiColorMatcher';
export { ColorMatcher } from './asciiColorMatcher';
export { brightnessAlgorithm, luminanceAlgorithm, contrastAlgorithm, edgeDetectionAlgorithm, saturationAlgorithm, redChannelAlgorithm, greenChannelAlgorithm, blueChannelAlgorithm, MAPPING_ALGORITHMS } from './asciiMappingAlgorithms';
export type { MappingAlgorithmOptions, MappingAlgorithm } from './asciiMappingAlgorithms';

// Legacy support - kept for backward compatibility
export const DEFAULT_ASCII_CHARS = [
  '@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.', ' '
];

export interface ConversionSettings {
  // Source type flag
  isGenerator?: boolean; // True for procedural generators, false/undefined for media imports
  
  // Character mapping - Enhanced with palette support
  enableCharacterMapping: boolean;
  characterPalette: CharacterPalette;
  mappingMethod: CharacterMappingSettings['mappingMethod'];
  characterMappingMode: 'by-index' | 'noise-dither' | 'bayer2x2' | 'bayer4x4'; // Dithering modes
  invertDensity: boolean;
  
  // Auto mode (shape-vector based character mapping)
  autoModeEnabled: boolean;
  autoModeCharacterSet: 'basic-ascii' | 'block-characters' | 'braille';
  autoModeGlobalContrast: number;
  autoModeDirectionalContrast: number;
  autoModeGridWidth: number;   // Character grid width (needed to compute cell dimensions)
  autoModeGridHeight: number;  // Character grid height
  
  // Line art mode (edge-detection + character convolution)
  lineArtEnabled: boolean;
  lineArtBlurRadius: number;
  lineArtEdgeThreshold: number;
  lineArtDilateRadius: number;
  lineArtErodeRadius: number;
  lineArtSdfBlurRadius: number;
  lineArtInverseMatchWeight: number;
  lineArtGridWidth: number;
  lineArtGridHeight: number;
  
  // Text (foreground) color mapping - NEW
  enableTextColorMapping: boolean;
  textColorPalette: string[]; // Array of hex colors from selected palette
  textColorMappingMode: 'closest' | 'noise-dither' | 'bayer2x2' | 'bayer4x4' | 'by-index';
  textColorDitherStrength: number; // 0-1 for text color dithering
  defaultTextColor: string; // Default color when text color mapping is disabled
  
  // Background color mapping - NEW
  enableBackgroundColorMapping: boolean;
  backgroundColorPalette: string[]; // Array of hex colors from selected palette
  backgroundColorMappingMode: 'closest' | 'noise-dither' | 'bayer2x2' | 'bayer4x4' | 'by-index';
  backgroundColorDitherStrength: number; // 0-1 for background color dithering
  
  // Legacy color settings (keep for backward compatibility)
  useOriginalColors: boolean;
  colorQuantization: 'none' | 'basic' | 'advanced';
  paletteSize: number;
  colorMappingMode: 'closest' | 'dithering';
  
  // Processing options
  contrastEnhancement: number; // 0-2 multiplier
  brightnessAdjustment: number; // -100 to 100
  saturationAdjustment: number; // -100 to 100
  highlightsAdjustment: number; // -100 to 100
  shadowsAdjustment: number; // -100 to 100
  midtonesAdjustment: number; // -100 to 100
  blurAmount: number; // 0-10
  sharpenAmount: number; // 0-10
  ditherStrength: number; // 0-1 for dithering algorithms
}

export interface ConversionResult {
  cells: Map<string, Cell>;
  colorPalette: string[];
  characterUsage: { [char: string]: number };
  metadata: {
    width: number;
    height: number;
    totalCells: number;
    uniqueColors: number;
    conversionTime: number;
  };
}

export class ASCIIConverter {
  private colorCache = new Map<string, string>();
  
  /**
   * Convert processed frame to ASCII art cells
   */
  convertFrame(frame: ProcessedFrame, settings: ConversionSettings): ConversionResult {
    const startTime = performance.now();
    
    let { imageData } = frame;
    
    // Apply blur filter if specified
    if (settings.blurAmount > 0) {
      imageData = this.applyBlurFilter(imageData, settings.blurAmount);
    }
    
    // Apply sharpen filter if specified
    if (settings.sharpenAmount > 0) {
      imageData = this.applySharpenFilter(imageData, settings.sharpenAmount);
    }
    
    // Delegate to auto mode if enabled
    if (settings.autoModeEnabled && settings.enableCharacterMapping) {
      return this.convertFrameAutoMode(imageData, settings, startTime);
    }
    
    // Delegate to line art mode if enabled
    if (settings.lineArtEnabled && settings.enableCharacterMapping) {
      return this.convertFrameLineArt(imageData, settings, startTime);
    }
    
    const { data, width, height } = imageData;
    
    const cells = new Map<string, Cell>();
    const colorPalette = new Set<string>();
    const characterUsage: { [char: string]: number } = {};
    
    // Extract colors if quantization is enabled
    let quantizedColors: string[] = [];
    if (settings.colorQuantization !== 'none') {
      quantizedColors = this.extractColors(imageData, settings.paletteSize);
    }
    
    // Process each pixel/cell
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];
        
        // Skip transparent pixels
        if (a < 128) continue;
        
        // Apply preprocessing adjustments to RGB values
        let adjustedR = r, adjustedG = g, adjustedB = b;
        
        // Apply brightness adjustment
        if (settings.brightnessAdjustment !== 0) {
          const adjustment = settings.brightnessAdjustment * 2.55;
          adjustedR = Math.max(0, Math.min(255, r + adjustment));
          adjustedG = Math.max(0, Math.min(255, g + adjustment));
          adjustedB = Math.max(0, Math.min(255, b + adjustment));
        }
        
        // Apply contrast enhancement
        if (settings.contrastEnhancement !== 1) {
          adjustedR = this.applyContrastToChannel(adjustedR, settings.contrastEnhancement);
          adjustedG = this.applyContrastToChannel(adjustedG, settings.contrastEnhancement);
          adjustedB = this.applyContrastToChannel(adjustedB, settings.contrastEnhancement);
        }
        
        // Apply saturation adjustment
        if (settings.saturationAdjustment !== 0) {
          [adjustedR, adjustedG, adjustedB] = this.applySaturationAdjustment(adjustedR, adjustedG, adjustedB, settings.saturationAdjustment);
        }
        
        // Apply tonal adjustments (highlights, shadows, midtones)
        if (settings.highlightsAdjustment !== 0 || settings.shadowsAdjustment !== 0 || settings.midtonesAdjustment !== 0) {
          [adjustedR, adjustedG, adjustedB] = this.applyTonalAdjustments(
            adjustedR, adjustedG, adjustedB,
            settings.highlightsAdjustment,
            settings.shadowsAdjustment,
            settings.midtonesAdjustment
          );
        }
        
        // Select character using the chosen algorithm (if character mapping is enabled)
        let character: string;
        if (settings.enableCharacterMapping) {
          // Calculate additional data for advanced algorithms
          const algorithmOptions: MappingAlgorithmOptions = {};
          
          if (settings.mappingMethod === 'contrast' || settings.mappingMethod === 'edge-detection') {
            // Calculate neighbor values for contrast and edge detection
            const neighbors = this.getNeighborValues(data, width, height, x, y);
            algorithmOptions.neighborValues = neighbors;
            
            // For edge detection, calculate Sobel gradients
            if (settings.mappingMethod === 'edge-detection') {
              const { sobelX, sobelY } = this.calculateSobelGradients(data, width, height, x, y);
              algorithmOptions.sobelX = sobelX;
              algorithmOptions.sobelY = sobelY;
            }
          }
          
          // Add pixel coordinates for character dithering
          algorithmOptions.x = x;
          algorithmOptions.y = y;
          algorithmOptions.ditherStrength = settings.ditherStrength;
          
          character = this.selectCharacterWithAlgorithm(
            adjustedR, adjustedG, adjustedB,
            settings.characterPalette,
            settings.mappingMethod,
            settings.invertDensity,
            settings.characterMappingMode,
            algorithmOptions
          );
        } else {
          // Use space character if character mapping is disabled (for pixel-art style effects)
          character = ' ';
        }
        
        // Determine text (foreground) color
        let color: string;
        if (settings.enableTextColorMapping && settings.textColorPalette.length > 0) {
          // Use palette-based color mapping
          switch (settings.textColorMappingMode) {
            case 'noise-dither':
              // Use index-based dithering for generators, closest-match for imports
              color = settings.isGenerator
                ? ColorMatcher.mapColorByIndexNoise(
                    adjustedR, adjustedG, adjustedB, 
                    settings.textColorPalette, 
                    settings.textColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorNoise(
                    adjustedR, adjustedG, adjustedB, 
                    settings.textColorPalette, 
                    settings.textColorDitherStrength,
                    x, y
                  );
              break;
            case 'bayer2x2':
              color = settings.isGenerator
                ? ColorMatcher.mapColorByIndexBayer2x2(
                    adjustedR, adjustedG, adjustedB,
                    settings.textColorPalette,
                    settings.textColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorBayer2x2(
                    adjustedR, adjustedG, adjustedB,
                    settings.textColorPalette,
                    settings.textColorDitherStrength,
                    x, y
                  );
              break;
            case 'bayer4x4':
              color = settings.isGenerator
                ? ColorMatcher.mapColorByIndexBayer4x4(
                    adjustedR, adjustedG, adjustedB,
                    settings.textColorPalette,
                    settings.textColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorBayer4x4(
                    adjustedR, adjustedG, adjustedB,
                    settings.textColorPalette,
                    settings.textColorDitherStrength,
                    x, y
                  );
              break;
            case 'by-index':
              color = ColorMatcher.mapColorByIndex(adjustedR, adjustedG, adjustedB, settings.textColorPalette);
              break;
            default: // 'closest'
              color = ColorMatcher.findClosestColor(adjustedR, adjustedG, adjustedB, settings.textColorPalette);
          }
        } else if (!settings.enableTextColorMapping) {
          // Use default text color when text color mapping is explicitly disabled
          color = settings.defaultTextColor;
        } else if (settings.useOriginalColors) {
          // Legacy color handling (only when text color mapping is not explicitly controlled)
          if (settings.colorQuantization === 'none') {
            color = ColorMatcher.rgbToHex(r, g, b);
          } else {
            color = this.quantizeColor(r, g, b, quantizedColors);
          }
        } else {
          // Fallback to default text color
          color = settings.defaultTextColor;
        }
        
        // Determine background color
        let bgColor: string;
        if (settings.enableBackgroundColorMapping && settings.backgroundColorPalette.length > 0) {
          // Use palette-based background color mapping
          switch (settings.backgroundColorMappingMode) {
            case 'noise-dither':
              bgColor = settings.isGenerator
                ? ColorMatcher.mapColorByIndexNoise(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorNoise(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  );
              break;
            case 'bayer2x2':
              bgColor = settings.isGenerator
                ? ColorMatcher.mapColorByIndexBayer2x2(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorBayer2x2(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  );
              break;
            case 'bayer4x4':
              bgColor = settings.isGenerator
                ? ColorMatcher.mapColorByIndexBayer4x4(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  )
                : ColorMatcher.ditherColorBayer4x4(
                    adjustedR, adjustedG, adjustedB,
                    settings.backgroundColorPalette,
                    settings.backgroundColorDitherStrength,
                    x, y
                  );
              break;
            case 'by-index':
              bgColor = ColorMatcher.mapColorByIndex(adjustedR, adjustedG, adjustedB, settings.backgroundColorPalette);
              break;
            default: // 'closest'
              bgColor = ColorMatcher.findClosestColor(adjustedR, adjustedG, adjustedB, settings.backgroundColorPalette);
          }
        } else {
          bgColor = 'transparent'; // Default transparent background
        }
        
        // Create cell
        const cellKey = `${x},${y}`;
        cells.set(cellKey, {
          char: character,
          color,
          bgColor
        });
        
        // Track usage
        colorPalette.add(color);
        characterUsage[character] = (characterUsage[character] || 0) + 1;
      }
    }
    
    const endTime = performance.now();
    
    return {
      cells,
      colorPalette: Array.from(colorPalette),
      characterUsage,
      metadata: {
        width,
        height,
        totalCells: cells.size,
        uniqueColors: colorPalette.size,
        conversionTime: endTime - startTime
      }
    };
  }
  
  /**
   * Convert a frame using shape-based auto mode.
   * The imageData is higher resolution (multiple pixels per cell).
   * Character selection uses 6D shape vectors; color uses center pixel.
   */
  private convertFrameAutoMode(
    imageData: ImageData,
    settings: ConversionSettings,
    startTime: number
  ): ConversionResult {
    const { data, width, height } = imageData;
    const gridW = settings.autoModeGridWidth;
    const gridH = settings.autoModeGridHeight;
    
    const cells = new Map<string, Cell>();
    const colorPalette = new Set<string>();
    const characterUsage: { [char: string]: number } = {};
    
    // Build shape-based converter, using the mapping algorithm to control
    // how RGB pixels are reduced to scalar values for shape analysis
    const shapeMappingMethod = this.resolveShapeMappingMethod(settings.mappingMethod);
    const converter = new ShapeBasedConverter({
      characterSet: settings.autoModeCharacterSet,
      globalContrastExponent: settings.autoModeGlobalContrast,
      directionalContrastExponent: settings.autoModeDirectionalContrast,
      mappingMethod: shapeMappingMethod,
    });
    
    // Apply preprocessing to the full image data first
    const preprocessed = this.applyPreprocessing(imageData, settings);
    
    // Use shape-based converter to get character map
    const charMap = converter.convertImage(preprocessed, gridW, gridH);
    
    // Cell pixel dimensions
    const cellW = width / gridW;
    const cellH = height / gridH;
    
    // Extract colors if quantization is enabled
    let quantizedColors: string[] = [];
    if (settings.colorQuantization !== 'none') {
      quantizedColors = this.extractColors(imageData, settings.paletteSize);
    }
    
    // For each cell, determine character (from shape converter) and color (from center pixel)
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const key = `${gx},${gy}`;
        
        // Get character from shape converter (may be absent for empty cells)
        let character = charMap.get(key) || ' ';
        
        // If character mapping is disabled, use space
        if (!settings.enableCharacterMapping) {
          character = ' ';
        }
        
        // Sample center pixel for color
        const centerPx = Math.floor(gx * cellW + cellW / 2);
        const centerPy = Math.floor(gy * cellH + cellH / 2);
        const clampedPx = Math.min(centerPx, width - 1);
        const clampedPy = Math.min(centerPy, height - 1);
        const pixelIdx = (clampedPy * width + clampedPx) * 4;
        
        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];
        const a = data[pixelIdx + 3];
        
        // Skip fully transparent cells
        if (a < 128 && character === ' ') continue;
        
        // Apply preprocessing adjustments for color determination
        let adjustedR = r, adjustedG = g, adjustedB = b;
        if (settings.brightnessAdjustment !== 0) {
          const adj = settings.brightnessAdjustment * 2.55;
          adjustedR = Math.max(0, Math.min(255, r + adj));
          adjustedG = Math.max(0, Math.min(255, g + adj));
          adjustedB = Math.max(0, Math.min(255, b + adj));
        }
        if (settings.saturationAdjustment !== 0) {
          [adjustedR, adjustedG, adjustedB] = this.applySaturationAdjustment(adjustedR, adjustedG, adjustedB, settings.saturationAdjustment);
        }
        
        // Determine text color
        let color: string;
        if (settings.enableTextColorMapping && settings.textColorPalette.length > 0) {
          color = ColorMatcher.findClosestColor(adjustedR, adjustedG, adjustedB, settings.textColorPalette);
        } else if (!settings.enableTextColorMapping) {
          color = settings.defaultTextColor;
        } else if (settings.useOriginalColors) {
          if (settings.colorQuantization === 'none') {
            color = ColorMatcher.rgbToHex(r, g, b);
          } else {
            color = this.quantizeColor(r, g, b, quantizedColors);
          }
        } else {
          color = settings.defaultTextColor;
        }
        
        // Determine background color
        let bgColor: string;
        if (settings.enableBackgroundColorMapping && settings.backgroundColorPalette.length > 0) {
          bgColor = ColorMatcher.findClosestColor(adjustedR, adjustedG, adjustedB, settings.backgroundColorPalette);
        } else {
          bgColor = 'transparent';
        }
        
        if (character !== ' ' || bgColor !== 'transparent') {
          cells.set(key, { char: character, color, bgColor });
          colorPalette.add(color);
          characterUsage[character] = (characterUsage[character] || 0) + 1;
        }
      }
    }
    
    const endTime = performance.now();
    return {
      cells,
      colorPalette: Array.from(colorPalette),
      characterUsage,
      metadata: {
        width: gridW,
        height: gridH,
        totalCells: cells.size,
        uniqueColors: colorPalette.size,
        conversionTime: endTime - startTime,
      },
    };
  }
  
  /**
   * Apply preprocessing adjustments to a copy of the image data.
   * Used by auto mode to preprocess before shape analysis.
   */
  private applyPreprocessing(imageData: ImageData, settings: ConversionSettings): ImageData {
    const { data, width, height } = imageData;
    
    // If no adjustments needed, return original
    if (
      settings.brightnessAdjustment === 0 &&
      settings.contrastEnhancement === 1 &&
      settings.saturationAdjustment === 0 &&
      settings.highlightsAdjustment === 0 &&
      settings.shadowsAdjustment === 0 &&
      settings.midtonesAdjustment === 0
    ) {
      return imageData;
    }
    
    // Create a copy
    const newData = new Uint8ClampedArray(data);
    
    for (let i = 0; i < newData.length; i += 4) {
      let r = newData[i], g = newData[i + 1], b = newData[i + 2];
      
      if (settings.brightnessAdjustment !== 0) {
        const adj = settings.brightnessAdjustment * 2.55;
        r = Math.max(0, Math.min(255, r + adj));
        g = Math.max(0, Math.min(255, g + adj));
        b = Math.max(0, Math.min(255, b + adj));
      }
      if (settings.contrastEnhancement !== 1) {
        r = this.applyContrastToChannel(r, settings.contrastEnhancement);
        g = this.applyContrastToChannel(g, settings.contrastEnhancement);
        b = this.applyContrastToChannel(b, settings.contrastEnhancement);
      }
      if (settings.saturationAdjustment !== 0) {
        [r, g, b] = this.applySaturationAdjustment(r, g, b, settings.saturationAdjustment);
      }
      if (settings.highlightsAdjustment !== 0 || settings.shadowsAdjustment !== 0 || settings.midtonesAdjustment !== 0) {
        [r, g, b] = this.applyTonalAdjustments(r, g, b, settings.highlightsAdjustment, settings.shadowsAdjustment, settings.midtonesAdjustment);
      }
      
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
    }
    
    return new ImageData(newData, width, height);
  }

  /**
   * Map the full set of mapping methods to the subset supported by shape analysis.
   * 'contrast' and 'edge-detection' fall back to 'brightness' since they need
   * neighbor context that doesn't apply to sub-cell sampling circles.
   */
  private resolveShapeMappingMethod(
    method: CharacterMappingSettings['mappingMethod']
  ): ShapeMappingMethod {
    switch (method) {
      case 'brightness':
      case 'luminance':
      case 'saturation':
      case 'red-channel':
      case 'green-channel':
      case 'blue-channel':
        return method;
      case 'contrast':
      case 'edge-detection':
      default:
        return 'brightness';
    }
  }

  /**
   * Convert a frame using line art mode.
   * The imageData is higher resolution (multiple pixels per cell).
   * Uses edge detection + character convolution for line art output.
   */
  private convertFrameLineArt(
    imageData: ImageData,
    settings: ConversionSettings,
    startTime: number
  ): ConversionResult {
    const { data, width, height } = imageData;
    const gridW = settings.lineArtGridWidth;
    const gridH = settings.lineArtGridHeight;

    const cells = new Map<string, Cell>();
    const colorPalette = new Set<string>();
    const characterUsage: { [char: string]: number } = {};

    // Cell pixel dimensions
    const cellW = Math.floor(width / gridW);
    const cellH = Math.floor(height / gridH);

    // Initialize line art converter with character bitmaps at cell size
    const converter = new LineArtConverter();
    converter.init(cellW, cellH);

    // Apply preprocessing
    const preprocessed = this.applyPreprocessing(imageData, settings);

    // Run line art conversion
    const charMap = converter.convertImage(preprocessed, gridW, gridH, {
      blurRadius: settings.lineArtBlurRadius,
      edgeThreshold: settings.lineArtEdgeThreshold,
      dilateRadius: settings.lineArtDilateRadius,
      erodeRadius: settings.lineArtErodeRadius,
      sdfBlurRadius: settings.lineArtSdfBlurRadius,
      inverseMatchWeight: settings.lineArtInverseMatchWeight,
    });

    // Extract colors if quantization is enabled
    let quantizedColors: string[] = [];
    if (settings.colorQuantization !== 'none') {
      quantizedColors = this.extractColors(imageData, settings.paletteSize);
    }

    // Build cells with color from center pixel
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const key = `${gx},${gy}`;
        const character = charMap.get(key) || ' ';
        if (character === ' ') continue;

        // Sample center pixel for color
        const centerPx = Math.min(Math.floor(gx * cellW + cellW / 2), width - 1);
        const centerPy = Math.min(Math.floor(gy * cellH + cellH / 2), height - 1);
        const pixelIdx = (centerPy * width + centerPx) * 4;

        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];

        // Determine text color
        let color: string;
        if (settings.enableTextColorMapping && settings.textColorPalette.length > 0) {
          color = ColorMatcher.findClosestColor(r, g, b, settings.textColorPalette);
        } else if (!settings.enableTextColorMapping) {
          color = settings.defaultTextColor;
        } else if (settings.useOriginalColors) {
          color = settings.colorQuantization === 'none'
            ? ColorMatcher.rgbToHex(r, g, b)
            : this.quantizeColor(r, g, b, quantizedColors);
        } else {
          color = settings.defaultTextColor;
        }

        // Determine background color
        let bgColor: string;
        if (settings.enableBackgroundColorMapping && settings.backgroundColorPalette.length > 0) {
          bgColor = ColorMatcher.findClosestColor(r, g, b, settings.backgroundColorPalette);
        } else {
          bgColor = 'transparent';
        }

        cells.set(key, { char: character, color, bgColor });
        colorPalette.add(color);
        characterUsage[character] = (characterUsage[character] || 0) + 1;
      }
    }

    const endTime = performance.now();
    return {
      cells,
      colorPalette: Array.from(colorPalette),
      characterUsage,
      metadata: {
        width: gridW,
        height: gridH,
        totalCells: cells.size,
        uniqueColors: colorPalette.size,
        conversionTime: endTime - startTime,
      },
    };
  }

  /**
   * Apply contrast enhancement to individual color channel
   */
  private applyContrastToChannel(channelValue: number, enhancement: number): number {
    // Sigmoid contrast curve applied to individual channel
    const normalized = channelValue / 255;
    const enhanced = 1 / (1 + Math.exp(-enhancement * (normalized - 0.5) * 6));
    return Math.round(Math.max(0, Math.min(255, enhanced * 255)));
  }

  /**
   * Apply saturation adjustment to RGB values
   */
  private applySaturationAdjustment(r: number, g: number, b: number, saturationAdjustment: number): [number, number, number] {
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    
    // Calculate lightness
    const lightness = (max + min) / 2;
    
    // If no saturation (grayscale), return original
    if (delta === 0) {
      return [r, g, b];
    }
    
    // Calculate current saturation
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    // Apply saturation adjustment (-100 to 100 -> 0 to 2 multiplier)
    const saturationMultiplier = 1 + (saturationAdjustment / 100);
    const newSaturation = Math.max(0, Math.min(1, saturation * saturationMultiplier));
    
    // Calculate hue
    let hue = 0;
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
    } else if (max === gNorm) {
      hue = ((bNorm - rNorm) / delta + 2) / 6;
    } else {
      hue = ((rNorm - gNorm) / delta + 4) / 6;
    }
    
    // Convert HSL back to RGB
    const c = (1 - Math.abs(2 * lightness - 1)) * newSaturation;
    const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
    const m = lightness - c / 2;
    
    let rPrime = 0, gPrime = 0, bPrime = 0;
    const hueSegment = hue * 6;
    
    if (hueSegment < 1) {
      rPrime = c; gPrime = x; bPrime = 0;
    } else if (hueSegment < 2) {
      rPrime = x; gPrime = c; bPrime = 0;
    } else if (hueSegment < 3) {
      rPrime = 0; gPrime = c; bPrime = x;
    } else if (hueSegment < 4) {
      rPrime = 0; gPrime = x; bPrime = c;
    } else if (hueSegment < 5) {
      rPrime = x; gPrime = 0; bPrime = c;
    } else {
      rPrime = c; gPrime = 0; bPrime = x;
    }
    
    const newR = Math.round((rPrime + m) * 255);
    const newG = Math.round((gPrime + m) * 255);
    const newB = Math.round((bPrime + m) * 255);
    
    return [
      Math.max(0, Math.min(255, newR)),
      Math.max(0, Math.min(255, newG)),
      Math.max(0, Math.min(255, newB))
    ];
  }

  /**
   * Apply tonal adjustments (highlights, shadows, midtones)
   */
  private applyTonalAdjustments(
    r: number, g: number, b: number,
    highlightsAdjustment: number,
    shadowsAdjustment: number,
    midtonesAdjustment: number
  ): [number, number, number] {
    // Calculate luminance to determine which tonal range this pixel belongs to
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const normalizedLuminance = luminance / 255;
    
    // Calculate weights for each tonal range using smooth transitions
    const shadowWeight = Math.max(0, 1 - normalizedLuminance * 2); // Strong in dark areas
    const highlightWeight = Math.max(0, (normalizedLuminance - 0.5) * 2); // Strong in bright areas
    const midtoneWeight = 1 - Math.abs(normalizedLuminance - 0.5) * 2; // Strong in middle areas
    
    // Apply adjustments based on tonal range weights
    const shadowAdjust = (shadowsAdjustment / 100) * shadowWeight;
    const highlightAdjust = (highlightsAdjustment / 100) * highlightWeight;
    const midtoneAdjust = (midtonesAdjustment / 100) * midtoneWeight;
    
    // Combine adjustments
    const totalAdjustment = (shadowAdjust + highlightAdjust + midtoneAdjust) * 2.55;
    
    const newR = Math.max(0, Math.min(255, r + totalAdjustment));
    const newG = Math.max(0, Math.min(255, g + totalAdjustment));
    const newB = Math.max(0, Math.min(255, b + totalAdjustment));
    
    return [newR, newG, newB];
  }

  /**
   * Apply blur filter to image data
   */
  private applyBlurFilter(imageData: ImageData, blurAmount: number): ImageData {
    if (blurAmount <= 0) return imageData;
    
    const { data, width, height } = imageData;
    const result = new ImageData(width, height);
    const resultData = result.data;
    
    // Gaussian blur approximation using box blur passes
    // Number of passes increases with blur amount for better quality
    const passes = Math.ceil(blurAmount / 2);
    const currentData = new Uint8ClampedArray(data);
    const tempData = new Uint8ClampedArray(data.length);
    
    for (let pass = 0; pass < passes; pass++) {
      // Horizontal pass
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerIndex = (y * width + x) * 4;
          let r = 0, g = 0, b = 0, a = 0;
          let count = 0;
          
          // Box blur kernel size based on blur amount
          const kernelRadius = Math.max(1, Math.floor(blurAmount / Math.max(1, passes)));
          
          for (let i = -kernelRadius; i <= kernelRadius; i++) {
            const sampleX = Math.max(0, Math.min(width - 1, x + i));
            const sampleIndex = (y * width + sampleX) * 4;
            
            r += currentData[sampleIndex];
            g += currentData[sampleIndex + 1];
            b += currentData[sampleIndex + 2];
            a += currentData[sampleIndex + 3];
            count++;
          }
          
          tempData[centerIndex] = r / count;
          tempData[centerIndex + 1] = g / count;
          tempData[centerIndex + 2] = b / count;
          tempData[centerIndex + 3] = a / count;
        }
      }
      
      // Vertical pass
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerIndex = (y * width + x) * 4;
          let r = 0, g = 0, b = 0, a = 0;
          let count = 0;
          
          const kernelRadius = Math.max(1, Math.floor(blurAmount / Math.max(1, passes)));
          
          for (let i = -kernelRadius; i <= kernelRadius; i++) {
            const sampleY = Math.max(0, Math.min(height - 1, y + i));
            const sampleIndex = (sampleY * width + x) * 4;
            
            r += tempData[sampleIndex];
            g += tempData[sampleIndex + 1];
            b += tempData[sampleIndex + 2];
            a += tempData[sampleIndex + 3];
            count++;
          }
          
          currentData[centerIndex] = r / count;
          currentData[centerIndex + 1] = g / count;
          currentData[centerIndex + 2] = b / count;
          currentData[centerIndex + 3] = a / count;
        }
      }
    }
    
    // Copy result back
    resultData.set(currentData);
    return result;
  }

  /**
   * Apply sharpen filter to image data
   */
  private applySharpenFilter(imageData: ImageData, sharpenAmount: number): ImageData {
    if (sharpenAmount <= 0) return imageData;
    
    const { data, width, height } = imageData;
    const result = new ImageData(width, height);
    const resultData = result.data;
    
    // Unsharp mask kernel - center weight increases with sharpen amount
    const centerWeight = 1 + (sharpenAmount * 0.8);
    const neighborWeight = -(sharpenAmount * 0.2);
    
    // Sharpen kernel: neighbor values are negative, center is positive
    // This enhances edges by subtracting the blur from the original
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIndex = (y * width + x) * 4;
        
        let r = data[centerIndex] * centerWeight;
        let g = data[centerIndex + 1] * centerWeight;
        let b = data[centerIndex + 2] * centerWeight;
        const a = data[centerIndex + 3]; // Alpha unchanged
        
        // Apply 3x3 kernel with neighbor weights
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue; // Skip center pixel
            
            const neighborX = Math.max(0, Math.min(width - 1, x + dx));
            const neighborY = Math.max(0, Math.min(height - 1, y + dy));
            const neighborIndex = (neighborY * width + neighborX) * 4;
            
            r += data[neighborIndex] * neighborWeight;
            g += data[neighborIndex + 1] * neighborWeight;
            b += data[neighborIndex + 2] * neighborWeight;
          }
        }
        
        // Clamp values and apply
        resultData[centerIndex] = Math.max(0, Math.min(255, Math.round(r)));
        resultData[centerIndex + 1] = Math.max(0, Math.min(255, Math.round(g)));
        resultData[centerIndex + 2] = Math.max(0, Math.min(255, Math.round(b)));
        resultData[centerIndex + 3] = a;
      }
    }
    
    return result;
  }
  
  /**
   * Get neighbor brightness values for contrast calculation
   */
  private getNeighborValues(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number[] {
    const neighbors: number[] = [];
    
    // Check 8-connected neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip center pixel
        
        const nx = x + dx;
        const ny = y + dy;
        
        // Check bounds
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const pixelIndex = (ny * width + nx) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          
          // Calculate brightness using same formula as brightness algorithm
          const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          neighbors.push(brightness);
        }
      }
    }
    
    return neighbors;
  }

  /**
   * Calculate Sobel gradients for edge detection
   */
  private calculateSobelGradients(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): { sobelX: number, sobelY: number } {
    // Sobel X kernel: [-1, 0, 1; -2, 0, 2; -1, 0, 1]
    // Sobel Y kernel: [-1, -2, -1; 0, 0, 0; 1, 2, 1]
    
    let sobelX = 0;
    let sobelY = 0;
    
    const sobelXKernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelYKernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        // Use edge pixel values for out-of-bounds pixels
        const boundedX = Math.max(0, Math.min(width - 1, nx));
        const boundedY = Math.max(0, Math.min(height - 1, ny));
        
        const pixelIndex = (boundedY * width + boundedX) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Convert to grayscale
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        // Apply Sobel kernels
        const kernelY = dy + 1;
        const kernelX = dx + 1;
        
        sobelX += gray * sobelXKernel[kernelY][kernelX];
        sobelY += gray * sobelYKernel[kernelY][kernelX];
      }
    }
    
    return { sobelX, sobelY };
  }

  /**
   * Select character using the specified algorithm
   */
  private selectCharacterWithAlgorithm(
    r: number,
    g: number,
    b: number,
    characterPalette: CharacterPalette,
    mappingMethod: CharacterMappingSettings['mappingMethod'],
    invertDensity: boolean,
    characterMappingMode: 'by-index' | 'noise-dither' | 'bayer2x2' | 'bayer4x4',
    options?: MappingAlgorithmOptions
  ): string {
    const algorithm = MAPPING_ALGORITHMS[mappingMethod];
    if (!algorithm) {
      console.warn(`Unknown mapping algorithm: ${mappingMethod}, falling back to brightness`);
      return MAPPING_ALGORITHMS.brightness.mapPixelToCharacter(r, g, b, characterPalette.characters);
    }
    
    let characters = [...characterPalette.characters];
    
    // Invert character order if requested (light to dark becomes dark to light)
    if (invertDensity) {
      characters = characters.reverse();
    }
    
    // Check if dithering is enabled and we have the required coordinates
    if (characterMappingMode !== 'by-index' && options?.x !== undefined && options?.y !== undefined) {
      const ditherStrength = options.ditherStrength ?? 0.5;
      
      switch (characterMappingMode) {
        case 'noise-dither':
          return CharacterMapper.mapCharacterByIndexNoise(r, g, b, characters, ditherStrength, options.x, options.y);
        case 'bayer2x2':
          return CharacterMapper.mapCharacterByIndexBayer2x2(r, g, b, characters, ditherStrength, options.x, options.y);
        case 'bayer4x4':
          return CharacterMapper.mapCharacterByIndexBayer4x4(r, g, b, characters, ditherStrength, options.x, options.y);
      }
    }
    
    // Use the algorithm to map pixel to character (no dithering)
    return algorithm.mapPixelToCharacter(r, g, b, characters, options);
  }
  
  /**
   * Convert RGB to hex color
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }
  
  /**
   * Extract dominant colors from image using k-means clustering
   */
  private extractColors(imageData: ImageData, paletteSize: number): string[] {
    const { data, width, height } = imageData;
    const pixels: [number, number, number][] = [];
    
    // Sample pixels (take every nth pixel for performance)
    const sampleRate = Math.max(1, Math.floor((width * height) / 1000));
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a >= 128) { // Skip transparent pixels
        pixels.push([r, g, b]);
      }
    }
    
    // Simple color quantization (can be enhanced with k-means later)
    const colorCounts = new Map<string, number>();
    
    pixels.forEach(([r, g, b]) => {
      // Quantize to reduce color space
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      const key = this.rgbToHex(qr, qg, qb);
      
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    });
    
    // Get most frequent colors
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, paletteSize)
      .map(([color]) => color);
    
    return sortedColors;
  }
  
  /**
   * Quantize color to nearest palette color
   */
  private quantizeColor(
    r: number, 
    g: number, 
    b: number, 
    palette: string[]
  ): string {
    const originalColor = this.rgbToHex(r, g, b);
    
    // Check cache first
    if (this.colorCache.has(originalColor)) {
      return this.colorCache.get(originalColor)!;
    }
    
    let nearestColor = palette[0] || '#000000';
    let minDistance = Infinity;
    
    palette.forEach(paletteColor => {
      const distance = this.colorDistance(r, g, b, paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = paletteColor;
      }
    });
    
    // Cache result
    this.colorCache.set(originalColor, nearestColor);
    
    return nearestColor;
  }
  
  /**
   * Calculate Euclidean distance between colors
   */
  private colorDistance(r: number, g: number, b: number, hexColor: string): number {
    const targetR = parseInt(hexColor.slice(1, 3), 16);
    const targetG = parseInt(hexColor.slice(3, 5), 16);
    const targetB = parseInt(hexColor.slice(5, 7), 16);
    
    return Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );
  }
  
  /**
   * Clear color cache (call when settings change)
   */
  clearCache(): void {
    this.colorCache.clear();
  }
}

// Singleton instance
export const asciiConverter = new ASCIIConverter();