import type { User } from '@/entities/user';
import type { CartItem } from '@/features/cart/types/CartItem';

type BillingContactInfo = {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
};

type BillingAddress = {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: 'DO';
};

type CardInfo = {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
};

type OrderItem = {
  productid: number;
  quantity: number;
};

export type CheckoutFormData = {
  billing_contact: BillingContactInfo;
  billing_address: BillingAddress;
  cardInformation: CardInfo;
  PickUpTime: Date;
  items: OrderItem[];
};

type CheckoutResponseData = {
  cart: {
    id: number;
    status: boolean;
    items: CartItem[];
  };
  user: User;
};

type CheckoutInfoResponse = {
  status: 'ok' | 'error';
  data: CheckoutResponseData;
};

export type CheckoutPostResponse = {
  status: 'ok' | 'error';
  data?: {
    order: {
      id: number;
      reference: string;
      status: string;
      created_at: string;
      pickuptime: string;
      total: number;
    };
    cart: {
      id: number;
      status: boolean;
      items: [];
    };
    user: User;
  };
  error?: {
    code: string;
    message: string;
    field: string | null;
  };
};

type TimeSlot = string;

type AvailableDate = {
  date: string;
  slots: TimeSlot[];
};

type AvailableDatesResponse = {
  availableDates: AvailableDate[];
};

export class CheckoutService {
  private baseurl = `${process.env.NEXT_PUBLIC_API_URL}`;

  async getCheckoutInfo(): Promise<CheckoutInfoResponse> {
    try {
      const response = await fetch(`/api/v1/checkout/`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        if (errorBody?.error?.code === 'CHECKOUT_LOGIN_REQUIRED') {
          throw new Error(`User must log in to checkout`);
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CheckoutInfoResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async checkout(formdata: CheckoutFormData): Promise<CheckoutPostResponse> {
    const payload = {
      billing_contact: {
        firstname: formdata.billing_contact.firstname,
        lastname: formdata.billing_contact.lastname,
        email: formdata.billing_contact.email,
        phone_number: formdata.billing_contact.phone_number,
      },
      billing_address: {
        street: formdata.billing_address.street,
        apartment: formdata.billing_address.apartment,
        city: formdata.billing_address.city,
        country: formdata.billing_address.country,
        postal_code: formdata.billing_address.postal_code,
        state: formdata.billing_address.state,
      },
      card_information: {
        card_number: formdata.cardInformation.card_number,
        expiry_month: formdata.cardInformation.expiry_month,
        expiry_year: formdata.cardInformation.expiry_year,
        cvv: formdata.cardInformation.cvv,
      },
      pickuptime: formdata.PickUpTime,
      items: formdata.items,
    };

    try {
      const response = await fetch(`/api/v1/checkout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: CheckoutPostResponse = await response.json();

      if (!response.ok && !data.error) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  }

  async getAvailableSlots(): Promise<AvailableDatesResponse> {
    try {
      const response = await fetch(`/api/v1/checkout/timeslots/`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AvailableDatesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }
}
