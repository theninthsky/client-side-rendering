import { injectGlobal } from '@emotion/css'

injectGlobal`
	:root {
		--primary-color: dodgerblue;
		--text-color: #24292e;
		--bg-color: #fff;
	}

	[data-theme='dark'] {
		--text-color: #fff;
		--bg-color: #0f0e0e;
	}

	body {
		font-family: 'Montserrat', sans-serif;
		color: var(--text-color);
		background-color: var(--bg-color);
		transition: color 0.2s, background-color 0.2s;
	}

	svg {
		fill: currentColor;
	}

	.hidden {
		display: none;
	}

	.invisible {
		visibility: hidden;
	}

	.flex {
		display: flex;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.flex-wrap {
		display: flex;
		flex-wrap: wrap;
	}

	.justify-between {
		display: flex;
		justify-content: space-between;
	}

	.justify-end {
		display: flex;
		justify-content: flex-end;
	}

	.items-center {
		display: flex;
		align-items: center;
	}

	.items-end {
		display: flex;
		align-items: flex-end;
	}
`
