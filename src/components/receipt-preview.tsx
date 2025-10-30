'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ReceiptPreviewProps = {
  data: any;
};

// Hook para evitar erros de hidratação com datas
function useSafeDate() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
  }, []);

  return currentDate;
}


export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const currentDate = useSafeDate();
  
  if (!data) return null;

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const numberValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'))
    if (isNaN(numberValue)) return '';
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const numberToWords = (num: number): string => {
    const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const teens = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const tens = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    const convert = (n: number): string => {
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " e " + units[n % 10] : "");
        if (n < 1000) {
            if (n === 100) return "cem";
            return hundreds[Math.floor(n / 100)] + (n % 100 !== 0 ? " e " + convert(n % 100) : "");
        }
        return "";
    }
    
    if (num === 0) return "zero";

    const integerPart = Math.floor(num);
    const fractionalPart = Math.round((num - integerPart) * 100);

    let result = "";

    const convertGroup = (n: number): string => {
        if (n === 0) return "";
        let str = "";
        const billion = Math.floor(n / 1000000000);
        const million = Math.floor((n % 1000000000) / 1000000);
        const thousand = Math.floor((n % 1000000) / 1000);
        const rest = n % 1000;

        if (billion > 0) {
          str += (billion > 1 ? convert(billion) + " bilhões" : "um bilhão") + (n % 1000000000 !== 0 ? " e " : "");
        }
        if (million > 0) {
          str += (million > 1 ? convert(million) + " milhões" : "um milhão") + (n % 1000000 !== 0 ? " e " : "");
        }
        if (thousand > 0) {
           if (thousand === 1 && (million > 0 || billion > 0)) str = str.replace(/ e $/, ", ");
           str += (thousand > 1 ? convert(thousand) + " mil" : "mil") + (n % 1000 !== 0 ? " e " : "");
        }
        if (rest > 0) {
           if ((thousand > 0 || million > 0 || billion > 0) && str.endsWith(" e ")) {
              // não faz nada
           } else if (thousand > 0 || million > 0 || billion > 0) {
              str += " e ";
           }
           str += convert(rest);
        }

        return str.replace(/,  e /g, ' e ');
    }

    if (integerPart > 0) {
        result += convertGroup(integerPart);
        result += integerPart === 1 ? " real" : " reais";
    }

    if (fractionalPart > 0) {
        if (integerPart > 0) result += " e ";
        result += convert(fractionalPart);
        result += fractionalPart === 1 ? " centavo" : " centavos";
    }

    // Capitalize first letter
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const convertToWords = (numStr: string): string => {
    const num = parseFloat(numStr.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(num)) return '';
    return numberToWords(num);
  }

  const {
    sellerName, sellerCpf, sellerRg, sellerRgEmitter, sellerAddress, sellerNumber, sellerComplement, sellerNeighborhood, sellerCity, sellerState, sellerCep,
    buyerName, buyerCpf, buyerRg, buyerRgEmitter, buyerAddress, buyerNumber, buyerComplement, buyerNeighborhood, buyerCity, buyerState, buyerCep,
    propertyAddress, propertyValue, signatureLocation, isDigitalSignature
  } = data;

  const valueInWords = convertToWords(propertyValue);
  const formattedValue = formatCurrency(propertyValue);
  const fullSellerAddress = `${sellerAddress}, nº ${sellerNumber}${sellerComplement ? `, ${sellerComplement}` : ''}, ${sellerNeighborhood}, ${sellerCity}/${sellerState}, CEP: ${sellerCep}`;
  const fullBuyerAddress = `${buyerAddress}, nº ${buyerNumber}${buyerComplement ? `, ${buyerComplement}` : ''}, ${buyerNeighborhood}, ${buyerCity}/${buyerState}, CEP: ${buyerCep}`;

  return (
    <div id="receipt-preview" className="bg-white text-gray-800 p-12 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto A4-container">
       <style jsx global>{`
        .A4-container {
          width: 21cm;
          min-height: 29.7cm;
          padding: 2cm;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <div className='flex-grow'>
        <h1 className="text-3xl font-bold text-center mb-10 border-b-2 border-gray-300 pb-4 text-gray-900 font-serif">
          RECIBO DE COMPRA E VENDA DE IMÓVEL
        </h1>

        <div className="space-y-6 text-base leading-relaxed text-justify">
          <p>
            Eu, <strong className="font-semibold">{sellerName}</strong>, portador(a) do RG nº <strong className="font-semibold">{sellerRg}</strong> (expedido por {sellerRgEmitter}) e do CPF nº <strong className="font-semibold">{sellerCpf}</strong>, residente e domiciliado(a) em {fullSellerAddress}, declaro para os devidos fins que recebi de <strong className="font-semibold">{buyerName}</strong>, portador(a) do RG nº <strong className="font-semibold">{buyerRg}</strong> (expedido por {buyerRgEmitter}) e do CPF nº <strong className="font-semibold">{buyerCpf}</strong>, residente e domiciliado(a) em {fullBuyerAddress}, a quantia de <strong className="font-semibold">{formattedValue} ({valueInWords})</strong>.
          </p>

          <p>
            A referida quantia é referente ao pagamento integral para a compra e venda do imóvel localizado em <strong className="font-semibold">{propertyAddress}</strong>.
          </p>

          <p>
            Com este pagamento, dou a mais plena, geral e irrevogável quitação do valor acordado para a transação do referido imóvel, nada mais havendo a reclamar no presente ou no futuro. Este recibo serve como prova definitiva da quitação total.
          </p>
        </div>

        <p className="text-right mt-12 mb-16">
          {signatureLocation}, {currentDate}.
        </p>

        {/* ASSINATURAS */}
        <div className="flex flex-col md:flex-row justify-around items-center mt-20 text-center gap-12 md:gap-0">
          <div className="w-4/5 md:w-2/5">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">{sellerName}</p>
              <p className="text-sm text-gray-600">(Vendedor(a))</p>
            </div>
          </div>
          <div className="w-4/5 md:w-2/5">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">{buyerName}</p>
              <p className="text-sm text-gray-600">(Comprador(a))</p>
            </div>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÃO FINAL */}
      <div className="mt-20 text-center text-xs text-gray-500 italic pt-8 border-t border-gray-100">
        <p>
          {isDigitalSignature
            ? 'Este documento foi assinado digitalmente, possuindo validade jurídica conforme a legislação vigente (MP nº 2.200-2/2001).'
            : 'Para plena validade jurídica, recomenda-se o reconhecimento de firma das assinaturas em cartório.'
          }
        </p>
      </div>
    </div>
  );
}

    