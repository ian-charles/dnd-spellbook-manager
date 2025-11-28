import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from './useFocusTrap';
import { describe, it, expect } from 'vitest';

// Test component that uses the hook
function TestComponent({ isActive = true }: { isActive?: boolean }) {
    const containerRef = useFocusTrap(isActive);

    return (
        <div>
            <button data-testid="outside-before">Outside Before</button>
            <div ref={containerRef} data-testid="container">
                <button data-testid="first">First</button>
                <input data-testid="middle" type="text" />
                <button data-testid="last">Last</button>
            </div>
            <button data-testid="outside-after">Outside After</button>
        </div>
    );
}

describe('useFocusTrap', () => {
    it('should focus the first element when activated', () => {
        render(<TestComponent isActive={true} />);

        // Should focus the first element inside the container
        expect(screen.getByTestId('first')).toHaveFocus();
    });

    it('should not trap focus when inactive', async () => {
        const user = userEvent.setup();
        render(<TestComponent isActive={false} />);

        // Focus first element manually since hook is inactive
        await user.click(screen.getByTestId('first'));
        expect(screen.getByTestId('first')).toHaveFocus();

        // Tab through
        await user.tab();
        expect(screen.getByTestId('middle')).toHaveFocus();
        await user.tab();
        expect(screen.getByTestId('last')).toHaveFocus();

        // Should be able to tab out
        await user.tab();
        expect(screen.getByTestId('outside-after')).toHaveFocus();
    });

    it('should cycle focus to first element when tabbing from last', async () => {
        const user = userEvent.setup();
        render(<TestComponent isActive={true} />);

        // Focus last element
        await user.click(screen.getByTestId('last'));
        expect(screen.getByTestId('last')).toHaveFocus();

        // Tab should cycle back to first
        await user.tab();
        expect(screen.getByTestId('first')).toHaveFocus();
    });

    it('should cycle focus to last element when shift-tabbing from first', async () => {
        const user = userEvent.setup();
        render(<TestComponent isActive={true} />);

        // Focus first element
        await user.click(screen.getByTestId('first'));
        expect(screen.getByTestId('first')).toHaveFocus();

        // Shift+Tab should cycle to last
        await user.tab({ shift: true });
        expect(screen.getByTestId('last')).toHaveFocus();
    });
});
