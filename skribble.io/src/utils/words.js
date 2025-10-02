// Word bank for the game
export const WORD_CATEGORIES = {
  animals: [
    'cat', 'dog', 'elephant', 'tiger', 'lion', 'giraffe', 'zebra', 'monkey', 
    'rabbit', 'horse', 'cow', 'pig', 'chicken', 'duck', 'fish', 'bird',
    'snake', 'turtle', 'frog', 'butterfly', 'bee', 'spider', 'whale', 'shark'
  ],
  objects: [
    'car', 'house', 'tree', 'flower', 'book', 'computer', 'phone', 'chair',
    'table', 'lamp', 'clock', 'guitar', 'piano', 'bicycle', 'airplane', 'boat',
    'umbrella', 'glasses', 'shoe', 'hat', 'key', 'scissors', 'hammer', 'brush'
  ],
  food: [
    'pizza', 'burger', 'cake', 'ice cream', 'apple', 'banana', 'orange', 'grape',
    'strawberry', 'bread', 'cheese', 'milk', 'coffee', 'tea', 'chocolate', 'cookie',
    'sandwich', 'pasta', 'rice', 'chicken', 'fish', 'egg', 'carrot', 'tomato'
  ],
  actions: [
    'running', 'jumping', 'swimming', 'dancing', 'singing', 'reading', 'writing', 'cooking',
    'sleeping', 'eating', 'drinking', 'walking', 'flying', 'driving', 'painting', 'drawing',
    'playing', 'watching', 'listening', 'thinking', 'laughing', 'crying', 'hugging', 'waving'
  ],
  nature: [
    'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'mountain', 'ocean',
    'river', 'forest', 'desert', 'beach', 'island', 'volcano', 'rainbow', 'lightning',
    'wind', 'fire', 'rock', 'sand', 'grass', 'leaf', 'branch', 'root'
  ]
};

export const getAllWords = () => {
  return Object.values(WORD_CATEGORIES).flat();
};

export const getRandomWords = (count = 3, difficulty = 'medium') => {
  const allWords = getAllWords();
  const shuffled = allWords.sort(() => 0.5 - Math.random());
  
  // Filter by difficulty (word length)
  let filteredWords;
  switch (difficulty) {
    case 'easy':
      filteredWords = shuffled.filter(word => word.length <= 5);
      break;
    case 'hard':
      filteredWords = shuffled.filter(word => word.length >= 7);
      break;
    default: // medium
      filteredWords = shuffled.filter(word => word.length >= 4 && word.length <= 8);
  }
  
  // Fallback to all words if not enough filtered words
  if (filteredWords.length < count) {
    filteredWords = shuffled;
  }
  
  return filteredWords.slice(0, count);
};

export const maskWord = (word) => {
  if (word.length <= 3) return '_ '.repeat(word.length).trim();
  
  const masked = word.split('').map((char, index) => {
    if (index === 0 || index === word.length - 1) return char;
    return '_';
  }).join(' ');
  
  return masked;
};