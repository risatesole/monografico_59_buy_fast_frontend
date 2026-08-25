import { CheckoutFormData } from '@/services/checkout';

export type PaymentDetailsProps = {
  formData: CheckoutFormData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
