'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPriceWithTax, getTaxAmount } from '@/lib/tax';

// ============================================================================
// CAPA DE DOMINIO Y TIPOS
// ============================================================================

type BillingAddress = {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type CheckoutData = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  billing_address: BillingAddress;
  pickuptime: string;
  items: Array<{
    product_variant_id: string;
    quantity: number;
  }>;
};

type CartItem = {
  id: string;
  productvariant: {
    id: string;
    name: string;
    description: string;
    selling_price: number;
    tax_rate: number;
  };
  quantity: number;
};

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string;
  phone_number: string;
  permissions: string[];
  profilepicture: string;
  is_email_verified: boolean;
};

type PickupTimeSlot = {
  date: string;
  time: string;
  available: boolean;
};

type CheckoutPageData = {
  status: string;
  data: {
    cart: { items: CartItem[] };
    user: User;
    pickup_times: PickupTimeSlot[];
  };
};

type CheckoutResult = {
  orderId: number;
  amount: number;
};

// ============================================================================
// CAPA DE SERVICIO (I/O y Lógica de Red)
// ============================================================================

class CheckoutService {
  async getCheckoutData(): Promise<CheckoutPageData> {
    const [checkoutResponse, timeslotsResponse] = await Promise.all([
      fetch('/api/v1/checkout', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
      fetch('/api/v1/checkout/timeslots', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
    ]);

    if (!checkoutResponse.ok) {
      throw new Error(`Failed to fetch checkout data: ${checkoutResponse.status}`);
    }

    const checkoutData = await checkoutResponse.json();
    const pickupTimes: PickupTimeSlot[] = [];

    if (timeslotsResponse.ok) {
      const timeslotsData = await timeslotsResponse.json();
      if (Array.isArray(timeslotsData?.availableDates)) {
        timeslotsData.availableDates.forEach((dateSlot: { date: string; slots: string[] }) => {
          dateSlot.slots.forEach((time: string) => {
            pickupTimes.push({ date: dateSlot.date, time, available: true });
          });
        });
      }
    }

    return {
      status: checkoutData.status || 'success',
      data: {
        cart: checkoutData.data?.cart || { items: [] },
        user: checkoutData.data?.user || {
          id: '',
          firstname: '',
          lastname: '',
          email: '',
          matricula: '',
          phone_number: '',
          permissions: [],
          profilepicture: '',
          is_email_verified: false,
        },
        pickup_times: pickupTimes,
      },
    };
  }

  async executeCheckout(formData: CheckoutData): Promise<CheckoutResult> {
    const transformedData = {
      billing_contact: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone_number: formData.phone,
      },
      billing_address: {
        street: formData.billing_address.street,
        apartment: formData.billing_address.apartment || '',
        city: formData.billing_address.city,
        country: formData.billing_address.country || 'Dominican Republic',
        postal_code: formData.billing_address.postal_code,
        state: formData.billing_address.state,
      },
      pickuptime: formData.pickuptime,
      items: formData.items.map(item => ({
        productvariantid: parseInt(item.product_variant_id, 10),
        quantity: item.quantity,
      })),
    };

    const response = await fetch('/api/v1/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(transformedData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.order_id) {
      const message =
        data?.error?.message || data?.message || `Checkout failed: ${response.status}`;
      throw new Error(message);
    }

    return { orderId: data.order_id, amount: data.amount };
  }
}

// ============================================================================
// PAYPAL — carga del SDK y botón de pago (sandbox)
// ============================================================================

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void> | void;
        onCancel?: () => void;
        onError?: (err: unknown) => void;
      }) => { render: (container: HTMLElement) => void };
    };
  }
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SDK_SCRIPT_ID = 'paypal-sdk';

function loadPayPalSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();

  const existingScript = document.getElementById(PAYPAL_SDK_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar PayPal')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = PAYPAL_SDK_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar PayPal'));
    document.body.appendChild(script);
  });
}

interface PayPalCheckoutButtonProps {
  orderId: number;
  onSuccess: () => void;
  onCancelled: (message?: string) => void;
}

function PayPalCheckoutButton({ orderId, onSuccess, onCancelled }: PayPalCheckoutButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return;

    let cancelled = false;

    const notifyCancelled = (order_id: number, message: string) => {
      fetch('/api/v1/checkout/paypal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ order_id }),
      }).catch(() => {});
      onCancelled(message);
    };

    loadPayPalSdk()
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) return;
        containerRef.current.innerHTML = '';
        window.paypal
          .Buttons({
            createOrder: async () => {
              const res = await fetch('/api/v1/checkout/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_id: orderId }),
              });
              const data = await res.json().catch(() => null);
              if (!res.ok || !data?.paypal_order_id) {
                throw new Error(data?.error?.message || 'No se pudo iniciar el pago con PayPal');
              }
              return data.paypal_order_id;
            },
            onApprove: async data => {
              const res = await fetch('/api/v1/checkout/paypal/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_id: orderId, paypal_order_id: data.orderID }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => null);
                onCancelled(
                  body?.error?.message || body?.message || 'El pago no se pudo completar.'
                );
                return;
              }
              onSuccess();
            },
            onCancel: () => {
              notifyCancelled(
                orderId,
                'Pago cancelado. Tus productos siguen disponibles, puedes intentar de nuevo.'
              );
            },
            onError: () => {
              notifyCancelled(orderId, 'Ocurrió un error con PayPal. Intenta de nuevo.');
            },
          })
          .render(containerRef.current);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError('No se pudo cargar PayPal. Verifica tu conexión e intenta de nuevo.');
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, onSuccess, onCancelled]);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <p className="text-sm text-red-600">
        PayPal no está configurado (falta NEXT_PUBLIC_PAYPAL_CLIENT_ID).
      </p>
    );
  }

  if (loadError) {
    return <p className="text-sm text-red-600">{loadError}</p>;
  }

  return (
    <div>
      <div ref={containerRef} />
      <p className="mt-3 text-xs text-gray-400">
        Cargo de prueba en USD — entorno sandbox de PayPal (solo para fines de demostración).
      </p>
    </div>
  );
}

// ============================================================================
// CUSTOM HOOK: LÓGICA DE ESTADO Y NEGOCIO
// ============================================================================

type FormErrors = Record<string, string>;

function useCheckoutLogic() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutPageData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [orderId, setOrderId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CheckoutData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    billing_address: { street: '', city: '', state: '', postal_code: '', country: '' },
    pickuptime: '',
    items: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const service = new CheckoutService();
        const data = await service.getCheckoutData();
        if (!isMounted) return;

        setCheckoutData(data);
        setFormData(prev => ({
          ...prev,
          firstname: data.data.user.firstname || '',
          lastname: data.data.user.lastname || '',
          email: data.data.user.email || '',
          phone: data.data.user.phone_number || '',
          items: data.data.cart.items.map(item => ({
            product_variant_id: item.productvariant.id,
            quantity: item.quantity,
          })),
        }));
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : 'Failed to load checkout data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const subtotalAmount = useMemo(() => {
    return (
      checkoutData?.data.cart.items.reduce(
        (sum, item) => sum + item.productvariant.selling_price * item.quantity,
        0
      ) || 0
    );
  }, [checkoutData?.data.cart.items]);

  const taxAmount = useMemo(() => {
    return (
      checkoutData?.data.cart.items.reduce(
        (sum, item) =>
          sum +
          getTaxAmount(item.productvariant.selling_price, item.productvariant.tax_rate) *
            item.quantity,
        0
      ) || 0
    );
  }, [checkoutData?.data.cart.items]);

  const totalAmount = subtotalAmount + taxAmount;

  const validateAll = useCallback(() => {
    const errors: FormErrors = {};
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) =>
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ''));

    if (!formData.firstname.trim()) errors.firstname = 'El nombre es requerido';
    if (!formData.lastname.trim()) errors.lastname = 'El apellido es requerido';
    if (!formData.email.trim()) errors.email = 'El correo es requerido';
    else if (!validateEmail(formData.email)) errors.email = 'El correo no es válido';
    if (!formData.phone.trim()) errors.phone = 'Se requiere un número de teléfono';
    else if (!validatePhone(formData.phone)) errors.phone = 'Formato de teléfono inválido';

    const address = formData.billing_address;
    if (!address.street.trim()) errors.billing_street = 'La calle es requerida';
    if (!address.city.trim()) errors.billing_city = 'La ciudad es requerida';
    if (!address.state.trim()) errors.billing_state = 'El estado es requerido';
    if (!address.postal_code.trim()) errors.billing_postal_code = 'El código postal es requerido';
    if (!address.country.trim()) errors.billing_country = 'El país es requerido';
    if (!formData.pickuptime) errors.pickuptime = 'Por favor selecciona un horario';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setError(null);

      setFormData(prev => {
        if (name.startsWith('billing_'))
          return {
            ...prev,
            billing_address: { ...prev.billing_address, [name.replace('billing_', '')]: value },
          };
        return { ...prev, [name]: value };
      });

      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [formErrors]
  );

  const handleSubmit = async () => {
    if (!validateAll()) {
      // Lleva al usuario al primer campo con error para que no tenga que buscarlo
      const firstErrorField = document.querySelector<HTMLElement>('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const service = new CheckoutService();
      const result = await service.executeCheckout(formData);
      setOrderId(result.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    setSuccess(true);
  }, []);

  const handlePaymentCancelled = useCallback((message?: string) => {
    setOrderId(null);
    setError(message || null);
  }, []);

  const handleEditOrder = useCallback(async () => {
    if (orderId) {
      try {
        await fetch('/api/v1/checkout/paypal/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order_id: orderId }),
        });
      } catch {
        // best-effort — the order stays reserved server-side either way and
        // the user can just retry from the form again
      }
    }
    setOrderId(null);
  }, [orderId]);

  return {
    loading,
    submitting,
    error,
    success,
    checkoutData,
    formErrors,
    formData,
    subtotalAmount,
    taxAmount,
    totalAmount,
    orderId,
    handleInputChange,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    handleEditOrder,
  };
}

// ============================================================================
// CAPA DE PRESENTACIÓN (UI)
// ============================================================================

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  formErrors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  placeholder = '',
  maxLength,
  formErrors,
  onChange,
}: InputFieldProps) {
  const hasError = Boolean(formErrors[name]);
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
      <div className="mt-2 relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          data-error={hasError}
          className={`block w-full rounded-xl border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset transition-all duration-200 ${
            hasError
              ? 'ring-red-300 focus:ring-red-500 bg-red-50/50'
              : 'ring-gray-300 focus:ring-blue-600 hover:ring-gray-400'
          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
        />
        {hasError && <p className="mt-1 text-xs text-red-600">{formErrors[name]}</p>}
      </div>
    </div>
  );
}

interface SectionCardProps {
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function SectionCard({ step, title, subtitle, children }: SectionCardProps) {
  return (
    <section className="bg-white border-2 border-blue-600 rounded-3xl shadow-sm p-6 sm:p-10">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {step}
        </div>
        <div>
          <h2 className="text-xl font-semibold leading-7 text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const {
    loading,
    submitting,
    error,
    success,
    checkoutData,
    formErrors,
    formData,
    subtotalAmount,
    taxAmount,
    totalAmount,
    orderId,
    handleInputChange,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    handleEditOrder,
  } = useCheckoutLogic();

  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const isEmailVerified = checkoutData?.data.user.is_email_verified ?? false;

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      const res = await fetch('/api/v1/resend-verification-email', { method: 'POST' });
      setResendStatus(res.ok ? 'sent' : 'error');
    } catch {
      setResendStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Cargando plataforma de pago...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-blue-600 rounded-2xl shadow-sm p-8 text-center animate-in zoom-in duration-300">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            ¡Orden Confirmada!
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Gracias por tu compra. Hemos procesado tu orden exitosamente y recibirás un correo de
            confirmación en breve.
          </p>
          <div className="space-y-3">
            {orderId && (
              <Link
                href={`/account/orders/${orderId}`}
                className="block w-full rounded-xl border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all text-center"
              >
                Ver mi pedido #{orderId}
              </Link>
            )}
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header con Inyección de Logo Institucional y Brand Text */}
        <div className="mb-10 max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center justify-center gap-5 rounded-2xl bg-[#002d62] px-6 py-4 shadow-sm transition-opacity hover:opacity-90"
          >
            <Image
              src="/image/logo_uasd.svg"
              alt="UASD Logo"
              width={160}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-lg font-bold tracking-widest text-white leading-tight">
                BUYFAST
              </span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-[#abc7ff] leading-none uppercase">
                ECONOMATO
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finalizar Compra</h1>
          <p className="mt-2 text-sm text-gray-500">
            Completa toda la información y confirma tu pedido para retirarlo en el económato.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-8 space-y-8">
            {!isEmailVerified && (
              <div className="rounded-xl bg-[#fef7e0] p-4 ring-1 ring-inset ring-[#feefc3]">
                <p className="text-sm font-medium text-[#b06000]">
                  Debes verificar tu correo electrónico antes de poder completar tu pedido.
                </p>
                <div className="mt-2">
                  {resendStatus === 'sent' ? (
                    <span className="text-sm font-semibold text-[#b06000]">
                      Correo de verificación enviado.
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendStatus === 'sending'}
                      className="text-sm font-semibold text-[#b06000] underline underline-offset-2 hover:text-[#8a4a00] disabled:opacity-60"
                    >
                      {resendStatus === 'sending'
                        ? 'Enviando...'
                        : 'Reenviar correo de verificación'}
                    </button>
                  )}
                  {resendStatus === 'error' && (
                    <span className="ml-2 text-sm text-red-700">No se pudo enviar el correo.</span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-200/50">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            )}

            {/* 1. Contacto */}
            <SectionCard
              step="1"
              title="Información de Contacto"
              subtitle="Utilizaremos este correo para enviar tu recibo."
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <InputField
                  label="Nombres"
                  name="firstname"
                  value={formData.firstname}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Apellidos"
                  name="lastname"
                  value={formData.lastname}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    formErrors={formErrors}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Número de Teléfono"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    formErrors={formErrors}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </SectionCard>

            {/* 2. Retiro y Facturación */}
            <SectionCard
              step="2"
              title="Retiro en Económato"
              subtitle="Selecciona el horario para pasar a retirar tu pedido y confirma tu dirección de facturación."
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Horario de Recogida
                  </label>
                  <select
                    name="pickuptime"
                    value={formData.pickuptime}
                    onChange={handleInputChange}
                    data-error={Boolean(formErrors.pickuptime)}
                    className={`mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${formErrors.pickuptime ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'} focus:ring-2 sm:text-sm`}
                  >
                    <option value="">Selecciona un horario disponible...</option>
                    {checkoutData?.data.pickup_times.map(slot => (
                      <option
                        key={`${slot.date}-${slot.time}`}
                        value={`${slot.date} ${slot.time}`}
                        disabled={!slot.available}
                      >
                        {slot.date} a las {slot.time} {!slot.available && '(No Disponible)'}
                      </option>
                    ))}
                  </select>
                  {formErrors.pickuptime && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.pickuptime}</p>
                  )}
                </div>

                <div className="sm:col-span-2 pt-2 border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Dirección de Facturación</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Solo para fines de facturación; el pedido se retira en el económato.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Dirección"
                    name="billing_street"
                    value={formData.billing_address.street}
                    formErrors={formErrors}
                    onChange={handleInputChange}
                  />
                </div>
                <InputField
                  label="Ciudad"
                  name="billing_city"
                  value={formData.billing_address.city}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Provincia / Estado"
                  name="billing_state"
                  value={formData.billing_address.state}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Código Postal"
                  name="billing_postal_code"
                  value={formData.billing_address.postal_code}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
                <InputField
                  label="País"
                  name="billing_country"
                  value={formData.billing_address.country}
                  formErrors={formErrors}
                  onChange={handleInputChange}
                />
              </div>
            </SectionCard>

            {/* 3. Pago */}
            <SectionCard
              step="3"
              title="Pago con PayPal"
              subtitle="Paga de forma segura con tu cuenta de PayPal (entorno de pruebas / sandbox)."
            >
              {orderId ? (
                <div>
                  <PayPalCheckoutButton
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onCancelled={handlePaymentCancelled}
                  />
                  <button
                    type="button"
                    onClick={handleEditOrder}
                    className="mt-4 text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
                  >
                    Editar pedido
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Completa la información de contacto y retiro, luego continúa para pagar con
                  PayPal.
                </p>
              )}
            </SectionCard>

            {/* Continuar al pago */}
            {!orderId && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !isEmailVerified}
                  className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  {submitting && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {submitting ? 'Procesando...' : 'Continuar al pago'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Resumen */}
          {checkoutData && (
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white border-2 border-blue-600 rounded-3xl shadow-sm p-6 sm:p-8 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Pedido</h3>
                <div className="flow-root mb-6">
                  <ul
                    role="list"
                    className="-my-6 divide-y divide-gray-100 max-h-[28rem] overflow-y-auto pr-4 custom-scrollbar"
                  >
                    {checkoutData.data.cart.items.map(item => (
                      <li key={item.id} className="flex py-6">
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <h4 className="line-clamp-2 pr-4">{item.productvariant.name}</h4>
                            <p className="ml-4 whitespace-nowrap">
                              $
                              {(
                                getPriceWithTax(
                                  item.productvariant.selling_price,
                                  item.productvariant.tax_rate
                                ) * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Cant. {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-gray-600">Precio del producto</dt>
                    <dd className="font-medium text-gray-900">${subtotalAmount.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-gray-600">Impuesto</dt>
                    <dd className="font-medium text-gray-900">${taxAmount.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-gray-600">Envío</dt>
                    <dd className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Retiro en Económato
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <dt className="text-base font-bold text-gray-900">Total a Pagar</dt>
                    <dd className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</dd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
