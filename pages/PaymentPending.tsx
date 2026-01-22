import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPending: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-yellow-600">pending</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento em Processamento</h1>
          <p className="text-gray-600 mb-6">
            Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-neon hover:bg-neon/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Voltar para a Loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
