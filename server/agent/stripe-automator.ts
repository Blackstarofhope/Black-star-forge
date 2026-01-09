/**
 * THE STRIPE AUTOMATOR
 * Automatically creates products, prices, and payment links
 */

import Stripe from 'stripe';
import { ProjectState } from './types';
import { config } from './config';

export class StripeAutomator {
  private stripe: Stripe | null = null;
  private isTestMode: boolean;

  constructor(isTestMode: boolean = true) {
    this.isTestMode = isTestMode;
    const apiKey = isTestMode 
      ? config.stripeTestKey
      : config.stripeLiveKey;
    
    // Only initialize Stripe if key exists or not in mock mode (though mock mode usually implies no keys)
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-12-15.clover'
      } as any);
    } else if (!config.isMockMode) {
      // If not in mock mode and no key, throw error
      console.warn('Stripe API key not configured');
    }
  }

  /**
   * Create a Stripe product for the project
   */
  async createProduct(projectState: ProjectState): Promise<string> {
    if (config.isMockMode || !this.stripe) {
      return `prod_mock_${Math.random().toString(36).substring(7)}`;
    }

    try {
      const product = await this.stripe.products.create({
        name: projectState.project_name,
        description: projectState.requirements.substring(0, 200),
        metadata: {
          orderId: projectState.orderId,
          generatedBy: 'BlackStarSweatshop'
        }
      });

      return product.id;
    } catch (error: any) {
      throw new Error(`Failed to create Stripe product: ${error.message}`);
    }
  }

  /**
   * Create a price for the product
   */
  async createPrice(productId: string, amount: number, currency: string = 'usd'): Promise<string> {
    if (config.isMockMode || !this.stripe) {
      return `price_mock_${Math.random().toString(36).substring(7)}`;
    }

    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          generatedBy: 'BlackStarSweatshop'
        }
      });

      return price.id;
    } catch (error: any) {
      throw new Error(`Failed to create Stripe price: ${error.message}`);
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(priceId: string, projectState: ProjectState): Promise<string> {
    if (config.isMockMode || !this.stripe) {
      return `https://buy.stripe.com/test_${Math.random().toString(36).substring(7)}`;
    }

    try {
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        metadata: {
          orderId: projectState.orderId,
          projectName: projectState.project_name
        },
        after_completion: {
          type: 'hosted_confirmation',
          hosted_confirmation: {
            custom_message: `Thank you for your purchase of ${projectState.project_name}!`
          }
        }
      });

      return paymentLink.url;
    } catch (error: any) {
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  }

  /**
   * Full automation: Create product, price, and payment link
   */
  async automatePaymentSetup(
    projectState: ProjectState, 
    amount: number = 99,
    currency: string = 'usd'
  ): Promise<{ productId: string; priceId: string; paymentLink: string }> {
    console.log(`[Stripe] Creating payment setup for ${projectState.project_name} (${this.isTestMode ? 'TEST' : 'LIVE'} mode)`);
    
    const productId = await this.createProduct(projectState);
    console.log(`[Stripe] Product created: ${productId}`);
    
    const priceId = await this.createPrice(productId, amount, currency);
    console.log(`[Stripe] Price created: ${priceId}`);
    
    const paymentLink = await this.createPaymentLink(priceId, projectState);
    console.log(`[Stripe] Payment link created: ${paymentLink}`);

    return { productId, priceId, paymentLink };
  }

  /**
   * Switch to live mode (creates new instance)
   */
  static switchToLiveMode(): StripeAutomator {
    return new StripeAutomator(false);
  }

  /**
   * Inject payment link into HTML code
   */
  injectPaymentLink(htmlCode: string, paymentLink: string): string {
    // Look for common payment button patterns and inject the link
    
    // Pattern 1: Placeholder comment
    if (htmlCode.includes('<!-- PAYMENT_LINK -->')) {
      return htmlCode.replace(
        '<!-- PAYMENT_LINK -->',
        `<a href="${paymentLink}" class="payment-button">Buy Now</a>`
      );
    }

    // Pattern 2: Existing button without href
    if (htmlCode.includes('<button') && htmlCode.includes('payment')) {
      return htmlCode.replace(
        /<button([^>]*class="[^"]*payment[^"]*"[^>]*)>/i,
        `<a href="${paymentLink}"$1><button$1>`
      );
    }

    // Pattern 3: Add to end of body
    if (htmlCode.includes('</body>')) {
      return htmlCode.replace(
        '</body>',
        `  <div style="text-align: center; margin: 40px;">
    <a href="${paymentLink}" style="display: inline-block; padding: 15px 30px; background: #635bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
      Buy Now
    </a>
  </div>
</body>`
      );
    }

    // Pattern 4: Just append if no body tag
    return htmlCode + `\n\n<!-- Stripe Payment Link: ${paymentLink} -->`;
  }

  /**
   * Verify Stripe configuration is correct
   */
  async verifyConfiguration(): Promise<boolean> {
    try {
      // Test the API key by fetching account info
      const account = await this.stripe.accounts.retrieve();
      console.log(`[Stripe] Connected to account: ${account.id}`);
      return true;
    } catch (error: any) {
      console.error(`[Stripe] Configuration error: ${error.message}`);
      return false;
    }
  }
}
