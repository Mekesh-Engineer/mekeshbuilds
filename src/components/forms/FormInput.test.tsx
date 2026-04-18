import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormInput } from './FormInput';

describe('FormInput', () => {
    it('renders label and input with proper association', () => {
        render(<FormInput label="Email" placeholder="name@example.com" />);

        const input = screen.getByLabelText('Email');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', 'name@example.com');
    });

    it('applies accessible error wiring when error exists', () => {
        render(<FormInput label="Password" error="Password is required" />);

        const input = screen.getByLabelText('Password');
        const alert = screen.getByRole('alert');

        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(alert).toHaveTextContent('Password is required');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        expect(alert).toHaveAttribute('id', describedBy as string);
    });

    it('reserves right-side spacing when icon and rightSlot are used', () => {
        render(
            <FormInput
                label="Search"
                icon="search"
                rightSlot={<span data-testid="slot">X</span>}
            />,
        );

        const input = screen.getByLabelText('Search');
        expect(input.className).toContain('pl-11');
        expect(input.className).toContain('pr-11');
        expect(screen.getByTestId('slot')).toBeInTheDocument();
    });
});
