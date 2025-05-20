/**
 * Keyboard layout mappings for Malayalam input
 */

// Phonetic (standard) layout mapping
const PHONETIC_LAYOUT = {
  // Vowels
  'a': 'അ', 'aa': 'ആ', 'A': 'ആ', 'i': 'ഇ', 'ee': 'ഈ', 'I': 'ഈ',
  'u': 'ഉ', 'oo': 'ഊ', 'U': 'ഊ', 'r': 'ഋ', 'e': 'എ', 'E': 'ഏ',
  'ai': 'ഐ', 'o': 'ഒ', 'O': 'ഓ', 'au': 'ഔ', 'am': 'അം', 'aha': 'അഃ',
  
  // Consonants
  'k': 'ക', 'ka': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
  'c': 'ച', 'ch': 'ഛ', 'C': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'ny': 'ഞ',
  't': 'ട', 'T': 'ഠ', 'd': 'ഡ', 'D': 'ഢ', 'N': 'ണ',
  'th': 'ത', 'tha': 'ഥ', 'dh': 'ദ', 'Dh': 'ധ', 'n': 'ന',
  'p': 'പ', 'ph': 'ഫ', 'b': 'ബ', 'bh': 'ഭ', 'm': 'മ',
  'y': 'യ', 'r': 'ര', 'l': 'ല', 'v': 'വ', 'w': 'വ',
  'sh': 'ശ', 'Sh': 'ഷ', 's': 'സ', 'h': 'ഹ',
  'L': 'ള', 'zh': 'ഴ', 'R': 'റ',
  
  // Chillus (chillaksharam)
  'k\u0D4D': 'ൿ', 'n\u0D4D': 'ൺ', 'N\u0D4D': 'ണ്',
  't\u0D4D': 'ട്', 'n\u0D4D': 'ൻ', 'l\u0D4D': 'ൽ',
  'l\u0D4D': 'ൾ', 'n\u0D4D': 'ൺ', 'n\u0D4D': 'ൿ',
  
  // Numbers
  '0': '൦', '1': '൧', '2': '൨', '3': '൩', '4': '൪',
  '5': '൫', '6': '൬', '7': '൭', '8': '൮', '9': '൯',
  
  // Punctuation
  '.': '।', '..': '॥', '\'': 'ഽ', '\'\'': 'ഃ',
  '|': '൹', '||': 'ൗ', '`': '്ര', '~': 'ർ'
};

// Inscript layout mapping
const INSCRIPT_LAYOUT = {
  // Vowels
  'D': 'അ', 'E': 'ആ', 'F': 'ഇ', 'R': 'ഈ', 'G': 'ഉ', 'T': 'ഊ',
  'H': 'ഋ', 'S': 'എ', 'W': 'ഏ', 'Y': 'ഐ', 'J': 'ഒ', 'X': 'ഓ',
  'I': 'ഔ', 'O': 'അം', 'P': 'അഃ',
  
  // Consonants
  'k': 'ക', 'K': 'ഖ', 'i': 'ഗ', 'I': 'ഘ', ';': 'ങ',
  'q': 'ച', 'Q': 'ഛ', '\'': 'ജ', '\"': 'ഝ', 'j': 'ഞ',
  'e': 'ട', 'E': 'ഠ', 'f': 'ഡ', 'F': 'ഢ', 't': 'ണ',
  'd': 'ത', 'D': 'ഥ', 's': 'ദ', 'S': 'ധ', 'a': 'ന',
  'w': 'പ', 'W': 'ഫ', 'g': 'ബ', 'G': 'ഭ', 'h': 'മ',
  'y': 'യ', 'u': 'ര', 'U': 'റ', ']': 'ല', '}\"': 'ള',
  'x': 'വ', 'X': 'ശ', 'c': 'ഷ', 'v': 'സ', 'b': 'ഹ',
  'n': 'ഴ', 'm': 'ൺ', 'M': 'ൻ', '\\': 'ർ', '|': 'ൽ',
  
  // Numbers
  '0': '൦', '1': '൧', '2': '൨', '3': '൩', '4': '൪',
  '5': '൫', '6': '൬', '7': '൭', '8': '൮', '9': '൯',
  
  // Punctuation
  '^': '൹', '&': 'ൗ', '*': 'ർ', '`': 'ഽ', '~': '്ര',
  'u\u0D4D': '്ര', 'U\u0D4D': '്ര', '\\\u0D4D': '്ര',
  '|\u0D4D': '്ര', '`\u0D4D': '്ര', '~\u0D4D': '്ര'
};

// Swanalekha layout mapping
const SWANALEKHA_LAYOUT = {
  // Vowels
  'a': 'അ', 'aa': 'ആ', 'A': 'ആ', 'i': 'ഇ', 'ee': 'ഈ', 'I': 'ഈ',
  'u': 'ഉ', 'oo': 'ഊ', 'U': 'ഊ', 'r': 'ഋ', 'e': 'എ', 'E': 'ഏ',
  'ai': 'ഐ', 'o': 'ഒ', 'O': 'ഓ', 'au': 'ഔ', 'am': 'അം', 'aha': 'അഃ',
  
  // Consonants
  'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
  'c': 'ച', 'ch': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'ny': 'ഞ',
  't': 'ട', 'th': 'ഠ', 'd': 'ഡ', 'dh': 'ഢ', 'n': 'ണ',
  'T': 'ത', 'Th': 'ഥ', 'D': 'ദ', 'Dh': 'ധ', 'N': 'ന',
  'p': 'പ', 'ph': 'ഫ', 'b': 'ബ', 'bh': 'ഭ', 'm': 'മ',
  'y': 'യ', 'r': 'ര', 'l': 'ല', 'v': 'വ', 'w': 'വ',
  'sh': 'ശ', 'Sh': 'ഷ', 's': 'സ', 'h': 'ഹ',
  'L': 'ള', 'zh': 'ഴ', 'R': 'റ',
  
  // Chillus (chillaksharam)
  'k\u0D4D': 'ൿ', 'n\u0D4D': 'ൺ', 'N\u0D4D': 'ണ്',
  't\u0D4D': 'ട്', 'n\u0D4D': 'ൻ', 'l\u0D4D': 'ൽ',
  'l\u0D4D': 'ൾ', 'n\u0D4D': 'ൺ', 'n\u0D4D': 'ൿ',
  
  // Numbers
  '0': '൦', '1': '൧', '2': '൨', '3': '൩', '4': '൪',
  '5': '൫', '6': '൬', '7': '൭', '8': '൮', '9': '൯',
  
  // Punctuation
  '.': '।', '..': '॥', '\'': 'ഽ', '\'\'': 'ഃ',
  '|': '൹', '||': 'ൗ', '`': '്ര', '~': 'ർ'
};

// Available keyboard layouts
const LAYOUTS = {
  PHONETIC: 'phonetic',
  INSCRIPT: 'inscript',
  SWANALEKHA: 'swanalekha'
};

// Get the key map for a specific layout
function getKeyMap(layout) {
  switch (layout) {
    case LAYOUTS.INSCRIPT:
      return INSCRIPT_LAYOUT;
    case LAYOUTS.SWANALEKHA:
      return SWANALEKHA_LAYOUT;
    case LAYOUTS.PHONETIC:
    default:
      return PHONETIC_LAYOUT;
  }
}

// Convert a key sequence to Malayalam characters
function convertToMalayalam(input, layout = LAYOUTS.PHONETIC) {
  if (!input) return '';
  
  const keyMap = getKeyMap(layout);
  let output = '';
  let i = 0;
  
  while (i < input.length) {
    let found = false;
    
    // Check for multi-character sequences first (max 3 chars)
    for (let len = 3; len > 0; len--) {
      if (i + len > input.length) continue;
      
      const seq = input.substr(i, len);
      if (keyMap[seq]) {
        output += keyMap[seq];
        i += len;
        found = true;
        break;
      }
    }
    
    // If no sequence found, add the character as-is
    if (!found) {
      output += input[i];
      i++;
    }
  }
  
  return output;
}

// Get all available layouts
function getAvailableLayouts() {
  return Object.values(LAYOUTS);
}

// Get the display name for a layout
function getLayoutDisplayName(layout) {
  const names = {
    [LAYOUTS.PHONETIC]: 'Phonetic (ഫോണറ്റിക്)',
    [LAYOUTS.INSCRIPT]: 'Inscript (ഇൻസ്ക്രിപ്റ്റ്)',
    [LAYOUTS.SWANALEKHA]: 'Swanalekha (സ്വനലേഖ)'
  };
  
  return names[layout] || layout;
}

module.exports = {
  LAYOUTS,
  getKeyMap,
  convertToMalayalam,
  getAvailableLayouts,
  getLayoutDisplayName
};
