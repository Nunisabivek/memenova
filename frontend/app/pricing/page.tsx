"use client"
import { motion } from 'framer-motion'
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  Heart,
  ArrowRight
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Unlimited image memes with ads',
      icon: Heart,
      color: 'from-secondary-500 to-secondary-600',
      popular: false,
      features: [
        'Unlimited image memes (with ads)',
        'Standard quality downloads',
        '3 free video memes at 720p (account required)',
        'Basic templates',
        'Community support'
      ]
    },
    {
      name: 'Pro',
      price: '$25',
      period: 'per month',
      description: 'HD quality + auto-publish with 1 social account',
      icon: Crown,
      color: 'from-primary-500 to-accent-600',
      popular: true,
      features: [
        'HD image and video exports',
        'No ads, no watermark',
        'Auto-publish to 1 social account',
        'Smart captions & hashtags',
        'Premium templates',
        'Priority generation'
      ]
    },
    {
      name: 'Pro Max',
      price: '$60',
      period: 'per month',
      description: 'Everything in Pro + multiple social accounts',
      icon: Users,
      color: 'from-accent-500 to-primary-600',
      popular: false,
      features: [
        'Everything in Pro',
        'Multiple social accounts',
        'Team collaboration',
        'Brand kit & assets',
        'Analytics dashboard',
        'Priority rendering'
      ]
    }
  ]

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. No questions asked.'
    },
    {
      question: 'How does the AI generation work?',
      answer: 'Our AI analyzes your prompt and creates custom memes using advanced machine learning models trained on viral content.'
    },
    {
      question: 'Can I use the memes commercially?',
      answer: 'Yes! All memes created with Pro and Business plans come with full commercial usage rights.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-accent-50/50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-secondary-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your meme creation needs. 
              Start free and upgrade as you grow.
            </p>
            <div className="flex items-center justify-center space-x-2 text-secondary-600">
              <Shield className="w-5 h-5" />
              <span>30-day money-back guarantee</span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className={`relative h-full ${plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''}`}
                  hover={!plan.popular}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary-900">{plan.name}</h3>
                    <p className="text-secondary-600">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-secondary-900">{plan.price}</span>
                      <span className="text-secondary-600">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-secondary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'hero-glow' : ''}`}
                      variant={plan.popular ? 'primary' : 'outline'}
                      size="lg"
                    >
                      {plan.name === 'Free' ? 'Get Started' : `Choose ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Features Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Everything You Need to Create
                <span className="text-gradient"> Viral Content</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-secondary-600">
                  Generate professional memes in seconds with our advanced AI engine.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <TrendingUp className="w-12 h-12 text-accent-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Viral Ready</h3>
                <p className="text-secondary-600">
                  Templates and styles optimized for maximum engagement across platforms.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Team Friendly</h3>
                <p className="text-secondary-600">
                  Collaborate with your team and maintain consistent brand voice.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-secondary-600">
              Everything you need to know about our pricing and features.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-secondary-600">
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Creating?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators who are already using MemeNova to 
              engage their audience and grow their following.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-primary-700 hover:bg-gray-50"
              icon={ArrowRight}
              iconPosition="right"
            >
              Start Free Trial
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}


