import { injectGlobal } from '@emotion/css'

injectGlobal`
	:root {
		--primary-color: dodgerblue;
		--text-color: #24292e;
		--bg-color: #fff;
	}

	body {
		font-family: 'Montserrat', sans-serif;
		color: var(--text-color);
		background-color: var(--bg-color);
	}

	svg {
		fill: currentColor;
	}

  .flex {
    display: flex;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }
`
