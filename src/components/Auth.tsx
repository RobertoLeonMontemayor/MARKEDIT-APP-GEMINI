import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole, UserProfile } from '../types';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export function Auth() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        if (!role) {
          setError('Por favor, selecciona un rol antes de registrarte.');
          setLoading(false);
          return;
        }

        // Create initial profile
        const newProfile: Partial<UserProfile> = {
          nombre_completo: user.displayName || 'Usuario',
          email: user.email || '',
          rol: role,
          fecha_registro: new Date().toISOString(),
          verificado_id: false,
          avatar: user.photoURL || 'https://picsum.photos/seed/avatar/200/200',
        };
        await setDoc(userDoc, newProfile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#141417] p-8 rounded-2xl border border-[#333] shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-[#8a2be2] to-[#00f2ff] bg-clip-text text-transparent mb-2">
            MARKEDIT
          </h1>
          <p className="text-[#a1a1a6] text-sm">Ecosistema profesional para creadores y editores</p>
        </div>

        {!role ? (
          <div className="space-y-4">
            <p className="text-center text-[#f5f5f7] font-medium mb-4">¿Quién eres?</p>
            <div className="grid grid-cols-1 gap-3">
              {(['editor', 'miniaturero', 'youtuber'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="p-4 rounded-xl border border-[#333] hover:border-[#8a2be2] hover:bg-[#8a2be2]/5 transition-all text-left group"
                >
                  <span className="block text-[#f5f5f7] font-semibold capitalize group-hover:text-[#8a2be2]">{r}</span>
                  <span className="text-xs text-[#a1a1a6]">
                    {r === 'editor' && 'Edita videos de alta calidad para canales top.'}
                    {r === 'miniaturero' && 'Crea miniaturas que maximizan el CTR.'}
                    {r === 'youtuber' && 'Encuentra el mejor talento para tu canal.'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-[#8a2be2]/10 rounded-lg border border-[#8a2be2]/30">
              <span className="text-sm text-[#8a2be2] font-medium capitalize">Rol seleccionado: {role}</span>
              <button onClick={() => setRole(null)} className="text-xs text-[#a1a1a6] hover:text-[#f5f5f7] underline">Cambiar</button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#f5f5f7] text-[#0a0a0c] rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0a0a0c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Continuar con Google
                </>
              )}
            </button>

            {error && <p className="text-xs text-[#ff4444] text-center">{error}</p>}
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#a1a1a6] uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Conexión segura vía Firebase Auth
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
