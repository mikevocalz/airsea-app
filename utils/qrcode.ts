const QR_MODES = {
  NUMERIC: 1,
  ALPHANUMERIC: 2,
  BYTE: 4,
};

const ERROR_CORRECTION_LEVELS = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
};

const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

const CAPACITY_TABLE: Record<number, Record<number, number>> = {
  1: { 0: 17, 1: 14, 2: 11, 3: 7 },
  2: { 0: 32, 1: 26, 2: 20, 3: 14 },
  3: { 0: 53, 1: 42, 2: 32, 3: 24 },
  4: { 0: 78, 1: 62, 2: 46, 3: 34 },
  5: { 0: 106, 1: 84, 2: 60, 3: 44 },
  6: { 0: 134, 1: 106, 2: 74, 3: 58 },
  7: { 0: 154, 1: 122, 2: 86, 3: 64 },
  8: { 0: 192, 1: 152, 2: 108, 3: 84 },
  9: { 0: 230, 1: 180, 2: 130, 3: 98 },
  10: { 0: 271, 1: 213, 2: 151, 3: 119 },
};

function getMode(data: string): number {
  if (/^\d+$/.test(data)) return QR_MODES.NUMERIC;
  if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return QR_MODES.ALPHANUMERIC;
  return QR_MODES.BYTE;
}

function getVersion(data: string, ecLevel: number): number {
  const len = new TextEncoder().encode(data).length;
  for (let v = 1; v <= 10; v++) {
    if (CAPACITY_TABLE[v][ecLevel] >= len) return v;
  }
  return 10;
}

function createMatrix(size: number): number[][] {
  return Array(size).fill(null).map(() => Array(size).fill(-1));
}

function addFinderPattern(matrix: number[][], row: number, col: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const nr = row + r;
      const nc = col + c;
      if (nr < 0 || nc < 0 || nr >= matrix.length || nc >= matrix.length) continue;
      
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[nr][nc] = 0;
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[nr][nc] = 1;
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[nr][nc] = 1;
      } else {
        matrix[nr][nc] = 0;
      }
    }
  }
}

function addTimingPatterns(matrix: number[][]): void {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
}

function addAlignmentPattern(matrix: number[][], row: number, col: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const nr = row + r;
      const nc = col + c;
      if (matrix[nr][nc] !== -1) return;
    }
  }
  
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2) {
        matrix[row + r][col + c] = 1;
      } else if (r === 0 && c === 0) {
        matrix[row + r][col + c] = 1;
      } else {
        matrix[row + r][col + c] = 0;
      }
    }
  }
}

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function addAlignmentPatterns(matrix: number[][], version: number): void {
  if (version < 2) return;
  const positions = ALIGNMENT_POSITIONS[version];
  if (!positions) return;
  
  for (const row of positions) {
    for (const col of positions) {
      if ((row === 6 && col === 6) || 
          (row === 6 && col === positions[positions.length - 1]) ||
          (row === positions[positions.length - 1] && col === 6)) {
        continue;
      }
      addAlignmentPattern(matrix, row, col);
    }
  }
}

function encodeData(data: string, version: number, ecLevel: number): number[] {
  const mode = getMode(data);
  const bits: number[] = [];
  
  bits.push(...toBits(mode, 4));
  
  const charCountBits = version <= 9 ? (mode === QR_MODES.NUMERIC ? 10 : mode === QR_MODES.ALPHANUMERIC ? 9 : 8) : 16;
  bits.push(...toBits(data.length, charCountBits));
  
  if (mode === QR_MODES.BYTE) {
    const bytes = new TextEncoder().encode(data);
    for (const byte of bytes) {
      bits.push(...toBits(byte, 8));
    }
  } else if (mode === QR_MODES.NUMERIC) {
    for (let i = 0; i < data.length; i += 3) {
      const chunk = data.slice(i, i + 3);
      const bitLen = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
      bits.push(...toBits(parseInt(chunk, 10), bitLen));
    }
  } else {
    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        const val = ALPHANUMERIC_CHARS.indexOf(data[i]) * 45 + ALPHANUMERIC_CHARS.indexOf(data[i + 1]);
        bits.push(...toBits(val, 11));
      } else {
        bits.push(...toBits(ALPHANUMERIC_CHARS.indexOf(data[i]), 6));
      }
    }
  }
  
  bits.push(0, 0, 0, 0);
  
  while (bits.length % 8 !== 0) bits.push(0);
  
  const capacity = CAPACITY_TABLE[version][ecLevel] * 8;
  let padByte = 0;
  while (bits.length < capacity) {
    bits.push(...toBits(padByte === 0 ? 236 : 17, 8));
    padByte = 1 - padByte;
  }
  
  return bits;
}

function toBits(value: number, length: number): number[] {
  const bits: number[] = [];
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >> i) & 1);
  }
  return bits;
}

function placeData(matrix: number[][], bits: number[]): void {
  const size = matrix.length;
  let bitIndex = 0;
  let up = true;
  
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    
    for (let row = up ? size - 1 : 0; up ? row >= 0 : row < size; up ? row-- : row++) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (matrix[row][currentCol] === -1) {
          matrix[row][currentCol] = bitIndex < bits.length ? bits[bitIndex++] : 0;
        }
      }
    }
    up = !up;
  }
}

function applyMask(matrix: number[][], mask: number): number[][] {
  const size = matrix.length;
  const result = matrix.map(row => [...row]);
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isDataModule(row, col, size)) {
        let shouldFlip = false;
        switch (mask) {
          case 0: shouldFlip = (row + col) % 2 === 0; break;
          case 1: shouldFlip = row % 2 === 0; break;
          case 2: shouldFlip = col % 3 === 0; break;
          case 3: shouldFlip = (row + col) % 3 === 0; break;
          case 4: shouldFlip = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0; break;
          case 5: shouldFlip = ((row * col) % 2) + ((row * col) % 3) === 0; break;
          case 6: shouldFlip = (((row * col) % 2) + ((row * col) % 3)) % 2 === 0; break;
          case 7: shouldFlip = (((row + col) % 2) + ((row * col) % 3)) % 2 === 0; break;
        }
        if (shouldFlip) {
          result[row][col] = 1 - result[row][col];
        }
      }
    }
  }
  
  return result;
}

function isDataModule(row: number, col: number, size: number): boolean {
  if (row < 9 && col < 9) return false;
  if (row < 9 && col >= size - 8) return false;
  if (row >= size - 8 && col < 9) return false;
  if (row === 6 || col === 6) return false;
  return true;
}

function addFormatInfo(matrix: number[][], ecLevel: number, mask: number): void {
  const formatBits = getFormatBits(ecLevel, mask);
  const size = matrix.length;
  
  for (let i = 0; i < 6; i++) {
    matrix[8][i] = formatBits[i];
    matrix[i][8] = formatBits[14 - i];
  }
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i];
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i];
  }
  
  matrix[size - 8][8] = 1;
}

function getFormatBits(ecLevel: number, mask: number): number[] {
  const FORMAT_STRINGS: Record<string, number[]> = {
    '0-0': [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0],
    '0-1': [1,1,1,0,0,1,0,1,1,1,1,0,0,1,1],
    '0-2': [1,1,1,1,1,0,1,1,0,1,0,1,0,1,0],
    '0-3': [1,1,1,1,0,0,0,1,0,0,1,1,1,0,1],
    '0-4': [1,1,0,0,1,1,0,0,0,1,0,1,1,1,1],
    '0-5': [1,1,0,0,0,1,1,0,0,0,1,1,0,0,0],
    '0-6': [1,1,0,1,1,0,0,0,1,0,0,0,0,0,1],
    '0-7': [1,1,0,1,0,0,1,0,1,1,1,0,1,1,0],
    '1-0': [1,0,1,0,1,0,0,0,0,0,1,0,0,1,0],
    '1-1': [1,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
    '1-2': [1,0,1,1,1,1,0,0,1,1,1,1,1,0,0],
    '1-3': [1,0,1,1,0,1,1,0,1,0,0,1,0,1,1],
    '1-4': [1,0,0,0,1,0,1,1,1,1,1,1,0,0,1],
    '1-5': [1,0,0,0,0,0,0,1,1,0,0,1,1,1,0],
    '1-6': [1,0,0,1,1,1,1,1,0,0,1,0,1,1,1],
    '1-7': [1,0,0,1,0,1,0,1,0,1,0,0,0,0,0],
    '2-0': [0,1,1,0,1,0,1,0,1,0,1,1,1,1,1],
    '2-1': [0,1,1,0,0,0,0,0,1,1,0,1,0,0,0],
    '2-2': [0,1,1,1,1,1,1,0,0,1,1,0,0,0,1],
    '2-3': [0,1,1,1,0,1,0,0,0,0,0,0,1,1,0],
    '2-4': [0,1,0,0,1,0,0,1,0,1,1,0,1,0,0],
    '2-5': [0,1,0,0,0,0,1,1,0,0,0,0,0,1,1],
    '2-6': [0,1,0,1,1,1,0,1,1,0,1,1,0,1,0],
    '2-7': [0,1,0,1,0,1,1,1,1,1,0,1,1,0,1],
    '3-0': [0,0,1,0,1,1,0,1,0,0,0,1,0,0,1],
    '3-1': [0,0,1,0,0,1,1,1,0,1,1,1,1,1,0],
    '3-2': [0,0,1,1,1,0,0,1,1,1,0,0,1,1,1],
    '3-3': [0,0,1,1,0,0,1,1,1,0,1,0,0,0,0],
    '3-4': [0,0,0,0,1,1,1,0,1,1,0,0,0,1,0],
    '3-5': [0,0,0,0,0,1,0,0,1,0,1,0,1,0,1],
    '3-6': [0,0,0,1,1,0,1,0,0,0,0,1,1,0,0],
    '3-7': [0,0,0,1,0,0,0,0,0,1,1,1,0,1,1],
  };
  
  return FORMAT_STRINGS[`${ecLevel}-${mask}`] || FORMAT_STRINGS['1-0'];
}

export function generateQRMatrix(data: string, ecLevel: keyof typeof ERROR_CORRECTION_LEVELS = 'M'): number[][] {
  const ecLevelNum = ERROR_CORRECTION_LEVELS[ecLevel];
  const version = getVersion(data, ecLevelNum);
  const size = version * 4 + 17;
  
  const matrix = createMatrix(size);
  
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);
  
  addTimingPatterns(matrix);
  addAlignmentPatterns(matrix, version);
  
  matrix[size - 8][8] = 1;
  
  const bits = encodeData(data, version, ecLevelNum);
  placeData(matrix, bits);
  
  const maskedMatrix = applyMask(matrix, 0);
  addFormatInfo(maskedMatrix, ecLevelNum, 0);
  
  return maskedMatrix;
}

export function generateQRSvgPath(data: string, moduleSize: number = 4): string {
  const matrix = generateQRMatrix(data);
  const size = matrix.length;
  const paths: string[] = [];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col] === 1) {
        const x = col * moduleSize;
        const y = row * moduleSize;
        paths.push(`M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z`);
      }
    }
  }
  
  return paths.join('');
}

export function generateQRSvg(data: string, size: number = 200, fgColor: string = '#000000', bgColor: string = '#FFFFFF'): string {
  const matrix = generateQRMatrix(data);
  const matrixSize = matrix.length;
  const moduleSize = size / matrixSize;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;
  svg += `<path d="${generateQRSvgPath(data, moduleSize)}" fill="${fgColor}"/>`;
  svg += '</svg>';
  
  return svg;
}

export function generateQRDataUri(data: string, size: number = 200): string {
  const svg = generateQRSvg(data, size);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getQRMatrixSize(data: string): number {
  const version = getVersion(data, ERROR_CORRECTION_LEVELS.M);
  return version * 4 + 17;
}
