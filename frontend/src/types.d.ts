declare module 'uuid';

// React Router DOM extensions
import { LinkProps as OriginalLinkProps } from 'react-router-dom';
import { ElementType, ComponentProps } from 'react';

// Fix React 18 + React Router compatibility issues
declare namespace React {
  interface ReactElement {
    // This allows React.ReactElement to be treated as a ReactNode
    // which fixes React Router component type errors
    children?: ReactNode;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    component: ElementType;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    component: ElementType;
    to: string;
  }
}

declare module '@mui/material/Container' {
  interface ContainerPropsVariantOverrides {
    component: ElementType;
  }
}

// Fix React Router DOM types
declare module 'react-router-dom' {
  export interface LinkProps extends OriginalLinkProps {
    component?: ElementType;
  }
} 