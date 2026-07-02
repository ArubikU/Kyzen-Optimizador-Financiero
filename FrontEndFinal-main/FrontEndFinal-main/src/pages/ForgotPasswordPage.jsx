import React, { useState } from 'react';
import { Mail, Key, ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowPassConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'Vacía', color: 'bg-slate-200', text: 'text-slate-400', pct: 'w-0' };
    if (pass.length < 6) return { label: 'Muy débil', color: 'bg-rose-500', text: 'text-rose-500', pct: 'w-1/4' };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: 'Contraseña débil', color: 'bg-orange-400', text: 'text-orange-500', pct: 'w-2/4' };
    if (score === 2) return { label: 'Contraseña media', color: 'bg-amber-500', text: 'text-amber-500', pct: 'w-3/4' };
    return { label: 'Contraseña fuerte ✨', color: 'bg-emerald-500', text: 'text-emerald-600', pct: 'w-full' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
      } else {
        setErrorMsg(data.message || 'El correo ingresado no se encuentra registrado.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Por favor, completa el código de verificación.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(3);
      } else {
        setErrorMsg(data.message || 'El código ingresado es incorrecto o ya expiró.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.join(''), password: newPassword })
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setNewPassword('');
        setConfirmPassword('');
        if (onBackToLogin) onBackToLogin();
      } else {
        setErrorMsg(data.message || 'No se pudo actualizar la contraseña. Inténtalo de nuevo.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="w-full min-h-[85vh] font-sans select-none animate-fadeIn flex flex-col items-center justify-center pb-12">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100">
          K
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Kyzen</h1>
        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Paso {step} de 3 · Recuperar Contraseña</p>
      </div>

      <div className="flex items-center justify-center gap-12 mb-8 relative w-full max-w-sm">
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-100 z-0"></div>
        <div className="absolute left-6 top-4 h-0.5 bg-indigo-600 z-0 transition-all duration-300" style={{ width: step === 2 ? '50%' : step === 3 ? '100%' : '0%' }}></div>

        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${step >= 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${step >= 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${step === 3 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          3
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 shadow-2xl rounded-[32px] p-6 md:p-8 w-full max-w-md mx-4 relative">
        {step === 1 && (
          <button onClick={onBackToLogin} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold">
            <ArrowLeft size={14} /> Volver
          </button>
        )}

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-2.5 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-6 pt-2">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">¿Olvidaste tu contraseña?</h2>
              <p className="text-xs font-medium text-slate-400">Ingresa tu correo registrado para enviarte un código.</p>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-center text-[10px] font-black uppercase text-amber-700 tracking-wider">
              *Válido solo para correos registrados*
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <><ArrowRight size={14} /> Enviar Código</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Revisa tu correo</h2>
              <p className="text-xs font-semibold text-slate-400">Enviamos un código de verificación a</p>
              <p className="text-sm font-black text-indigo-600 break-all">{email}</p>
            </div>

            <div className="flex justify-center gap-2">
              {code.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleCodeChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-lg font-black text-indigo-600 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              ))}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <><ShieldCheck size={14} /> Verificar Código</>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Crea tu nueva contraseña</h2>
              <p className="text-xs font-medium text-slate-400">Debe tener mínimo 8 caracteres combinados.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nueva Contraseña*</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full ${strength.color} rounded-full transition-all duration-300 ${strength.pct}`}></div>
              </div>
              <p className={`text-[10px] font-black uppercase ${strength.text}`}>{strength.label}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirmar nueva contraseña*</label>
              <div className="relative">
                <input required type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
                <button type="button" onClick={() => setShowPassConfirm(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md pt-3">
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <><Key size={14} /> Guardar nueva contraseña</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}