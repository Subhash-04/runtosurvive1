// Puzzle definitions and solution logic

export interface Puzzle {
    id: number;
    type: 'hex' | 'pseudocode' | 'algorithm' | 'caesar' | 'debug';
    position: { x: number; z: number };
    title: string;
    description: string;
    content: any;
    solution: string | number[];
    keyName: string;
}

// Puzzle 1: Hex Decode with Reference Chart
const puzzle1: Puzzle = {
    id: 1,
    type: 'hex',
    position: { x: 10, z: 5 },
    title: 'DECODE THE SECRET',
    description: 'Convert this hexadecimal message to ASCII to find the password. Use the reference chart below:',
    content: {
        hex: '47 41 54 45 57 41 59',
        hint: 'Each pair of hex digits represents one ASCII character. Convert hex to decimal, then find the letter.',
        referenceChart: true // Flag to show the chart
    },
    solution: 'GATEWAY',
    keyName: '🔑 Ruby Key'
};

// Puzzle 2: Pseudo-code Analysis
const puzzle2: Puzzle = {
    id: 2,
    type: 'pseudocode',
    position: { x: 25, z: 12 },
    title: 'ANALYZE THE CODE',
    description: 'What value does this function return for mystery(10)?',
    content: {
        code: `FUNCTION mystery(n)
    IF n <= 0 THEN
        RETURN 0
    END IF
    
    SET result = 0
    FOR i FROM 1 TO n DO
        result = result + i
    END FOR
    
    RETURN result - n - 3
END FUNCTION

What is mystery(10)?`,
        hint: 'Sum of 1 to 10 is 55. Then subtract n and 3.'
    },
    solution: '42',
    keyName: '🔑 Sapphire Key'
};

// Puzzle 3: Algorithm Challenge (no specific language)
const puzzle3: Puzzle = {
    id: 3,
    type: 'algorithm',
    position: { x: 15, z: 20 },
    title: 'ALGORITHM CHALLENGE',
    description: 'Follow the algorithm to decode the secret word:',
    content: {
        algorithm: `INPUT: "XQORFN"

ALGORITHM DecodeWord:
1. Take the input string
2. For each character in the string:
   a. Find its position in alphabet (A=1, B=2, ... Z=26)
   b. Subtract 2 from the position
   c. If result < 1, wrap around (add 26)
   d. Convert back to letter
3. OUTPUT the decoded string

Execute this algorithm and enter the result:`,
        hint: 'X(24) - 2 = V(22), Q(17) - 2 = O(15)...'
    },
    solution: 'UNLOCK',
    keyName: '🔑 Emerald Key'
};

// Puzzle 4: Caesar Cipher (interactive shift + code entry)
const puzzle4: Puzzle = {
    id: 4,
    type: 'caesar',
    position: { x: 30, z: 28 },
    title: 'CAESAR CIPHER DECODER',
    description: 'Find the right shift value to decode this message, then enter the decoded word:',
    content: {
        encodedMessage: 'BDAOQQP',
        hint: 'Try different shift values. The correct shift will reveal a readable word. Then type that word!'
    },
    solution: 'PROCEED', // The decoded word to enter
    keyName: '🔑 Topaz Key'
};

// Puzzle 5: C Code Debugger (25 lines, 5 bugs - NO red markers)
const puzzle5: Puzzle = {
    id: 5,
    type: 'debug',
    position: { x: 35, z: 35 },
    title: 'DEBUG THE CODE',
    description: 'This C program has 5 bugs. Find each buggy line, click on it, and select the correct fix. No hints - find them yourself!',
    content: {
        code: [
            { line: 1, text: '#include <stdio.h>', bug: false },
            { line: 2, text: '#include <stdlib.h>', bug: false },
            { line: 3, text: '', bug: false },
            { line: 4, text: 'int calculateSum(int arr[], int size) {', bug: false },
            { line: 5, text: '    int sum;', bug: true, bugId: 1, fix: 'int sum = 0;', options: ['int sum = 1;', 'int sum = 0;', 'float sum;'] },
            { line: 6, text: '    for (int i = 0; i <= size; i++) {', bug: true, bugId: 2, fix: 'for (int i = 0; i < size; i++) {', options: ['for (int i = 0; i < size; i++) {', 'for (int i = 1; i <= size; i++) {', 'for (int i = 0; i < size; i--) {'] },
            { line: 7, text: '        sum = sum + arr[i];', bug: false },
            { line: 8, text: '    }', bug: false },
            { line: 9, text: '    return sum;', bug: false },
            { line: 10, text: '}', bug: false },
            { line: 11, text: '', bug: false },
            { line: 12, text: 'void printArray(int arr[], int size) {', bug: false },
            { line: 13, text: '    printf("Array: ");', bug: false },
            { line: 14, text: '    for (int i = 0; i < size; i++) {', bug: false },
            { line: 15, text: '        printf("%d ", arr[i]);', bug: false },
            { line: 16, text: '    }', bug: false },
            { line: 17, text: '    printf("\\n");', bug: false },
            { line: 18, text: '}', bug: false },
            { line: 19, text: '', bug: false },
            { line: 20, text: 'int main() {', bug: false },
            { line: 21, text: '    int numbers[5] = {10, 20, 30, 40, 50};', bug: false },
            { line: 22, text: '    int size = 5;', bug: false },
            { line: 23, text: '    int result;', bug: false },
            { line: 24, text: '', bug: false },
            { line: 25, text: '    printArray(numbers, size);', bug: false },
            { line: 26, text: '    result = calculateSum(numbers, size);', bug: false },
            { line: 27, text: '', bug: false },
            { line: 28, text: '    if (result = 150) {', bug: true, bugId: 3, fix: 'if (result == 150) {', options: ['if (result >= 150) {', 'if (result != 150) {', 'if (result == 150) {'] },
            { line: 29, text: '        printf("Sum is correct: %d\\n", result);', bug: false },
            { line: 30, text: '    } else {', bug: false },
            { line: 31, text: '        printf("Sum is incorrect\\n");', bug: false },
            { line: 32, text: '    }', bug: false },
            { line: 33, text: '', bug: false },
            { line: 34, text: '    printf("Program complete\\n")', bug: true, bugId: 4, fix: 'printf("Program complete\\n");', options: ['printf("Program complete");', 'printf("Program complete\\n");', 'print("Program complete\\n");'] },
            { line: 35, text: '    return;', bug: true, bugId: 5, fix: 'return 0;', options: ['return 0;', 'return 1;', 'return result;'] },
            { line: 36, text: '}', bug: false }
        ],
        hint: 'Look carefully at: variable initialization, loop bounds, comparison operators, statement endings, and return values.'
    },
    solution: [1, 2, 3, 4, 5], // Bug IDs that need to be fixed
    keyName: '🔑 Amethyst Key'
};

export const puzzles: Puzzle[] = [puzzle1, puzzle2, puzzle3, puzzle4, puzzle5];

// Helper function to decode Caesar cipher
export function caesarDecode(text: string, shift: number): string {
    return text
        .split('')
        .map(char => {
            if (char >= 'A' && char <= 'Z') {
                const code = ((char.charCodeAt(0) - 65 - shift + 26) % 26) + 65;
                return String.fromCharCode(code);
            }
            return char;
        })
        .join('');
}

// Check if Caesar decode is correct
export function checkCaesarSolution(encodedMessage: string, shift: number): boolean {
    const decoded = caesarDecode(encodedMessage, shift);
    return decoded === 'PROCEED';
}

// Generate hex reference chart
export function getHexReferenceChart(): { letter: string; decimal: number; hex: string }[] {
    const chart = [];
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        const decimal = 65 + i;
        const hex = decimal.toString(16).toUpperCase().padStart(2, '0');
        chart.push({ letter, decimal, hex });
    }
    return chart;
}
