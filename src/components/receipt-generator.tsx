'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ReceiptPreview } from './receipt-preview';
import { User, FileText } from 'lucide-react';

export function ReceiptGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerCpf: '',
    sellerRg: '',
    sellerRgEmitter: '',
    sellerAddress: '',
    sellerNumber: '',
    sellerComplement: '',
    sellerNeighborhood: '',
    sellerCity: '',
    sellerState: '',
    sellerCep: '',
    propertyAddress: '',
    buyerName: '',
    buyerCpf: '',
    buyerRg: '',
    buyerRgEmitter: '',
    buyerAddress: '',
    buyerNumber: '',
    buyerComplement: '',
    buyerNeighborhood: '',
    buyerCity: '',
    buyerState: '',
    buyerCep: '',
    propertyValue: '',
    signatureLocation: '',
    isDigitalSignature: false,
  });
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, isDigitalSignature: checked as boolean }));
  };
  
  const generateReceipt = () => {
    const requiredFields = [
      'sellerName', 'sellerCpf', 'sellerRg', 'sellerRgEmitter', 'sellerAddress', 'sellerNumber', 'sellerNeighborhood', 'sellerCity', 'sellerState', 'sellerCep',
      'buyerName', 'buyerCpf', 'buyerRg', 'buyerRgEmitter', 'buyerAddress', 'buyerNumber', 'buyerNeighborhood', 'buyerCity', 'buyerState', 'buyerCep',
      'propertyAddress', 'propertyValue', 'signatureLocation'
    ];

    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast({
        variant: "destructive",
        title: "Campos Incompletos",
        description: "Por favor, preencha todos os campos para gerar o recibo.",
      });
      return;
    }
    setReceiptData(formData);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-preview');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Recibo de Compra e Venda de Imóvel</title>
               <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap');
                @media print {
                  @page { 
                    size: A4;
                    margin: 0;
                  }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
                body {
                  font-family: 'Inter', sans-serif;
                }
                 .font-serif {
                   font-family: 'Playfair Display', serif;
                 }
              </style>
            </head>
            <body class="bg-white">
              <div class="p-8 md:p-12 lg:p-16">${printContent.innerHTML}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  }


  return (
    <div className="w-full max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>Gerador de Recibos</h1>
        <p className="mt-3 text-lg text-gray-600">Crie recibos de compra e venda de imóveis com validade jurídica.</p>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-primary">
        <CardContent className="p-8 space-y-8">
          {/* Vendedor */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Dados do Vendedor(a)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="sellerName">Nome Completo</Label>
                <Input required id="sellerName" value={formData.sellerName} onChange={handleChange} placeholder="Nome completo do vendedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerCpf">CPF</Label>
                <Input required id="sellerCpf" value={formData.sellerCpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerRg">RG</Label>
                <Input required id="sellerRg" value={formData.sellerRg} onChange={handleChange} placeholder="00.000.000-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerRgEmitter">Órgão Expedidor</Label>
                <Input required id="sellerRgEmitter" value={formData.sellerRgEmitter} onChange={handleChange} placeholder="Ex: SSP/SP" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="sellerCep">CEP</Label>
                <Input required id="sellerCep" value={formData.sellerCep} onChange={handleChange} placeholder="00000-000" />
              </div>
               <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sellerAddress">Logradouro</Label>
                <Input required id="sellerAddress" value={formData.sellerAddress} onChange={handleChange} placeholder="Rua, Avenida, etc." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="sellerNumber">Número</Label>
                <Input required id="sellerNumber" value={formData.sellerNumber} onChange={handleChange} placeholder="Ex: 123" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="sellerComplement">Complemento</Label>
                <Input id="sellerComplement" value={formData.sellerComplement} onChange={handleChange} placeholder="Apto, Bloco, etc." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="sellerNeighborhood">Bairro</Label>
                <Input required id="sellerNeighborhood" value={formData.sellerNeighborhood} onChange={handleChange} placeholder="Bairro" />
              </div>
                <div className="space-y-2">
                <Label htmlFor="sellerCity">Cidade</Label>
                <Input required id="sellerCity" value={formData.sellerCity} onChange={handleChange} placeholder="Cidade" />
              </div>
                <div className="space-y-2">
                <Label htmlFor="sellerState">Estado</Label>
                <Input required id="sellerState" value={formData.sellerState} onChange={handleChange} placeholder="UF" />
              </div>
            </div>
             <div className="space-y-2 pt-4">
                <Label htmlFor="propertyAddress">Endereço Completo do Imóvel</Label>
                <Input required id="propertyAddress" value={formData.propertyAddress} onChange={handleChange} placeholder="Rua, número, bairro, cidade, estado" />
              </div>
          </div>
          
          <Separator />

          {/* Comprador */}
           <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Dados do Comprador(a)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="buyerName">Nome Completo</Label>
                <Input required id="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Nome completo do comprador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerCpf">CPF</Label>
                <Input required id="buyerCpf" value={formData.buyerCpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerRg">RG</Label>
                <Input required id="buyerRg" value={formData.buyerRg} onChange={handleChange} placeholder="00.000.000-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerRgEmitter">Órgão Expedidor</Label>
                <Input required id="buyerRgEmitter" value={formData.buyerRgEmitter} onChange={handleChange} placeholder="Ex: SSP/SP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerCep">CEP</Label>
                <Input required id="buyerCep" value={formData.buyerCep} onChange={handleChange} placeholder="00000-000" />
              </div>
               <div className="space-y-2 md:col-span-2">
                <Label htmlFor="buyerAddress">Logradouro</Label>
                <Input required id="buyerAddress" value={formData.buyerAddress} onChange={handleChange} placeholder="Rua, Avenida, etc." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="buyerNumber">Número</Label>
                <Input required id="buyerNumber" value={formData.buyerNumber} onChange={handleChange} placeholder="Ex: 123" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="buyerComplement">Complemento</Label>
                <Input id="buyerComplement" value={formData.buyerComplement} onChange={handleChange} placeholder="Apto, Bloco, etc." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="buyerNeighborhood">Bairro</Label>
                <Input required id="buyerNeighborhood" value={formData.buyerNeighborhood} onChange={handleChange} placeholder="Bairro" />
              </div>
                <div className="space-y-2">
                <Label htmlFor="buyerCity">Cidade</Label>
                <Input required id="buyerCity" value={formData.buyerCity} onChange={handleChange} placeholder="Cidade" />
              </div>
                <div className="space-y-2">
                <Label htmlFor="buyerState">Estado</Label>
                <Input required id="buyerState" value={formData.buyerState} onChange={handleChange} placeholder="UF" />
              </div>
            </div>
          </div>
          
          <Separator />

          {/* Imóvel e Assinatura */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Detalhes da Transação</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyValue">Valor Total (R$)</Label>
                <Input required id="propertyValue" value={formData.propertyValue} onChange={handleChange} placeholder="Ex: 250000,00" />
              </div>
              <div className="space-y-2">
                    <Label htmlFor="signatureLocation">Local da Assinatura</Label>
                    <Input required id="signatureLocation" value={formData.signatureLocation} onChange={handleChange} placeholder="Cidade onde o recibo é assinado" />
                </div>
            </div>
             <div className="flex items-center space-x-3 pt-4">
                    <Checkbox id="isDigitalSignature" checked={formData.isDigitalSignature} onCheckedChange={handleCheckboxChange} />
                    <Label htmlFor="isDigitalSignature" className="cursor-pointer text-sm font-normal">
                    Utilizar assinatura digital (com validade jurídica)
                    </Label>
                </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-6 rounded-b-lg">
          <Button onClick={generateReceipt} size="lg" className="w-full">Gerar Recibo</Button>
        </CardFooter>
      </Card>

      {receiptData && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Pré-visualização do Recibo</CardTitle>
              <CardDescription>Revise as informações e imprima ou salve o documento.</CardDescription>
            </div>
            <Button variant="outline" onClick={handlePrint}>Imprimir / Salvar PDF</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-gray-100 p-8 md:p-12">
              <ReceiptPreview data={receiptData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
