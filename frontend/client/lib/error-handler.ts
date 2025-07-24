import { AxiosError } from 'axios';
import { toast } from '../components/ui/use-toast';

interface ErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    
    if (data?.message) {
      toast({
        title: 'Error',
        description: data.message,
        variant: 'destructive',
      });
    } else if (data?.errors) {
      const errorMessages = Object.values(data.errors).flat();
      toast({
        title: 'Validation Error',
        description: errorMessages.join('\n'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  } else {
    toast({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      variant: 'destructive',
    });
  }
};
