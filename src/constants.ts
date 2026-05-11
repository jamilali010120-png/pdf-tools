import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Presentation, 
  FileCode, 
  Settings, 
  Type, 
  File
} from 'lucide-react';

export type ToolType = 
  | 'pdf-to-word' | 'pdf-to-jpg' | 'pdf-to-png' | 'pdf-to-ppt' | 'pdf-to-docx' | 'pdf-to-excel'
  | 'word-to-pdf' | 'docx-to-pdf' | 'jpg-to-pdf' | 'png-to-pdf' | 'excel-to-pdf' | 'pptx-to-pdf' 
  | 'heic-to-pdf' | 'txt-to-pdf' | 'dwg-to-pdf' | 'xps-to-pdf';

export interface ToolDef {
  id: ToolType;
  name: string;
  description: string;
  icon: any;
  color: string;
  to: string;
  accept: string;
}

export const TOOLS: ToolDef[] = [
  // PDF TO X
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to Word',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    to: 'Word',
    accept: 'application/pdf',
  },
  {
    id: 'pdf-to-docx',
    name: 'PDF to DOCX',
    description: 'Convert PDF to DOCX',
    icon: FileCode,
    color: 'bg-indigo-100 text-indigo-700',
    to: 'DOCX',
    accept: 'application/pdf',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF to JPG',
    icon: ImageIcon,
    color: 'bg-indigo-50 text-indigo-600',
    to: 'JPG',
    accept: 'application/pdf',
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Convert PDF to Excel',
    icon: FileSpreadsheet,
    color: 'bg-indigo-50 text-indigo-600',
    to: 'Excel',
    accept: 'application/pdf',
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PPT',
    description: 'Convert PDF to PPT',
    icon: Presentation,
    color: 'bg-indigo-50 text-indigo-600',
    to: 'PPT',
    accept: 'application/pdf',
  },

  // X TO PDF
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents (.doc, .docx) to PDF.',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
    to: 'PDF',
    accept: '.doc,.docx',
  },
  {
    id: 'docx-to-pdf',
    name: 'DOCX to PDF',
    description: 'Convert modern DOCX files to PDF.',
    icon: FileCode,
    color: 'bg-blue-50 text-blue-600',
    to: 'PDF',
    accept: '.docx',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert your JPG images into PDF documents.',
    icon: ImageIcon,
    color: 'bg-orange-50 text-orange-600',
    to: 'PDF',
    accept: 'image/jpeg',
  },
  {
    id: 'png-to-pdf',
    name: 'PNG to PDF',
    description: 'Convert PNG images into PDF files.',
    icon: ImageIcon,
    color: 'bg-orange-50 text-orange-600',
    to: 'PDF',
    accept: 'image/png',
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets into PDF documents.',
    icon: FileSpreadsheet,
    color: 'bg-green-50 text-green-600',
    to: 'PDF',
    accept: '.xls,.xlsx',
  },
  {
    id: 'heic-to-pdf',
    name: 'HEIC to PDF',
    description: 'Convert HEIC iPhone photos to PDF.',
    icon: ImageIcon,
    color: 'bg-indigo-50 text-indigo-600',
    to: 'PDF',
    accept: '.heic',
  },
  {
    id: 'pptx-to-pdf',
    name: 'PPT to PDF',
    description: 'Convert PowerPoint slideshows to PDF.',
    icon: Presentation,
    color: 'bg-red-50 text-red-600',
    to: 'PDF',
    accept: '.ppt,.pptx',
  },
  {
    id: 'txt-to-pdf',
    name: 'TXT to PDF',
    description: 'Convert plain text files into PDF documents.',
    icon: Type,
    color: 'bg-slate-50 text-slate-600',
    to: 'PDF',
    accept: '.txt',
  },
  {
    id: 'dwg-to-pdf',
    name: 'DWG to PDF',
    description: 'Convert CAD files (DWG) into PDF documents.',
    icon: Settings,
    color: 'bg-slate-50 text-slate-600',
    to: 'PDF',
    accept: '.dwg',
  },
  {
    id: 'xps-to-pdf',
    name: 'XPS to PDF',
    description: 'Convert XPS files into PDF standard.',
    icon: File,
    color: 'bg-slate-50 text-slate-600',
    to: 'PDF',
    accept: '.xps',
  },
];
