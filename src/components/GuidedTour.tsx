import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTourStore } from '../store/useTourStore';
import { useThemeStore } from '../store/useThemeStore';

const steps: Step[] = [
  {
    target: 'body',
    content: 'Bem-vindo ao Controle Financeiro! Vamos fazer um tour rápido pelo sistema.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.period-selector',
    content: 'Aqui você pode selecionar o mês que deseja visualizar. Todas as informações serão filtradas de acordo com o período selecionado.',
  },
  {
    target: '.add-expense-button',
    content: 'Clique aqui para adicionar uma nova despesa.',
  },
  {
    target: '.add-income-button',
    content: 'Registre suas receitas clicando neste botão.',
  },
  {
    target: '.recurring-button',
    content: 'Gerencie suas despesas recorrentes como contas mensais, assinaturas e financiamentos.',
  },
  {
    target: '.dashboard-summary',
    content: 'Aqui você encontra um resumo do seu mês, com receitas, despesas e saldo.',
  },
  {
    target: '.expense-list',
    content: 'Suas despesas são listadas aqui. As vencidas são destacadas em vermelho, e as pagas em verde.',
  },
  {
    target: '.income-list',
    content: 'Suas receitas são exibidas nesta lista, ordenadas por data.',
  },
  {
    target: '.charts-section',
    content: 'Acompanhe seus gastos através dos gráficos de categorias e comparativo mensal.',
  },
];

export function GuidedTour() {
  // Temporarily disable tour by always returning null
  return null;

  /* Tour code commented out for now
  const { hasSeenTour, setHasSeenTour, currentStep, setCurrentStep } = useTourStore();
  const { isDark } = useThemeStore();
  const [run, setRun] = useState(!hasSeenTour);

  useEffect(() => {
    setRun(!hasSeenTour);
  }, [hasSeenTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setHasSeenTour(true);
    } else {
      setCurrentStep(index);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      stepIndex={currentStep}
      styles={{
        options: {
          primaryColor: '#2563eb',
          textColor: isDark ? '#e2e8f0' : '#1e293b',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          arrowColor: isDark ? '#1e293b' : '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
      locale={{
        back: 'Anterior',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
  */
}