import React from 'react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-[#f5f5f7] p-4">
          <div className="max-w-2xl w-full bg-[#141417] p-8 rounded-2xl border border-[#333] shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-[#ff4444] mb-4">Algo salió mal</h1>
            <p className="text-[#a1a1a6] mb-6">Se ha producido un error inesperado.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#8a2be2] hover:bg-[#8a2be2]/80 text-white rounded-full transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
