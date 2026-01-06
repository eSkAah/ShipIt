import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Shield, Users, CreditCard, Mail, Globe, Check, ArrowRight } from 'lucide-react';
import { MarketingLayout } from '../components/layouts/marketing-layout';

export function LandingPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <CTASection />
    </MarketingLayout>
  );
}

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="section-padding text-center">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 mb-8">
          <Zap className="w-4 h-4 text-purple-600 dark:text-gold-500" />
          <span className="text-sm font-medium text-purple-700 dark:text-gold-400">
            {t('marketing.hero.badge')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-hero font-bold leading-hero mb-6 text-black dark:text-white">
          {t('marketing.hero.title')}{' '}
          <span className="text-gradient">{t('marketing.hero.titleAccent')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto mb-10 animate-slide-up">
          {t('marketing.hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
            {t('marketing.hero.cta')}
            <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn-secondary">
            {t('marketing.hero.learnMore')}
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
          {[
            { value: '10+', label: t('marketing.hero.stats.features') },
            { value: '2', label: t('marketing.hero.stats.languages') },
            { value: '100%', label: t('marketing.hero.stats.typescript') },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-black dark:text-white">{stat.value}</div>
              <div className="text-sm text-black/60 dark:text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t('marketing.features.auth.title'),
      description: t('marketing.features.auth.description'),
    },
    {
      icon: Users,
      title: t('marketing.features.multiTenancy.title'),
      description: t('marketing.features.multiTenancy.description'),
    },
    {
      icon: CreditCard,
      title: t('marketing.features.billing.title'),
      description: t('marketing.features.billing.description'),
    },
    {
      icon: Mail,
      title: t('marketing.features.email.title'),
      description: t('marketing.features.email.description'),
    },
    {
      icon: Globe,
      title: t('marketing.features.i18n.title'),
      description: t('marketing.features.i18n.description'),
    },
    {
      icon: Zap,
      title: t('marketing.features.performance.title'),
      description: t('marketing.features.performance.description'),
    },
  ];

  return (
    <section id="features" className="section-padding bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-section font-bold leading-section text-black dark:text-white mb-4">
            {t('marketing.features.title')}
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            {t('marketing.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 hover:shadow-lg transition-shadow duration-700 ease-smooth"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-600 dark:text-gold-500" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-black/60 dark:text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('marketing.pricing.free.name'),
      price: t('marketing.pricing.free.price'),
      description: t('marketing.pricing.free.description'),
      features: [
        t('marketing.pricing.free.feature1'),
        t('marketing.pricing.free.feature2'),
        t('marketing.pricing.free.feature3'),
        t('marketing.pricing.free.feature4'),
      ],
      cta: t('marketing.pricing.free.cta'),
      href: '/signup',
      highlighted: false,
    },
    {
      name: t('marketing.pricing.premium.name'),
      price: t('marketing.pricing.premium.price'),
      period: t('marketing.pricing.premium.period'),
      description: t('marketing.pricing.premium.description'),
      features: [
        t('marketing.pricing.premium.feature1'),
        t('marketing.pricing.premium.feature2'),
        t('marketing.pricing.premium.feature3'),
        t('marketing.pricing.premium.feature4'),
        t('marketing.pricing.premium.feature5'),
      ],
      cta: t('marketing.pricing.premium.cta'),
      href: '/signup',
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-section font-bold leading-section text-black dark:text-white mb-4">
            {t('marketing.pricing.title')}
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            {t('marketing.pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-premium p-8 ${
                plan.highlighted
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-gold-glow'
                  : 'glass-card'
              }`}
            >
              {/* Plan Name */}
              <h3
                className={`text-xl font-semibold mb-2 ${
                  plan.highlighted ? 'text-white dark:text-black' : 'text-black dark:text-white'
                }`}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? 'text-white dark:text-black' : 'text-black dark:text-white'
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={
                      plan.highlighted
                        ? 'text-white/60 dark:text-black/60'
                        : 'text-black/60 dark:text-white/60'
                    }
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                className={`mb-6 ${
                  plan.highlighted
                    ? 'text-white/70 dark:text-black/70'
                    : 'text-black/60 dark:text-white/60'
                }`}
              >
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check
                      className={`w-5 h-5 ${
                        plan.highlighted
                          ? 'text-gold-500 dark:text-gold-600'
                          : 'text-purple-600 dark:text-gold-500'
                      }`}
                    />
                    <span
                      className={
                        plan.highlighted
                          ? 'text-white/90 dark:text-black/90'
                          : 'text-black/80 dark:text-white/80'
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.href}
                className={`block text-center py-3 rounded-full font-semibold transition-all duration-700 ease-smooth ${
                  plan.highlighted
                    ? 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                    : 'btn-secondary w-full'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="section-padding bg-black dark:bg-white text-white dark:text-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-section font-bold leading-section mb-6">{t('marketing.cta.title')}</h2>
        <p className="text-lg text-white/70 dark:text-black/70 mb-10 max-w-2xl mx-auto">
          {t('marketing.cta.subtitle')}
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-white dark:bg-black text-black dark:text-white rounded-full px-8 py-4 font-semibold shadow-gold-glow hover:shadow-gold-glow-hover transition-shadow duration-700 ease-smooth"
        >
          {t('marketing.cta.button')}
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
