// This file helps TypeScript recognize React Router DOM v6 exports
declare module 'react-router-dom' {
  export interface NavigateProps {
    to: string;
    replace?: boolean;
    state?: any;
  }
  export const Navigate: React.FC<NavigateProps>;
  export function useLocation(): any;
  export function useNavigate(): (to: string, options?: { replace?: boolean; state?: any }) => void;
} 