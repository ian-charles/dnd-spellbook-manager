import { useState, useEffect } from 'react';
import { CreateSpellbookInput, SpellSlots } from '../types/spellbook';
import {
    MIN_ATTACK_MODIFIER,
    MAX_ATTACK_MODIFIER,
    MIN_SAVE_DC,
    MAX_SAVE_DC
} from '../constants/gameRules';

interface UseCreateSpellbookFormProps {
    isOpen: boolean;
    onSubmit: (input: CreateSpellbookInput) => Promise<void>;
    existingNames: string[];
    initialData?: {
        name?: string;
        spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
        spellAttackModifier?: number;
        spellSaveDC?: number;
        maxSpellSlots?: SpellSlots;
    };
}

export function useCreateSpellbookForm({
    isOpen,
    onSubmit,
    existingNames,
    initialData,
}: UseCreateSpellbookFormProps) {
    const [name, setName] = useState('');
    const [spellcastingAbility, setSpellcastingAbility] = useState<'INT' | 'WIS' | 'CHA' | ''>('');
    const [spellAttackModifier, setSpellAttackModifier] = useState('');
    const [spellSaveDC, setSpellSaveDC] = useState('');
    const [maxSpellSlots, setMaxSpellSlots] = useState<SpellSlots | undefined>(undefined);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setSpellcastingAbility(initialData.spellcastingAbility || '');
            setSpellAttackModifier(initialData.spellAttackModifier !== undefined ? String(initialData.spellAttackModifier) : '');
            setSpellSaveDC(initialData.spellSaveDC !== undefined ? String(initialData.spellSaveDC) : '');
            setMaxSpellSlots(initialData.maxSpellSlots);
            setError('');
            setLoading(false);
        } else if (!isOpen) {
            setName('');
            setSpellcastingAbility('');
            setSpellAttackModifier('');
            setSpellSaveDC('');
            setMaxSpellSlots(undefined);
            setError('');
            setLoading(false);
        }
    }, [isOpen, initialData]);

    const isValidAttackModifier = (value: string): boolean => {
        const num = parseInt(value);
        return Number.isInteger(num) && num >= MIN_ATTACK_MODIFIER && num <= MAX_ATTACK_MODIFIER;
    };

    const isValidSaveDC = (value: string): boolean => {
        const num = parseInt(value);
        return Number.isInteger(num) && num >= MIN_SAVE_DC && num <= MAX_SAVE_DC;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!name.trim()) {
            setError('Spellbook name is required');
            setLoading(false);
            return;
        }

        if (existingNames.some(n => n.toLowerCase() === name.trim().toLowerCase())) {
            setError('A spellbook with this name already exists');
            setLoading(false);
            return;
        }

        if (spellAttackModifier && !isValidAttackModifier(spellAttackModifier)) {
            setError(`Spell Attack Modifier must be an integer between ${MIN_ATTACK_MODIFIER} and ${MAX_ATTACK_MODIFIER}`);
            setLoading(false);
            return;
        }

        if (spellSaveDC && !isValidSaveDC(spellSaveDC)) {
            setError(`Spell Save DC must be an integer between ${MIN_SAVE_DC} and ${MAX_SAVE_DC}`);
            setLoading(false);
            return;
        }

        const input: CreateSpellbookInput = {
            name: name.trim(),
            spellcastingAbility: spellcastingAbility || undefined,
            spellAttackModifier: spellAttackModifier ? parseInt(spellAttackModifier) : undefined,
            spellSaveDC: spellSaveDC ? parseInt(spellSaveDC) : undefined,
            maxSpellSlots: maxSpellSlots,
        };

        try {
            await onSubmit(input);
            setName('');
            setSpellcastingAbility('');
            setSpellAttackModifier('');
            setSpellSaveDC('');
            setMaxSpellSlots(undefined);
            setError('');
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create spellbook');
            setLoading(false);
        }
    };

    return {
        name,
        setName,
        spellcastingAbility,
        setSpellcastingAbility,
        spellAttackModifier,
        setSpellAttackModifier,
        spellSaveDC,
        setSpellSaveDC,
        maxSpellSlots,
        setMaxSpellSlots,
        error,
        loading,
        handleSubmit,
    };
}
