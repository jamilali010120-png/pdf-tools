/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  X, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Cloud,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from './lib/utils';
import { TOOLS, ToolDef, ToolType } from './constants';
import { PDFService } from './services/pdfService';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<'from-pdf' | 'to-pdf' | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolDef | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  const validateFile = (selectedFile: File) => {
    if (!selectedTool) return false;
    
    const accept = selectedTool.accept;
    const fileName = selectedFile.name.toLowerCase();
    
    // Simple validation based on extensions or mime types
    const allowedExtensions = accept.split(',').map(ext => ext.trim());
    const isAllowed = allowedExtensions.some(ext => {
      if (ext.startsWith('.')) {
        return fileName.endsWith(ext);
      }
      if (ext.includes('/')) {
        return selectedFile.type === ext;
      }
      return false;
    });

    if (!isAllowed) {
      setError(`Please choose a valid file (${accept}).`);
      return false;
    }
    return true;
  };

  const startConversion = async () => {
    if (!file || !selectedTool) return;
    
    setIsProcessing(true);
    setIsSuccess(false);
    setError(null);

    try {
      await PDFService.process(file, selectedTool.id);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setIsSuccess(false);
    setIsProcessing(false);
    setError(null);
  };

  const goBack = () => {
    reset();
    if (selectedTool) {
      setSelectedTool(null);
    } else {
      setActiveCategory(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="h-16 flex items-center justify-between px-6 lg:px-12 bg-white border-bottom border-gray-100 sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setSelectedTool(null);
            setActiveCategory(null);
            reset();
          }}
        >
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">PDF Editor <span className="text-brand-primary font-black">PRO</span></span>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          {!selectedTool && !activeCategory ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Edit PDF files <br />
                  <span className="text-brand-primary underline decoration-brand-primary/20 underline-offset-8">right in your browser</span>
                </motion.h1>
                <motion.p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                  Select a service category to find the tool you need.
                </motion.p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory('from-pdf')}
                  className="group relative p-8 rounded-[2.5rem] bg-indigo-50/20 border border-indigo-100/50 shadow-xl shadow-slate-100 hover:border-brand-primary hover:shadow-brand-primary/10 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Convert From PDF</h2>
                    <p className="text-slate-500 font-medium mb-8">Transform your PDF files into images, Word documents, Excel, and more.</p>
                    <div className="mt-auto flex items-center gap-2 text-brand-primary font-bold">
                      View All Tools <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory('to-pdf')}
                  className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-600 hover:shadow-blue-600/10 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRightLeft className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Convert To PDF</h2>
                    <p className="text-slate-500 font-medium mb-8">Create PDF documents from images, text, Word, Excel, and other formats.</p>
                    <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold">
                      View All Tools <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800">Guaranteed Security</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Your privacy is our priority. We do not store your files on our servers after the process is complete.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800">Instant Conversion</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Get high-quality conversion results in seconds thanks to our cloud technology.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800">Anywhere</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Access PDF Editor PRO from any browser, anytime, and on any device without installation.</p>
                </div>
              </section>
            </motion.div>
          ) : !selectedTool && activeCategory ? (
            <motion.div
              key="tools-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold transition-colors group px-4 py-2 hover:bg-slate-50 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Categories
                </button>
                <div className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border",
                  activeCategory === 'from-pdf' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {activeCategory === 'from-pdf' ? 'Convert From PDF' : 'Convert To PDF'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOOLS.filter(t => 
                  activeCategory === 'from-pdf' 
                    ? t.accept === 'application/pdf' 
                    : t.to === 'PDF'
                ).map((tool, idx) => (
                  <motion.button
                    key={tool.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedTool(tool)}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group text-left",
                      activeCategory === 'from-pdf' ? "hover:border-brand-primary" : "hover:border-blue-600"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm", tool.color)}>
                        <tool.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-xl font-black text-slate-800 tracking-tight leading-none">{tool.name}</span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-wide">{tool.description}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-all",
                      activeCategory === 'from-pdf' ? "group-hover:bg-brand-primary group-hover:text-white" : "group-hover:bg-blue-600 group-hover:text-white"
                    )}>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tool-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto w-full"
            >
              <button 
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-primary mb-8 font-medium transition-colors"
                disabled={isProcessing}
              >
                <ArrowLeft className="w-4 h-4" />
                {activeCategory ? 'Back to Tool List' : 'Back to Home'}
              </button>

              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                {/* Tool Header */}
                <div className={cn("p-12 text-white flex flex-col md:flex-row items-center gap-8 justify-between", selectedTool?.color.split(' ')[0].replace('-50', '-500'))}>
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2">
                       {selectedTool && <selectedTool.icon className="w-10 h-10 text-white" />}
                    </div>
                    <h2 className="text-4xl font-bold">{selectedTool?.name}</h2>
                    <p className="text-white/80 text-lg max-w-lg">{selectedTool?.description}</p>
                  </div>
                </div>

                <div className="p-12 bg-white">
                  {!file ? (
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-3 border-dashed border-gray-200 rounded-3xl p-16 text-center space-y-4 hover:border-brand-primary hover:bg-brand-primary/5 cursor-pointer transition-all group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept={selectedTool?.accept}
                        className="hidden" 
                      />
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-brand-primary/10 group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-brand-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold">Choose {selectedTool?.accept.includes('pdf') ? 'PDF' : 'Related'} File</p>
                        <p className="text-gray-400 font-medium">Format: {selectedTool?.accept}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                             <FileText />
                           </div>
                           <div>
                             <p className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{file.name}</p>
                             <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                           </div>
                         </div>
                         {!isProcessing && !isSuccess && (
                           <button onClick={reset} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                             <X className="w-6 h-6" />
                           </button>
                         )}
                       </div>

                       {error && (
                         <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                           {error}
                         </div>
                       )}

                       <div className="flex flex-col gap-4">
                         {!isSuccess ? (
                           <button 
                             onClick={startConversion}
                             disabled={isProcessing}
                             className="btn-primary w-full py-4 text-xl flex items-center justify-center gap-3 h-16"
                           >
                             {isProcessing ? (
                               <>
                                 <Loader2 className="animate-spin" />
                                 Processing...
                               </>
                             ) : (
                               <>
                                 Convert to {selectedTool?.to}
                                 <ChevronRight className="w-5 h-5" />
                               </>
                             )}
                           </button>
                         ) : (
                           <div className="space-y-6">
                             <div className="p-8 bg-green-50 border border-green-100 rounded-3xl text-center space-y-4">
                               <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                                 <CheckCircle2 className="w-10 h-10" />
                                </div>
                               <h3 className="text-2xl font-bold text-green-900">Done!</h3>
                               <p className="text-green-700 font-medium">Your file has been successfully converted and downloaded.</p>
                             </div>
                             
                             <div className="flex gap-4">
                               <button onClick={reset} className="btn-secondary flex-1 py-4">
                                 Convert Another File
                               </button>
                               <button onClick={goBack} className="btn-primary flex-1 py-4">
                                 Back to Menu
                               </button>
                             </div>
                           </div>
                         )}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-gray-400 font-medium">
                Privacy Guaranteed: Your files are encrypted and will be deleted automatically.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold">PDF Editor <span className="text-brand-primary font-black">PRO</span></span>
            </div>
            <p className="text-gray-500 max-w-xs">
              Our mission is to simplify the way you work with PDF documents. Free, secure, and easy-to-use online tools.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold">Popular Tools</h5>
            <ul className="text-gray-500 text-sm space-y-2">
              <li><a href="#" className="hover:text-brand-primary">PDF to Word</a></li>
              <li><a href="#" className="hover:text-brand-primary">PDF to JPG</a></li>
              <li><a href="#" className="hover:text-brand-primary">PDF to Excel</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold">Company</h5>
            <ul className="text-gray-500 text-sm space-y-2">
              <li><a href="#" className="hover:text-brand-primary">About Us</a></li>
              <li><a href="#" className="hover:text-brand-primary">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-primary">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          © 2026 PDF Editor PRO. Smart document solutions for everyone.
        </div>
      </footer>
    </div>
  );
}
