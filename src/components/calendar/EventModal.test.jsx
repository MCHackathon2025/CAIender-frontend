import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventModal from './EventModal';

// Mock the CSS import
vi.mock('./styles/EventModal.css', () => ({}));

describe('EventModal', () => {
    const mockProps = {
        isOpen: true,
        selectedDate: new Date('2024-12-15'),
        onSave: vi.fn(),
        onCancel: vi.fn(),
        onDelete: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders modal when isOpen is true', () => {
            render(<EventModal {...mockProps} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('New Event')).toBeInTheDocument();
        });

        it('does not render modal when isOpen is false', () => {
            render(<EventModal {...mockProps} isOpen={false} />);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('displays selected date correctly', () => {
            render(<EventModal {...mockProps} />);

            expect(screen.getByText('Sunday, December 15, 2024')).toBeInTheDocument();
        });

        it('shows "Edit Event" title when editing existing event', () => {
            const event = {
                id: '1',
                title: 'Test Event',
                description: 'Test Description',
                startTime: '10:00',
                endTime: '11:00',
                theme: 'info',
                isAllDay: false
            };

            render(<EventModal {...mockProps} event={event} />);

            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });
    });

    describe('Form Fields', () => {
        it('renders all required form fields', () => {
            render(<EventModal {...mockProps} />);

            expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
            expect(screen.getByText(/all day/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
            expect(screen.getByText(/color/i)).toBeInTheDocument();
        });

        it('populates form with existing event data', () => {
            const event = {
                id: '1',
                title: 'Test Event',
                description: 'Test Description',
                startTime: '10:00',
                endTime: '11:00',
                theme: 'info',
                isAllDay: false
            };

            render(<EventModal {...mockProps} event={event} />);

            expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
            expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
        });

        it('hides time fields when all day is checked', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const allDayCheckbox = screen.getByRole('checkbox');
            await user.click(allDayCheckbox);

            expect(screen.queryByLabelText(/start time/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/end time/i)).not.toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('shows error when title is empty', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const submitButton = screen.getByRole('button', { name: /create/i });
            await user.click(submitButton);

            expect(screen.getByText('Event title is required')).toBeInTheDocument();
            expect(mockProps.onSave).not.toHaveBeenCalled();
        });

        it('shows error when end time is before start time', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const titleInput = screen.getByLabelText(/event title/i);
            const startTimeInput = screen.getByLabelText(/start time/i);
            const endTimeInput = screen.getByLabelText(/end time/i);
            const submitButton = screen.getByRole('button', { name: /create/i });

            await user.type(titleInput, 'Test Event');
            await user.clear(startTimeInput);
            await user.type(startTimeInput, '15:00');
            await user.clear(endTimeInput);
            await user.type(endTimeInput, '14:00');
            await user.click(submitButton);

            expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
            expect(mockProps.onSave).not.toHaveBeenCalled();
        });

        it('clears errors when user starts typing', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const submitButton = screen.getByRole('button', { name: /create/i });
            await user.click(submitButton);

            expect(screen.getByText('Event title is required')).toBeInTheDocument();

            const titleInput = screen.getByLabelText(/event title/i);
            await user.type(titleInput, 'T');

            expect(screen.queryByText('Event title is required')).not.toBeInTheDocument();
        });
    });

    describe('Theme Selection', () => {
        it('renders all theme options', () => {
            render(<EventModal {...mockProps} />);

            const themeButtons = screen.getAllByRole('button', { name: /select .* theme/i });
            expect(themeButtons).toHaveLength(4);
        });

        it('allows theme selection', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const infoThemeButton = screen.getByRole('button', { name: /select info theme/i });
            await user.click(infoThemeButton);

            expect(infoThemeButton).toHaveClass('selected');
        });
    });

    describe('Form Submission', () => {
        it('calls onSave with correct data for new event', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const titleInput = screen.getByLabelText(/event title/i);
            const descriptionInput = screen.getByLabelText(/description/i);
            const submitButton = screen.getByRole('button', { name: /create/i });

            // Type into the fields (they should be empty initially)
            await user.type(titleInput, 'Test Event');
            await user.type(descriptionInput, 'Test Description');
            
            // Submit the form
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockProps.onSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: expect.any(String),
                        title: 'Test Event',
                        description: 'Test Description',
                        startDate: mockProps.selectedDate,
                        endDate: mockProps.selectedDate,
                        startTime: '09:00',
                        endTime: '10:00',
                        theme: 'main',
                        isAllDay: false
                    })
                );
            });
        });

        it('calls onSave with all-day event data', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const titleInput = screen.getByLabelText(/event title/i);
            const allDayCheckbox = screen.getByRole('checkbox');
            const submitButton = screen.getByRole('button', { name: /create/i });

            await user.type(titleInput, 'All Day Event');
            await user.click(allDayCheckbox);
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockProps.onSave).toHaveBeenCalledWith({
                    id: expect.any(String),
                    title: 'All Day Event',
                    description: '',
                    startDate: mockProps.selectedDate,
                    endDate: mockProps.selectedDate,
                    startTime: '00:00',
                    endTime: '23:59',
                    theme: 'main',
                    isAllDay: true
                });
            });
        });

        it('shows loading state during submission', async () => {
            const user = userEvent.setup();
            const slowOnSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<EventModal {...mockProps} onSave={slowOnSave} />);

            const titleInput = screen.getByLabelText(/event title/i);
            const submitButton = screen.getByRole('button', { name: /create/i });

            await user.type(titleInput, 'Test Event');
            await user.click(submitButton);

            expect(screen.getByText('Saving...')).toBeInTheDocument();
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Event Deletion', () => {
        it('shows delete button when editing existing event', () => {
            const event = { id: '1', title: 'Test Event' };
            render(<EventModal {...mockProps} event={event} />);

            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });

        it('does not show delete button for new events', () => {
            render(<EventModal {...mockProps} />);

            expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
        });

        it('calls onDelete when delete is confirmed', async () => {
            const user = userEvent.setup();
            const event = { id: '1', title: 'Test Event' };

            // Mock window.confirm
            const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

            render(<EventModal {...mockProps} event={event} />);

            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this event?');
            expect(mockProps.onDelete).toHaveBeenCalledWith('1');

            confirmSpy.mockRestore();
        });
    });

    describe('Modal Interactions', () => {
        it('calls onCancel when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const closeButton = screen.getByRole('button', { name: /close modal/i });
            await user.click(closeButton);

            expect(mockProps.onCancel).toHaveBeenCalled();
        });

        it('calls onCancel when overlay is clicked', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const overlay = screen.getByRole('dialog').parentElement;
            await user.click(overlay);

            expect(mockProps.onCancel).toHaveBeenCalled();
        });

        it('does not call onCancel when modal content is clicked', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const modal = screen.getByRole('dialog');
            await user.click(modal);

            expect(mockProps.onCancel).not.toHaveBeenCalled();
        });

        it('calls onCancel when Escape key is pressed', async () => {
            render(<EventModal {...mockProps} />);

            const modal = screen.getByRole('dialog');
            fireEvent.keyDown(modal, { key: 'Escape' });

            expect(mockProps.onCancel).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<EventModal {...mockProps} />);

            const modal = screen.getByRole('dialog');
            expect(modal).toHaveAttribute('aria-modal', 'true');
            expect(modal).toHaveAttribute('aria-labelledby', 'event-modal-title');
        });

        it('focuses title input when modal opens', async () => {
            render(<EventModal {...mockProps} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/event title/i)).toHaveFocus();
            }, { timeout: 500 });
        });

        it('traps focus within modal', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const closeButton = screen.getByRole('button', { name: /close modal/i });
            const submitButton = screen.getByRole('button', { name: /create/i });

            closeButton.focus();
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            expect(submitButton).toHaveFocus();
        });

        it('has proper error announcements', async () => {
            const user = userEvent.setup();
            render(<EventModal {...mockProps} />);

            const submitButton = screen.getByRole('button', { name: /create/i });
            await user.click(submitButton);

            const errorMessage = screen.getByText('Event title is required');
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });
    });
});