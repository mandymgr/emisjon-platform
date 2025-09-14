// MinimalRegisterPage – Kinfolk/Oblinor registration form
// - Multi-step feel with progressive disclosure
// - Comprehensive zod validation with Norwegian error messages
// - Password strength indicator, terms acceptance, newsletter opt-in
// - Matches MinimalLoginPage design language

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Check, X } from "lucide-react";

// Registration schema with Norwegian validation
const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Fornavn må være minst 2 tegn")
    .max(50, "Fornavn kan ikke være lengre enn 50 tegn")
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, "Kun bokstaver, mellomrom og bindestrek er tillatt"),

  lastName: z
    .string()
    .min(2, "Etternavn må være minst 2 tegn")
    .max(50, "Etternavn kan ikke være lengre enn 50 tegn")
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, "Kun bokstaver, mellomrom og bindestrek er tillatt"),

  email: z
    .string()
    .email("Ugyldig e-postadresse"),

  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      const cleaned = phone.replace(/\s+/g, '');
      return /^(\+47)?[2-9]\d{7}$/.test(cleaned);
    }, "Ugyldig norsk telefonnummer"),

  password: z
    .string()
    .min(8, "Passord må være minst 8 tegn")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Passord må inneholde minst en stor bokstav, en liten bokstav og ett tall"),

  confirmPassword: z.string().min(1, "Bekreft passordet"),

  acceptTerms: z
    .boolean()
    .refine(val => val === true, "Du må godta vilkårene for å registrere deg"),

  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, "Du må godta personvernreglene"),

  newsletter: z.boolean().optional().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passordene må være like",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

// Password strength checker
function usePasswordStrength(password: string) {
  return React.useMemo(() => {
    const checks = [
      { test: password.length >= 8, label: "Minst 8 tegn" },
      { test: /[a-z]/.test(password), label: "Liten bokstav" },
      { test: /[A-Z]/.test(password), label: "Stor bokstav" },
      { test: /\d/.test(password), label: "Tall" },
      { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: "Spesialtegn (valgfritt)" },
    ];

    const passedChecks = checks.filter(check => check.test).length;
    const strength = passedChecks <= 2 ? "weak" : passedChecks <= 3 ? "medium" : "strong";

    return { checks, strength, score: passedChecks };
  }, [password]);
}

export default function MinimalRegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur" // Validate on blur for better UX
  });

  const watchedPassword = watch("password") || "";
  const passwordStrength = usePasswordStrength(watchedPassword);

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    setError(null);
    try {
      // TODO: Replace with actual registration dispatch
      // const result = await dispatch(register(values)).unwrap();
      console.log("Registration values:", values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // On success, redirect to login or dashboard
      navigate("/minimal-login?registered=true");
    } catch (e: any) {
      setError(e?.message || "Registrering feilet. Prøv igjen senere.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate unique IDs for form fields
  const ids = {
    firstName: React.useId(),
    lastName: React.useId(),
    email: React.useId(),
    phone: React.useId(),
    password: React.useId(),
    confirmPassword: React.useId(),
    terms: React.useId(),
    privacy: React.useId(),
    newsletter: React.useId(),
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F7F5] text-[#0E1A1C] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62] dark:text-white">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-10">
            <img src="/oblinor-logo.svg" alt="Oblinor" className="h-10 w-auto dark:opacity-95" />
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-[clamp(28px,5vw,40px)] leading-tight tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[#4A4A4A] dark:text-white/70">
              Join the Oblinor shareholder community
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={ids.firstName} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                  Fornavn
                </label>
                <input
                  id={ids.firstName}
                  type="text"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? `${ids.firstName}-error` : undefined}
                  placeholder="Maria"
                  className="input-professional w-full"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p id={`${ids.firstName}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={ids.lastName} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                  Etternavn
                </label>
                <input
                  id={ids.lastName}
                  type="text"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? `${ids.lastName}-error` : undefined}
                  placeholder="Hansen"
                  className="input-professional w-full"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p id={`${ids.lastName}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor={ids.email} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                E-postadresse
              </label>
              <input
                id={ids.email}
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${ids.email}-error` : undefined}
                placeholder="maria@example.no"
                className="input-professional w-full"
                {...register("email")}
              />
              {errors.email && (
                <p id={`${ids.email}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor={ids.phone} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                Telefonnummer <span className="text-[10px] normal-case opacity-70">(valgfritt)</span>
              </label>
              <input
                id={ids.phone}
                type="tel"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
                placeholder="+47 123 45 678"
                className="input-professional w-full"
                {...register("phone")}
              />
              {errors.phone && (
                <p id={`${ids.phone}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password with strength indicator */}
            <div>
              <label htmlFor={ids.password} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                Passord
              </label>
              <div className="relative">
                <input
                  id={ids.password}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? `${ids.password}-error` : `${ids.password}-strength`}
                  placeholder="••••••••"
                  className="input-professional w-full pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A6A6A] hover:text-[#124F62] dark:text-white/60 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 rounded"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {watchedPassword && (
                <div id={`${ids.password}-strength`} className="mt-3 space-y-2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength.score
                            ? passwordStrength.strength === "strong"
                              ? "bg-green-500"
                              : passwordStrength.strength === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            : "bg-gray-200 dark:bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {passwordStrength.checks.slice(0, 4).map((check, i) => (
                      <div key={i} className={`flex items-center space-x-1 ${check.test ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                        {check.test ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p id={`${ids.password}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor={ids.confirmPassword} className="block text-[12px] uppercase tracking-wider text-[#6A6A6A] dark:text-white/60 mb-2">
                Bekreft passord
              </label>
              <div className="relative">
                <input
                  id={ids.confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? `${ids.confirmPassword}-error` : undefined}
                  placeholder="••••••••"
                  className="input-professional w-full pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? "Skjul passord" : "Vis passord"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A6A6A] hover:text-[#124F62] dark:text-white/60 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 rounded"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id={`${ids.confirmPassword}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <label htmlFor={ids.terms} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id={ids.terms}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[#E6E6E0] text-[#124F62] focus:ring-2 focus:ring-[#124F62]/30"
                  {...register("acceptTerms")}
                />
                <span className="text-sm text-[#4A4A4A] dark:text-white/70">
                  Jeg godtar{" "}
                  <a href="/terms" className="text-[#124F62] hover:underline" target="_blank">
                    vilkårene for bruk
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {errors.acceptTerms.message}
                </p>
              )}

              <label htmlFor={ids.privacy} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id={ids.privacy}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[#E6E6E0] text-[#124F62] focus:ring-2 focus:ring-[#124F62]/30"
                  {...register("acceptPrivacy")}
                />
                <span className="text-sm text-[#4A4A4A] dark:text-white/70">
                  Jeg godtar{" "}
                  <a href="/privacy" className="text-[#124F62] hover:underline" target="_blank">
                    personvernreglene
                  </a>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {errors.acceptPrivacy.message}
                </p>
              )}

              <label htmlFor={ids.newsletter} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id={ids.newsletter}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[#E6E6E0] text-[#124F62] focus:ring-2 focus:ring-[#124F62]/30"
                  {...register("newsletter")}
                />
                <span className="text-sm text-[#4A4A4A] dark:text-white/70">
                  Send meg oppdateringer og nyhetsbrev (valgfritt)
                </span>
              </label>
            </div>

            {/* Global error */}
            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-professional w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed bg-[#124F62] text-white hover:brightness-110"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                  Oppretter konto...
                </span>
              ) : (
                "Opprett konto"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#4A4A4A] dark:text-white/70">
              Har du allerede en konto?{" "}
              <Link to="/minimal-login" className="text-[#124F62] hover:underline">
                Logg inn her
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: editorial panel */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-[#EDEDE9] dark:bg-white/5" aria-hidden />
        {/* Investment-focused geometry */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#124F62" />
              <stop offset="100%" stopColor="#278899" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#g2)" strokeWidth="1.5">
            <path d="M50,500 L150,400 L250,420 L350,300 L450,320 L550,200 L650,180 L750,80" />
            <rect x="80" y="360" width="40" height="140" fillOpacity="0.1" fill="url(#g2)" />
            <rect x="180" y="380" width="40" height="120" fillOpacity="0.1" fill="url(#g2)" />
            <rect x="280" y="280" width="40" height="220" fillOpacity="0.1" fill="url(#g2)" />
            <rect x="380" y="300" width="40" height="200" fillOpacity="0.1" fill="url(#g2)" />
            <rect x="480" y="180" width="40" height="320" fillOpacity="0.1" fill="url(#g2)" />
            <circle cx="650" cy="180" r="6" fill="url(#g2)" />
            <circle cx="750" cy="80" r="8" fill="url(#g2)" />
          </g>
        </svg>

        <div className="relative flex h-full items-center justify-center p-16">
          <div className="max-w-md text-center">
            <h2 className="font-serif text-5xl leading-tight tracking-tight text-[#0E1A1C] dark:text-white mb-6">
              Join Our
              <br />
              Community
            </h2>
            <p className="text-lg text-[#3A3A3A] dark:text-white/80 mb-8">
              Become part of a growing network of investors building the future of sustainable real estate.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm text-[#4A4A4A] dark:text-white/60">
                <div className="text-center">
                  <div className="text-2xl font-light text-[#124F62] dark:text-white">1,250+</div>
                  <div>Shareholders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-[#124F62] dark:text-white">€45M</div>
                  <div>Invested</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-[#124F62] dark:text-white">7.3%</div>
                  <div>Avg Return</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}