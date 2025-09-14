import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createOrderSchema } from '@/lib/schemas/trading';
import type { CreateOrderInput } from '@/lib/schemas/trading';
import { useCreateOrder } from '@/hooks/useTrading';
import { OrderType } from '@/types/trading';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, InfoIcon } from 'lucide-react';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'BUY' | 'SELL';
  shareholderId?: string;
  shareholders?: Array<{
    id: string;
    name: string;
    sharesOwned?: number;
    availableShares?: number;
  }>;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  defaultType = OrderType.BUY,
  shareholderId,
  shareholders = [],
}: CreateOrderDialogProps) {
  const createOrder = useCreateOrder();
  const [showTimeLimit, setShowTimeLimit] = useState(false);

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema as any),
    defaultValues: {
      shareholderId: shareholderId || '',
      type: defaultType,
      quantity: 1,
      price: 0,
      partialFill: false,
      timeLimit: undefined,
    },
  });

  const watchType = form.watch('type');
  const watchQuantity = form.watch('quantity');
  const watchPrice = form.watch('price');
  const watchShareholderId = form.watch('shareholderId');

  const selectedShareholder = shareholders.find(s => s.id === watchShareholderId);
  const shareholderShares = selectedShareholder?.availableShares ?? selectedShareholder?.sharesOwned ?? 0;
  const totalValue = watchQuantity * watchPrice;

  const handleSubmit = async (data: CreateOrderInput) => {
    try {
      await createOrder.mutateAsync(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Place a new buy or sell order in the market
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Shareholder Selection */}
            <FormField
              control={form.control}
              name="shareholderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shareholder Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shareholder account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shareholders.length === 0 ? (
                        <div className="p-3 text-center">
                          <p className="text-sm text-muted-foreground">
                            No shareholder accounts available.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You need to be associated with a shareholder account to trade.
                          </p>
                        </div>
                      ) : (
                        shareholders.map((shareholder) => (
                        <SelectItem key={shareholder.id} value={shareholder.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{shareholder.name}</span>
                            {(shareholder.availableShares !== undefined || shareholder.sharesOwned !== undefined) && (
                              <Badge variant="secondary" className="ml-2">
                                {shareholder.availableShares ?? shareholder.sharesOwned ?? 0} shares
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={OrderType.BUY}>
                        <Badge className="bg-green-600">BUY</Badge>
                      </SelectItem>
                      <SelectItem value={OrderType.SELL}>
                        <Badge className="bg-red-600">SELL</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Share (NOK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Value Display */}
            {totalValue > 0 && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Total Order Value: <strong>{formatCurrency(totalValue)}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* SELL Order Warning */}
            {watchType === OrderType.SELL && selectedShareholder && (
              <Alert variant={shareholderShares < watchQuantity ? 'destructive' : 'default'}>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  {shareholderShares < watchQuantity ? (
                    <>
                      Insufficient shares! You have {shareholderShares} available,
                      but trying to sell {watchQuantity}.
                    </>
                  ) : (
                    <>
                      You have {shareholderShares} shares available.
                      Selling {watchQuantity} will leave you with {shareholderShares - watchQuantity}.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Partial Fill */}
            <FormField
              control={form.control}
              name="partialFill"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Partial Fill</FormLabel>
                    <FormDescription>
                      Accept partial matches if full quantity isn't available
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Time Limit Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Set Expiration Date</FormLabel>
                <FormDescription>
                  Order will be cancelled after this date
                </FormDescription>
              </div>
              <Switch
                checked={showTimeLimit}
                onCheckedChange={setShowTimeLimit}
              />
            </div>

            {/* Time Limit Date Picker */}
            {showTimeLimit && (
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) =>
                            date < new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Creating...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}