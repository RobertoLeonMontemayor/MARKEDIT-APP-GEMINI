import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useFirebase } from './FirebaseProvider';
import { PortfolioItem, Contract, Message, UserProfile, OperationType } from '../types';
import { handleFirestoreError } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, FolderOpen, MessageSquare, CreditCard, Settings, 
  Plus, Star, TrendingUp, Users, ExternalLink, Play, Image as ImageIcon,
  LogOut, CheckCircle2, Clock, Send
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, profile } = useFirebase();
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'messages' | 'contracts' | 'settings'>('home');
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const portfolioQuery = query(
      collection(db, 'portfolios'),
      where('usuario_id', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const contractsQuery = query(
      collection(db, 'contracts'),
      where(profile?.rol === 'youtuber' ? 'cliente_id' : 'profesional_id', '==', user.uid),
      orderBy('fecha_contrato', 'desc')
    );

    const messagesQuery = query(
      collection(db, 'messages'),
      where('receptor_id', '==', user.uid),
      orderBy('enviado_el', 'desc'),
      limit(10)
    );

    const unsubPortfolio = onSnapshot(portfolioQuery, (snapshot) => {
      setPortfolio(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'portfolios'));

    const unsubContracts = onSnapshot(contractsQuery, (snapshot) => {
      setContracts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contract)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contracts'));

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));

    return () => {
      unsubPortfolio();
      unsubContracts();
      unsubMessages();
    };
  }, [user, profile?.rol]);

  const handleLogout = () => auth.signOut();

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-[#f5f5f7] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141417] border-r border-[#333] flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-[#8a2be2] to-[#00f2ff] bg-clip-text text-transparent">
            MARKEDIT
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<Home className="w-5 h-5" />} label="Resumen" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<FolderOpen className="w-5 h-5" />} label="Mi Portafolio" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Mensajes" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} badge={messages.filter(m => !m.leido).length} />
          <NavItem icon={<CreditCard className="w-5 h-5" />} label="Pagos e Ingresos" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Configuración" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-[#333]">
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl mb-4">
            <img src={profile?.avatar || 'https://picsum.photos/seed/avatar/100/100'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#333]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.nombre_completo}</p>
              <p className="text-[10px] text-[#a1a1a6] uppercase tracking-widest">{profile?.rol}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 text-xs text-[#ff4444] hover:bg-[#ff4444]/10 rounded-xl transition-all">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <div className="space-y-8">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bienvenido, {profile?.nombre_completo.split(' ')[0]}</h2>
                    <p className="text-[#a1a1a6]">Aquí tienes un resumen de tu actividad reciente.</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#8a2be2] hover:bg-[#8a2be2]/80 text-white rounded-full font-bold transition-all shadow-lg shadow-[#8a2be2]/20">
                    <Plus className="w-5 h-5" />
                    Subir Trabajo
                  </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={<TrendingUp className="w-6 h-6 text-[#00f2ff]" />} label="Proyectos Activos" value={contracts.filter(c => c.estado === 'en_proceso').length.toString()} color="#00f2ff" />
                  <StatCard icon={<Star className="w-6 h-6 text-[#ffd700]" />} label="Calificación Media" value={`⭐ ${profile?.calificacion_avg || '4.9'}`} color="#ffd700" />
                  <StatCard icon={<CreditCard className="w-6 h-6 text-[#00ff88]" />} label="Ingresos del mes" value={`$${contracts.filter(c => c.estado === 'pagado').reduce((acc, curr) => acc + curr.monto_total, 0).toLocaleString()}`} color="#00ff88" />
                </div>

                {/* Recent Portfolio */}
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold">Últimas muestras en tu portafolio</h3>
                    <button onClick={() => setActiveTab('portfolio')} className="text-sm text-[#8a2be2] hover:underline">Ver todo</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.slice(0, 3).map((item: PortfolioItem) => (
                      <PortfolioCard key={item.id} item={item} />
                    ))}
                    {portfolio.length === 0 && (
                      <div className="col-span-full p-12 bg-[#141417] rounded-2xl border border-dashed border-[#333] text-center">
                        <p className="text-[#a1a1a6]">No tienes trabajos publicados aún.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-8">
                <header className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold tracking-tight">Mi Portafolio</h2>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#8a2be2] hover:bg-[#8a2be2]/80 text-white rounded-full font-bold transition-all">
                    <Plus className="w-5 h-5" />
                    Añadir Proyecto
                  </button>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {portfolio.map((item: PortfolioItem) => (
                    <PortfolioCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight">Mensajes</h2>
                <div className="bg-[#141417] rounded-2xl border border-[#333] divide-y divide-[#333]">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-6 flex items-start gap-4 hover:bg-black/20 transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-[#8a2be2]/20 flex items-center justify-center text-[#8a2be2]">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-bold">Cliente #{msg.emisor_id.slice(0, 4)}</h4>
                          <span className="text-[10px] text-[#a1a1a6] uppercase">{new Date(msg.enviado_el || '').toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#a1a1a6] line-clamp-2">{msg.mensaje}</p>
                      </div>
                      {!msg.leido && <div className="w-2 h-2 rounded-full bg-[#00f2ff] mt-2" />}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="p-12 text-center text-[#a1a1a6]">No tienes mensajes nuevos.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight">Contrataciones</h2>
                <div className="bg-[#141417] rounded-2xl border border-[#333] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-[10px] uppercase tracking-widest text-[#a1a1a6]">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Profesional/Cliente</th>
                        <th className="px-6 py-4">Monto</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                      {contracts.map(c => (
                        <tr key={c.id} className="hover:bg-black/20 transition-all">
                          <td className="px-6 py-4 text-xs font-mono text-[#00f2ff]">#{c.id.slice(0, 6)}</td>
                          <td className="px-6 py-4 text-sm">{profile?.rol === 'youtuber' ? `Pro #${c.profesional_id.slice(0, 4)}` : `Cliente #${c.cliente_id.slice(0, 4)}`}</td>
                          <td className="px-6 py-4 text-sm font-bold text-[#00ff88]">${c.monto_total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              c.estado === 'pagado' && "bg-[#00ff88]/10 text-[#00ff88]",
                              c.estado === 'en_proceso' && "bg-[#8a2be2]/10 text-[#8a2be2]",
                              c.estado === 'pendiente' && "bg-[#ffd700]/10 text-[#ffd700]",
                              c.estado === 'entregado' && "bg-[#00f2ff]/10 text-[#00f2ff]"
                            )}>
                              {c.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#a1a1a6]">{new Date(c.fecha_contrato || '').toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contracts.length === 0 && (
                    <div className="p-12 text-center text-[#a1a1a6]">No hay contrataciones registradas.</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
        active ? "bg-[#8a2be2]/10 text-[#8a2be2]" : "text-[#a1a1a6] hover:text-[#f5f5f7] hover:bg-white/5"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {badge ? (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#00f2ff] text-[#0a0a0c] text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#8a2be2] rounded-r-full" />}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-[#141417] p-6 rounded-2xl border border-[#333] hover:border-[#8a2be2]/30 transition-all group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-black/40 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs text-[#a1a1a6] uppercase tracking-widest font-medium">{label}</span>
      </div>
      <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem, key?: string }) {
  return (
    <div className="bg-[#141417] rounded-2xl border border-[#333] overflow-hidden group hover:border-[#8a2be2]/50 transition-all">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.url_imagen || `https://picsum.photos/seed/${item.id}/800/600`} 
          alt={item.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          {item.tipo === 'video' ? (
            <button className="p-4 bg-white text-[#0a0a0c] rounded-full shadow-xl hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current" />
            </button>
          ) : (
            <button className="p-4 bg-white text-[#0a0a0c] rounded-full shadow-xl hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {item.tipo}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold mb-1 group-hover:text-[#8a2be2] transition-colors">{item.titulo}</h4>
        <p className="text-xs text-[#a1a1a6] line-clamp-2 mb-4">{item.descripcion || 'Sin descripción disponible.'}</p>
        <div className="flex justify-between items-center pt-4 border-t border-[#333]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#8a2be2]/20 flex items-center justify-center">
              <Users className="w-3 h-3 text-[#8a2be2]" />
            </div>
            <span className="text-[10px] text-[#a1a1a6]">Pro #{item.usuario_id.slice(0, 4)}</span>
          </div>
          <ExternalLink className="w-4 h-4 text-[#a1a1a6] hover:text-[#f5f5f7] cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
