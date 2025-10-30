
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ReceiptPreview } from './receipt-preview';

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
    propertyAddress: '',
    propertyValue: '',
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
      'propertyAddress', 'propertyValue'
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
                @media print {
                  @page { 
                    size: A4;
                    margin: 20mm;
                  }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
                body {
                  font-family: Inter, sans-serif;
                }
              </style>
            </head>
            <body class="bg-white">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  }


  return (
    <div className="w-full max-w-4xl space-y-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Gerador de Recibo de Venda de Imóvel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vendedor */}
          <div>
            <h3 className="text-lg font-medium text-primary">Dados do Vendedor(a)</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
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
                <div className="space-y-2">
                <Label htmlFor="sellerCep">CEP</Label>
                <Input required id="sellerCep" value={formData.sellerCep} onChange={handleChange} placeholder="00000-000" />
              </div>
            </div>
          </div>
          {/* Comprador */}
          <div>
            <h3 className="text-lg font-medium text-primary">Dados do Comprador(a)</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
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
                <div className="space-y-2">
                <Label htmlFor="buyerCep">CEP</Label>
                <Input required id="buyerCep" value={formData.buyerCep} onChange={handleChange} placeholder="00000-000" />
              </div>
            </div>
          </div>

          {/* Imóvel */}
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

      {receiptData && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recibo Gerado</CardTitle>
            <Button variant="outline" onClick={handlePrint}>Imprimir / Salvar PDF</Button>
          </CardHeader>
          <CardContent>
            <ReceiptPreview data={receiptData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
