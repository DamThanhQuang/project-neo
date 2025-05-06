import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the configuration');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createPayment(options: {
    amount: number;
    email: string;
    bookingId?: string;
  }) {
    const amountInUSD = options.amount / 26000; // Convert VND to USD
    const amountInCents = Math.round(amountInUSD * 100);

    // Tạo metadata với bookingId nếu có
    const metadata: any = {};
    if (options.bookingId) {
      metadata.bookingId = options.bookingId;
    }

    console.log(metadata);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Thanh toán dịch vụ',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: options.email,
      metadata: metadata,
      success_url: `${this.configService.get(
        'FRONTEND_URL',
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/cancel`,
    });

    console.log('Stripe session created:', session.metadata);
    return { id: session.id, url: session.url };
  }

  async verifyPayment(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // Kiểm tra trạng thái thanh toán
      if (session.payment_status === 'paid') {
        return {
          success: true,
          id: session.id,
          amount: (session.amount_total ?? 0) / 100,
          customer: session.customer_details,
          status: session.payment_status,
          created: new Date(session.created * 1000).toISOString(),
          metadata: session.metadata, // Trả về metadata (có chứa bookingId)
        };
      } else {
        return {
          success: false,
          status: session.payment_status,
        };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Could not verify payment');
    }
  }
}
