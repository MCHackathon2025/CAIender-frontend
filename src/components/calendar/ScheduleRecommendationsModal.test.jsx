import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScheduleRecommendationsModal from './ScheduleRecommendationsModal';

// Mock the CSS import
vi.mock('./ScheduleRecommendationsModal.css', () => ({}));

describe('ScheduleRecommendationsModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      expect(screen.getByText('Choose a suggestion:')).toBeInTheDocument();
      expect(screen.getByText('Reschedule today\'s schedule')).toBeInTheDocument();
      expect(screen.getByText('Schedule a 1-hour meeting today')).toBeInTheDocument();
      expect(screen.getByText('Block focus time for deep work today')).toBeInTheDocument();
      expect(screen.getByText('Add workout sessions to today\'s schedule')).toBeInTheDocument();
      expect(screen.getByText('Reschedule conflicting meetings')).toBeInTheDocument();
      expect(screen.getByText('Custom Prompt')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<ScheduleRecommendationsModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText('Choose a suggestion:')).not.toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get recommendations/i })).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });
  });

  describe('Quick Prompts', () => {
    it('allows selection of quick prompts', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      expect(promptButton.closest('button')).toHaveClass('selected');
    });

    it('shows time preferences for selected prompt (except conflicting meetings)', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      expect(screen.getByText('Select preferred time slots:')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('does not show time preferences for conflicting meetings prompt', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule conflicting meetings');
      await user.click(promptButton);

      expect(screen.queryByText('Select preferred time slots:')).not.toBeInTheDocument();
    });

    it('deselects prompt when another is selected', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const firstPrompt = screen.getByText('Reschedule today\'s schedule');
      const secondPrompt = screen.getByText('Schedule a 1-hour meeting today');

      await user.click(firstPrompt);
      expect(firstPrompt.closest('button')).toHaveClass('selected');

      await user.click(secondPrompt);
      expect(firstPrompt.closest('button')).not.toHaveClass('selected');
      expect(secondPrompt.closest('button')).toHaveClass('selected');
    });
  });

  describe('Custom Prompt', () => {
    it('shows custom input when custom prompt button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(customPromptButton.closest('button')).toHaveClass('active');
    });

    it('hides custom input when custom prompt button is clicked again', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const customPromptButton = screen.getByText('Custom Prompt');

      // Open custom input
      await user.click(customPromptButton);
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Close custom input
      await user.click(customPromptButton);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('focuses textarea when custom input is shown', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });

    it('allows typing in custom prompt textarea', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Find time for team meetings');

      expect(textarea).toHaveValue('Find time for team meetings');
    });

    it('deselects quick prompts when custom input is shown', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const quickPrompt = screen.getByText('Reschedule today\'s schedule');
      const customPromptButton = screen.getByText('Custom Prompt');

      await user.click(quickPrompt);
      expect(quickPrompt.closest('button')).toHaveClass('selected');

      await user.click(customPromptButton);
      expect(quickPrompt.closest('button')).not.toHaveClass('selected');
    });
  });

  describe('Time Preferences', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      // Select a prompt to show time preferences
      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);
    });

    it('renders time preference structure', () => {
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('0:00 ~ 9:00')).toBeInTheDocument();
      expect(screen.getByText('9:00 ~ 12:00')).toBeInTheDocument();
      expect(screen.getByText('12:00 ~ 13:00')).toBeInTheDocument();
      expect(screen.getByText('13:00 ~ 18:00')).toBeInTheDocument();
      expect(screen.getByText('18:00 ~ 24:00')).toBeInTheDocument();
    });

    it('allows toggling category expansion', async () => {
      const user = userEvent.setup();

      const morningCategory = screen.getByText('9:00 ~ 12:00');
      const toggleButton = morningCategory.parentElement.querySelector('.toggle-button');

      expect(toggleButton).toHaveTextContent('+');

      await user.click(toggleButton);
      expect(toggleButton).toHaveTextContent('−');

      // Should show time slots
      expect(screen.getByText('9:00 ~ 10:00')).toBeInTheDocument();
      expect(screen.getByText('10:00 ~ 11:00')).toBeInTheDocument();
      expect(screen.getByText('11:00 ~ 12:00')).toBeInTheDocument();
    });

    it('allows selecting individual time slots', async () => {
      const user = userEvent.setup();

      // Expand morning category
      const morningCategory = screen.getByText('9:00 ~ 12:00');
      const toggleButton = morningCategory.parentElement.querySelector('.toggle-button');
      await user.click(toggleButton);

      // Select a time slot
      const timeSlotCheckbox = screen.getByLabelText('9:00 ~ 10:00');
      await user.click(timeSlotCheckbox);

      expect(timeSlotCheckbox).toBeChecked();
    });

    it('handles "All" checkbox selection', async () => {
      const user = userEvent.setup();

      const allCheckbox = screen.getByLabelText('All');
      await user.click(allCheckbox);

      expect(allCheckbox).toBeChecked();

      // All category checkboxes should be checked
      const morningCheckbox = screen.getByLabelText('9:00 ~ 12:00');
      const afternoonCheckbox = screen.getByLabelText('13:00 ~ 18:00');

      expect(morningCheckbox).toBeChecked();
      expect(afternoonCheckbox).toBeChecked();
    });

    it('handles category checkbox selection', async () => {
      const user = userEvent.setup();

      const morningCheckbox = screen.getByLabelText('9:00 ~ 12:00');
      await user.click(morningCheckbox);

      expect(morningCheckbox).toBeChecked();

      // Expand to see individual slots
      const toggleButton = morningCheckbox.parentElement.querySelector('.toggle-button');
      await user.click(toggleButton);

      // All individual slots should be checked
      expect(screen.getByLabelText('9:00 ~ 10:00')).toBeChecked();
      expect(screen.getByLabelText('10:00 ~ 11:00')).toBeChecked();
      expect(screen.getByLabelText('11:00 ~ 12:00')).toBeChecked();
    });

    it('updates parent checkbox when all children are selected', async () => {
      const user = userEvent.setup();

      // Expand morning category
      const morningCategory = screen.getByText('9:00 ~ 12:00');
      const toggleButton = morningCategory.parentElement.querySelector('.toggle-button');
      await user.click(toggleButton);

      // Select all individual slots
      await user.click(screen.getByLabelText('9:00 ~ 10:00'));
      await user.click(screen.getByLabelText('10:00 ~ 11:00'));
      await user.click(screen.getByLabelText('11:00 ~ 12:00'));

      // Parent category should be checked
      const morningCheckbox = screen.getByLabelText('9:00 ~ 12:00');
      expect(morningCheckbox).toBeChecked();
    });

    it('shows indeterminate state for partially selected categories', async () => {
      const user = userEvent.setup();

      // Expand morning category
      const morningCategory = screen.getByText('9:00 ~ 12:00');
      const toggleButton = morningCategory.parentElement.querySelector('.toggle-button');
      await user.click(toggleButton);

      // Select only one time slot
      await user.click(screen.getByLabelText('9:00 ~ 10:00'));

      // Parent category should be indeterminate
      const morningCheckbox = screen.getByLabelText('9:00 ~ 12:00');
      expect(morningCheckbox.indeterminate).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('enables submit button when prompt is selected', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      expect(submitButton).toBeDisabled();

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      expect(submitButton).not.toBeDisabled();
    });

    it('enables submit button when custom prompt is entered', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      expect(submitButton).toBeDisabled();

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Find time for meetings');

      expect(submitButton).not.toBeDisabled();
    });

    it('handles form submission with quick prompt', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      await user.click(submitButton);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('handles form submission with custom prompt', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Find time for meetings');

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      await user.click(submitButton);

      expect(screen.getByText('Processing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('logs recommendation request to console', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Getting recommendations for:', 'Reschedule today\'s schedule');
      }, { timeout: 3000 });
    });

    it('prevents submission when no prompt is selected', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      expect(submitButton).toBeDisabled();

      await user.click(submitButton);
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking outside modal', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const overlay = screen.getByRole('dialog').parentElement;
      await user.click(overlay);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('does not call onClose when clicking modal content', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const modal = screen.getByRole('dialog');
      await user.click(modal);

      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('prevents body scroll when modal is open', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(<ScheduleRecommendationsModal {...mockProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ScheduleRecommendationsModal {...mockProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('State Reset', () => {
    it('resets state when modal is closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ScheduleRecommendationsModal {...mockProps} />);

      // Interact with modal
      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      const customPromptButton = screen.getByText('Custom Prompt');
      await user.click(customPromptButton);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test prompt');

      // Close modal
      rerender(<ScheduleRecommendationsModal {...mockProps} isOpen={false} />);

      // Reopen modal
      rerender(<ScheduleRecommendationsModal {...mockProps} isOpen={true} />);

      // Wait for state to be reset
      await waitFor(() => {
        const newPromptButton = screen.getByText('Reschedule today\'s schedule');
        const newCustomPromptButton = screen.getByText('Custom Prompt');
        expect(newPromptButton.closest('button')).not.toHaveClass('selected');
        expect(newCustomPromptButton.closest('button')).not.toHaveClass('active');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles errors during recommendation request gracefully', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      await user.click(submitButton);

      // Should show processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for processing to complete
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<ScheduleRecommendationsModal {...mockProps} />);

      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get recommendations/i })).toBeInTheDocument();
    });

    it('disables buttons during processing', async () => {
      const user = userEvent.setup();
      render(<ScheduleRecommendationsModal {...mockProps} />);

      const promptButton = screen.getByText('Reschedule today\'s schedule');
      await user.click(promptButton);

      const submitButton = screen.getByRole('button', { name: /get recommendations/i });
      await user.click(submitButton);

      // All buttons should be disabled during processing
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /close modal/i })).toBeDisabled();

      // Wait for processing to complete
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
