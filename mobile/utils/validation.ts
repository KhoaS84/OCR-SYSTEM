import { LoginFormData, RegisterFormData, ValidationError } from '../types/auth';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Mật khẩu ít nhất 6 ký tự
  return password.length >= 6;
};

export const validateUsername = (username: string): boolean => {
  // Tên đăng nhập ít nhất 3 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

export const validateLoginForm = (
  formData: LoginFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate username
  if (!formData.username.trim()) {
    errors.push({
      field: 'username',
      message: 'Tài khoản không được để trống',
    });
  }

  // Validate password
  if (!formData.password) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu không được để trống',
    });
  }

  return errors;
};

export const validateRegisterForm = (
  formData: RegisterFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate username
  if (!formData.username.trim()) {
    errors.push({
      field: 'username',
      message: 'Tài khoản không được để trống',
    });
  } else if (!validateUsername(formData.username)) {
    errors.push({
      field: 'username',
      message: 'Tài khoản phải có ít nhất 3 ký tự và chỉ chứa chữ cái, số, dấu gạch dưới',
    });
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.push({
      field: 'email',
      message: 'Email không được để trống',
    });
  } else if (!validateEmail(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Email không hợp lệ',
    });
  }

  // Validate password
  if (!formData.password) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu không được để trống',
    });
  } else if (!validatePassword(formData.password)) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
    });
  }

  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Vui lòng xác nhận mật khẩu',
    });
  } else if (formData.password !== formData.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Mật khẩu xác nhận không khớp',
    });
  }

  return errors;
};
