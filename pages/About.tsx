import React from 'react';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in bg-background-light min-h-screen overflow-x-hidden">
       <div className="container mx-auto px-4 py-16 md:py-24 max-w-[1000px]">
           
           <div className="text-center mb-20 space-y-6">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-tight">
                   Cultivando bem-estar, colhendo o futuro.
               </h1>
               <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                   Uma jornada que começa na terra e chega até você, unindo natureza, ciência e paixão em cada produto.
               </p>
           </div>

           <div className="space-y-24 md:space-y-32">
               {/* Section 1 */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                   <div className="relative aspect-[4/5] md:order-1 order-2">
                       <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon/20 rounded-full blur-3xl"></div>
                       <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGXebs8Yffx5vI2rPAVbfAwac3ShAAe0sAoFREJfbKS1KKaPQzhXyd1UkKcZhHaUWvCYaqSwXikTxWBNoOorQ6JSTfwP0EiEqEygQuX8YAYET9MPfK5y7Qun4BzNb8xZqvRDNJRIljjXXjUAo2BjlSvEui9OowOvpkjoL-_wUytHVYxLe0ZFqojGoB8g_lXMnprEci2dOg9Hk_HAPi-fx6kihdpgyIYi6f5rJegZGDHekfGE7wx3toTI4Bi9fAH2DEc0YF9pqKGTwS" alt="Sprout in hands" className="w-full h-full object-cover rounded-2xl relative z-10 shadow-xl" />
                   </div>
                   <div className="space-y-6 md:order-2 order-1">
                       <span className="text-primary-dark dark:text-neon font-bold uppercase tracking-wider text-sm">Nossa Essência</span>
                       <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Das nossas raízes para a sua vida.</h2>
                       <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                           A Naturalis nasceu do amor pela terra e da crença no poder da natureza. Começamos como uma pequena fazenda familiar, com o sonho de criar produtos que fossem puros, eficazes e gentis com o nosso corpo e com o planeta.
                       </p>
                   </div>
               </section>

               {/* Section 2 */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                       <span className="text-primary-dark dark:text-neon font-bold uppercase tracking-wider text-sm">Nossa Missão</span>
                       <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Inovação com consciência.</h2>
                       <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                           Nossa missão é ir além do natural. Combinamos sabedoria ancestral com ciência moderna para criar fórmulas únicas que nutrem e revitalizam. Acreditamos que o verdadeiro bem-estar vem do equilíbrio e da conexão com o mundo ao nosso redor.
                       </p>
                   </div>
                   <div className="relative aspect-[4/5]">
                       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon/20 rounded-full blur-3xl"></div>
                       <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqtnc0TA30GCW9VMPLrN3Zvcv5Ds2i2hPdcCI3rS_Z50kmC_9kO9C6SPbo4HPttiZ0Dt2NRnNkroYRj6fzHbjUcAE38kT_nw2wTPDb3RGg864KCEe_tDtIr1AvDreTObsxST01vj4o_xxICeya-gULjiME74Kg71tuZXwj1ieXW0rqXrvewzGZ_UbHp3FSEAzNA4EEGhFcPe6muf3Hufi0uGBl1NSv3XKkM8e2QgPnvofgdfhm3GcAObnp6ogj1p1WEaGXDzPl4Ppf" alt="Tea field" className="w-full h-full object-cover rounded-2xl relative z-10 shadow-xl" />
                   </div>
               </section>

               {/* Timeline */}
               <section className="pt-10">
                   <h2 className="text-center text-4xl font-black text-gray-900 dark:text-white mb-16">Nossa Trajetória</h2>
                   <div className="relative border-l-2 border-gray-200 dark:border-white/10 ml-4 md:ml-1/2 space-y-12">
                       {[
                           { year: "2015", title: "O Início de Tudo", desc: "Fundamos a Naturalis em nossa fazenda familiar, com a primeira colheita." },
                           { year: "2018", title: "Primeira Loja", desc: "Inauguramos nossa primeira loja física, levando nossos produtos para a comunidade." },
                           { year: "2021", title: "Expansão Nacional", desc: "Lançamos nosso e-commerce, expandindo nosso alcance para todo o país." },
                           { year: "Hoje", title: "Futuro Sustentável", desc: "Continuamos a inovar com novas linhas e compromisso com a sustentabilidade." }
                       ].map((item, idx) => (
                           <div key={idx} className={`relative pl-8 md:pl-0 flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                               <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-primary-dark dark:bg-neon rounded-full border-4 border-background-light dark:border-background-dark z-10"></div>
                               <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                                   <div className="p-6 bg-white dark:bg-[#1a2c18] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                       <span className="text-primary-dark dark:text-neon font-bold text-sm">{item.year}</span>
                                       <h3 className="text-lg font-bold mt-1 text-gray-900 dark:text-white">{item.title}</h3>
                                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.desc}</p>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </section>
           </div>
       </div>
    </div>
  );
};

export default About;