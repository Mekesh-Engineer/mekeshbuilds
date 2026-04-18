import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
    it('renders children and applies default variant classes', () => {
        render(<Button>Save</Button>);

        const button = screen.getByRole('button', { name: 'Save' });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain('bg-sys-accent');
        expect(button.className).toContain('focus-visible:ring-sys-accent');
    });

    it('disables button and shows loading spinner when isLoading is true', () => {
        render(<Button isLoading>Submitting</Button>);

        const button = screen.getByRole('button', { name: 'Submitting' });
        expect(button).toBeDisabled();

        const spinner = button.querySelector('.animate-spin');
        expect(spinner).toBeTruthy();
    });

    it('applies size classes for large button', () => {
        render(<Button size="lg">Launch</Button>);

        const button = screen.getByRole('button', { name: 'Launch' });
        expect(button.className).toContain('h-11');
        expect(button.className).toContain('sm:h-12');
    });
});
