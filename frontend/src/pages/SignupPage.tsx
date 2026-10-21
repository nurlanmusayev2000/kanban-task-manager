import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../services/api/apiSlice';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { getErrorMessage } from '../utils/errors';

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();
  const [signup, { isLoading, error }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupForm) => {
    try {
      const result = await signup(data).unwrap();
      dispatch(setCredentials(result));
      navigate('/');
    } catch {
      // The mutation's `error` state renders the message below the form.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
            error={errors.password?.message}
          />
          {error && <p className="text-sm text-red-600">{getErrorMessage(error)}</p>}
          <Button type="submit" isLoading={isLoading}>
            Sign up
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
