import React from 'react';

const Security: React.FC = () => {
  return (
    <div className="bg-background-light min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="material-symbols-outlined text-6xl text-neon mb-4">lock</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Sua Compra com Segurança
          </h1>
        </div>

        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            Este site foi pensado para oferecer uma experiência de compra tranquila e protegida. Em produção, ele deve ser publicado em um endereço com HTTPS, que é o padrão de segurança para lojas virtuais modernas.
          </p>

          <p>
            O HTTPS utiliza o protocolo SSL/TLS para criar uma conexão criptografada entre o seu navegador e o servidor. Isso ajuda a proteger informações sensíveis, como dados pessoais e endereços, evitando que terceiros interceptem esse tráfego.
          </p>

          <p>
            Ao publicar este site em uma hospedagem com HTTPS configurado, você verá o cadeado ao lado do endereço, indicando que a conexão é segura. Até lá, esta página serve como uma explicação simples para os seus clientes sobre esse cuidado com a segurança.
          </p>
        </div>

        <div className="mt-12 p-6 bg-[#e9f3e7] rounded-2xl">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-neon">verified_user</span>
            <div>
              <h3 className="font-bold text-gray-900">Compromisso com sua privacidade</h3>
              <p className="text-gray-600 text-sm">Seus dados são tratados com respeito e segurança.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
