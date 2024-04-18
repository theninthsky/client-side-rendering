import { injectGlobal } from '@emotion/css'

import { DESKTOP_VIEWPORT } from './constants'

injectGlobal`
	:root {
		--primary-color: dodgerblue;
    --secondary-color: #654597;
		--text-color: #24292e;
		--bg-color: #fff;
	}

	[data-theme='dark'] {
		--text-color: #fff;
		--bg-color: #0f0e0e;
	}

  ::view-transition-old(root) {
    animation: slide-out 0.1s;

    @media(${DESKTOP_VIEWPORT}) {
      animation: none;
    }
  }

  ::view-transition-new(root) {
    animation: slide-in 0.1s;

    @media(${DESKTOP_VIEWPORT}) {
      animation: none;
    }
  }

  @keyframes slide-out {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }

  @keyframes slide-in {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
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
