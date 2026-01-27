const FloatingBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large floating shapes */}
      <div 
        className="floating-shape w-96 h-96 -top-20 -right-20 animate-float-slow"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="floating-shape w-80 h-80 top-1/4 -left-20 animate-pulse-soft"
        style={{ animationDelay: '1s' }}
      />
      <div 
        className="floating-shape w-64 h-64 bottom-1/4 right-1/4 animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div 
        className="floating-shape w-48 h-48 bottom-20 left-1/3 animate-float-slow"
        style={{ animationDelay: '3s' }}
      />
      <div 
        className="floating-shape w-72 h-72 top-1/2 right-10 animate-pulse-soft"
        style={{ animationDelay: '1.5s' }}
      />
      
      {/* Smaller accent shapes */}
      <div 
        className="absolute w-32 h-32 rounded-full bg-accent/10 blur-2xl top-20 left-1/4 animate-float"
        style={{ animationDelay: '0.5s' }}
      />
      <div 
        className="absolute w-24 h-24 rounded-full bg-primary/10 blur-xl bottom-1/3 right-1/3 animate-float-slow"
        style={{ animationDelay: '2.5s' }}
      />
      <div 
        className="absolute w-40 h-40 rounded-full bg-success/5 blur-2xl top-2/3 left-10 animate-pulse-soft"
        style={{ animationDelay: '1.2s' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
    </div>
  );
};

export default FloatingBackground;
