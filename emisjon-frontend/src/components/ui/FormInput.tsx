import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ label, error, helperText, type = 'text', className = '', ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;

    return (
      <div className="mb-5">
        <label htmlFor={props.id} className="block text-sm font-normal text-white mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1
              transition-all duration-200 text-white bg-[#2a3441] placeholder-gray-500
              ${error 
                ? 'border-red-500 focus:border-red-400 focus:ring-red-400' 
                : 'border-gray-600 hover:border-gray-500 focus:border-gray-400 focus:ring-gray-400'
              }
              ${isPasswordType ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

export default FormInput;