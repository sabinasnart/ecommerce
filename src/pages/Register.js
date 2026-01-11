import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Имя пользователя обязательно');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email обязателен');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Некорректный email');
      return false;
    }
    if (!formData.password) {
      setError('Пароль обязателен');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <h1 className="register-title">Регистрация</h1>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <Input
                type="text"
                name="username"
                label="Имя пользователя *"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                type="email"
                name="email"
                label="Email *"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <Input
                type="password"
                name="password"
                label="Пароль *"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                type="password"
                name="confirmPassword"
                label="Подтвердите пароль *"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <Input
                type="text"
                name="firstName"
                label="Имя"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              <Input
                type="text"
                name="lastName"
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <Input
              type="tel"
              name="phone"
              label="Телефон"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              loading={loading}
              className="register-submit-button"
            >
              Зарегистрироваться
            </Button>
          </form>

          <div className="register-footer">
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="register-link">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
