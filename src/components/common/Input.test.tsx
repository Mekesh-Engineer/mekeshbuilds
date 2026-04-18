import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
    it('renders helper text with valid aria-describedby when no error exists', () => {
        render(<Input label="Website" helperText="Optional" />);

        const input = screen.getByLabelText('Website');
        const helper = screen.getByText('Optional');

        expect(helper).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-describedby', helper.id);
        expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('prefers error text and marks the field invalid', () => {
        render(<Input label="Email" helperText="Optional" error="Email is invalid" />);

        const input = screen.getByLabelText('Email');
        const error = screen.getByText('Email is invalid');

        expect(error).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', error.id);
    });

    it('contains responsive control sizing classes', () => {
        render(<Input aria-label="Plain" />);

        const input = screen.getByLabelText('Plain');
        expect(input.className).toContain('h-11');
        expect(input.className).toContain('sm:h-12');
    });
});
