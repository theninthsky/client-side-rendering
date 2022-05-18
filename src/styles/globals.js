import { injectGlobal } from '@emotion/css'

injectGlobal`
	.relative {
		position: relative;
	}

	.w-full {
		width: 100%;
	}

	.max-w-full {
		max-width: 100%;
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

	.flex-1 {
		flex: 1;
	}

	.flex-2 {
		flex: 2;
	}

	.flex-3 {
		flex: 3;
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

	.cursor-pointer {
		cursor: pointer;
	}

	.pointer-events-none {
		pointer-events: none;
	}

	.text-center {
		text-align: center;
	}

	.grayscale {
		filter: grayscale(100%);
	}
`
