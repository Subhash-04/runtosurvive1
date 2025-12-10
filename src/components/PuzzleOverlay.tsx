import React, { useState } from 'react';
import { Puzzle, caesarDecode, getHexReferenceChart } from '../data/puzzles';

interface PuzzleOverlayProps {
    puzzle: Puzzle;
    onSolve: (keyName: string) => void;
    onClose: () => void;
}

export default function PuzzleOverlay({ puzzle, onSolve, onClose }: PuzzleOverlayProps) {
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [caesarShift, setCaesarShift] = useState(0);
    const [decodedMessage, setDecodedMessage] = useState(puzzle.type === 'caesar' ? puzzle.content.encodedMessage : '');
    const [caesarAnswer, setCaesarAnswer] = useState('');
    const [fixedBugs, setFixedBugs] = useState<number[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [wrongGuesses, setWrongGuesses] = useState<number[]>([]);

    const handleSubmit = () => {
        const userAnswer = answer.toUpperCase().trim();
        const correctAnswer = typeof puzzle.solution === 'string' ? puzzle.solution.toUpperCase() : '';

        if (userAnswer === correctAnswer) {
            setSuccess(`✅ Correct! You earned: ${puzzle.keyName}`);
            setTimeout(() => onSolve(puzzle.keyName), 1500);
        } else {
            setError('Incorrect answer. Try again!');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleCaesarShift = () => {
        const decoded = caesarDecode(puzzle.content.encodedMessage, caesarShift);
        setDecodedMessage(decoded);
    };

    const handleCaesarSubmit = () => {
        const userAnswer = caesarAnswer.toUpperCase().trim();
        if (userAnswer === 'PROCEED') {
            setSuccess(`✅ Correct! You earned: ${puzzle.keyName}`);
            setTimeout(() => onSolve(puzzle.keyName), 1500);
        } else {
            setError('Incorrect decoded message. Try again!');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleBugFix = (bugId: number, selectedFix: string, correctFix: string) => {
        if (selectedFix === correctFix) {
            const newFixedBugs = [...fixedBugs, bugId];
            setFixedBugs(newFixedBugs);
            setSelectedLine(null);
            setSuccess(`Bug ${newFixedBugs.length}/5 fixed!`);
            setTimeout(() => setSuccess(''), 1500);

            // Check if all bugs are fixed
            if (newFixedBugs.length === 5) {
                setSuccess(`✅ All bugs fixed! You earned: ${puzzle.keyName}`);
                setTimeout(() => onSolve(puzzle.keyName), 1500);
            }
        } else {
            setError('Wrong fix! Try again.');
            setWrongGuesses(prev => [...prev, selectedLine!]);
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleLineClick = (line: any) => {
        // In debug mode, player clicks on any line to check if it's a bug
        if (fixedBugs.includes(line.bugId)) return; // Already fixed

        if (line.bug) {
            // Correct! This line has a bug
            setSelectedLine(line.line);
        } else {
            // Wrong! This line doesn't have a bug
            setError('No bug on this line. Keep looking!');
            setTimeout(() => setError(''), 1500);
        }
    };

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "'Consolas', 'Monaco', monospace",
    };

    const modalStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00ff88',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 0 50px rgba(0, 255, 136, 0.3)',
    };

    const titleStyle: React.CSSProperties = {
        color: '#00ff88',
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
        textShadow: '0 0 10px #00ff88',
    };

    const descStyle: React.CSSProperties = {
        color: '#ffffff',
        fontSize: '16px',
        marginBottom: '20px',
        lineHeight: 1.6,
    };

    const codeBlockStyle: React.CSSProperties = {
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '15px',
        fontFamily: "'Consolas', monospace",
        fontSize: '14px',
        color: '#c9d1d9',
        whiteSpace: 'pre-wrap',
        marginBottom: '20px',
        overflowX: 'auto',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        fontSize: '18px',
        background: '#0d1117',
        border: '2px solid #30363d',
        borderRadius: '8px',
        color: '#ffffff',
        marginBottom: '15px',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '12px 30px',
        fontSize: '16px',
        background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '10px',
    };

    const hintStyle: React.CSSProperties = {
        color: '#888',
        fontSize: '14px',
        fontStyle: 'italic',
        marginTop: '15px',
    };

    const renderPuzzleContent = () => {
        switch (puzzle.type) {
            case 'hex':
                const hexChart = getHexReferenceChart();
                return (
                    <>
                        <div style={codeBlockStyle}>
                            {puzzle.content.hex}
                        </div>

                        {/* Hex Reference Chart */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>📊 ASCII Reference Chart (A-Z)</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(13, 1fr)',
                                gap: '4px',
                                background: '#0d1117',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}>
                                {hexChart.map(item => (
                                    <div key={item.letter} style={{
                                        background: '#1a1a2e',
                                        padding: '5px',
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        border: '1px solid #30363d'
                                    }}>
                                        <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{item.letter}</div>
                                        <div style={{ color: '#888' }}>{item.hex}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p style={hintStyle}>Hint: {puzzle.content.hint}</p>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the decoded password..."
                            style={inputStyle}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </>
                );

            case 'pseudocode':
                return (
                    <>
                        <div style={codeBlockStyle}>
                            {puzzle.content.code}
                        </div>
                        <p style={hintStyle}>Hint: {puzzle.content.hint}</p>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the return value..."
                            style={inputStyle}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </>
                );

            case 'algorithm':
                return (
                    <>
                        <div style={codeBlockStyle}>
                            {puzzle.content.algorithm}
                        </div>
                        <p style={hintStyle}>Hint: {puzzle.content.hint}</p>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the decoded word..."
                            style={inputStyle}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </>
                );

            case 'caesar':
                return (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#fff', marginBottom: '10px' }}>Encoded Message:</p>
                            <div style={{ ...codeBlockStyle, fontSize: '24px', textAlign: 'center', letterSpacing: '5px' }}>
                                {puzzle.content.encodedMessage}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#fff', marginBottom: '10px' }}>Decoded Message (Shift: {caesarShift}):</p>
                            <div style={{
                                ...codeBlockStyle,
                                fontSize: '24px',
                                textAlign: 'center',
                                letterSpacing: '5px',
                                color: '#c9d1d9',
                            }}>
                                {decodedMessage}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <label style={{ color: '#fff' }}>Shift Value:</label>
                            <input
                                type="number"
                                value={caesarShift}
                                onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
                                min={0}
                                max={25}
                                style={{ ...inputStyle, width: '80px', marginBottom: 0 }}
                            />
                            <button onClick={handleCaesarShift} style={buttonStyle}>
                                SHIFT
                            </button>
                        </div>

                        {/* Code entry field */}
                        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid #00ff88', borderRadius: '8px' }}>
                            <p style={{ color: '#00ff88', marginBottom: '10px' }}>
                                🔐 Enter the decoded message to unlock:
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={caesarAnswer}
                                    onChange={(e) => setCaesarAnswer(e.target.value)}
                                    placeholder="Enter the decoded word..."
                                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCaesarSubmit()}
                                />
                                <button onClick={handleCaesarSubmit} style={buttonStyle}>
                                    SUBMIT
                                </button>
                            </div>
                        </div>
                        <p style={hintStyle}>Hint: {puzzle.content.hint}</p>
                    </>
                );

            case 'debug':
                return (
                    <>
                        <p style={{ color: '#ffc800', marginBottom: '10px', fontWeight: 'bold' }}>
                            🐛 Bugs Fixed: {fixedBugs.length} / 5
                        </p>
                        <p style={{ color: '#aaa', marginBottom: '15px', fontSize: '13px' }}>
                            Click on a line you think has a bug. If correct, you'll see fix options.
                        </p>
                        <div style={{ ...codeBlockStyle, padding: 0, maxHeight: '400px', overflow: 'auto' }}>
                            {puzzle.content.code.map((line: any) => {
                                const isFixed = fixedBugs.includes(line.bugId);
                                const isWrongGuess = wrongGuesses.includes(line.line);

                                return (
                                    <div
                                        key={line.line}
                                        onClick={() => !isFixed && handleLineClick(line)}
                                        style={{
                                            padding: '4px 15px',
                                            cursor: 'pointer',
                                            background: isFixed
                                                ? 'rgba(0, 255, 136, 0.2)'
                                                : isWrongGuess
                                                    ? 'rgba(255, 0, 0, 0.06)'
                                                    : selectedLine === line.line
                                                        ? 'rgba(255, 200, 0, 0.3)'
                                                        : 'transparent',
                                            borderLeft: isFixed
                                                ? '3px solid #00ff88'
                                                : isWrongGuess
                                                    ? '3px solid #ff4444'
                                                    : '3px solid transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFixed && selectedLine !== line.line) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFixed && selectedLine !== line.line) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <span style={{
                                            color: '#666',
                                            marginRight: '15px',
                                            minWidth: '25px',
                                            userSelect: 'none'
                                        }}>
                                            {line.line}
                                        </span>
                                        <span style={{
                                            textDecoration: isFixed ? 'line-through' : 'none',
                                            color: isFixed ? '#666' : '#c9d1d9',
                                        }}>
                                            {line.text || ' '}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedLine !== null && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                background: 'rgba(255, 200, 0, 0.1)',
                                border: '1px solid #ffc800',
                                borderRadius: '8px'
                            }}>
                                <p style={{ color: '#ffc800', marginBottom: '10px' }}>
                                    🔧 Select the correct fix for line {selectedLine}:
                                </p>
                                {puzzle.content.code
                                    .find((l: any) => l.line === selectedLine)
                                    ?.options?.map((option: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const line = puzzle.content.code.find((l: any) => l.line === selectedLine);
                                                handleBugFix(line.bugId, option, line.fix);
                                            }}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '10px',
                                                marginBottom: '8px',
                                                background: '#0d1117',
                                                border: '1px solid #30363d',
                                                borderRadius: '5px',
                                                color: '#c9d1d9',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontFamily: "'Consolas', monospace",
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                            </div>
                        )}
                        <p style={hintStyle}>Hint: {puzzle.content.hint}</p>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2 style={titleStyle}>🔒 PUZZLE {puzzle.id}: {puzzle.title}</h2>
                <p style={descStyle}>{puzzle.description}</p>

                {renderPuzzleContent()}

                {error && (
                    <p style={{ color: '#ff4444', textAlign: 'center', marginTop: '15px', fontSize: '18px' }}>
                        ❌ {error}
                    </p>
                )}

                {success && (
                    <p style={{ color: '#00ff88', textAlign: 'center', marginTop: '15px', fontSize: '18px' }}>
                        {success}
                    </p>
                )}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    {puzzle.type !== 'caesar' && puzzle.type !== 'debug' && (
                        <button onClick={handleSubmit} style={buttonStyle}>
                            SUBMIT
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{ ...buttonStyle, background: '#444', color: '#fff' }}
                    >
                        CLOSE (ESC)
                    </button>
                </div>

                {/* Key reward indicator */}
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    color: '#ffc800',
                    fontSize: '14px'
                }}>
                    🏆 Reward: {puzzle.keyName}
                </div>
            </div>
        </div>
    );
}
