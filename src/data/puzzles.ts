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
        hex: '52 58 41 59 54 43',
        hint: 'Example: 55 XOR 11 = 44 (D). XOR is reversible - apply the same operation to decrypt!',
        referenceChart: true,
        xorKey: '0x11'
    },
    // 52 XOR 11 = 43 = C, 58 XOR 11 = 49 = I, 41 XOR 11 = 50 = P, 59 XOR 11 = 48 = H, 54 XOR 11 = 45 = E, 43 XOR 11 = 52 = R
    solution: 'CIPHER',
    keyName: '🔑 Ruby Key'
};

// Puzzle 2: Complex Pseudocode with Recursion & Memoization
const puzzle2: Puzzle = {
    id: 2,
    type: 'pseudocode',
    position: { x: 25, z: 12 },
    title: 'RECURSIVE ANALYSIS',
    description: 'Analyze this recursive function carefully. What value does compute(6) return?',
    content: {
        code: `FUNCTION compute(n)
    IF n <= 1 THEN
        RETURN n
    END IF
    
    IF n MOD 2 == 0 THEN
        // Even: multiply by 3 and add recursive call
        RETURN 3 * compute(n - 1) + 1
    ELSE
        // Odd: add two recursive calls
        RETURN compute(n - 1) + compute(n - 2)
    END IF
END FUNCTION

What is compute(6)?`,
        hint: 'Start from the base cases and work up. compute(2) = 4'
    },
    solution: '64',
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

INITIAL STATE: value = 7, code = ""

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
        hint: 'Example with 6: 6 then 3 then 10 then 5 then 16 then 8 then 4 then 2 then 1. Count As and Bs!'
    },
    solution: '511',
    keyName: '🔑 Emerald Key'
};

// Puzzle 4: Vigenère Cipher (replacing Caesar - much harder)
const puzzle4: Puzzle = {
    id: 4,
    type: 'vigenere',
    position: { x: 30, z: 28 },
    title: 'VIGENÈRE CIPHER DECODER',
    description: 'This message is encrypted with a Vigenère cipher. The key is "KEY". Decode the message and enter the result:',
    content: {
        // PROCEED encrypted with KEY:
        // P(15)+K(10)=25=Z, R(17)+E(4)=21=V, O(14)+Y(24)=38%26=12=M
        // C(2)+K(10)=12=M, E(4)+E(4)=8=I, E(4)+Y(24)=28%26=2=C, D(3)+K(10)=13=N
        encodedMessage: 'ZVMMICN',
        key: 'KEY',
        hint: 'Example: To decrypt Q with key K, calculate Q(16) - K(10) = 6 = G. Apply same logic to each letter!',
        table: true
    },
    solution: 'PROCEED',
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
            { line: 1, text: 'public class SecretDecoder {', bug: false },
            { line: 2, text: '', bug: false },
            { line: 3, text: '    private static int[] cache = new int[100];', bug: false },
            { line: 4, text: '    private static boolean[] computed = new boolean[100];', bug: false },
            { line: 5, text: '', bug: false },
            { line: 6, text: '    public static int fibonacci(int n) {', bug: false },
            { line: 7, text: '        if (n < 0) return -1;', bug: false },
            { line: 8, text: '        if (n <= 1) return n;', bug: false },
            { line: 9, text: '', bug: false },
            { line: 10, text: '        if (computed[n] = true) {', bug: true, bugId: 1, fix: 'if (computed[n] == true) {', options: ['if (computed[n] != true) {', 'if (computed[n] == true) {', 'if (computed[n] = false) {'] },
            { line: 11, text: '            return cache[n];', bug: false },
            { line: 12, text: '        }', bug: false },
            { line: 13, text: '', bug: false },
            { line: 14, text: '        cache[n] = fibonacci(n - 1) + fibonacci(n - 2);', bug: false },
            { line: 15, text: '        computed[n] = true;', bug: false },
            { line: 16, text: '        return cache[n];', bug: false },
            { line: 17, text: '    }', bug: false },
            { line: 18, text: '', bug: false },
            { line: 19, text: '    public static String decode(String encoded) {', bug: false },
            { line: 20, text: '        StringBuilder result = new StringBuilder();', bug: false },
            { line: 21, text: '        String[] parts = encoded.split(",");', bug: false },
            { line: 22, text: '', bug: false },
            { line: 23, text: '        for (int i = 0; i <= parts.length; i++) {', bug: true, bugId: 2, fix: 'for (int i = 0; i < parts.length; i++) {', options: ['for (int i = 1; i <= parts.length; i++) {', 'for (int i = 0; i < parts.length; i--) {', 'for (int i = 0; i < parts.length; i++) {'] },
            { line: 24, text: '            int fibIndex = Integer.parseInt(parts[i].trim());', bug: false },
            { line: 25, text: '            int charCode = fibonacci(fibIndex) + 65;', bug: false },
            { line: 26, text: '            result.append((char) charCode);', bug: false },
            { line: 27, text: '        }', bug: false },
            { line: 28, text: '', bug: false },
            { line: 29, text: '        return result;', bug: true, bugId: 3, fix: 'return result.toString();', options: ['return result.toString();', 'return (String) result;', 'return result.String();'] },
            { line: 30, text: '    }', bug: false },
            { line: 31, text: '', bug: false },
            { line: 32, text: '    public static void main(String[] args) {', bug: false },
            { line: 33, text: '        String secret = "7,4,11,8,6,12,3";', bug: false },
            { line: 34, text: '        String decoded = decode(secret);', bug: false },
            { line: 35, text: '', bug: false },
            { line: 36, text: '        if (decoded.length() > 0)', bug: true, bugId: 4, fix: 'if (decoded.length() > 0) {', options: ['if (decoded.size() > 0) {', 'if (decoded.length() > 0) {', 'if (decoded.length > 0) {'] },
            { line: 37, text: '            System.out.println("Decoded: " + decoded);', bug: false },
            { line: 38, text: '            System.out.println("Success!");', bug: false },
            { line: 39, text: '        }', bug: false },
            { line: 40, text: '', bug: false },
            { line: 41, text: '        System.exit(1);', bug: true, bugId: 5, fix: 'System.exit(0);', options: ['System.exit(-1);', 'System.exit();', 'System.exit(0);'] },
            { line: 42, text: '    }', bug: false },
            { line: 43, text: '}', bug: false }
        ],
        hint: 'Look for: assignment vs comparison, array bounds, return types, missing braces, and exit codes. Java is strict!'
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

// XOR helper for puzzle 1
export function xorDecode(hexString: string, xorKey: number): string {
    const bytes = hexString.split(' ').map(h => parseInt(h, 16));
    return bytes.map(b => String.fromCharCode(b ^ xorKey)).join('');
}
