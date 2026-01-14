import CountUp from 'react-countup';

interface AnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
}

export function AnimatedCounter({
  end,
  start = 0,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  separator = ',',
}: AnimatedCounterProps) {
  return (
    <span className={className}>
      <CountUp
        start={start}
        end={end}
        duration={duration}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        separator={separator}
      />
    </span>
  );
}

interface CurrencyCounterProps {
  amount: number;
  currency?: 'USD' | 'EUR' | 'GBP';
  duration?: number;
  className?: string;
}

const currencySymbols = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
};

export function CurrencyCounter({
  amount,
  currency = 'USD',
  duration = 1.5,
  className = '',
}: CurrencyCounterProps) {
  return (
    <AnimatedCounter
      end={amount}
      decimals={2}
      prefix={currencySymbols[currency]}
      duration={duration}
      className={className}
    />
  );
}

interface TokenCounterProps {
  amount: number;
  symbol?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function TokenCounter({
  amount,
  symbol,
  decimals = 0,
  duration = 1.5,
  className = '',
}: TokenCounterProps) {
  return (
    <AnimatedCounter
      end={amount}
      decimals={decimals}
      suffix={symbol ? ` ${symbol}` : ''}
      duration={duration}
      className={className}
    />
  );
}
