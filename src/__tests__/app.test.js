import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('😁 Happy path', () => {
	test('Renders the app with basic controls', () => {
		const { getByText, getByLabelText } = render(<App />);
		const appTitle = getByText('Get in time 🕰️');
		expect(appTitle).toBeInTheDocument();
		expect(getByLabelText(/Tempo:/)).toBeInTheDocument();
		expect(getByLabelText(/Playback resolution:/)).toBeInTheDocument();
		expect(getByLabelText(/Performance length:/)).toBeInTheDocument();
		const startButton = getByText('► Play');
		expect(startButton.tagName).toBe('BUTTON');
		const stopButton = getByText('◾ Stop');
		expect(stopButton.tagName).toBe('BUTTON');
		const tapPad = getByText('Tap here');
		expect(tapPad.tagName).toBe('BUTTON');
	});
});
