import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-2xl font-display font-bold tracking-tight">
              Campanhas<span className="text-primary italic">Já</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#home" className="hover:text-primary transition-colors">Início</a>
            <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contato</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="btn-outline py-2 px-6">
              Login
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-white/40 hover:text-white transition-colors"
              title="Painel Administrativo"
            >
              ⚙️
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden bg-hero-gradient">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Suas campanhas, seus resultados.{' '}
              <span className="text-white/80">Tudo em um só lugar.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl">
              A plataforma definitiva para estruturação e disparo de campanhas de mensagens em massa voltada para candidatos. Gestão inteligente de contatos e tags.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary text-lg px-10 py-4">
              Comece Agora
            </button>
          </motion.div>

          <div className="relative hidden md:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square glass rounded-full flex items-center justify-center border-white/20"
            >
              <div className="grid grid-cols-2 gap-4 p-12 w-full">
                {[
                  { icon: '👥', color: 'bg-primary', progress: '66%' },
                  { icon: '📩', color: 'bg-green-400', progress: '100%', mt: 'mt-8' },
                  { icon: '📊', color: 'bg-blue-400', progress: '50%', mtn: '-mt-8' },
                  { icon: '🏷️', color: 'bg-yellow-400', progress: '75%' },
                ].map(({ icon, color, progress, mt, mtn }, i) => (
                  <div key={i} className={`aspect-square glass rounded-2xl flex flex-col items-center justify-center gap-2 ${mt || mtn || ''}`}>
                    <span className="text-3xl">{icon}</span>
                    <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: progress }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Funcionalidades Poderosas</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Tudo o que você precisa para gerenciar sua base eleitoral de forma eficiente e profissional.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: 'Gestão de Contatos', desc: 'Importe, gerencie e organize todos os seus contatos em uma base única e segura.' },
              { icon: '📩', title: 'Campanhas em Massa', desc: 'Disparo inteligente de mensagens com personalização por nome e outras variáveis.' },
              { icon: '🏷️', title: 'Tags Inteligentes', desc: 'Categorize sua audiência por bairro, perfil ou engajamento para comunicação assertiva.' },
            ].map((item) => (
              <div key={item.title} className="glass p-10 flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                <span className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{item.icon}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Escolha o seu Plano</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Temos a solução ideal para o tamanho da sua campanha.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Básico', price: '197', contacts: '1.000', campaigns: '5', popular: false },
              { name: 'Profissional', price: '497', contacts: '10.000', campaigns: '15', popular: true },
              { name: 'Enterprise', price: '997', contacts: 'Ilimitados', campaigns: 'Ilimitadas', popular: false },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={`glass p-10 flex flex-col relative ${plan.popular ? 'border-primary border-2 scale-105 z-10' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-4 rounded-full uppercase tracking-widest">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-xl text-white/60 mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold font-display">R$ {plan.price}</span>
                  <span className="text-white/40 mb-1">/mês</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-2 text-sm text-white/70"><span>✅</span> Até {plan.contacts} contatos</li>
                  <li className="flex items-center gap-2 text-sm text-white/70"><span>✅</span> {plan.campaigns} campanhas/mês</li>
                  <li className="flex items-center gap-2 text-sm text-white/70"><span>✅</span> Tags ilimitadas</li>
                  {i > 0 && <li className="flex items-center gap-2 text-sm text-white/70"><span>✅</span> Suporte prioritário</li>}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    plan.popular
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Escolher Plano
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto glass p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Fale Conosco</h2>
              <p className="text-white/60 mb-8">Dúvidas sobre a plataforma? Nossa equipe está pronta para te atender.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-white/70">
                  <span className="text-xl">📧</span>
                  <span>contato@campanhasja.com</span>
                </div>
                <div className="flex items-center gap-4 text-white/70">
                  <span className="text-xl">📱</span>
                  <span>(11) 99999-8888</span>
                </div>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Seu Nome" className="w-full input-glass h-12" />
              <input type="email" placeholder="Seu Email" className="w-full input-glass h-12" />
              <textarea placeholder="Sua Mensagem" rows={4} className="w-full input-glass resize-none p-4" />
              <button type="submit" className="btn-primary w-full">Enviar Mensagem</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-30 grayscale">
            <span className="text-xl">🚀</span>
            <span className="font-display font-bold tracking-tight">CampanhasJá</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 CampanhasJá. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xl opacity-40 hover:opacity-100 transition-opacity">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
