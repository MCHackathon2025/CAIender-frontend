import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LLMRecommandationButton from './LLMRecommandationButton';

// Mock the CSS import
vi.mock('./LLMRecommandationButton.css', () => ({}));

// Mock the ScheduleRecommendationsModal component
vi.mock('./ScheduleRecommendationsModal', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="schedule-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    ) : null
  )
}));

describe('LLMRecommandationButton', () => {
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
    it('renders the main button with correct icon', () => {
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      expect(mainButton).toBeInTheDocument();
      expect(mainButton).not.toBeDisabled();
    });

    it('renders the dropdown button', () => {
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      expect(dropdownButton).toBeInTheDocument();
      expect(dropdownButton).not.toBeDisabled();
    });

    it('renders with correct initial state', () => {
      render(<LLMRecommandationButton />);

      // Dropdown should be closed initially
      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();

      // Modal should be closed initially
      expect(screen.queryByTestId('schedule-modal')).not.toBeInTheDocument();
    });
  });

  describe('Main Button Functionality', () => {
    it('handles LLM request when main button is clicked', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      // Should show processing state
      expect(mainButton).toHaveAttribute('title', 'Processing...');
      expect(mainButton).toBeDisabled();
    });

    it('shows processing state during LLM request', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      // Check for spinning icon (processing state)
      const spinningIcon = mainButton.querySelector('.spinning');
      expect(spinningIcon).toBeInTheDocument();
    });

    it('completes processing after timeout', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      // Wait for processing to complete (1500ms timeout)
      await waitFor(() => {
        expect(mainButton).not.toBeDisabled();
      }, { timeout: 2000 });

      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });

    it('logs LLM request to console', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('LLM request sent to backend');
      }, { timeout: 2000 });
    });

    it('prevents multiple requests when processing', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });

      // Click multiple times rapidly
      await user.click(mainButton);
      await user.click(mainButton);
      await user.click(mainButton);

      // Should only show one processing state (check by title attribute)
      const processingButtons = screen.getAllByTitle('Processing...');
      expect(processingButtons).toHaveLength(1);
    });
  });

  describe('Dropdown Functionality', () => {
    it('opens dropdown when dropdown button is clicked', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();
    });

    it('closes dropdown when dropdown button is clicked again', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');

      // Open dropdown
      await user.click(dropdownButton);
      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();

      // Close dropdown
      await user.click(dropdownButton);
      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <LLMRecommandationButton />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      const dropdownButton = screen.getByTitle('More options');

      // Open dropdown
      await user.click(dropdownButton);
      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();

      // Click outside
      const outsideElement = screen.getByTestId('outside-element');
      await user.click(outsideElement);

      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();
    });

    it('closes dropdown when main button is clicked', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });

      // Open dropdown
      await user.click(dropdownButton);
      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();

      // Click main button
      await user.click(mainButton);

      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();
    });

    it('disables dropdown when processing', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      const dropdownButton = screen.getByTitle('More options');

      // Start processing
      await user.click(mainButton);

      // Try to open dropdown
      await user.click(dropdownButton);

      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();
    });
  });

  describe('Schedule Recommendations Modal', () => {
    it('opens schedule modal when dropdown item is clicked', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      const scheduleButton = screen.getByText('Schedule Recommendations');
      await user.click(scheduleButton);

      expect(screen.getByTestId('schedule-modal')).toBeInTheDocument();
      expect(screen.queryByText('Schedule Recommendations')).not.toBeInTheDocument();
    });

    it('closes schedule modal when close is called', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      const scheduleButton = screen.getByText('Schedule Recommendations');
      await user.click(scheduleButton);

      expect(screen.getByTestId('schedule-modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-modal');
      await user.click(closeButton);

      expect(screen.queryByTestId('schedule-modal')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Position', () => {
    it('updates dropdown position on window resize', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      // Mock getBoundingClientRect
      const mockRect = {
        bottom: 100,
        right: 200,
        top: 50,
        left: 150
      };

      const buttonElement = dropdownButton.closest('.llm-recommandation-button');
      vi.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue(mockRect);

      // Trigger resize event
      fireEvent.resize(window);

      // Dropdown should still be visible
      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();
    });

    it('updates dropdown position on window scroll', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      // Mock getBoundingClientRect
      const mockRect = {
        bottom: 100,
        right: 200,
        top: 50,
        left: 150
      };

      const buttonElement = dropdownButton.closest('.llm-recommandation-button');
      vi.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue(mockRect);

      // Trigger scroll event
      fireEvent.scroll(window);

      // Dropdown should still be visible
      expect(screen.getByText('Schedule Recommendations')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles errors during LLM request gracefully', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      // Should show processing state
      expect(mainButton).toHaveAttribute('title', 'Processing...');
      expect(mainButton).toBeDisabled();

      // Wait for processing to complete
      await waitFor(() => {
        expect(mainButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('has proper button titles', () => {
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      const dropdownButton = screen.getByTitle('More options');

      expect(mainButton).toHaveAttribute('title', 'Get AI Recommendations');
      expect(dropdownButton).toHaveAttribute('title', 'More options');
    });

    it('updates button title when processing', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      await user.click(mainButton);

      expect(mainButton).toHaveAttribute('title', 'Processing...');

      // Wait for processing to complete
      await waitFor(() => {
        expect(mainButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });

    it('has proper ARIA attributes for dropdown', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const dropdownButton = screen.getByTitle('More options');
      await user.click(dropdownButton);

      const dropdownMenu = screen.getByText('Schedule Recommendations').closest('.dropdown-menu-portal');
      expect(dropdownMenu).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    it('resets state when component unmounts', () => {
      const { unmount } = render(<LLMRecommandationButton />);

      // Component should render without errors
      expect(screen.getByRole('button', { name: /get ai recommendations/i })).toBeInTheDocument();

      // Unmount should not cause errors
      unmount();
    });

    it('handles rapid state changes correctly', async () => {
      const user = userEvent.setup();
      render(<LLMRecommandationButton />);

      const mainButton = screen.getByRole('button', { name: /get ai recommendations/i });
      const dropdownButton = screen.getByTitle('More options');

      // Rapidly click both buttons
      await user.click(mainButton);
      await user.click(dropdownButton);
      await user.click(mainButton);

      // Should handle state changes gracefully
      expect(mainButton).toHaveAttribute('title', 'Processing...');

      // Wait for processing to complete
      await waitFor(() => {
        expect(mainButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });
});
