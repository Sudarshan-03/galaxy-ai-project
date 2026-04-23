"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
    SignInButton, 
    SignUpButton, 
    SignedIn, 
    SignedOut, 
    UserButton 
} from "@clerk/nextjs";
import { ArrowRight, Sparkles, Wand2, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for hover tooltips
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="relative group/tooltip flex justify-center">
     {children}
     <div className="absolute -top-12 bg-[#222] border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#222] border-r border-b border-white/10 rotate-45" />
     </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -8; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}} />

      {/* Animated Background Enhancement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-[pulse-slow_6s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-[pulse-slow_8s_ease-in-out_infinite] delay-1000" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                 <span className="text-black font-bold text-xl leading-none">Z</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Zentra AI</span>
           </div>
           
           <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
              <Link href="#" className="hover:text-white transition-colors">Platform</Link>
              <Link href="#" className="hover:text-white transition-colors">Use Cases</Link>
              <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-white transition-colors">Docs</Link>
           </nav>

           <div className="flex items-center gap-4">
              <SignedOut>
                 <SignInButton mode="modal" forceRedirectUrl="/canvas">
                   <button className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
                     Sign In
                   </button>
                 </SignInButton>
                 <SignUpButton mode="modal" forceRedirectUrl="/canvas">
                   <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-all shadow-sm active:scale-95">
                     Get Started
                   </button>
                 </SignUpButton>
              </SignedOut>
              <SignedIn>
                 <Link href="/canvas" className="text-sm font-medium text-white/60 hover:text-white transition-colors mr-4">
                   Dashboard
                 </Link>
                 <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg shadow-sm border border-white/10" } }} />
              </SignedIn>
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 md:pt-48 md:pb-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
           
           {/* Announcement Badge */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors"
           >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Zentra AI 2.0 is now in public beta</span>
           </motion.div>

           {/* Main Headline */}
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
             className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl"
           >
             Artistic Intelligence, <br className="hidden md:block" />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient relative inline-block">
                Architected for Scale.
             </span>
           </motion.h1>

           {/* Subheadline */}
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
             className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
           >
             Turn your creative vision into scalable workflows. Connect inputs, process with AI models, and generate outputs in one intuitive platform.
           </motion.p>

           {/* Step Indicators */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="mt-12 flex items-center justify-center gap-4 sm:gap-10 text-white/50 text-sm font-medium"
           >
             <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">1</div>
                <span>Add Input</span>
             </div>
             <div className="w-8 h-px bg-white/10 hidden sm:block" />
             <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">2</div>
                <span>Connect AI</span>
             </div>
             <div className="w-8 h-px bg-white/10 hidden sm:block" />
             <div className="flex items-center gap-2.5 text-white/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">3</div>
                <span>Generate</span>
             </div>
           </motion.div>

           {/* CTAs */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
             className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
           >
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/canvas">
                  <button className="relative group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden w-full sm:w-auto">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                      Start Building Free
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/canvas" className="relative group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden w-full sm:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    Open Canvas
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedIn>

              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111] text-white border border-white/10 px-8 py-3.5 rounded-xl text-base font-medium hover:bg-white/5 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
                  View Demo
              </button>
           </motion.div>

           {/* Guided Flow Canvas Preview */}
           <motion.div
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
             className="mt-20 w-full max-w-[1200px] mx-auto rounded-2xl border border-white/10 bg-[#111]/50 p-2 sm:p-4 shadow-2xl backdrop-blur-sm"
           >
              <div className="aspect-[4/3] md:aspect-[21/9] w-full rounded-xl border border-white/10 bg-[#050505] shadow-inner overflow-hidden relative flex flex-col">
                 
                 {/* Mock Topbar */}
                 <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                    </div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                      Visual Editor Active
                    </div>
                 </div>

                 {/* Canvas Area */}
                 <div className="flex-1 relative flex items-center justify-center bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden">
                    
                    {/* Visual Node Graph */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-14 items-center justify-center scale-[0.65] md:scale-90 lg:scale-100">
                       
                       {/* Node 1: Text Input */}
                       <Tooltip text="1. Start with a Prompt">
                         <motion.div 
                           animate={{ y: [0, -5, 0] }} 
                           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                           className="w-56 bg-[#111] border border-white/10 rounded-xl shadow-lg overflow-hidden group hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] relative cursor-pointer"
                         >
                            <div className="p-3 border-b border-white/5 bg-[#161616] flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                    <FileText className="w-3 h-3" />
                                 </div>
                                 <span className="text-sm font-semibold text-white/90">Text Input</span>
                               </div>
                            </div>
                            <div className="p-4 space-y-3">
                               <div className="p-2 rounded bg-white/5 border border-white/5 text-white/60 text-xs font-mono h-16 line-clamp-3">
                                  "A futuristic city with glowing neon lights, cinematic angle, highly detailed"
                               </div>
                            </div>
                            <div className="absolute right-0 top-[40%] translate-x-[60%] w-3 h-3 bg-[#111] border-2 border-indigo-500 rounded-full z-20" />
                         </motion.div>
                       </Tooltip>

                       {/* Connection 1 */}
                       <div className="hidden md:block absolute left-[224px] top-[40%] w-14 h-[2px] z-0">
                         <svg width="100%" height="100%" className="overflow-visible text-indigo-500/50">
                            <path d="M 0 0 L 56 0" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" style={{ animation: "dash 1s linear infinite" }} />
                         </svg>
                       </div>

                       {/* Node 2: LLM Processor */}
                       <Tooltip text="2. Run AI Model">
                         <motion.div 
                           animate={{ y: [0, -8, 0] }} 
                           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                           className="w-56 bg-[#111] border border-white/10 rounded-xl shadow-lg overflow-hidden ring-1 ring-indigo-500/20 group hover:border-indigo-500/50 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] relative cursor-pointer"
                         >
                            <div className="absolute left-0 top-[35%] -translate-x-[60%] w-3 h-3 bg-indigo-500 border-2 border-[#111] rounded-full z-20 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                            <div className="p-3 border-b border-white/5 bg-[#161616] flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <Wand2 className="w-3 h-3" />
                                 </div>
                                 <span className="text-sm font-semibold text-white/90">SDXL Model</span>
                               </div>
                            </div>
                            <div className="p-4 space-y-3">
                               <div className="space-y-2 pt-1">
                                  <div className="flex justify-between items-center text-[10px] text-white/40">
                                     <span>Processing...</span>
                                     <span>65%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/10 rounded overflow-hidden">
                                     <div className="w-[65%] h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded animate-pulse" />
                                  </div>
                               </div>
                            </div>
                            <div className="absolute right-0 top-[65%] translate-x-[60%] w-3 h-3 bg-[#111] border-2 border-purple-500 rounded-full z-20" />
                         </motion.div>
                       </Tooltip>

                       {/* Connection 2 */}
                       <div className="hidden md:block absolute left-[504px] top-[65%] w-14 h-[2px] z-0">
                         <svg width="100%" height="100%" className="overflow-visible text-purple-500/50">
                            <path d="M 0 0 L 56 0" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" style={{ animation: "dash 1s linear infinite" }} />
                         </svg>
                       </div>

                       {/* Node 3: Image Output */}
                       <Tooltip text="3. Export Output">
                         <motion.div 
                           animate={{ y: [0, -4, 0] }} 
                           transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                           className="w-56 bg-[#111] border border-white/10 rounded-xl shadow-lg overflow-hidden group hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] relative cursor-pointer"
                         >
                            <div className="absolute left-0 top-[65%] -translate-x-[60%] w-3 h-3 bg-purple-500 border-2 border-[#111] rounded-full z-20 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                            <div className="p-3 border-b border-white/5 bg-[#161616] flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3" />
                                 </div>
                                 <span className="text-sm font-semibold text-white/90">Output Image</span>
                               </div>
                            </div>
                            <div className="p-4 space-y-3">
                               <div className="h-28 rounded bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:from-indigo-800/50 group-hover:to-purple-800/50 transition-all">
                                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?w=800&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                                  <span className="text-xs font-semibold text-white/80 z-10 backdrop-blur-sm px-2 py-1 bg-black/30 rounded">Result.png</span>
                               </div>
                            </div>
                         </motion.div>
                       </Tooltip>

                    </div>
                 </div>
              </div>
           </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a] relative z-10">
         <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-xs leading-none">Z</span>
               </div>
               <span className="font-semibold text-white">Zentra AI</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium text-white/40">
               <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
               <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
            
            <div className="text-sm text-white/20">
               © {new Date().getFullYear()} Zentra AI. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
}
