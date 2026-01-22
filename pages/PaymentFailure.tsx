import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-600">error</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Falhou</h1>
          <p className="text-gray-600 mb-6">
            Infelizmente não conseguimos processar seu pagamento. Tente novamente ou escolha outra forma de pagamento.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-neon hover:bg-neon/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-600 hover:text-gray-900 font-medium py-3"
            >
              Voltar para a Loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
