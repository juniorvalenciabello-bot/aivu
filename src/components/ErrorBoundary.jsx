import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary detectó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0a0a0c', color: '#ff003c', height: '100vh', fontFamily: 'monospace' }}>
          <h2>Algo salió terriblemente mal.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', color: 'white' }}>Ver detalles del error técnico (Haz clic aquí y mándale captura al asistente)</summary>
            <br />
            <strong style={{ color: 'yellow' }}>{this.state.error && this.state.error.toString()}</strong>
            <br />
            <span style={{ color: 'gray' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</span>
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}
