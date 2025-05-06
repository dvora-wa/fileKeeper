export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    firstName: string;  
    lastName: string;   
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface User {
    id: string;
    email: string;
  }