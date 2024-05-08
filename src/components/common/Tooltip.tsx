import { useState, FC } from 'react'
import { injectGlobal } from '@emotion/css'
import { ClickAwayListener, Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

const Tooltip: FC<TooltipProps> = props => {
  const [open, setOpen] = useState(false)

  return (
    <ClickAwayListener onClickAway={() => setTimeout(() => setOpen(false), 50)}>
      <MuiTooltip
        {...props}
        PopperProps={{ disablePortal: true }}
        onClick={() => setOpen(true)}
        onClose={() => setOpen(false)}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      />
    </ClickAwayListener>
  )
}

injectGlobal`
  .MuiTooltip-popper  {
    max-width: 450px;
    margin-bottom: -10px !important;
    
    .MuiTooltip-tooltip {
      padding: 10px;
      box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;
      white-space: pre-wrap;
      line-height: 1.3;
      font-family: inherit;
      font-size: 15px;
      font-weight: 400;
      background-color: var(--primary-color);
    }
  }
`

export default Tooltip
