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
// Using a capturing group to include the separator in split results
const SPLIT_REGEX = /(\b\d*d(?:4|6|8|10|12|20|100)\b)/gi;

// Regex to test if a part is a dice notation (same pattern, no global flag needed for test)
const MATCH_REGEX = /^\b\d*d(?:4|6|8|10|12|20|100)\b$/i;

/**
 * SpellDescription Component
 * 
 * Parses spell description text and highlights dice notations (e.g., 1d6, 2d8, d20).
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The spell description text to parse
 * @param {string} [props.className] - Optional CSS class name
 */
export function SpellDescription({ text, className = '' }: SpellDescriptionProps) {
    if (!text) return null;

    const parts = text.split(SPLIT_REGEX);

    return (
        <div className={`spell-description-text ${className}`}>
            {parts.map((part, index) => {
                if (MATCH_REGEX.test(part)) {
                    return (
                        <span key={`${index}-${part}`} className="dice-notation">
                            {part}
                        </span>
                    );
                }
                return <span key={`${index}-text`}>{part}</span>;
            })}
        </div>
    );
}
