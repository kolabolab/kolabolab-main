import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, it, expect, vi } from 'vitest';
import { RoleSelector } from './RoleSelector';
import { theme } from '../theme';

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
}

describe('RoleSelector', () => {
  it('renders three role cards with titles and descriptions', () => {
    renderWithChakra(
      <RoleSelector selectedRoles={[]} onChange={() => {}} />
    );

    expect(screen.getByText('Entrepreneur')).toBeInTheDocument();
    expect(screen.getByText('I want to create and grow a startup')).toBeInTheDocument();

    expect(screen.getByText('Collaborator')).toBeInTheDocument();
    expect(screen.getByText('I have skills and want to join a startup team')).toBeInTheDocument();

    expect(screen.getByText('Investor')).toBeInTheDocument();
    expect(screen.getByText('I want to discover and invest in startups')).toBeInTheDocument();
  });

  it('visually highlights selected roles with aria-pressed', () => {
    renderWithChakra(
      <RoleSelector selectedRoles={['entrepreneur']} onChange={() => {}} />
    );

    const entrepreneurBtn = screen.getByRole('button', { pressed: true });
    expect(entrepreneurBtn).toHaveAttribute('aria-label', 'Entrepreneur: I want to create and grow a startup');

    const otherBtns = screen.getAllByRole('button', { pressed: false });
    expect(otherBtns).toHaveLength(2);
  });

  it('calls onChange with role added when clicking unselected role', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithChakra(
      <RoleSelector selectedRoles={[]} onChange={onChange} />
    );

    await user.click(screen.getByText('Entrepreneur'));
    expect(onChange).toHaveBeenCalledWith(['entrepreneur']);
  });

  it('calls onChange with role removed when clicking selected role', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithChakra(
      <RoleSelector selectedRoles={['entrepreneur', 'investor']} onChange={onChange} />
    );

    await user.click(screen.getByText('Entrepreneur'));
    expect(onChange).toHaveBeenCalledWith(['investor']);
  });

  it('supports multiple selections', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithChakra(
      <RoleSelector selectedRoles={['entrepreneur']} onChange={onChange} />
    );

    await user.click(screen.getByText('Collaborator'));
    expect(onChange).toHaveBeenCalledWith(['entrepreneur', 'collaborator']);
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithChakra(
      <RoleSelector selectedRoles={[]} onChange={onChange} disabled />
    );

    await user.click(screen.getByText('Entrepreneur'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
