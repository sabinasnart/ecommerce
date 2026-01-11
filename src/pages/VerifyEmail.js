import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/VerifyEmail.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Токен подтверждения не найден');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email успешно подтвержден');
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Ошибка подтверждения email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResend = async () => {
    setStatus('resending');
    setError('');
    try {
      const email = prompt('Введите ваш email:');
      if (!email) return;

      await authService.resendVerificationEmail(email);
      setStatus('success');
      setMessage('Письмо с подтверждением отправлено. Проверьте вашу почту.');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Ошибка отправки письма');
    }
  };

  if (status === 'verifying' || status === 'resending') {
    return (
      <div className="verify-email-page">
        <div className="verify-email-container">
          <LoadingSpinner />
          <p>Подтверждение email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === 'success' ? (
          <div className="verify-email-success">
            <h1>Email подтвержден</h1>
            <p>{message}</p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Войти
            </Button>
          </div>
        ) : (
          <div className="verify-email-error">
            <h1>Ошибка подтверждения</h1>
            <p>{error}</p>
            <div className="verify-email-actions">
              <Button variant="primary" onClick={handleResend}>
                Отправить письмо повторно
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                На главную
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

