import Demo from './components/Demo';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Nav from './components/Nav';
import Report from './components/Report';
import { useAnalysis } from './hooks/useAnalysis';
import { useHealth } from './hooks/useHealth';

export default function App() {
  const analysis = useAnalysis();
  const health = useHealth();

  return (
    <>
      <Nav />
      <main id="contenido">
        <Hero onExample={analysis.loadExample} />
        <Demo analysis={analysis} health={health} />
        <Report state={analysis.state} />
        <HowItWorks />
      </main>
    </>
  );
}
