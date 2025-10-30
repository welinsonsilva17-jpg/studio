
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function ReceiptGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerCpf: '',
    buyerName: '',
    buyerCpf: '',
    propertyAddress: '',
    propertyValue: '',
    isDigitalSignature: false,
  });
  const [receipt, setReceipt] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, isDigitalSignature: checked as boolean }));
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const numberValue = parseFloat(value.replace(/\D/g, '')) / 100;
    if (isNaN(numberValue)) return '';
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const convertToWords = (numStr: string): string => {
    const num = parseFloat(numStr.replace(/[^\d,-]/g, '').replace(',', '.'));
    if (isNaN(num)) return '';

    const value = num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('.',',');
    return `${value} reais`;
  }

  const generateReceipt = () => {
    const { sellerName, sellerCpf, buyerName, buyerCpf, propertyAddress, propertyValue } = formData;
    if(!sellerName || !sellerCpf || !buyerName || !buyerCpf || !propertyAddress || !propertyValue) {
      toast({
        variant: "destructive",
        title: "Campos Incompletos",
        description: "Por favor, preencha todos os campos para gerar o recibo.",
      });
      return;
    }

    const valueInWords = convertToWords(propertyValue);
    const formattedValue = formatCurrency(propertyValue);

    const receiptText = `
RECIBO DE COMPRA E VENDA DE IMÓVEL

Eu, ${sellerName}, portador(a) do CPF nº ${sellerCpf}, declaro para os devidos fins que recebi de ${buyerName}, portador(a) do CPF nº ${buyerCpf}, a quantia de ${formattedValue} (${valueInWords}), referente à venda do imóvel localizado no endereço ${propertyAddress}.

Este pagamento representa a quitação total e irrevogável do valor acordado para a transação do referido imóvel, não restando qualquer pendência financeira entre as partes.

Local e Data: ____________________________


_________________________________________
${sellerName}
(Vendedor(a))

_________________________________________
${buyerName}
(Comprador(a))

${formData.isDigitalSignature
  ? 'Este documento foi assinado digitalmente, possuindo validade jurídica conforme a legislação vigente.'
  : 'Para plena validade jurídica, recomenda-se o reconhecimento de firma das assinaturas em cartório.'
}
    `;
    setReceipt(receiptText.trim());
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo de Compra e Venda de Imóvel</title>
            <style>
              body { font-family: sans-serif; line-height: 1.6; padding: 2rem; }
              pre { white-space: pre-wrap; font-family: sans-serif; }
            </style>
          </head>
          <body>
            <pre>${receipt}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Gerador de Recibo de Venda de Imóvel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-primary">Dados do Vendedor(a)</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Nome Completo</Label>
                <Input required id="sellerName" value={formData.sellerName} onChange={handleChange} placeholder="Nome completo do vendedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerCpf">CPF</Label>
                <Input required id="sellerCpf" value={formData.sellerCpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary">Dados do Comprador(a)</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Nome Completo</Label>
                <Input required id="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Nome completo do comprador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerCpf">CPF</Label>
                <Input required id="buyerCpf" value={formData.buyerCpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary">Dados do Imóvel</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Endereço Completo do Imóvel</Label>
                <Input required id="propertyAddress" value={formData.propertyAddress} onChange={handleChange} placeholder="Rua, número, bairro, cidade, estado" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyValue">Valor Total (R$)</Label>
                <Input required id="propertyValue" value={formData.propertyValue} onChange={handleChange} placeholder="Ex: 250000,00" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox id="isDigitalSignature" checked={formData.isDigitalSignature} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="isDigitalSignature" className="cursor-pointer">
              Utilizar assinatura digital (com validade jurídica)
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateReceipt}>Gerar Recibo</Button>
        </CardFooter>
      </Card>

      {receipt && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recibo Gerado</CardTitle>
            <Button variant="outline" onClick={handlePrint}>Imprimir / Salvar PDF</Button>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">{receipt}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
