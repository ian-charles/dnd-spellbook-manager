import React from 'react';
import './SpellDescription.css';

interface SpellDescriptionProps {
    text: string;
    className?: string;
}

// Regex to match dice notations like 1d4, 2d6, d20, 10d100, etc.
// Matches:
// - Optional number prefix (e.g., "1" in "1d6")
// - "d" character (case insensitive)
// - Number suffix (4, 6, 8, 10, 12, 20, 100)
const VALID_DICE_TYPES = '(?:4|6|8|10|12|20|100)';

// Regex to match dice notations like 1d4, 2d6, d20, 10d100, etc.
// Matches:
// - Optional number prefix (e.g., "1" in "1d6")
// - "d" character (case insensitive)
// - Number suffix (4, 6, 8, 10, 12, 20, 100)
// Using a capturing group to include the separator in split results
const SPLIT_REGEX = new RegExp(`(\\b\\d*d${VALID_DICE_TYPES}\\b)`, 'gi');

// Regex to test if a part is a dice notation (same pattern, no global flag needed for test)
const MATCH_REGEX = new RegExp(`^\\b\\d*d${VALID_DICE_TYPES}\\b$`, 'i');

/**
 * Helper to highlight dice notation in text
 */
function HighlightDice({ text }: { text: string }) {
    const parts = text.split(SPLIT_REGEX);
    return (
        <>
            {parts.map((part, index) => {
                if (MATCH_REGEX.test(part)) {
                    return (
                        <span key={`dice-${index}-${part}`} className="dice-notation" data-testid="dice-notation">
                            {part}
                        </span>
                    );
                }
                return <span key={`text-${index}`}>{part}</span>;
            })}
        </>
    );
}

/**
 * Helper to render a markdown table
 */
function MarkdownTable({ lines }: { lines: string[] }) {
    if (lines.length < 2) return null;

    // Assume first line is header, second is separator, rest are body
    // Filter out empty lines or non-table lines if any crept in
    const tableLines = lines.filter(line => line.trim().startsWith('|'));

    if (tableLines.length < 2) return null;

    const headerLine = tableLines[0];
    // Skip separator line (index 1)
    const bodyLines = tableLines.slice(2);

    /**
   * Parses a markdown table row into cells.
   * Handles leading/trailing pipes and empty cells.
   * 
   * @param line - The raw markdown table line
   * @returns Array of cell contents
   */
    // React's JSX automatically escapes text content, preventing XSS attacks
    // See test at line 155 for XSS protection verification
    const parseRow = (line: string) => {
        const cells = line.split('|');
        // Remove first and last if empty (from leading/trailing pipes)
        // e.g. "| a | b |" -> ["", " a ", " b ", ""] -> [" a ", " b "]
        if (cells.length > 0 && cells[0].trim() === '') cells.shift();
        if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();

        return cells.map(cell => cell.trim());
    };

    const headers = parseRow(headerLine);

    return (
        <div className="spell-table-wrapper">
            <table className="spell-table-rendered">
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={`header-${i}`} scope="col">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyLines.map((line, i) => (
                        <tr key={`row-${i}`}>
                            {parseRow(line).map((cell, j) => (
                                <td key={`cell-${i}-${j}`}><HighlightDice text={cell} /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * SpellDescription Component
 * 
 * Parses D&D 5e spell description text and applies special formatting:
 * 1. Highlights dice notations (e.g., 1d4, 2d6, 3d8, d10, d12, d20, d100)
 * 2. Renders markdown tables with proper styling
 * 3. Preserves line breaks and paragraph structure
 * 
 * Supported dice types: d4, d6, d8, d10, d12, d20, d100
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The spell description text to parse (supports markdown tables)
 * @param {string} [props.className] - Optional CSS class name for the wrapper div
 * 
 * @example
 * <SpellDescription text="Deals 1d6 fire damage" />
 * 
 * @example
 * // With markdown table
 * <SpellDescription text={`
 * | Level | Damage |
 * |-------|--------|
 * | 1     | 1d6    |
 * `} />
 */
export function SpellDescription({ text, className = '' }: SpellDescriptionProps) {
    if (!text || typeof text !== 'string') return null;

    // Split by newlines to process blocks
    const lines = text.split('\n');
    const blocks: { type: 'text' | 'table'; content: string[] }[] = [];
    let currentBlock: { type: 'text' | 'table'; content: string[] } = { type: 'text', content: [] };

    lines.forEach((line) => {
        const isTableLine = line.trim().startsWith('|');

        if (isTableLine) {
            if (currentBlock.type !== 'table') {
                // Push previous text block if not empty
                if (currentBlock.content.length > 0) {
                    blocks.push(currentBlock);
                }
                // Start new table block
                currentBlock = { type: 'table', content: [line] };
            } else {
                // Continue table block
                currentBlock.content.push(line);
            }
        } else {
            if (currentBlock.type !== 'text') {
                // Push previous table block
                blocks.push(currentBlock);
                // Start new text block
                currentBlock = { type: 'text', content: [line] };
            } else {
                // Continue text block
                currentBlock.content.push(line);
            }
        }
    });

    // Push final block
    if (currentBlock.content.length > 0) {
        blocks.push(currentBlock);
    }

    return (
        <div className={`spell-description-text ${className}`}>
            {blocks.map((block, index) => {
                if (block.type === 'table') {
                    return <MarkdownTable key={index} lines={block.content} />;
                } else {
                    // Join text lines with newlines (or render paragraphs)
                    // For simple text, we can join and render.
                    // Note: Original implementation split by dice regex on the whole text.
                    // Here we process per block.
                    return (
                        <div key={index} className="spell-text-block">
                            {block.content.map((line, i) => (
                                <div key={i} className={line.trim() === '' ? 'spell-text-line-empty' : 'spell-text-line'}>
                                    <HighlightDice text={line} />
                                </div>
                            ))}
                        </div>
                    );
                }
            })}
        </div>
    );
}
