import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { RoleExpansionPanel, RoleDetailState, RoleExpansionPanelProps } from './RoleExpansionPanel';

function renderPanel(overrides: Partial<RoleExpansionPanelProps> = {}) {
  const defaultDetails: RoleDetailState = {
    description: '',
    skillsInput: '',
    commitment: '',
  };

  const defaultProps: RoleExpansionPanelProps = {
    roleTitle: 'CTO',
    details: defaultDetails,
    isExpanded: true,
    onToggleExpand: vi.fn(),
    onChange: vi.fn(),
    ...overrides,
  };

  const result = render(
    <ChakraProvider>
      <RoleExpansionPanel {...defaultProps} />
    </ChakraProvider>
  );

  return { ...result, props: defaultProps };
}

describe('RoleExpansionPanel', () => {
  describe('expand/collapse toggle behavior', () => {
    it('calls onToggleExpand when the header is clicked', async () => {
      const onToggleExpand = vi.fn();
      renderPanel({ onToggleExpand });

      const header = screen.getByRole('button', { name: /details for CTO/i });
      await userEvent.click(header);

      expect(onToggleExpand).toHaveBeenCalledTimes(1);
    });

    it('displays the role title in the header', () => {
      renderPanel({ roleTitle: 'Software Engineer' });

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('sets aria-expanded to true when expanded', () => {
      renderPanel({ isExpanded: true });

      const header = screen.getByRole('button', { name: /details for CTO/i });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-expanded to false when collapsed', () => {
      renderPanel({ isExpanded: false });

      const header = screen.getByRole('button', { name: /details for CTO/i });
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('detail fields render correctly', () => {
    it('renders the description textarea with the provided value', () => {
      renderPanel({
        details: { description: 'Lead the tech team', skillsInput: '', commitment: '' },
      });

      const textarea = screen.getByPlaceholderText('Describe what this role involves...');
      expect(textarea).toHaveValue('Lead the tech team');
    });

    it('renders the skills input with the provided value', () => {
      renderPanel({
        details: { description: '', skillsInput: 'React, TypeScript', commitment: '' },
      });

      const input = screen.getByPlaceholderText('e.g., React, TypeScript, Node.js');
      expect(input).toHaveValue('React, TypeScript');
    });

    it('renders the commitment select with the provided value', () => {
      renderPanel({
        details: { description: '', skillsInput: '', commitment: 'Full-time' },
      });

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('Full-time');
    });

    it('renders all commitment options', () => {
      renderPanel();

      const options = screen.getAllByRole('option');
      // placeholder option + 4 commitment options
      const optionTexts = options.map((o) => o.textContent);
      expect(optionTexts).toContain('Full-time');
      expect(optionTexts).toContain('Part-time');
      expect(optionTexts).toContain('Flexible');
      expect(optionTexts).toContain('Contract');
    });

    it('calls onChange with updated description when textarea changes', async () => {
      const onChange = vi.fn();
      renderPanel({
        onChange,
        details: { description: '', skillsInput: '', commitment: '' },
      });

      const textarea = screen.getByPlaceholderText('Describe what this role involves...');
      fireEvent.change(textarea, { target: { value: 'New description' } });

      expect(onChange).toHaveBeenCalledWith({
        description: 'New description',
        skillsInput: '',
        commitment: '',
      });
    });

    it('calls onChange with updated skills when input changes', async () => {
      const onChange = vi.fn();
      renderPanel({
        onChange,
        details: { description: '', skillsInput: '', commitment: '' },
      });

      const input = screen.getByPlaceholderText('e.g., React, TypeScript, Node.js');
      fireEvent.change(input, { target: { value: 'React, Node' } });

      expect(onChange).toHaveBeenCalledWith({
        description: '',
        skillsInput: 'React, Node',
        commitment: '',
      });
    });

    it('calls onChange with updated commitment when select changes', async () => {
      const onChange = vi.fn();
      renderPanel({
        onChange,
        details: { description: '', skillsInput: '', commitment: '' },
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Part-time' } });

      expect(onChange).toHaveBeenCalledWith({
        description: '',
        skillsInput: '',
        commitment: 'Part-time',
      });
    });

    it('displays the character count for description', () => {
      renderPanel({
        details: { description: 'Hello', skillsInput: '', commitment: '' },
      });

      expect(screen.getByText('5/500')).toBeInTheDocument();
    });
  });

  describe('validation error display', () => {
    it('displays description error message when provided', () => {
      renderPanel({
        errors: { description: 'Description must not exceed 500 characters' },
      });

      expect(screen.getByText('Description must not exceed 500 characters')).toBeInTheDocument();
    });

    it('displays skills error message when provided', () => {
      renderPanel({
        errors: { skills: 'Each skill must not exceed 50 characters' },
      });

      expect(screen.getByText('Each skill must not exceed 50 characters')).toBeInTheDocument();
    });

    it('displays both error messages when both are provided', () => {
      renderPanel({
        errors: {
          description: 'Description must not exceed 500 characters',
          skills: 'Each skill must not exceed 50 characters',
        },
      });

      expect(screen.getByText('Description must not exceed 500 characters')).toBeInTheDocument();
      expect(screen.getByText('Each skill must not exceed 50 characters')).toBeInTheDocument();
    });

    it('does not display error messages when errors prop is undefined', () => {
      renderPanel({ errors: undefined });

      expect(screen.queryByText('Description must not exceed 500 characters')).not.toBeInTheDocument();
      expect(screen.queryByText('Each skill must not exceed 50 characters')).not.toBeInTheDocument();
    });
  });
});
