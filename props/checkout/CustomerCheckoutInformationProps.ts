import { CheckoutFormData } from '@/services/checkout';

export type CustomerCheckoutInformationProps = {
  formData: CheckoutFormData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
