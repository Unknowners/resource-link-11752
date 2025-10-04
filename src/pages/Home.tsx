import { Sparkles, Brain, Shield, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Hero Section */}
      <section className="relative overflow-hidden flex-1 flex items-center justify-center py-20 sm:py-32">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
          }}
        />
        <div className="absolute inset-0 z-0" style={{ background: "var(--gradient-hero)" }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered Workspace Intelligence
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              Прискорте онбординг
              <br />
              <span className="gradient-text">нових співробітників</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Інтелектуальна Q&A платформа для швидкої адаптації команди. 
              Автоматична документація, інтеграції та AI-асистент в одному місці.
            </p>
          </div>
        </div>

        {/* Feature Icons - Floating */}
        <div className="absolute top-1/4 left-4 sm:left-20 opacity-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center animate-float">
            <Brain className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="absolute top-1/3 right-4 sm:right-20 opacity-20" style={{ animationDelay: '1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center animate-float">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-20" style={{ animationDelay: '2s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-float">
            <Zap className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </section>
    </div>
  );
}
