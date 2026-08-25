import type { CheckoutFormData } from '@/services/checkout';

export type CheckoutFormProps = {
  formData: CheckoutFormData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
