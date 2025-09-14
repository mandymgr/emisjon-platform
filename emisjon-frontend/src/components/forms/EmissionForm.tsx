import * as React from "react";
import { useZodForm } from "@/hooks/useZodForm";
import { createEmissionSchema, type CreateEmissionData } from "@/validators/emission";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
} from "@/components/ui/oblinor-form";

interface EmissionFormProps {
  onSubmit: (data: CreateEmissionData) => Promise<void>;
  initialData?: Partial<CreateEmissionData>;
  isLoading?: boolean;
  className?: string;
}

export function EmissionForm({
  onSubmit,
  initialData,
  isLoading = false,
  className = "",
}: EmissionFormProps) {
  const form = useZodForm(createEmissionSchema, {
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      newSharesOffered: initialData?.newSharesOffered || 0,
      pricePerShare: initialData?.pricePerShare || 0,
      status: initialData?.status || "DRAFT",
      targetAmount: initialData?.targetAmount || undefined,
      minimumInvestment: initialData?.minimumInvestment || undefined,
      projectDetails: {
        location: initialData?.projectDetails?.location || "",
        propertyType: initialData?.projectDetails?.propertyType || "",
        expectedReturn: initialData?.projectDetails?.expectedReturn || 0,
        riskLevel: initialData?.projectDetails?.riskLevel || "MEDIUM",
      },
    },
  });

  // Calculate total value automatically
  const watchedShares = form.watch("newSharesOffered");
  const watchedPrice = form.watch("pricePerShare");
  const totalValue = React.useMemo(() => {
    return (watchedShares || 0) * (watchedPrice || 0);
  }, [watchedShares, watchedPrice]);

  const handleSubmit = async (data: CreateEmissionData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      // Form errors will be shown by the parent component
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="mb-12 text-center">
        <h1
          className="text-5xl font-normal tracking-tight text-[#0E1A1C] dark:text-white mb-4"
          style={{ fontFamily: '"EB Garamond", serif' }}
        >
          {initialData ? "Edit Emission" : "Create New Emission"}
        </h1>
        <p className="text-lg font-light text-black/70 dark:text-white/70 max-w-2xl mx-auto">
          {initialData
            ? "Update the emission details below"
            : "Fill in the details to create a new investment opportunity"}
        </p>
        <div className="w-16 h-px bg-[#124F62] mx-auto mt-6" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
          {/* Basic Information */}
          <section className="space-y-8">
            <h2 className="text-2xl font-light tracking-wide text-[#124F62] dark:text-white">
              Basic Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emission Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Downtown Oslo Office Building"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for the investment opportunity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-[#E6E6E0] bg-white px-3 py-2 text-sm font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-1 dark:border-white/20 dark:bg-white/5 dark:text-white"
                        {...field}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="CLOSED">Closed</option>
                        <option value="FUNDED">Funded</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </FormControl>
                    <FormDescription>Current status of the emission</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-[#E6E6E0] bg-white px-3 py-2 text-sm font-light placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-white resize-none"
                      placeholder="Describe the investment opportunity, including key details about the property, expected returns, and investment terms..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of the investment opportunity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Investment Details */}
          <section className="space-y-8">
            <h2 className="text-2xl font-light tracking-wide text-[#124F62] dark:text-white">
              Investment Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>When the emission opens for investment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>When the emission closes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="newSharesOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shares Offered</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Number of shares to offer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Share (NOK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Price per individual share</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-light uppercase tracking-[0.05em] text-black/80 dark:text-white/80">
                  Total Value (NOK)
                </label>
                <div className="flex h-10 w-full rounded-md border border-[#E6E6E0] bg-[#F7F7F5] px-3 py-2 text-sm font-light dark:border-white/20 dark:bg-white/5 dark:text-white items-center">
                  <span className="tabular-nums">
                    {totalValue.toLocaleString('nb-NO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <p className="text-xs font-light text-black/60 dark:text-white/60">
                  Automatically calculated
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (NOK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Optional funding target</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Investment (NOK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Minimum amount per investor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Project Details */}
          <section className="space-y-8">
            <h2 className="text-2xl font-light tracking-wide text-[#124F62] dark:text-white">
              Project Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectDetails.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Oslo, Norway" {...field} />
                    </FormControl>
                    <FormDescription>Property location</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectDetails.propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Office Building, Residential" {...field} />
                    </FormControl>
                    <FormDescription>Type of property</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectDetails.expectedReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Expected annual return percentage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectDetails.riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-[#E6E6E0] bg-white px-3 py-2 text-sm font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-1 dark:border-white/20 dark:bg-white/5 dark:text-white"
                        {...field}
                      >
                        <option value="LOW">Low Risk</option>
                        <option value="MEDIUM">Medium Risk</option>
                        <option value="HIGH">High Risk</option>
                      </select>
                    </FormControl>
                    <FormDescription>Investment risk assessment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-[#E6E6E0] dark:border-white/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Saving..." : initialData ? "Update Emission" : "Create Emission"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Dev helper - show form state in development */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 p-4 bg-[#F7F7F5] dark:bg-white/5 rounded-lg">
          <summary className="text-sm font-light cursor-pointer">Debug Form State</summary>
          <pre className="mt-4 text-xs overflow-auto">
            {JSON.stringify(form.formState, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}