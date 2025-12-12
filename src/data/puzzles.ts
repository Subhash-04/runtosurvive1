// Puzzle definitions and solution logic

export interface Puzzle {
    id: number;
    type: 'hex' | 'pseudocode' | 'algorithm' | 'vigenere' | 'debug';
    position: { x: number; z: number };
    title: string;
    description: string;
    content: any;
    solution: string | number[];
    keyName: string;
}

// Puzzle 1: Complex Hex Decode with Bitwise XOR
const puzzle1: Puzzle = {
    id: 1,
    type: 'hex',
    position: { x: 10, z: 5 },
    title: 'CRYPTOGRAPHIC DECODE',
    description: 'Decode the encrypted message! Each hex byte has been XOR\'d with 0x11. Apply XOR 0x11 to each byte, then convert to ASCII:',
    content: {
        hex: '54 42 52 50 41 54',
        hint: 'Example: 55 XOR 11 = 44 (D). XOR is reversible - apply the same operation to decrypt!',
        referenceChart: true,
        xorKey: '0x11'
    },
    // 54 XOR 11 = 45 = E, 42 XOR 11 = 53 = S, 52 XOR 11 = 43 = C, 50 XOR 11 = 41 = A, 41 XOR 11 = 50 = P, 54 XOR 11 = 45 = E
    solution: 'ESCAPE',
    keyName: '🔑 Ruby Key'
};

// Puzzle 2: Complex Pseudocode with Recursion & Memoization
const puzzle2: Puzzle = {
    id: 2,
    type: 'pseudocode',
    position: { x: 25, z: 12 },
    title: 'RECURSIVE ANALYSIS',
    description: 'Analyze this recursive function carefully. What value does compute(5) return?',
    content: {
        code: `FUNCTION compute(n)
    IF n <= 1 THEN
        RETURN 1
    END IF
    
    IF n MOD 3 == 0 THEN
        // Divisible by 3: double previous and add n
        RETURN 2 * compute(n - 1) + n
    ELSE IF n MOD 3 == 1 THEN
        // Remainder 1: sum of two previous
        RETURN compute(n - 1) + compute(n - 2)
    ELSE
        // Remainder 2: triple previous
        RETURN 3 * compute(n - 1)
    END IF
END FUNCTION

What is compute(5)?`,
        hint: 'Start from the base cases. compute(2) = 3 * compute(1) = 3'
    },
    solution: '36',
    keyName: '🔑 Sapphire Key'
};

// Puzzle 3: Toughest Algorithm - State Machine with Hash
const puzzle3: Puzzle = {
    id: 3,
    type: 'algorithm',
    position: { x: 15, z: 20 },
    title: 'STATE MACHINE DECODE',
    description: 'Execute this state machine algorithm step by step to find the secret code:',
    content: {
        algorithm: `ALGORITHM StateMachineDecode:

INITIAL STATE: value = 12, code = ""

TRANSITION RULES:
  IF value is ODD:
    - Multiply value by 3, then add 1
    - Append 'A' to code
  IF value is EVEN:
    - Divide value by 2
    - Append 'B' to code

TERMINATION: Stop when value equals 1

EXECUTE the algorithm and count:
- How many 'A's in the final code?
- How many 'B's in the final code?

ANSWER FORMAT: Enter as "XY" where X = count of A's, Y = count of B's

Example trace for value=3:
3 (odd) → 3*3+1=10, code="A"
10 (even) → 10/2=5, code="AB"
... continue until value=1`,
        hint: 'Example with 6: 6→3→10→5→16→8→4→2→1. Now try with 12!'
    },
    // 12(B)→6(B)→3(A)→10(B)→5(A)→16(B)→8(B)→4(B)→2(B)→1: 2 A's, 7 B's
    solution: '27',
    keyName: '🔑 Emerald Key'
};

// Puzzle 4: Vigenère Cipher (replacing Caesar - much harder)
const puzzle4: Puzzle = {
    id: 4,
    type: 'vigenere',
    position: { x: 30, z: 28 },
    title: 'VIGENÈRE CIPHER DECODER',
    description: 'This message is encrypted with a Vigenère cipher. The key is "CODE". Decode the message and enter the result:',
    content: {
        // UNLOCK encrypted with CODE:
        // U(20)+C(2)=22=W, N(13)+O(14)=27%26=1=B, L(11)+D(3)=14=O
        // O(14)+E(4)=18=S, C(2)+C(2)=4=E, K(10)+O(14)=24=Y
        encodedMessage: 'WBOSEY',
        key: 'CODE',
        hint: 'Example: To decrypt W with key C, calculate W(22) - C(2) = 20 = U. Apply same logic to each letter!',
        table: true
    },
    solution: 'UNLOCK',
    keyName: '🔑 Topaz Key'
};

// Puzzle 5: Java Code Debugger (complex bugs)
const puzzle5: Puzzle = {
    id: 5,
    type: 'debug',
    position: { x: 35, z: 35 },
    title: 'DEBUG THE JAVA CODE',
    description: 'This Java program has 5 subtle bugs. Find each buggy line, click on it, and select the correct fix. These bugs are tricky!',
    content: {
        code: [
            { line: 1, text: 'public class PasswordValidator {', bug: false },
            { line: 2, text: '', bug: false },
            { line: 3, text: '    private static final int MIN_LENGTH = 8;', bug: false },
            { line: 4, text: '    private static final String SPECIAL = "!@#$%^&*";', bug: false },
            { line: 5, text: '', bug: false },
            { line: 6, text: '    public static boolean hasSpecial(String pwd) {', bug: false },
            { line: 7, text: '        for (int i = 0; i <= pwd.length(); i++) {', bug: true, bugId: 1, fix: 'for (int i = 0; i < pwd.length(); i++) {', options: ['for (int i = 1; i <= pwd.length(); i++) {', 'for (int i = 0; i < pwd.length(); i++) {', 'for (int i = 0; i <= pwd.size(); i++) {'] },
            { line: 8, text: '            char c = pwd.charAt(i);', bug: false },
            { line: 9, text: '            if (SPECIAL.indexOf(c) >= 0) {', bug: false },
            { line: 10, text: '                return true;', bug: false },
            { line: 11, text: '            }', bug: false },
            { line: 12, text: '        }', bug: false },
            { line: 13, text: '        return false;', bug: false },
            { line: 14, text: '    }', bug: false },
            { line: 15, text: '', bug: false },
            { line: 16, text: '    public static int countDigits(String pwd) {', bug: false },
            { line: 17, text: '        int count = 0;', bug: false },
            { line: 18, text: '        for (char c : pwd.toCharArray()) {', bug: false },
            { line: 19, text: '            if (c >= \'0\' || c <= \'9\') {', bug: true, bugId: 2, fix: 'if (c >= \'0\' && c <= \'9\') {', options: ['if (c >= \'0\' && c <= \'9\') {', 'if (c > \'0\' || c < \'9\') {', 'if (c == \'0\' || c == \'9\') {'] },
            { line: 20, text: '                count++;', bug: false },
            { line: 21, text: '            }', bug: false },
            { line: 22, text: '        }', bug: false },
            { line: 23, text: '        return count;', bug: false },
            { line: 24, text: '    }', bug: false },
            { line: 25, text: '', bug: false },
            { line: 26, text: '    public static boolean isValidLength(String pwd) {', bug: false },
            { line: 27, text: '        return pwd.length() > MIN_LENGTH;', bug: true, bugId: 3, fix: 'return pwd.length() >= MIN_LENGTH;', options: ['return pwd.size() >= MIN_LENGTH;', 'return pwd.length() >= MIN_LENGTH;', 'return pwd.length() == MIN_LENGTH;'] },
            { line: 28, text: '    }', bug: false },
            { line: 29, text: '', bug: false },
            { line: 30, text: '    public static String validate(String pwd) {', bug: false },
            { line: 31, text: '        StringBuilder errors = new StringBuilder();', bug: false },
            { line: 32, text: '', bug: false },
            { line: 33, text: '        if (countDigits(pwd) = 0) {', bug: true, bugId: 4, fix: 'if (countDigits(pwd) == 0) {', options: ['if (countDigits(pwd) != 0) {', 'if (countDigits(pwd) = 0) {', 'if (countDigits(pwd) == 0) {'] },
            { line: 34, text: '            errors.append("Needs digit. ");', bug: false },
            { line: 35, text: '        }', bug: false },
            { line: 36, text: '', bug: false },
            { line: 37, text: '        return errors;', bug: true, bugId: 5, fix: 'return errors.toString();', options: ['return errors.toString();', 'return (String) errors;', 'return errors.String();'] },
            { line: 38, text: '    }', bug: false },
            { line: 39, text: '', bug: false },
            { line: 40, text: '    public static void main(String[] args) {', bug: false },
            { line: 41, text: '        String result = validate("MyP@ss123");', bug: false },
            { line: 42, text: '        System.out.println(result.isEmpty() ? "Valid!" : result);', bug: false },
            { line: 43, text: '    }', bug: false },
            { line: 44, text: '}', bug: false }
        ],
        hint: 'Look for: off-by-one errors, OR vs AND logic, comparison operators, assignment vs equality, and return types!'
    },
    solution: [1, 2, 3, 4, 5], // Bug IDs that need to be fixed
    keyName: '🔑 Amethyst Key'
};

export const puzzles: Puzzle[] = [puzzle1, puzzle2, puzzle3, puzzle4, puzzle5];

// Helper function to decode Vigenère cipher
export function vigenereDecode(text: string, key: string): string {
    let result = '';
    const keyUpper = key.toUpperCase();
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        if (char >= 'A' && char <= 'Z') {
            const charCode = char.charCodeAt(0) - 65;
            const keyChar = keyUpper[keyIndex % keyUpper.length].charCodeAt(0) - 65;
            const decoded = ((charCode - keyChar + 26) % 26) + 65;
            result += String.fromCharCode(decoded);
            keyIndex++;
        } else {
            result += char;
        }
    }
    return result;
}

// Deprecated: Keep for backward compatibility
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

// Check if Vigenère decode is correct
export function checkVigenereSolution(encodedMessage: string, key: string): boolean {
    const decoded = vigenereDecode(encodedMessage, key);
    return decoded === 'UNLOCK';
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

// XOR helper for puzzle 1
export function xorDecode(hexString: string, xorKey: number): string {
    const bytes = hexString.split(' ').map(h => parseInt(h, 16));
    return bytes.map(b => String.fromCharCode(b ^ xorKey)).join('');
}
