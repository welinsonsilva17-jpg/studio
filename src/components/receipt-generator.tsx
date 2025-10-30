'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ReceiptPreview } from './receipt-preview';
import { User, FileText } from 'lucide-react';

// Função para validar CPF
const validateCpf = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  return true;
};

// Função para validar RG (validação simples de tamanho)
const validateRg = (rg: string) => {
  const cleanedRg = rg.replace(/[^\dX]/gi, '');
  return cleanedRg.length >= 5; // Exemplo: mínimo de 5 caracteres
};

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
  const [cpfErrors, setCpfErrors] = useState({ seller: false, buyer: false });
  const [rgErrors, setRgErrors] = useState({ seller: false, buyer: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'sellerCpf' || id === 'buyerCpf') {
      const isSeller = id === 'sellerCpf';
      const key = isSeller ? 'seller' : 'buyer';
      if (value.replace(/[^\d]/g, '').length === 11) {
        const isValid = validateCpf(value);
        setCpfErrors(prev => ({ ...prev, [key]: !isValid }));
      } else {
        setCpfErrors(prev => ({...prev, [key]: false}));
      }
    }

    if (id === 'sellerRg' || id === 'buyerRg') {
      const isSeller = id === 'sellerRg';
      const key = isSeller ? 'seller' : 'buyer';
       if (value.length > 0) {
        const isValid = validateRg(value);
        setRgErrors(prev => ({ ...prev, [key]: !isValid }));
      } else {
        setRgErrors(prev => ({...prev, [key]: false}));
      }
    }
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, isDigitalSignature: checked as boolean }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>, person: 'seller' | 'buyer') => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          [`${person}Address`]: data.logradouro,
          [`${person}Neighborhood`]: data.bairro,
          [`${person}City`]: data.localidade,
          [`${person}State`]: data.uf,
        }));
      } else {
         toast({
            variant: "destructive",
            title: "CEP não encontrado",
            description: "Não foi possível encontrar o endereço para o CEP informado.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
            variant: "destructive",
            title: "Erro de Rede",
            description: "Não foi possível conectar à API de CEP.",
        });
    }
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

    if (cpfErrors.seller || cpfErrors.buyer || rgErrors.seller || rgErrors.buyer) {
      toast({
        variant: "destructive",
        title: "Dados Inválidos",
        description: "Por favor, verifique os campos destacados em vermelho.",
      });
      return;
    }
    setReceiptData(formData);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-preview-container');
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
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // printWindow.close();
        }, 500);
      }
    }
  }

  return (
    <div className="w-full max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">Gerador de Recibos</h1>
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
                <Input required id="sellerCpf" value={formData.sellerCpf} onChange={handleChange} placeholder="000.000.000-00" className={cpfErrors.seller ? 'border-destructive' : ''} />
                {cpfErrors.seller && <p className="text-xs text-destructive">CPF inválido</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerRg">RG</Label>
                <Input required id="sellerRg" value={formData.sellerRg} onChange={handleChange} placeholder="00.000.000-0" className={rgErrors.seller ? 'border-destructive' : ''} />
                {rgErrors.seller && <p className="text-xs text-destructive">RG inválido</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerRgEmitter">Órgão Expedidor</Label>
                <Input required id="sellerRgEmitter" value={formData.sellerRgEmitter} onChange={handleChange} placeholder="Ex: SSP/SP" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="sellerCep">CEP</Label>
                <Input required id="sellerCep" value={formData.sellerCep} onChange={handleChange} onBlur={(e) => handleCepBlur(e, 'seller')} placeholder="00000-000" />
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
                <Input required id="buyerCpf" value={formData.buyerCpf} onChange={handleChange} placeholder="000.000.000-00" className={cpfErrors.buyer ? 'border-destructive' : ''} />
                {cpfErrors.buyer && <p className="text-xs text-destructive">CPF inválido</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerRg">RG</Label>
                <Input required id="buyerRg" value={formData.buyerRg} onChange={handleChange} placeholder="00.000.000-0" className={rgErrors.buyer ? 'border-destructive' : ''} />
                {rgErrors.buyer && <p className="text-xs text-destructive">RG inválido</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerRgEmitter">Órgão Expedidor</Label>
                <Input required id="buyerRgEmitter" value={formData.buyerRgEmitter} onChange={handleChange} placeholder="Ex: SSP/SP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerCep">CEP</Label>
                <Input required id="buyerCep" value={formData.buyerCep} onChange={handleChange} onBlur={(e) => handleCepBlur(e, 'buyer')} placeholder="00000-000" />
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
        <CardFooter className="bg-gray-50/50 p-6 rounded-b-lg border-t">
          <Button onClick={generateReceipt} size="lg" className="w-full text-base font-semibold">Gerar Recibo</Button>
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
            <div id="receipt-preview-container" className="bg-gray-50 p-8 md:p-12">
              <ReceiptPreview data={receiptData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
