import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import React from 'react';

const ExampleButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}>{children}</button>
);

describe('Component Testing Examples', () => {
  describe('Example Component - Button', () => {
    it('should render with children text', () => {
      const handleClick = vi.fn();
      render(<ExampleButton onClick={handleClick}>Click Me</ExampleButton>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<ExampleButton onClick={handleClick}>Click Me</ExampleButton>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be clickable multiple times', () => {
      const handleClick = vi.fn();
      render(<ExampleButton onClick={handleClick}>Click Me</ExampleButton>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Example Component - Conditional Rendering', () => {
    const ExampleConditional = ({ show, message }: { show: boolean; message: string }) => (
      <div>{show && <p>{message}</p>}</div>
    );

    it('should show content when condition is true', () => {
      render(<ExampleConditional show={true} message="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should hide content when condition is false', () => {
      render(<ExampleConditional show={false} message="Hello World" />);
      expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
    });
  });

  describe('Example Component - Form Input', () => {
    const ExampleInput = () => {
      const [value, setValue] = React.useState('');
      return (
        <div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text"
          />
          <p>You typed: {value}</p>
        </div>
      );
    };

    it('should update input value on change', () => {
      render(<ExampleInput />);
      const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(input.value).toBe('test');
      expect(screen.getByText('You typed: test')).toBeInTheDocument();
    });
  });
});
