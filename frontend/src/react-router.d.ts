declare module 'react-router-dom' {
  // This forces TypeScript to use any for React Router components
  // which sidesteps the Element vs ReactNode compatibility issues
  import * as React from 'react';
  import * as ReactRouter from 'react-router';
  
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }

  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const useLocation: any;
  export const useNavigate: any;
} 