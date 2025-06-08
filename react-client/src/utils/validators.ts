export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePassword = (password: string): boolean => {
    // At least 6 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
    return passwordRegex.test(password)
  }
  
  export const validateFolderName = (name: string): boolean => {
    // No special characters that are invalid in file systems
    const invalidChars = /[<>:"\/\\|?*]/
    return name.length > 0 && name.length <= 255 && !invalidChars.test(name)
  }
  