// Replace Next.js generated types with our own compatible type
declare module 'next' {
  export interface PageProps {
    params: { 
      id: string;
      [key: string]: string | string[];
    };
    searchParams?: { 
      [key: string]: string | string[] | undefined 
    };
  }
}

// Alternative approach: Define interface at page level
export interface EmailPageProps {
  params: {
    id: string;
  };
  searchParams?: { 
    [key: string]: string | string[] | undefined 
  };
}